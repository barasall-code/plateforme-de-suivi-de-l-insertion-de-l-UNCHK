import { Router } from 'express';
import * as messagerieController from '../controllers/messagerie.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.post('/conversations', authenticate, authorize('etudiant', 'entreprise'), messagerieController.getOuCreerConversation);
router.get('/conversations', authenticate, authorize('etudiant', 'entreprise'), messagerieController.getMesConversations);
router.get('/conversations/:conversationId/messages', authenticate, authorize('etudiant', 'entreprise'), messagerieController.getMessages);
router.post('/conversations/:conversationId/messages', authenticate, authorize('etudiant', 'entreprise'), messagerieController.envoyerMessage);
router.get('/non-lus', authenticate, messagerieController.getNombreMsgNonLus);

export default router;