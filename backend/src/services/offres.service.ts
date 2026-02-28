import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getOffres(filters: any) {
  const where: any = { statut: 'publie' };
  if (filters.typeOffre) where.typeOffre = filters.typeOffre;
  if (filters.modeTravail) where.modeTravail = filters.modeTravail;
  if (filters.niveauRequis) where.niveauRequis = filters.niveauRequis;
  if (filters.search) {
    where.OR = [
      { titre: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const offres = await prisma.offre.findMany({
    where,
    include: {
      entreprise: { select: { nomEntreprise: true, secteurActivite: true } },
    },
    orderBy: { datePublication: 'desc' },
    skip: filters.page ? (Number(filters.page) - 1) * 10 : 0,
    take: 10,
  });

  const total = await prisma.offre.count({ where });
  return { offres, total, page: Number(filters.page) || 1, totalPages: Math.ceil(total / 10) };
}

export async function getOffreById(id: string) {
  const offre = await prisma.offre.findUnique({
    where: { id },
    include: {
      entreprise: { select: { nomEntreprise: true, secteurActivite: true, siteWeb: true } },
      competences: { include: { competence: true } },
    },
  });
  if (!offre) throw new Error('Offre introuvable');
  return offre;
}

export async function createOffre(data: any, entrepriseUserId: string) {
  const entreprise = await prisma.entreprise.findUnique({ where: { id: entrepriseUserId } });
  if (!entreprise) throw new Error('Entreprise introuvable');
  if (!entreprise.estValide) throw new Error('Entreprise non validee');

  return prisma.offre.create({
    data: {
      entrepriseId: entrepriseUserId,
      titre: data.titre,
      description: data.description,
      typeOffre: data.typeOffre,
      domaine: data.domaine || '',
      niveauRequis: data.niveauRequis,
      modeTravail: data.modeTravail || 'presentiel',
      localisation: data.localisation || '',
      salaireMin: data.salaireMin,
      salaireMax: data.salaireMax,
      dureeMois: data.dureeMois,
      dateLimiteCandidature: new Date(data.dateLimiteCandidature || Date.now()),
      statut: 'brouillon',
    },
  });
}

export async function updateOffre(id: string, data: any, entrepriseUserId: string) {
  const offre = await prisma.offre.findUnique({ where: { id } });
  if (!offre) throw new Error('Offre introuvable');
  if (offre.entrepriseId !== entrepriseUserId) throw new Error('Non autorise');
  if (offre.statut === 'publie') throw new Error('Impossible de modifier une offre publiee');

  return prisma.offre.update({
    where: { id },
    data: {
      titre: data.titre,
      description: data.description,
      typeOffre: data.typeOffre,
      domaine: data.domaine,
      niveauRequis: data.niveauRequis,
      modeTravail: data.modeTravail,
      localisation: data.localisation,
      salaireMin: data.salaireMin,
      salaireMax: data.salaireMax,
      dureeMois: data.dureeMois,
      dateLimiteCandidature: data.dateLimiteCandidature ? new Date(data.dateLimiteCandidature) : undefined,
    },
  });
}

export async function deleteOffre(id: string, entrepriseUserId: string) {
  const offre = await prisma.offre.findUnique({ where: { id } });
  if (!offre) throw new Error('Offre introuvable');
  if (offre.entrepriseId !== entrepriseUserId) throw new Error('Non autorise');
  await prisma.offre.delete({ where: { id } });
  return { message: 'Offre supprimee' };
}

export async function validerOffre(id: string) {
  const offre = await prisma.offre.findUnique({ where: { id } });
  if (!offre) throw new Error('Offre introuvable');
  return prisma.offre.update({
    where: { id },
    data: { statut: 'publie', datePublication: new Date() },
  });
}

export async function getMesOffres(entrepriseUserId: string) {
  return prisma.offre.findMany({
    where: { entrepriseId: entrepriseUserId },
    orderBy: { dateCreation: 'desc' },
  });
}