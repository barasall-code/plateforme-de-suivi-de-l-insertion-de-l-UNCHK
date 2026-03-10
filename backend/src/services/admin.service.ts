import { prisma } from '../lib/prisma';

export async function getStats() {
  const [
    totalEtudiants,
    totalEntreprises,
    totalOffres,
    totalCandidatures,
    entreprisesEnAttente,
    offresPubliees,
    candidaturesAcceptees,
  ] = await Promise.all([
    prisma.etudiant.count(),
    prisma.entreprise.count(),
    prisma.offre.count(),
    prisma.candidature.count(),
    prisma.entreprise.count({ where: { estValide: false } }),
    prisma.offre.count({ where: { statut: 'publie' } }),
    prisma.candidature.count({ where: { statut: 'acceptee' } }),
  ]);

  return {
    totalEtudiants,
    totalEntreprises,
    totalOffres,
    totalCandidatures,
    entreprisesEnAttente,
    offresPubliees,
    candidaturesAcceptees,
    tauxInsertion: totalEtudiants > 0
      ? Math.round((candidaturesAcceptees / totalEtudiants) * 100)
      : 0,
  };
}

export async function getEntreprises() {
  return prisma.entreprise.findMany({
    include: {
      utilisateur: { select: { email: true, dateCreation: true, estActif: true } },
      offres:      { select: { id: true, statut: true } },
    },
    orderBy: { utilisateur: { dateCreation: 'desc' } },
    take: 100,
  });
}

export async function validerEntreprise(id: string) {
  const entreprise = await prisma.entreprise.findUnique({ where: { id } });
  if (!entreprise)          throw new Error('Entreprise introuvable');
  if (entreprise.estValide) throw new Error('Entreprise deja validee');

  return prisma.entreprise.update({
    where: { id },
    data:  { estValide: true, dateValidation: new Date() },
  });
}

export async function rejeterEntreprise(id: string) {
  const entreprise = await prisma.entreprise.findUnique({ where: { id } });
  if (!entreprise) throw new Error('Entreprise introuvable');

  return prisma.entreprise.update({
    where: { id },
    data:  { estValide: false, dateValidation: null },
  });
}

export async function getUtilisateurs(page = 1, limit = 50) {
  const skip = (Math.max(1, page) - 1) * Math.min(100, limit);
  const [utilisateurs, total] = await Promise.all([
    prisma.utilisateur.findMany({
      select: {
        id:              true,
        email:           true,
        typeUtilisateur: true,
        estActif:        true,
        dateCreation:    true,
        etudiant:   { select: { nom: true, prenom: true } },
        entreprise: { select: { nomEntreprise: true, estValide: true } },
      },
      orderBy: { dateCreation: 'desc' },
      skip,
      take: Math.min(100, limit),
    }),
    prisma.utilisateur.count(),
  ]);
  return { utilisateurs, total, page, totalPages: Math.ceil(total / limit) };
}

export async function toggleUtilisateur(id: string, adminId: string) {
  if (id === adminId) throw new Error('Impossible de desactiver votre propre compte');

  const user = await prisma.utilisateur.findUnique({ where: { id } });
  if (!user) throw new Error('Utilisateur introuvable');

  return prisma.utilisateur.update({
    where: { id },
    data:  { estActif: !user.estActif },
  });
}

export async function validerOffre(id: string) {
  const offre = await prisma.offre.findUnique({ where: { id } });
  if (!offre)                    throw new Error('Offre introuvable');
  if (offre.statut === 'publie') throw new Error('Offre deja publiee');

  return prisma.offre.update({
    where: { id },
    data:  { statut: 'publie', datePublication: new Date() },
  });
}

export async function getOffresEnAttente() {
  return prisma.offre.findMany({
    where:   { statut: 'brouillon' },
    include: { entreprise: { select: { nomEntreprise: true } } },
    orderBy: { dateCreation: 'desc' },
    take: 100,
  });
}
