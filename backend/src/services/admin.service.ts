import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getStats() {
  const [
    totalEtudiants,
    totalEntreprises,
    totalOffres,
    totalCandidatures,
    entreprisesEnAttente,
    offresPubliees,
  ] = await Promise.all([
    prisma.etudiant.count(),
    prisma.entreprise.count(),
    prisma.offre.count(),
    prisma.candidature.count(),
    prisma.entreprise.count({ where: { estValide: false } }),
    prisma.offre.count({ where: { statut: 'publie' } }),
  ]);

  return {
    totalEtudiants,
    totalEntreprises,
    totalOffres,
    totalCandidatures,
    entreprisesEnAttente,
    offresPubliees,
  };
}

export async function getEntreprises() {
  return prisma.entreprise.findMany({
    include: {
      utilisateur: { select: { email: true, dateCreation: true, estActif: true } },
      offres: { select: { id: true, statut: true } },
    },
    orderBy: { utilisateur: { dateCreation: 'desc' } },
  });
}

export async function validerEntreprise(id: string) {
  const entreprise = await prisma.entreprise.findUnique({ where: { id } });
  if (!entreprise) throw new Error('Entreprise introuvable');

  return prisma.entreprise.update({
    where: { id },
    data: { estValide: true, dateValidation: new Date() },
  });
}

export async function rejeterEntreprise(id: string) {
  const entreprise = await prisma.entreprise.findUnique({ where: { id } });
  if (!entreprise) throw new Error('Entreprise introuvable');

  return prisma.entreprise.update({
    where: { id },
    data: { estValide: false, dateValidation: null },
  });
}

export async function getUtilisateurs() {
  return prisma.utilisateur.findMany({
    select: {
      id: true,
      email: true,
      typeUtilisateur: true,
      estActif: true,
      dateCreation: true,
      etudiant: { select: { nom: true, prenom: true } },
      entreprise: { select: { nomEntreprise: true, estValide: true } },
    },
    orderBy: { dateCreation: 'desc' },
  });
}

export async function toggleUtilisateur(id: string) {
  const user = await prisma.utilisateur.findUnique({ where: { id } });
  if (!user) throw new Error('Utilisateur introuvable');

  return prisma.utilisateur.update({
    where: { id },
    data: { estActif: !user.estActif },
  });
}

export async function validerOffre(id: string) {
  const offre = await prisma.offre.findUnique({ where: { id } });
  if (!offre) throw new Error('Offre introuvable');

  return prisma.offre.update({
    where: { id },
    data: { statut: 'publie', datePublication: new Date() },
  });
}

export async function getOffresEnAttente() {
  return prisma.offre.findMany({
    where: { statut: 'brouillon' },
    include: {
      entreprise: { select: { nomEntreprise: true } },
    },
    orderBy: { dateCreation: 'desc' },
  });
}
