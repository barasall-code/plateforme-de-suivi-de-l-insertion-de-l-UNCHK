import { Router } from 'express';
import * as offresController from '../controllers/offres.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', offresController.getOffres);
router.get('/mes-offres', authenticate, authorize('entreprise'), offresController.getMesOffres);
router.get('/:id', offresController.getOffreById);
router.post('/', authenticate, authorize('entreprise'), offresController.createOffre);
router.put('/:id', authenticate, authorize('entreprise'), offresController.updateOffre);
router.delete('/:id', authenticate, authorize('entreprise'), offresController.deleteOffre);
router.post('/:id/valider', authenticate, authorize('admin'), offresController.validerOffre);

export default router;