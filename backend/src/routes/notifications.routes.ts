import { Router } from 'express';
import * as notificationsController from '../controllers/notifications.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Mes notifications
 *     description: Retourne les notifications de l'utilisateur connecté (par date décroissante).
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Liste des notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: string }
 *                       type: { type: string }
 *                       titre: { type: string }
 *                       contenu: { type: string }
 *                       estLue: { type: boolean }
 *                       dateCreation: { type: string, format: date-time }
 */
router.get('/', authenticate, notificationsController.getNotifications);

/**
 * @swagger
 * /notifications/lire-tout:
 *   put:
 *     summary: Marquer toutes les notifications comme lues
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Toutes les notifications marquées comme lues
 */
router.put('/lire-tout', authenticate, notificationsController.marquerToutesCommeLues);

/**
 * @swagger
 * /notifications/{id}/lire:
 *   put:
 *     summary: Marquer une notification comme lue
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Notification marquée comme lue
 *       404:
 *         description: Notification introuvable
 */
router.put('/:id/lire', authenticate, notificationsController.marquerCommeLue);

export default router;