import { Router } from 'express';
import * as profilController from '../controllers/profil.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /profil:
 *   get:
 *     summary: Récupérer son profil
 *     description: Retourne le profil complet de l'utilisateur connecté (étudiant, entreprise ou superviseur).
 *     tags: [Profil]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Profil de l'utilisateur connecté
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/', authenticate, profilController.getProfil);

/**
 * @swagger
 * /profil:
 *   put:
 *     summary: Mettre à jour son profil
 *     description: Met à jour les informations du profil selon le rôle (nom, filiere, niveauEtude pour étudiant ; nomEntreprise, secteur pour entreprise).
 *     tags: [Profil]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Champs selon le rôle de l'utilisateur
 *     responses:
 *       200:
 *         description: Profil mis à jour
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.put('/', authenticate, profilController.updateProfil);

export default router;