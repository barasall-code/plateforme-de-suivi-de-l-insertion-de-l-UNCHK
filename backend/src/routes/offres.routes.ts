import { Router } from 'express';
import * as offresController from '../controllers/offres.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { cacheMiddleware } from '../middlewares/cache.middleware';

const router = Router();

// Public listing cached for 2 minutes
router.get('/',    cacheMiddleware(120), offresController.getOffres);
router.get('/:id', cacheMiddleware(120), offresController.getOffreById);
router.post('/', authenticate, authorize('entreprise'), offresController.createOffre);
router.put('/:id', authenticate, authorize('entreprise'), offresController.updateOffre);
router.delete('/:id', authenticate, authorize('entreprise'), offresController.deleteOffre);
router.post('/:id/soumettre', authenticate, authorize('entreprise'), offresController.soumettreOffre);
router.post('/:id/valider', authenticate, authorize('admin'), offresController.validerOffre);

export default router;