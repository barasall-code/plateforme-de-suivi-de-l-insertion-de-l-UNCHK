import { Router } from 'express';
import * as candidaturesController from '../controllers/candidatures.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticate, authorize('etudiant'), candidaturesController.postuler);
router.get('/mes-candidatures', authenticate, authorize('etudiant'), candidaturesController.getMesCandidatures);
router.get('/offre/:offreId', authenticate, authorize('entreprise'), candidaturesController.getCandidaturesOffre);
router.get('/:id/profil', authenticate, authorize('entreprise'), candidaturesController.getProfilCandidat);
router.put('/:id/statut', authenticate, authorize('entreprise'), candidaturesController.changerStatut);
router.delete('/:id', authenticate, authorize('etudiant'), candidaturesController.retirerCandidature);

export default router;