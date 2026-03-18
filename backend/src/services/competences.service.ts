import { prisma } from '../lib/prisma';

export async function getAllCompetences() {
  return prisma.competence.findMany({
    orderBy: { nomCompetence: 'asc' },
  });
}

export async function createCompetence(data: any) {
  const existing = await prisma.competence.findUnique({ where: { nomCompetence: data.nomCompetence } });
  if (existing) throw new Error('Competence deja existante');
  return prisma.competence.create({
    data: {
      nomCompetence: data.nomCompetence,
      categorie: data.categorie,
      description: data.description || null,
    },
  });
}

export async function getMesCompetences(etudiantId: string) {
  return prisma.etudiantCompetence.findMany({
    where: { etudiantId },
    include: { competence: true },
    orderBy: { dateAcquisition: 'desc' },
  });
}

export async function ajouterCompetence(etudiantId: string, data: any) {
  if (!data.nomCompetence) throw new Error('nomCompetence requis');

  let competence = await prisma.competence.findUnique({
    where: { nomCompetence: data.nomCompetence },
  });

  if (!competence) {
    competence = await prisma.competence.create({
      data: {
        nomCompetence: data.nomCompetence,
        categorie: data.categorie || 'technique',
        description: data.description || null,
      },
    });
  }

  const existing = await prisma.etudiantCompetence.findUnique({
    where: { etudiantId_competenceId: { etudiantId, competenceId: competence.id } },
  });
  if (existing) throw new Error('Competence deja ajoutee');

  return prisma.etudiantCompetence.create({
    data: {
      etudiantId,
      competenceId: competence.id,
      niveauMaitrise: data.niveauMaitrise || 'intermediaire',
    },
    include: { competence: true },
  });
}

export async function modifierNiveau(etudiantId: string, competenceId: string, niveauMaitrise: string) {
  if (!niveauMaitrise) throw new Error('niveauMaitrise requis');
  const existing = await prisma.etudiantCompetence.findUnique({
    where: { etudiantId_competenceId: { etudiantId, competenceId } },
  });
  if (!existing) throw new Error('Competence non trouvee');

  return prisma.etudiantCompetence.update({
    where: { etudiantId_competenceId: { etudiantId, competenceId } },
    data: { niveauMaitrise },
    include: { competence: true },
  });
}

export async function supprimerCompetence(etudiantId: string, competenceId: string) {
  const existing = await prisma.etudiantCompetence.findUnique({
    where: { etudiantId_competenceId: { etudiantId, competenceId } },
  });
  if (!existing) throw new Error('Competence non trouvee');
  await prisma.etudiantCompetence.delete({
    where: { etudiantId_competenceId: { etudiantId, competenceId } },
  });
  return { message: 'Competence supprimee' };
}
