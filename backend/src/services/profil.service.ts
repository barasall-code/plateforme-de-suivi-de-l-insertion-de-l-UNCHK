import { prisma } from '../lib/prisma';
import { z } from 'zod';

const UpdateEtudiantSchema = z.object({
  nom:              z.string().min(1).max(100).optional(),
  prenom:           z.string().min(1).max(100).optional(),
  filiere:          z.string().max(100).optional(),
  niveauEtude:      z.enum(['licence', 'master', 'master1', 'master2', 'doctorat']).optional(),
  promotion:        z.string().max(20).optional(),
  telephone:        z.string().max(20).optional(),
  cvUrl:            z.string().url().optional().or(z.literal('')),
  linkedinUrl:      z.string().url().optional().or(z.literal('')),
  photoUrl:         z.string().url().optional().or(z.literal('')),
  dateNaissance:    z.string().optional(),
  situationActuelle: z.enum(['en_cours_etude', 'sous_contrat_stage', 'sous_contrat_cdd', 'sous_contrat_cdi', 'chomeur']).optional(),
}).strict();

const UpdateEntrepriseSchema = z.object({
  nomEntreprise:    z.string().min(1).max(255).optional(),
  secteurActivite:  z.string().max(100).optional(),
  description:      z.string().max(2000).optional(),
  siteWeb:          z.string().url().optional().or(z.literal('')),
  tailleEntreprise: z.enum(['TPE', 'PME', 'ETI', 'GE']).optional(),
  ville:            z.string().max(100).optional(),
  pays:             z.string().max(100).optional(),
  logoUrl:          z.string().url().optional().or(z.literal('')),
  siret:            z.string().max(20).optional(),
}).strict();

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
  const validation = UpdateEtudiantSchema.safeParse(data);
  if (!validation.success) {
    const flat = validation.error.flatten();
    const msg = flat.formErrors.length > 0
      ? flat.formErrors.join(', ')
      : JSON.stringify(flat.fieldErrors);
    throw new Error(msg);
  }
  const d = validation.data;

  const etudiant = await prisma.etudiant.findUnique({ where: { id: userId } });
  if (!etudiant) throw new Error('Profil introuvable');

  return prisma.etudiant.update({
    where: { id: userId },
    data: {
      ...(d.nom           !== undefined && { nom: d.nom }),
      ...(d.prenom        !== undefined && { prenom: d.prenom }),
      ...(d.filiere       !== undefined && { filiere: d.filiere }),
      ...(d.niveauEtude   !== undefined && { niveauEtude: d.niveauEtude }),
      ...(d.promotion     !== undefined && { promotion: d.promotion }),
      ...(d.telephone     !== undefined && { telephone: d.telephone }),
      ...(d.cvUrl         !== undefined && { cvUrl: d.cvUrl }),
      ...(d.linkedinUrl   !== undefined && { linkedinUrl: d.linkedinUrl }),
      ...(d.photoUrl      !== undefined && { photoUrl: d.photoUrl }),
      ...(d.dateNaissance !== undefined && {
        dateNaissance: d.dateNaissance ? new Date(d.dateNaissance) : null
      }),
      ...(d.situationActuelle !== undefined && { situationActuelle: d.situationActuelle }),
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
  const validation = UpdateEntrepriseSchema.safeParse(data);
  if (!validation.success) {
    const flat = validation.error.flatten();
    const msg = flat.formErrors.length > 0
      ? flat.formErrors.join(', ')
      : JSON.stringify(flat.fieldErrors);
    throw new Error(msg);
  }
  const d = validation.data;

  const entreprise = await prisma.entreprise.findUnique({ where: { id: userId } });
  if (!entreprise) throw new Error('Profil introuvable');

  return prisma.entreprise.update({
    where: { id: userId },
    data: {
      ...(d.nomEntreprise    !== undefined && { nomEntreprise: d.nomEntreprise }),
      ...(d.secteurActivite  !== undefined && { secteurActivite: d.secteurActivite }),
      ...(d.description      !== undefined && { description: d.description }),
      ...(d.siteWeb          !== undefined && { siteWeb: d.siteWeb }),
      ...(d.tailleEntreprise !== undefined && { tailleEntreprise: d.tailleEntreprise }),
      ...(d.ville            !== undefined && { ville: d.ville }),
      ...(d.pays             !== undefined && { pays: d.pays }),
      ...(d.logoUrl          !== undefined && { logoUrl: d.logoUrl }),
      ...(d.siret            !== undefined && { siret: d.siret }),
    },
  });
}
