import { Router } from 'express';
import * as notificationsController from '../controllers/notifications.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, notificationsController.getNotifications);
router.put('/lire-tout', authenticate, notificationsController.marquerToutesCommeLues);
router.put('/:id/lire', authenticate, notificationsController.marquerCommeLue);

export default router;