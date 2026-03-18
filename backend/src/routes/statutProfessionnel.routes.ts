import { Router } from 'express';
import * as controller from '../controllers/statutProfessionnel.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Étudiant
router.get('/', authenticate, authorize('etudiant'), controller.getMesStatuts);
router.post('/', authenticate, authorize('etudiant'), controller.declarer);
router.put('/:id', authenticate, authorize('etudiant'), controller.modifier);
router.delete('/:id', authenticate, authorize('etudiant'), controller.supprimer);

// Superviseur & Admin : voir les statuts d'un étudiant
router.get('/etudiant/:etudiantId', authenticate, authorize('superviseur', 'admin'), controller.getStatutsParEtudiant);

// Admin : valider un statut
router.put('/:id/valider', authenticate, authorize('admin'), controller.validerStatut);

export default router;
