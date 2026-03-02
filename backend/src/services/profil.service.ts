import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getProfilEtudiant(userId: string) {
  const etudiant = await prisma.etudiant.findUnique({
    where: { id: userId },
    include: {
      utilisateur: { select: { email: true, dateCreation: true } },
      competences: { include: { competence: true } },
    },
  });
  if (!etudiant) throw new Error('Profil introuvable');
  return etudiant;
}

export async function updateProfilEtudiant(userId: string, data: any) {
  const etudiant = await prisma.etudiant.findUnique({ where: { id: userId } });
  if (!etudiant) throw new Error('Profil introuvable');
  return prisma.etudiant.update({
    where: { id: userId },
    data: {
      nom: data.nom,
      prenom: data.prenom,
      filiere: data.filiere,
      niveauEtude: data.niveauEtude,
      promotion: data.promotion,
      telephone: data.telephone,
      cvUrl: data.cvUrl,
      linkedinUrl: data.linkedinUrl,
      photoUrl: data.photoUrl,
      dateNaissance: data.dateNaissance ? new Date(data.dateNaissance) : undefined,
    },
  });
}

export async function getProfilEntreprise(userId: string) {
  const entreprise = await prisma.entreprise.findUnique({
    where: { id: userId },
    include: {
      utilisateur: { select: { email: true, dateCreation: true } },
    },
  });
  if (!entreprise) throw new Error('Profil introuvable');
  return entreprise;
}

export async function updateProfilEntreprise(userId: string, data: any) {
  const entreprise = await prisma.entreprise.findUnique({ where: { id: userId } });
  if (!entreprise) throw new Error('Profil introuvable');
  return prisma.entreprise.update({
    where: { id: userId },
    data: {
      nomEntreprise: data.nomEntreprise,
      secteurActivite: data.secteurActivite,
      description: data.description,
      siteWeb: data.siteWeb,
      tailleEntreprise: data.tailleEntreprise,
      ville: data.ville,
      pays: data.pays,
      logoUrl: data.logoUrl,
      siret: data.siret,
    },
  });
}