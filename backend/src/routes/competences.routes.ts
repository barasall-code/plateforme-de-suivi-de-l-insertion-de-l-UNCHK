import { Router } from 'express';
import * as controller from '../controllers/competences.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Liste publique des compétences du référentiel
router.get('/', authenticate, controller.getAllCompetences);

// Admin : créer une compétence dans le référentiel
router.post('/', authenticate, authorize('admin'), controller.createCompetence);

// Étudiant : gérer ses compétences
router.get('/mes-competences', authenticate, authorize('etudiant'), controller.getMesCompetences);
router.post('/mes-competences', authenticate, authorize('etudiant'), controller.ajouterCompetence);
router.put('/mes-competences/:competenceId', authenticate, authorize('etudiant'), controller.modifierNiveau);
router.delete('/mes-competences/:competenceId', authenticate, authorize('etudiant'), controller.supprimerCompetence);

export default router;
