import cron from 'node-cron';
import { prisma } from '../lib/prisma';
import logger from '../lib/logger';

async function getUnAn(): Promise<Date> {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  return d;
}

async function creerNotificationRelance(utilisateurId: string, prenom: string, annee: number) {
  await prisma.notification.create({
    data: {
      utilisateurId,
      typeNotification: 'rappel',
      titre: 'Mise a jour de votre situation professionnelle',
      message: prenom + ", l'UNCHK vous invite a actualiser votre situation professionnelle pour l'annee " + annee + ". Votre contribution est essentielle pour le suivi de l'insertion des diplomes.",
      lienAction: '/statut-professionnel',
      estLue: false,
    }
  });
}

export function startRelanceJob() {
  cron.schedule('0 8 1 1 *', async () => {
    logger.info('[CRON] Relance annuelle diplomes demarree');
    try {
      const unAn = await getUnAn();
      const annee = new Date().getFullYear();

      const diplomes = await prisma.utilisateur.findMany({
        where: {
          typeUtilisateur: 'diplome',
          estActif: true,
          etudiant: {
            statutsProfessionnels: {
              none: { dateDeclaration: { gte: unAn } }
            }
          }
        },
        include: { etudiant: true }
      });

      for (const diplome of diplomes) {
        const prenom = diplome.etudiant?.prenom || 'Diplome';
        await creerNotificationRelance(diplome.id, prenom, annee);
      }

      logger.info('[CRON] ' + diplomes.length + ' notifications de relance envoyees');
    } catch (error: any) {
      logger.error('[CRON] Erreur relance annuelle:', error.message);
    }
  }, { timezone: 'Africa/Dakar' });

  logger.info('[CRON] Relance annuelle planifiee (01 Jan 08h00 — Africa/Dakar)');
}

export async function relancerManuellement(): Promise<{ count: number }> {
  const unAn = await getUnAn();
  const annee = new Date().getFullYear();

  const diplomes = await prisma.utilisateur.findMany({
    where: {
      typeUtilisateur: 'diplome',
      estActif: true,
      etudiant: {
        statutsProfessionnels: {
          none: { dateDeclaration: { gte: unAn } }
        }
      }
    },
    include: { etudiant: true }
  });

  for (const diplome of diplomes) {
    const prenom = diplome.etudiant?.prenom || 'Diplome';
    await creerNotificationRelance(diplome.id, prenom, annee);
  }

  return { count: diplomes.length };
}

export async function getNonRepondants() {
  const unAn = await getUnAn();

  return prisma.utilisateur.findMany({
    where: {
      typeUtilisateur: 'diplome',
      estActif: true,
      etudiant: {
        statutsProfessionnels: {
          none: { dateDeclaration: { gte: unAn } }
        }
      }
    },
    include: {
      etudiant: {
        select: {
          id: true, nom: true, prenom: true, filiere: true,
          niveauEtude: true, promotion: true,
          _count: { select: { statutsProfessionnels: true } }
        }
      }
    },
    orderBy: { dateCreation: 'asc' }
  });
}
