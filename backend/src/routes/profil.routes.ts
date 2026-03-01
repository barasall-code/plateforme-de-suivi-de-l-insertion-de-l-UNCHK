import { Router } from 'express';
import * as profilController from '../controllers/profil.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, profilController.getProfil);
router.put('/', authenticate, profilController.updateProfil);

export default router;