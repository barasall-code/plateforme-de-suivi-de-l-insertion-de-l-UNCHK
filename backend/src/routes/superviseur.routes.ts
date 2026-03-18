import { Router } from 'express';
import * as superviseurController from '../controllers/superviseur.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get('/profil', authenticate, authorize('superviseur'), superviseurController.getProfilSuperviseur);
router.put('/profil', authenticate, authorize('superviseur'), superviseurController.updateProfilSuperviseur);
router.get('/stats', authenticate, authorize('superviseur'), superviseurController.getStatsSuperviseur);
router.get('/tous-etudiants', authenticate, authorize('superviseur'), superviseurController.getTousEtudiants);
router.get('/etudiants', authenticate, authorize('superviseur'), superviseurController.getMesEtudiants);
router.get('/etudiants/:etudiantId', authenticate, authorize('superviseur'), superviseurController.getDetailEtudiant);
router.put('/etudiants/:etudiantId/commentaire', authenticate, authorize('superviseur'), superviseurController.ajouterCommentaire);

export default router;