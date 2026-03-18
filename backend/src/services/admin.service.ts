import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

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
    where:   { statut: 'soumis' },
    include: { entreprise: { select: { nomEntreprise: true } } },
    orderBy: { dateCreation: 'desc' },
    take: 100,
  });
}

// ─── Superviseurs ────────────────────────────────────────────────────────────

export async function getSuperviseurs() {
  return prisma.superviseur.findMany({
    include: {
      utilisateur: { select: { email: true, dateCreation: true, estActif: true } },
      _count: { select: { supervisions: true } },
    },
    orderBy: { nom: 'asc' },
  });
}

export async function creerSuperviseur(data: any) {
  if (!data.email || !data.motDePasse) throw new Error('email et motDePasse requis');
  if (!data.nom || !data.prenom)       throw new Error('nom et prenom requis');

  const existing = await prisma.utilisateur.findUnique({ where: { email: data.email } });
  if (existing) throw new Error('Email deja utilise');

  const hash = await bcrypt.hash(data.motDePasse, 12);
  return prisma.utilisateur.create({
    data: {
      email: data.email,
      motDePasseHash: hash,
      typeUtilisateur: 'superviseur',
      superviseur: {
        create: {
          nom: data.nom,
          prenom: data.prenom,
          departement: data.departement || null,
          telephone: data.telephone || null,
        },
      },
    },
    include: { superviseur: true },
  });
}

export async function modifierSuperviseur(id: string, data: any) {
  const superviseur = await prisma.superviseur.findUnique({ where: { id } });
  if (!superviseur) throw new Error('Superviseur introuvable');
  return prisma.superviseur.update({
    where: { id },
    data: {
      nom: data.nom,
      prenom: data.prenom,
      departement: data.departement ?? null,
      telephone: data.telephone ?? null,
    },
  });
}

export async function supprimerSuperviseur(id: string) {
  const superviseur = await prisma.superviseur.findUnique({ where: { id } });
  if (!superviseur) throw new Error('Superviseur introuvable');
  await prisma.utilisateur.delete({ where: { id } });
  return { message: 'Superviseur supprime' };
}

// ─── Supervisions ─────────────────────────────────────────────────────────────

export async function getSupervisions() {
  return prisma.supervision.findMany({
    include: {
      superviseur: { select: { nom: true, prenom: true, departement: true } },
      etudiant: {
        select: {
          nom: true,
          prenom: true,
          filiere: true,
          niveauEtude: true,
          utilisateur: { select: { email: true } },
        },
      },
    },
    orderBy: { dateDebut: 'desc' },
  });
}

export async function assignerSupervision(superviseurId: string, etudiantId: string) {
  const superviseur = await prisma.superviseur.findUnique({ where: { id: superviseurId } });
  if (!superviseur) throw new Error('Superviseur introuvable');
  const etudiant = await prisma.etudiant.findUnique({ where: { id: etudiantId } });
  if (!etudiant) throw new Error('Etudiant introuvable');

  const existing = await prisma.supervision.findUnique({
    where: { superviseurId_etudiantId: { superviseurId, etudiantId } },
  });
  if (existing) throw new Error('Supervision deja existante');

  return prisma.supervision.create({
    data: { superviseurId, etudiantId },
    include: {
      superviseur: { select: { nom: true, prenom: true } },
      etudiant: { select: { nom: true, prenom: true, utilisateur: { select: { email: true } } } },
    },
  });
}

export async function supprimerSupervision(superviseurId: string, etudiantId: string) {
  const existing = await prisma.supervision.findUnique({
    where: { superviseurId_etudiantId: { superviseurId, etudiantId } },
  });
  if (!existing) throw new Error('Supervision introuvable');
  await prisma.supervision.delete({
    where: { superviseurId_etudiantId: { superviseurId, etudiantId } },
  });
  return { message: 'Supervision supprimee' };
}

export async function getEtudiantsSansSupervision() {
  return prisma.etudiant.findMany({
    where: {
      supervisions: { none: { estActif: true } },
    },
    select: {
      id: true,
      nom: true,
      prenom: true,
      filiere: true,
      niveauEtude: true,
      utilisateur: { select: { email: true } },
    },
    orderBy: { nom: 'asc' },
  });
}
