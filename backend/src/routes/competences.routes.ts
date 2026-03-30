import { Router } from 'express';
import * as controller from '../controllers/competences.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /competences:
 *   get:
 *     summary: Référentiel complet des compétences
 *     description: Liste toutes les compétences disponibles sur la plateforme.
 *     tags: [Compétences]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Liste des compétences du référentiel
 */
router.get('/', authenticate, controller.getAllCompetences);

/**
 * @swagger
 * /competences:
 *   post:
 *     summary: Créer une compétence dans le référentiel (admin)
 *     tags: [Compétences]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nom, categorie]
 *             properties:
 *               nom: { type: string }
 *               categorie: { type: string }
 *     responses:
 *       201:
 *         description: Compétence créée
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/', authenticate, authorize('admin'), controller.createCompetence);

/**
 * @swagger
 * /competences/mes-competences:
 *   get:
 *     summary: Mes compétences (étudiant)
 *     tags: [Compétences]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Compétences de l'étudiant connecté avec niveaux
 */
router.get('/mes-competences', authenticate, authorize('etudiant', 'diplome'), controller.getMesCompetences);

/**
 * @swagger
 * /competences/mes-competences:
 *   post:
 *     summary: Ajouter une compétence à son profil
 *     tags: [Compétences]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [competenceId, niveau]
 *             properties:
 *               competenceId: { type: string, format: uuid }
 *               niveau: { type: string, enum: [debutant, intermediaire, avance, expert] }
 *     responses:
 *       201:
 *         description: Compétence ajoutée
 */
router.post('/mes-competences', authenticate, authorize('etudiant', 'diplome'), controller.ajouterCompetence);

/**
 * @swagger
 * /competences/mes-competences/{competenceId}:
 *   put:
 *     summary: Modifier le niveau d'une compétence
 *     tags: [Compétences]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: competenceId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [niveau]
 *             properties:
 *               niveau: { type: string, enum: [debutant, intermediaire, avance, expert] }
 *     responses:
 *       200:
 *         description: Niveau mis à jour
 */
router.put('/mes-competences/:competenceId', authenticate, authorize('etudiant', 'diplome'), controller.modifierNiveau);

/**
 * @swagger
 * /competences/mes-competences/{competenceId}:
 *   delete:
 *     summary: Supprimer une compétence de son profil
 *     tags: [Compétences]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: competenceId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Compétence retirée du profil
 */
router.delete('/mes-competences/:competenceId', authenticate, authorize('etudiant', 'diplome'), controller.supprimerCompetence);

export default router;
