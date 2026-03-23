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
    offresEnAttente,
    candidaturesAcceptees,
  ] = await Promise.all([
    prisma.etudiant.count(),
    prisma.entreprise.count(),
    prisma.offre.count(),
    prisma.candidature.count(),
    prisma.entreprise.count({ where: { estValide: false } }),
    prisma.offre.count({ where: { statut: 'publie' } }),
    prisma.offre.count({ where: { statut: 'soumis' } }),
    prisma.candidature.count({ where: { statut: 'acceptee' } }),
  ]);

  return {
    totalEtudiants,
    totalEntreprises,
    totalOffres,
    totalCandidatures,
    entreprisesEnAttente,
    offresPubliees,
    offresEnAttente,
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
  if (data.email) {
    const existing = await prisma.utilisateur.findFirst({ where: { email: data.email, NOT: { id } } });
    if (existing) throw new Error('Email deja utilise');
  }
  return prisma.superviseur.update({
    where: { id },
    data: {
      nom: data.nom,
      prenom: data.prenom,
      departement: data.departement ?? null,
      telephone: data.telephone ?? null,
      ...(data.email && { utilisateur: { update: { email: data.email } } }),
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

// ─── Statistiques avancées ────────────────────────────────────────────────────

export interface StatsFilters {
  promotion?: string;
  filiere?: string;
  niveauEtude?: string;
  typeOffre?: string;
  secteurActivite?: string;
  annee?: number;
}

export async function getStatsAvancees(filters: StatsFilters = {}) {
  const annee = filters.annee ?? new Date().getFullYear();
  const debutAnnee = new Date(`${annee}-01-01`);
  const finAnnee   = new Date(`${annee}-12-31T23:59:59`);

  // Build Etudiant where clause
  const etudiantWhere: Record<string, unknown> = {};
  if (filters.promotion)   etudiantWhere.promotion   = filters.promotion;
  if (filters.filiere)     etudiantWhere.filiere      = filters.filiere;
  if (filters.niveauEtude) etudiantWhere.niveauEtude  = filters.niveauEtude;

  const offreWhere: Record<string, unknown> = {};
  if (filters.typeOffre) offreWhere.typeOffre = filters.typeOffre;
  if (filters.secteurActivite) offreWhere.entreprise = { secteurActivite: filters.secteurActivite };

  // ── Candidatures par mois ─────────────────────────────────────────────────
  const candidaturesParMois = await prisma.$queryRaw<{ mois: number; nombre: bigint }[]>`
    SELECT EXTRACT(MONTH FROM "dateCandidature")::int AS mois,
           COUNT(*)::bigint                           AS nombre
    FROM candidatures
    WHERE "dateCandidature" BETWEEN ${debutAnnee} AND ${finAnnee}
    GROUP BY mois
    ORDER BY mois
  `;

  // ── Répartition par filière ───────────────────────────────────────────────
  const parFiliere = await prisma.etudiant.groupBy({
    by: ['filiere'],
    _count: { _all: true },
    where: Object.keys(etudiantWhere).length ? etudiantWhere : undefined,
  });

  // ── Répartition par niveau d'étude ────────────────────────────────────────
  const parNiveau = await prisma.etudiant.groupBy({
    by: ['niveauEtude'],
    _count: { _all: true },
    where: Object.keys(etudiantWhere).length ? etudiantWhere : undefined,
  });

  // ── Répartition par statut candidature ────────────────────────────────────
  const parStatutCandidature = await prisma.candidature.groupBy({
    by: ['statut'],
    _count: { _all: true },
    where: {
      dateCandidature: { gte: debutAnnee, lte: finAnnee },
    },
  });

  // ── Top secteurs d'activité par offres ────────────────────────────────────
  const topSecteurs = await prisma.$queryRaw<{ secteur: string; offres: bigint; candidatures: bigint }[]>`
    SELECT e."secteurActivite" AS secteur,
           COUNT(DISTINCT o.id)::bigint AS offres,
           COUNT(DISTINCT c.id)::bigint AS candidatures
    FROM entreprises e
    LEFT JOIN offres o ON o."entrepriseId" = e.id
    LEFT JOIN candidatures c ON c."offreId" = o.id
    WHERE e."secteurActivite" IS NOT NULL
    GROUP BY e."secteurActivite"
    ORDER BY offres DESC
    LIMIT 10
  `;

  // ── Top offres par type ────────────────────────────────────────────────────
  const parTypeOffre = await prisma.offre.groupBy({
    by: ['typeOffre'],
    _count: { _all: true },
    where: { statut: 'publie' },
  });

  // ── Taux de conversion par étape ──────────────────────────────────────────
  const [totalCandidatures, vues, entretiens, acceptees] = await Promise.all([
    prisma.candidature.count({ where: { dateCandidature: { gte: debutAnnee, lte: finAnnee } } }),
    prisma.candidature.count({ where: { statut: 'vue', dateCandidature: { gte: debutAnnee, lte: finAnnee } } }),
    prisma.candidature.count({ where: { statut: 'entretien', dateCandidature: { gte: debutAnnee, lte: finAnnee } } }),
    prisma.candidature.count({ where: { statut: 'acceptee', dateCandidature: { gte: debutAnnee, lte: finAnnee } } }),
  ]);

  // ── Situation des étudiants ────────────────────────────────────────────────
  const parSituation = await prisma.etudiant.groupBy({
    by: ['situationActuelle'],
    _count: { _all: true },
    where: Object.keys(etudiantWhere).length ? etudiantWhere : undefined,
  });

  // ── Évolution inscriptions par mois ───────────────────────────────────────
  const inscriptionsParMois = await prisma.$queryRaw<{ mois: number; nombre: bigint }[]>`
    SELECT EXTRACT(MONTH FROM u."dateCreation")::int AS mois,
           COUNT(*)::bigint                          AS nombre
    FROM utilisateurs u
    WHERE u."dateCreation" BETWEEN ${debutAnnee} AND ${finAnnee}
      AND u."typeUtilisateur" = 'etudiant'
    GROUP BY mois
    ORDER BY mois
  `;

  return {
    annee,
    filters,
    candidaturesParMois: candidaturesParMois.map(r => ({ mois: r.mois, nombre: Number(r.nombre) })),
    inscriptionsParMois: inscriptionsParMois.map(r => ({ mois: r.mois, nombre: Number(r.nombre) })),
    parFiliere: [...parFiliere]
      .sort((a, b) => ((b._count as { _all: number })._all) - ((a._count as { _all: number })._all))
      .map(r => ({ filiere: r.filiere, nombre: (r._count as { _all: number })._all })),
    parNiveau:  parNiveau.map(r => ({ niveau: r.niveauEtude, nombre: (r._count as { _all: number })._all })),
    parTypeOffre: parTypeOffre.map(r => ({ type: r.typeOffre, nombre: (r._count as { _all: number })._all })),
    parStatutCandidature: parStatutCandidature.map(r => ({ statut: r.statut, nombre: (r._count as { _all: number })._all })),
    parSituation: parSituation.map(r => ({ situation: r.situationActuelle, nombre: (r._count as { _all: number })._all })),
    topSecteurs: topSecteurs.map(r => ({
      secteur: r.secteur,
      offres: Number(r.offres),
      candidatures: Number(r.candidatures),
    })),
    entonnoir: {
      totalCandidatures,
      vues,
      entretiens,
      acceptees,
      tauxVue:       totalCandidatures > 0 ? Math.round((vues / totalCandidatures) * 100) : 0,
      tauxEntretien: totalCandidatures > 0 ? Math.round((entretiens / totalCandidatures) * 100) : 0,
      tauxAcceptation: totalCandidatures > 0 ? Math.round((acceptees / totalCandidatures) * 100) : 0,
    },
  };
}
