import { Router } from 'express';
import * as offresController from '../controllers/offres.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { cacheMiddleware } from '../middlewares/cache.middleware';

const router = Router();

/**
 * @swagger
 * /offres:
 *   get:
 *     summary: Liste des offres publiées
 *     description: Retourne toutes les offres avec filtres optionnels. Réponse mise en cache 2 minutes.
 *     tags: [Offres]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: typeOffre
 *         schema: { type: string, enum: [stage, emploi, alternance, freelance] }
 *       - in: query
 *         name: domaine
 *         schema: { type: string }
 *       - in: query
 *         name: localisation
 *         schema: { type: string }
 *       - in: query
 *         name: niveauRequis
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Liste des offres
 *         headers:
 *           X-Cache: { schema: { type: string, enum: [HIT, MISS] } }
 */
router.get('/',    cacheMiddleware(120), offresController.getOffres);

/**
 * @swagger
 * /offres/mes-offres:
 *   get:
 *     summary: Mes offres (vue entreprise)
 *     tags: [Offres]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Liste de toutes les offres de l'entreprise connectée
 */
router.get('/mes-offres', authenticate, authorize('entreprise'), offresController.getMesOffres);

/**
 * @swagger
 * /offres/{id}:
 *   get:
 *     summary: Détail d'une offre
 *     tags: [Offres]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Détail de l'offre
 *       404:
 *         description: Offre introuvable
 */
router.get('/:id', cacheMiddleware(120), offresController.getOffreById);

/**
 * @swagger
 * /offres:
 *   post:
 *     summary: Créer une offre (brouillon)
 *     tags: [Offres]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [titre, description, typeOffre, domaine, niveauRequis, localisation, dateLimiteCandidature]
 *             properties:
 *               titre: { type: string }
 *               description: { type: string }
 *               typeOffre: { type: string, enum: [stage, emploi, alternance, freelance] }
 *               domaine: { type: string }
 *               niveauRequis: { type: string }
 *               localisation: { type: string }
 *               dureeMois: { type: integer }
 *               salaireMin: { type: number }
 *               salaireMax: { type: number }
 *               modeTravail: { type: string, enum: [presentiel, remote, hybride] }
 *               dateLimiteCandidature: { type: string, format: date }
 *               nombrePostes: { type: integer }
 *               competences: { type: array, items: { type: string } }
 *     responses:
 *       201:
 *         description: Offre créée en brouillon
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/', authenticate, authorize('entreprise'), offresController.createOffre);

/**
 * @swagger
 * /offres/{id}:
 *   put:
 *     summary: Modifier une offre
 *     tags: [Offres]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Offre mise à jour
 *       403:
 *         description: Non propriétaire de l'offre
 */
router.put('/:id', authenticate, authorize('entreprise'), offresController.updateOffre);

/**
 * @swagger
 * /offres/{id}:
 *   delete:
 *     summary: Supprimer une offre
 *     tags: [Offres]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Offre supprimée
 *       403:
 *         description: Non propriétaire de l'offre
 */
router.delete('/:id', authenticate, authorize('entreprise'), offresController.deleteOffre);

/**
 * @swagger
 * /offres/{id}/soumettre:
 *   post:
 *     summary: Soumettre une offre à l'administration pour validation
 *     tags: [Offres]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Offre soumise — statut changé à 'soumis'
 */
router.post('/:id/soumettre', authenticate, authorize('entreprise'), offresController.soumettreOffre);

/**
 * @swagger
 * /offres/{id}/valider:
 *   post:
 *     summary: Valider une offre (admin)
 *     tags: [Offres]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Offre publiée
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/:id/valider', authenticate, authorize('admin'), offresController.validerOffre);

export default router;