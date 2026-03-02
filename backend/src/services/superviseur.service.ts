import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
  const supervisions = await prisma.supervision.findMany({
    where: { superviseurId: userId },
    include: {
      etudiant: {
        include: {
          utilisateur: { select: { email: true } },
          candidatures: {
            include: {
              offre: {
                include: { entreprise: { select: { nomEntreprise: true } } },
              },
            },
            orderBy: { dateCandidature: 'desc' },
          },
        },
      },
    },
    orderBy: { dateDebut: 'desc' },
  });
  return supervisions;
}

export async function getDetailEtudiant(etudiantId: string, superviseurId: string) {
  const supervision = await prisma.supervision.findUnique({
    where: { superviseurId_etudiantId: { superviseurId, etudiantId } },
  });
  if (!supervision) throw new Error('Etudiant non supervise');

  return prisma.etudiant.findUnique({
    where: { id: etudiantId },
    include: {
      utilisateur: { select: { email: true, dateCreation: true } },
      candidatures: {
        include: {
          offre: {
            include: { entreprise: { select: { nomEntreprise: true, secteurActivite: true } } },
          },
        },
        orderBy: { dateCandidature: 'desc' },
      },
      competences: { include: { competence: true } },
    },
  });
}

export async function ajouterCommentaire(etudiantId: string, superviseurId: string, commentaire: string) {
  const supervision = await prisma.supervision.findUnique({
    where: { superviseurId_etudiantId: { superviseurId, etudiantId } },
  });
  if (!supervision) throw new Error('Etudiant non supervise');

  return prisma.supervision.update({
    where: { superviseurId_etudiantId: { superviseurId, etudiantId } },
    data: { commentaire },
  });
}

export async function getStatsSuperviseur(userId: string) {
  const supervisions = await prisma.supervision.findMany({
    where: { superviseurId: userId },
    include: {
      etudiant: {
        include: {
          candidatures: true,
        },
      },
    },
  });

  const totalEtudiants = supervisions.length;
  const etudiantsActifs = supervisions.filter(s => s.estActif).length;

  let totalCandidatures = 0;
  let candidaturesAcceptees = 0;
  let candidaturesEnCours = 0;

  supervisions.forEach(s => {
    s.etudiant.candidatures.forEach(c => {
      totalCandidatures++;
      if (c.statut === 'acceptee') candidaturesAcceptees++;
      if (['soumise', 'vue', 'entretien'].includes(c.statut)) candidaturesEnCours++;
    });
  });

  return {
    totalEtudiants,
    etudiantsActifs,
    totalCandidatures,
    candidaturesAcceptees,
    candidaturesEnCours,
    tauxInsertion: totalEtudiants > 0 ? Math.round((candidaturesAcceptees / totalEtudiants) * 100) : 0,
  };
}