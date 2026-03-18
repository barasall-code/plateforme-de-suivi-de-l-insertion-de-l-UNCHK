import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function postuler(data: any, etudiantUserId: string) {
  const etudiant = await prisma.etudiant.findUnique({ where: { id: etudiantUserId } });
  if (!etudiant) throw new Error('Profil etudiant introuvable');

  const offre = await prisma.offre.findUnique({ where: { id: data.offreId } });
  if (!offre) throw new Error('Offre introuvable');
  if (offre.statut !== 'publie') throw new Error('Offre non disponible');

  const existante = await prisma.candidature.findUnique({
    where: { etudiantId_offreId: { etudiantId: etudiantUserId, offreId: data.offreId } },
  });
  if (existante) throw new Error('Vous avez deja postule a cette offre');

  let docs: object | undefined;
  if (data.documentsComplementaires) {
    try {
      docs = typeof data.documentsComplementaires === 'string'
        ? JSON.parse(data.documentsComplementaires)
        : data.documentsComplementaires;
    } catch {
      docs = undefined;
    }
  }

  return prisma.candidature.create({
    data: {
      etudiantId: etudiantUserId,
      offreId: data.offreId,
      lettreMotivation: data.lettreMotivation,
      cvUrl: data.cvUrl || etudiant.cvUrl || '',
      documentsComplementaires: docs ?? undefined,
      statut: 'soumise',
    },
    include: {
      offre: { select: { titre: true, entreprise: { select: { nomEntreprise: true } } } },
    },
  });
}

export async function getMesCandidatures(etudiantUserId: string) {
  return prisma.candidature.findMany({
    where: { etudiantId: etudiantUserId },
    include: {
      offre: {
        select: {
          titre: true,
          typeOffre: true,
          localisation: true,
          entreprise: { select: { nomEntreprise: true } },
        },
      },
    },
    orderBy: { dateCandidature: 'desc' },
  });
}

export async function getCandidaturesOffre(offreId: string, entrepriseUserId: string) {
  const offre = await prisma.offre.findUnique({ where: { id: offreId } });
  if (!offre) throw new Error('Offre introuvable');
  if (offre.entrepriseId !== entrepriseUserId) throw new Error('Non autorise');

  return prisma.candidature.findMany({
    where: { offreId },
    select: {
      id: true,
      statut: true,
      dateCandidature: true,
      lettreMotivation: true,
      cvUrl: true,
      documentsComplementaires: true,
      commentaireEntreprise: true,
      etudiant: {
        select: {
          nom: true,
          prenom: true,
          filiere: true,
          niveauEtude: true,
          cvUrl: true,
        },
      },
    },
    orderBy: { dateCandidature: 'desc' },
  });
}

export async function changerStatut(id: string, data: any, entrepriseUserId: string) {
  const candidature = await prisma.candidature.findUnique({
    where: { id },
    include: { offre: true },
  });
  if (!candidature) throw new Error('Candidature introuvable');
  if (candidature.offre.entrepriseId !== entrepriseUserId) throw new Error('Non autorise');

  const ancienStatut = candidature.statut;

  const updated = await prisma.candidature.update({
    where: { id },
    data: {
      statut: data.statut,
      commentaireEntreprise: data.commentaire,
    },
  });

  await prisma.historiqueStatutCandidature.create({
    data: {
      candidatureId: id,
      ancienStatut,
      nouveauStatut: data.statut,
      modificateurId: entrepriseUserId,
      commentaire: data.commentaire,
    },
  });

  // Notification automatique à l'étudiant
  const messages: Record<string, string> = {
    vue: 'Votre candidature a été consultée par l\'entreprise.',
    entretien: 'Félicitations ! Vous êtes convoqué(e) à un entretien.',
    acceptee: '🎉 Félicitations ! Votre candidature a été acceptée.',
    refusee: 'Votre candidature n\'a pas été retenue cette fois.',
  };

  if (messages[data.statut]) {
    await prisma.notification.create({
      data: {
        utilisateurId: candidature.etudiantId,
        typeNotification: 'statut' as any,
        titre: `Candidature — ${candidature.offre.titre}`,
        message: messages[data.statut],
        lienAction: '/candidatures',
        estLue: false,
      },
    });
  }

  return updated;
}

export async function retirerCandidature(id: string, etudiantUserId: string) {
  const candidature = await prisma.candidature.findUnique({ where: { id } });
  if (!candidature) throw new Error('Candidature introuvable');
  if (candidature.etudiantId !== etudiantUserId) throw new Error('Non autorise');
  if (candidature.statut !== 'soumise') throw new Error('Impossible de retirer une candidature en cours de traitement');

  await prisma.candidature.delete({ where: { id } });
  return { message: 'Candidature retiree' };
}
export async function getProfilCandidat(id: string, entrepriseUserId: string) {
  const candidature = await prisma.candidature.findUnique({
    where: { id },
    include: {
      offre: true,
      etudiant: {
        include: {
          utilisateur: { select: { email: true } },
          competences: { include: { competence: true } },
        },
      },
    },
  });
  if (!candidature) throw new Error('Candidature introuvable');
  if (candidature.offre.entrepriseId !== entrepriseUserId) throw new Error('Non autorise');

  return {
    etudiant: candidature.etudiant,
    candidature: {
      id: candidature.id,
      statut: candidature.statut,
      lettreMotivation: candidature.lettreMotivation,
      cvUrl: candidature.cvUrl,
      dateCandidature: candidature.dateCandidature,
    },
  };
}