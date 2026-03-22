import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { cacheMiddleware } from '../middlewares/cache.middleware';

const router = Router();

// Stats cached for 5 minutes
router.get('/stats',          authenticate, authorize('admin'), cacheMiddleware(300), adminController.getStats);
router.get('/stats/avancees', authenticate, authorize('admin'), cacheMiddleware(300), adminController.getStatsAvancees);
router.get('/entreprises', authenticate, authorize('admin'), adminController.getEntreprises);
router.put('/entreprises/:id/valider', authenticate, authorize('admin'), adminController.validerEntreprise);
router.put('/entreprises/:id/rejeter', authenticate, authorize('admin'), adminController.rejeterEntreprise);
router.get('/utilisateurs', authenticate, authorize('admin'), adminController.getUtilisateurs);
router.put('/utilisateurs/:id/toggle', authenticate, authorize('admin'), adminController.toggleUtilisateur);
router.get('/offres-en-attente', authenticate, authorize('admin'), adminController.getOffresEnAttente);
router.put('/offres/:id/valider', authenticate, authorize('admin'), adminController.validerOffre);

// Superviseurs
router.get('/superviseurs', authenticate, authorize('admin'), adminController.getSuperviseurs);
router.post('/superviseurs', authenticate, authorize('admin'), adminController.creerSuperviseur);
router.put('/superviseurs/:id', authenticate, authorize('admin'), adminController.modifierSuperviseur);
router.delete('/superviseurs/:id', authenticate, authorize('admin'), adminController.supprimerSuperviseur);

// Supervisions
router.get('/supervisions', authenticate, authorize('admin'), adminController.getSupervisions);
router.get('/supervisions/etudiants-sans-supervision', authenticate, authorize('admin'), adminController.getEtudiantsSansSupervision);
router.post('/supervisions', authenticate, authorize('admin'), adminController.assignerSupervision);
router.delete('/supervisions/:superviseurId/:etudiantId', authenticate, authorize('admin'), adminController.supprimerSupervision);

export default router;