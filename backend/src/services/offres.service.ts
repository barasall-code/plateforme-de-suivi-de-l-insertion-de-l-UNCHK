import { prisma } from '../lib/prisma';

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
      competences: { include: { competence: true } },
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

  const offre = await prisma.offre.create({
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

  if (Array.isArray(data.competences) && data.competences.length > 0) {
    await prisma.offreCompetence.createMany({
      data: data.competences.map((c: { competenceId: string; niveauRequis?: string; estObligatoire?: boolean }) => ({
        offreId: offre.id,
        competenceId: c.competenceId,
        niveauRequis: c.niveauRequis ?? 'intermédiaire',
        estObligatoire: c.estObligatoire !== undefined ? c.estObligatoire : true,
      })),
      skipDuplicates: true,
    });
  }

  return prisma.offre.findUnique({
    where: { id: offre.id },
    include: { competences: { include: { competence: true } } },
  });
}

export async function updateOffre(id: string, data: any, entrepriseUserId: string) {
  const offre = await prisma.offre.findUnique({ where: { id } });
  if (!offre) throw new Error('Offre introuvable');
  if (offre.entrepriseId !== entrepriseUserId) throw new Error('Non autorise');
  if (offre.statut === 'publie') throw new Error('Impossible de modifier une offre publiee');

  const updated = await prisma.offre.update({
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

  if (Array.isArray(data.competences)) {
    await prisma.offreCompetence.deleteMany({ where: { offreId: id } });
    if (data.competences.length > 0) {
      await prisma.offreCompetence.createMany({
        data: data.competences.map((c: { competenceId: string; niveauRequis?: string; estObligatoire?: boolean }) => ({
          offreId: id,
          competenceId: c.competenceId,
          niveauRequis: c.niveauRequis ?? 'intermédiaire',
          estObligatoire: c.estObligatoire !== undefined ? c.estObligatoire : true,
        })),
        skipDuplicates: true,
      });
    }
  }

  return prisma.offre.findUnique({
    where: { id: updated.id },
    include: { competences: { include: { competence: true } } },
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
    include: {
      _count: { select: { candidatures: true } },
    },
    orderBy: { dateCreation: 'desc' },
  });
}

export async function soumettreOffre(id: string, entrepriseUserId: string) {
  const offre = await prisma.offre.findUnique({ where: { id } });
  if (!offre) throw new Error('Offre introuvable');
  if (offre.entrepriseId !== entrepriseUserId) throw new Error('Non autorise');
  if (offre.statut !== 'brouillon') throw new Error('Seules les offres en brouillon peuvent etre soumises pour validation');

  return prisma.offre.update({
    where: { id },
    data: { statut: 'soumis' },
  });
}