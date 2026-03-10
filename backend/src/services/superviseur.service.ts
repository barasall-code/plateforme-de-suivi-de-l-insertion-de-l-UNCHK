import { prisma } from '../lib/prisma';
import { z } from 'zod';

const CommentaireSchema = z.string()
  .min(1,   'Le commentaire ne peut pas etre vide')
  .max(2000, 'Commentaire trop long (max 2000 caracteres)')
  .trim();

export async function getProfilSuperviseur(userId: string) {
  const superviseur = await prisma.superviseur.findUnique({
    where: { id: userId },
    include: {
      utilisateur: { select: { email: true, dateCreation: true } },
      supervisions: {
        where: { estActif: true },
        include: {
          etudiant: {
            include: {
              utilisateur: { select: { email: true } },
              candidatures: {
                include: { offre: { include: { entreprise: { select: { nomEntreprise: true } } } } },
                orderBy: { dateCandidature: 'desc' },
                take: 1,
              },
            },
          },
        },
      },
    },
  });
  if (!superviseur) throw new Error('Superviseur introuvable');
  return superviseur;
}

export async function getMesEtudiants(userId: string) {
  return prisma.supervision.findMany({
    where: { superviseurId: userId },
    include: {
      etudiant: {
        include: {
          utilisateur: { select: { email: true } },
          candidatures: {
            include: {
              offre: { include: { entreprise: { select: { nomEntreprise: true } } } },
            },
            orderBy: { dateCandidature: 'desc' },
            take: 5,
          },
        },
      },
    },
    orderBy: { dateDebut: 'desc' },
  });
}

export async function getDetailEtudiant(etudiantId: string, superviseurId: string) {
  if (!etudiantId) throw new Error('etudiantId requis');

  const supervision = await prisma.supervision.findUnique({
    where: { superviseurId_etudiantId: { superviseurId, etudiantId } },
  });
  if (!supervision) throw new Error('Etudiant non supervise');

  return prisma.etudiant.findUnique({
    where: { id: etudiantId },
    include: {
      utilisateur:  { select: { email: true, dateCreation: true } },
      candidatures: {
        include: {
          offre: { include: { entreprise: { select: { nomEntreprise: true, secteurActivite: true } } } },
        },
        orderBy: { dateCandidature: 'desc' },
        take: 50,
      },
      competences: { include: { competence: true } },
    },
  });
}

export async function ajouterCommentaire(
  etudiantId: string,
  superviseurId: string,
  commentaire: string,
) {
  const validation = CommentaireSchema.safeParse(commentaire);
  if (!validation.success) {
    throw new Error(validation.error.issues[0].message);
  }

  const supervision = await prisma.supervision.findUnique({
    where: { superviseurId_etudiantId: { superviseurId, etudiantId } },
  });
  if (!supervision) throw new Error('Etudiant non supervise');

  return prisma.supervision.update({
    where: { superviseurId_etudiantId: { superviseurId, etudiantId } },
    data:  { commentaire: validation.data },
  });
}

export async function getStatsSuperviseur(userId: string) {
  const supervisions = await prisma.supervision.findMany({
    where:   { superviseurId: userId },
    include: { etudiant: { include: { candidatures: { select: { statut: true } } } } },
  });

  const totalEtudiants      = supervisions.length;
  const etudiantsActifs     = supervisions.filter(s => s.estActif).length;
  let totalCandidatures     = 0;
  let candidaturesAcceptees = 0;
  let candidaturesEnCours   = 0;

  for (const s of supervisions) {
    for (const c of s.etudiant.candidatures) {
      totalCandidatures++;
      if (c.statut === 'acceptee')                           candidaturesAcceptees++;
      if (['soumise', 'vue', 'entretien'].includes(c.statut)) candidaturesEnCours++;
    }
  }

  return {
    totalEtudiants,
    etudiantsActifs,
    totalCandidatures,
    candidaturesAcceptees,
    candidaturesEnCours,
    tauxInsertion: totalEtudiants > 0
      ? Math.round((candidaturesAcceptees / totalEtudiants) * 100)
      : 0,
  };
}
