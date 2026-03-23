import { Router } from 'express';
import * as superviseurController from '../controllers/superviseur.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /superviseur/profil:
 *   get:
 *     summary: Profil du superviseur connecté
 *     tags: [Superviseur]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Profil superviseur
 */
router.get('/profil', authenticate, authorize('superviseur'), superviseurController.getProfilSuperviseur);

/**
 * @swagger
 * /superviseur/profil:
 *   put:
 *     summary: Mettre à jour le profil superviseur
 *     tags: [Superviseur]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Profil mis à jour
 */
router.put('/profil', authenticate, authorize('superviseur'), superviseurController.updateProfilSuperviseur);

/**
 * @swagger
 * /superviseur/stats:
 *   get:
 *     summary: Statistiques globales pour le superviseur
 *     description: Récapitule les chiffres clés de la plateforme et des étudiants supervisés.
 *     tags: [Superviseur]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Statistiques aggregées
 */
router.get('/stats', authenticate, authorize('superviseur'), superviseurController.getStatsSuperviseur);

/**
 * @swagger
 * /superviseur/tous-etudiants:
 *   get:
 *     summary: Tous les étudiants de la plateforme (vue superviseur)
 *     tags: [Superviseur]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Liste complète des étudiants
 */
router.get('/tous-etudiants', authenticate, authorize('superviseur'), superviseurController.getTousEtudiants);

/**
 * @swagger
 * /superviseur/etudiants:
 *   get:
 *     summary: Mes étudiants supervisés
 *     tags: [Superviseur]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: situation
 *         schema: { type: string, enum: [en_cours_etude, emploi_cdi, emploi_cdd, stage, alternance, chomeur, independant, poursuite_etudes] }
 *         description: Filtrer par situation actuelle
 *     responses:
 *       200:
 *         description: Étudiants sous supervision du superviseur connecté
 */
router.get('/etudiants', authenticate, authorize('superviseur'), superviseurController.getMesEtudiants);

/**
 * @swagger
 * /superviseur/etudiants/{etudiantId}:
 *   get:
 *     summary: Détail d'un étudiant supervisé
 *     tags: [Superviseur]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: etudiantId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Profil complet, candidatures et commentaire superviseur
 */
router.get('/etudiants/:etudiantId', authenticate, authorize('superviseur'), superviseurController.getDetailEtudiant);

/**
 * @swagger
 * /superviseur/etudiants/{etudiantId}/commentaire:
 *   put:
 *     summary: Ajouter ou modifier un commentaire de suivi
 *     tags: [Superviseur]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: etudiantId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [commentaire]
 *             properties:
 *               commentaire: { type: string }
 *     responses:
 *       200:
 *         description: Commentaire enregistré
 */
router.put('/etudiants/:etudiantId/commentaire', authenticate, authorize('superviseur'), superviseurController.ajouterCommentaire);

/**
 * @swagger
 * /superviseur/supervisions:
 *   post:
 *     summary: Créer une supervision (superviseur)
 *     tags: [Superviseur]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [etudiantId]
 *             properties:
 *               etudiantId: { type: string, format: uuid }
 *     responses:
 *       201:
 *         description: Supervision créée
 */
router.post('/supervisions', authenticate, authorize('superviseur'), superviseurController.creerSupervision);

export default router;