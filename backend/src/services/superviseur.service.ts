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
  // Accès autorisé même sans supervision (mode consultation tous les étudiants)

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

export async function updateProfilSuperviseur(userId: string, data: any) {
  const superviseur = await prisma.superviseur.findUnique({ where: { id: userId } });
  if (!superviseur) throw new Error('Superviseur introuvable');
  return prisma.superviseur.update({
    where: { id: userId },
    data: {
      nom: data.nom,
      prenom: data.prenom,
      departement: data.departement ?? null,
      telephone: data.telephone ?? null,
    },
  });
}

export async function getStatsSuperviseur(userId: string) {
  const [
    supervisions,
    totalEtudiantsPlateform,
    totalCandidaturesPlateform,
    accepteesPlateform,
    enCoursPlateform,
    recentes,
    tousEtudiantsSituation,
  ] = await Promise.all([
    prisma.supervision.findMany({
      where:   { superviseurId: userId },
      include: { etudiant: { include: { candidatures: { select: { statut: true } } } } },
    }),
    prisma.etudiant.count(),
    prisma.candidature.count(),
    prisma.candidature.count({ where: { statut: 'acceptee' } }),
    prisma.candidature.count({ where: { statut: { in: ['soumise', 'vue', 'entretien'] } } }),
    prisma.candidature.findMany({
      orderBy: { dateCandidature: 'desc' },
      take: 5,
      select: {
        statut: true,
        dateCandidature: true,
        etudiant: { select: { nom: true, prenom: true } },
        offre: { select: { titre: true, entreprise: { select: { nomEntreprise: true } } } },
      },
    }),
    prisma.etudiant.findMany({ select: { situationActuelle: true } }),
  ]);

  // Répartition par situationActuelle — tous les étudiants de la plateforme
  const parSituationPlateform: Record<string, number> = {
    en_cours_etude:    0,
    sous_contrat_stage: 0,
    sous_contrat_cdd:  0,
    sous_contrat_cdi:  0,
    chomeur:           0,
  };
  for (const e of tousEtudiantsSituation) {
    const sit = (e as any).situationActuelle || 'en_cours_etude';
    if (sit in parSituationPlateform) parSituationPlateform[sit]++;
  }

  const totalEtudiants      = supervisions.length;
  const etudiantsActifs     = supervisions.filter(s => s.estActif).length;
  let totalCandidatures     = 0;
  let candidaturesAcceptees = 0;
  let candidaturesEnCours   = 0;

  const parSituationActuelle: Record<string, number> = {
    en_cours_etude:    0,
    sous_contrat_stage: 0,
    sous_contrat_cdd:  0,
    sous_contrat_cdi:  0,
    chomeur:           0,
  };

  for (const s of supervisions) {
    for (const c of s.etudiant.candidatures) {
      totalCandidatures++;
      if (c.statut === 'acceptee')                           candidaturesAcceptees++;
      if (['soumise', 'vue', 'entretien'].includes(c.statut)) candidaturesEnCours++;
    }
    const sit = (s.etudiant as any).situationActuelle || 'en_cours_etude';
    if (sit in parSituationActuelle) parSituationActuelle[sit]++;
  }

  // Taux d'insertion = étudiants avec contrat (CDI, CDD, stage) / total
  const insertesSupervises =
    (parSituationActuelle['sous_contrat_cdi']   ?? 0) +
    (parSituationActuelle['sous_contrat_cdd']   ?? 0) +
    (parSituationActuelle['sous_contrat_stage'] ?? 0);

  const insertesPlateform =
    (parSituationPlateform['sous_contrat_cdi']   ?? 0) +
    (parSituationPlateform['sous_contrat_cdd']   ?? 0) +
    (parSituationPlateform['sous_contrat_stage'] ?? 0);

  return {
    // Mes supervisions
    totalEtudiants,
    etudiantsActifs,
    totalCandidatures,
    candidaturesAcceptees,
    candidaturesEnCours,
    parSituationActuelle,
    tauxInsertion: totalEtudiants > 0
      ? Math.round((insertesSupervises / totalEtudiants) * 100)
      : 0,
    // Plateforme globale
    totalEtudiantsPlateform,
    totalCandidaturesPlateform,
    accepteesPlateform,
    enCoursPlateform,
    parSituationPlateform,
    tauxInsertionPlateform: totalEtudiantsPlateform > 0
      ? Math.round((insertesPlateform / totalEtudiantsPlateform) * 100)
      : 0,
    recentes,
  };
}

export async function getTousEtudiants() {
  return prisma.etudiant.findMany({
    include: {
      utilisateur: { select: { email: true } },
      candidatures: {
        select: { statut: true, dateCandidature: true },
        orderBy: { dateCandidature: 'desc' },
        take: 5,
      },
      supervisions: {
        select: { superviseurId: true, estActif: true },
      },
    },
    orderBy: { nom: 'asc' },
  });
}

export async function creerSupervision(superviseurId: string, etudiantId: string) {
  const superviseur = await prisma.superviseur.findUnique({ where: { id: superviseurId } });
  if (!superviseur) throw new Error('Superviseur introuvable');
  const existing = await prisma.supervision.findUnique({
    where: { superviseurId_etudiantId: { superviseurId, etudiantId } }
  });
  if (existing) throw new Error('Supervision déjà existante');
  return prisma.supervision.create({
    data: { superviseurId, etudiantId, estActif: true }
  });
}
