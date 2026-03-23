/**
 * Cron jobs de purge — suppression automatique des enregistrements expirés
 *
 * Tâches planifiées :
 *  - 02h00 chaque nuit : purge des VerificationEmail expirés
 *  - 03h00 chaque nuit : purge des RefreshToken expirés
 */

import cron from 'node-cron';
import { prisma } from '../lib/prisma';
import logger from '../lib/logger';

/**
 * Démarre les tâches cron de purge de la base de données.
 * À appeler une seule fois au démarrage du serveur (src/index.ts).
 */
export function startPurgeJobs(): void {
  // ─── Purge VerificationEmail expirés — tous les jours à 02h00 ───────────
  cron.schedule('0 2 * * *', async () => {
    try {
      const now = new Date();
      const result = await prisma.verificationEmail.deleteMany({
        where: { expiresAt: { lt: now } },
      });
      logger.info('[CRON] Purge VerificationEmail expirés', { supprimés: result.count, timestamp: now.toISOString() });
    } catch (err) {
      logger.error('[CRON] Erreur purge VerificationEmail', {
        message: (err as Error).message,
        stack: (err as Error).stack,
      });
    }
  }, {
    timezone: 'Africa/Dakar',
  });

  // ─── Purge RefreshToken expirés — tous les jours à 03h00 ─────────────────
  cron.schedule('0 3 * * *', async () => {
    try {
      const now = new Date();
      const result = await prisma.refreshToken.deleteMany({
        where: { expiresAt: { lt: now } },
      });
      logger.info('[CRON] Purge RefreshToken expirés', { supprimés: result.count, timestamp: now.toISOString() });
    } catch (err) {
      logger.error('[CRON] Erreur purge RefreshToken', {
        message: (err as Error).message,
        stack: (err as Error).stack,
      });
    }
  }, {
    timezone: 'Africa/Dakar',
  });

  logger.info('[CRON] Tâches de purge planifiées (02h00 VerificationEmail | 03h00 RefreshToken) — fuseau: Africa/Dakar');
}
