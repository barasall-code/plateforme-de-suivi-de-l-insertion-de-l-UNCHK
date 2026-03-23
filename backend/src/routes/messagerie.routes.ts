import { Router } from 'express';
import * as messagerieController from '../controllers/messagerie.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /messagerie/conversations:
 *   post:
 *     summary: Obtenir ou créer une conversation
 *     description: Retourne une conversation existante entre deux parties ou en crée une nouvelle.
 *     tags: [Messagerie]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [interlocuteurId]
 *             properties:
 *               interlocuteurId: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Conversation (existante ou créée)
 */
router.post('/conversations', authenticate, authorize('etudiant', 'entreprise'), messagerieController.getOuCreerConversation);

/**
 * @swagger
 * /messagerie/conversations:
 *   get:
 *     summary: Mes conversations
 *     tags: [Messagerie]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Liste des conversations avec dernier message et nombre de non-lus
 */
router.get('/conversations', authenticate, authorize('etudiant', 'entreprise'), messagerieController.getMesConversations);

/**
 * @swagger
 * /messagerie/conversations/{conversationId}/messages:
 *   get:
 *     summary: Messages d'une conversation
 *     tags: [Messagerie]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Liste des messages (chronologique)
 *       403:
 *         description: Non participant à cette conversation
 */
router.get('/conversations/:conversationId/messages', authenticate, authorize('etudiant', 'entreprise'), messagerieController.getMessages);

/**
 * @swagger
 * /messagerie/conversations/{conversationId}/messages:
 *   post:
 *     summary: Envoyer un message
 *     tags: [Messagerie]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [contenu]
 *             properties:
 *               contenu: { type: string, maxLength: 2000 }
 *     responses:
 *       201:
 *         description: Message envoyé
 */
router.post('/conversations/:conversationId/messages', authenticate, authorize('etudiant', 'entreprise'), messagerieController.envoyerMessage);

/**
 * @swagger
 * /messagerie/non-lus:
 *   get:
 *     summary: Nombre de messages non lus
 *     tags: [Messagerie]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Compteur messages non lus
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count: { type: integer }
 */
router.get('/non-lus', authenticate, messagerieController.getNombreMsgNonLus);

export default router;