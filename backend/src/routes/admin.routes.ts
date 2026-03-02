import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get('/stats', authenticate, authorize('admin'), adminController.getStats);
router.get('/entreprises', authenticate, authorize('admin'), adminController.getEntreprises);
router.put('/entreprises/:id/valider', authenticate, authorize('admin'), adminController.validerEntreprise);
router.put('/entreprises/:id/rejeter', authenticate, authorize('admin'), adminController.rejeterEntreprise);
router.get('/utilisateurs', authenticate, authorize('admin'), adminController.getUtilisateurs);
router.put('/utilisateurs/:id/toggle', authenticate, authorize('admin'), adminController.toggleUtilisateur);
router.get('/offres-en-attente', authenticate, authorize('admin'), adminController.getOffresEnAttente);
router.put('/offres/:id/valider', authenticate, authorize('admin'), adminController.validerOffre);

export default router;