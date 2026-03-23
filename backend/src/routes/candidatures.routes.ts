import { Router } from 'express';
import * as candidaturesController from '../controllers/candidatures.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /candidatures:
 *   post:
 *     summary: Postuler à une offre
 *     tags: [Candidatures]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [offreId, lettreMotivation, cvUrl]
 *             properties:
 *               offreId: { type: string, format: uuid }
 *               lettreMotivation: { type: string }
 *               cvUrl: { type: string }
 *     responses:
 *       201:
 *         description: Candidature soumise avec succès
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/', authenticate, authorize('etudiant'), candidaturesController.postuler);

/**
 * @swagger
 * /candidatures/mes-candidatures:
 *   get:
 *     summary: Mes candidatures (vue étudiant)
 *     tags: [Candidatures]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Liste des candidatures de l'étudiant connecté
 */
router.get('/mes-candidatures', authenticate, authorize('etudiant'), candidaturesController.getMesCandidatures);

/**
 * @swagger
 * /candidatures/offre/{offreId}:
 *   get:
 *     summary: Candidatures reçues pour une offre (vue entreprise)
 *     tags: [Candidatures]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: offreId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Liste des candidats pour cette offre
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/offre/:offreId', authenticate, authorize('entreprise'), candidaturesController.getCandidaturesOffre);

/**
 * @swagger
 * /candidatures/{id}/profil:
 *   get:
 *     summary: Voir le profil complet d'un candidat
 *     tags: [Candidatures]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Profil du candidat avec compétences et historique
 */
router.get('/:id/profil', authenticate, authorize('entreprise'), candidaturesController.getProfilCandidat);

/**
 * @swagger
 * /candidatures/{id}/statut:
 *   put:
 *     summary: Changer le statut d'une candidature
 *     description: Workflow (soumise → vue → entretien → acceptée/refusée)
 *     tags: [Candidatures]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [statut]
 *             properties:
 *               statut: { type: string, enum: [vue, entretien, acceptee, refusee] }
 *     responses:
 *       200:
 *         description: Statut mis à jour
 */
router.put('/:id/statut', authenticate, authorize('entreprise'), candidaturesController.changerStatut);

/**
 * @swagger
 * /candidatures/{id}:
 *   delete:
 *     summary: Retirer sa candidature
 *     tags: [Candidatures]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Candidature retirée
 *       403:
 *         description: Non propriétaire de la candidature
 */
router.delete('/:id', authenticate, authorize('etudiant'), candidaturesController.retirerCandidature);

export default router;