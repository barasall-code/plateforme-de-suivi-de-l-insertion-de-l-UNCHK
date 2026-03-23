import { Router } from 'express';
import * as controller from '../controllers/statutProfessionnel.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /statut-professionnel:
 *   get:
 *     summary: Mes déclarations de situation professionnelle
 *     tags: [Statut Professionnel]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Historique des déclarations de l'étudiant connecté
 */
router.get('/', authenticate, authorize('etudiant'), controller.getMesStatuts);

/**
 * @swagger
 * /statut-professionnel:
 *   post:
 *     summary: Déclarer sa situation professionnelle
 *     description: Permet à l'étudiant de déclarer sa situation post-diplôme (emploi, stage, chômage, études supérieures).
 *     tags: [Statut Professionnel]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [typeStatut]
 *             properties:
 *               typeStatut: { type: string, enum: [emploi_cdi, emploi_cdd, stage, alternance, chomeur, independant, poursuite_etudes] }
 *               employeur: { type: string }
 *               poste: { type: string }
 *               dateDebut: { type: string, format: date }
 *               salaire: { type: number }
 *               duree: { type: integer }
 *     responses:
 *       201:
 *         description: Situation déclarée
 */
router.post('/', authenticate, authorize('etudiant'), controller.declarer);

/**
 * @swagger
 * /statut-professionnel/{id}:
 *   put:
 *     summary: Modifier une déclaration
 *     tags: [Statut Professionnel]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Déclaration mise à jour
 */
router.put('/:id', authenticate, authorize('etudiant'), controller.modifier);

/**
 * @swagger
 * /statut-professionnel/{id}:
 *   delete:
 *     summary: Supprimer une déclaration
 *     tags: [Statut Professionnel]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Déclaration supprimée
 */
router.delete('/:id', authenticate, authorize('etudiant'), controller.supprimer);

/**
 * @swagger
 * /statut-professionnel/etudiant/{etudiantId}:
 *   get:
 *     summary: Statuts d'un étudiant spécifique (superviseur / admin)
 *     tags: [Statut Professionnel]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: etudiantId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Historique de situation de l'étudiant
 */
router.get('/etudiant/:etudiantId', authenticate, authorize('superviseur', 'admin'), controller.getStatutsParEtudiant);

/**
 * @swagger
 * /statut-professionnel/{id}/valider:
 *   put:
 *     summary: Valider une déclaration (admin)
 *     tags: [Statut Professionnel]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Déclaration validée
 */
router.put('/:id/valider', authenticate, authorize('admin'), controller.validerStatut);

export default router;
