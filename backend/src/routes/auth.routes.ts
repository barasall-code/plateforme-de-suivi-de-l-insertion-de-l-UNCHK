import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { prisma } from '../lib/prisma';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Trop de tentatives. Reessayez dans 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Créer un compte utilisateur
 *     description: Enregistre un nouvel utilisateur (étudiant ou entreprise) et envoie un e-mail de vérification.
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: Compte créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Données invalides ou email déjà utilisé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Trop de tentatives
 */
router.post('/register', authLimiter, authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Se connecter
 *     description: Authentifie un utilisateur et retourne un access token et un refresh token.
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Identifiants incorrects
 *       429:
 *         description: Trop de tentatives
 */
router.post('/login', authLimiter, authController.login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Renouveler le token d'accès
 *     description: Utilise un refresh token valide pour obtenir un nouvel access token.
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token renouvelé
 *       401:
 *         description: Refresh token invalide ou expiré
 */
router.post('/refresh', authController.refresh);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Se déconnecter
 *     description: Invalide le refresh token de l'utilisateur.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Profil de l'utilisateur connecté
 *     description: Retourne les informations de l'utilisateur actuellement authentifié.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Informations de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/me', authenticate, authController.me);


router.get('/verifier-email', async (req, res) => {
  try {
    const token = req.query.token as string;
    if (!token) return res.status(400).json({ success: false, message: 'Token manquant' });
    const v = await prisma.verificationEmail.findUnique({ where: { token } });
    if (!v) return res.status(400).json({ success: false, message: 'Token invalide' });
    if (v.expiresAt < new Date()) {
      await prisma.verificationEmail.delete({ where: { token } });
      return res.status(400).json({ success: false, message: 'Token expire' });
    }
    await prisma.utilisateur.update({ where: { id: v.utilisateurId }, data: { emailVerifie: true } });
    await prisma.verificationEmail.delete({ where: { token } });
    res.json({ success: true, message: 'Email verifie' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

export default router;
