import { Router } from 'express';
import { uploadFichier, uploadDocument } from '../controllers/upload.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

/**
 * @swagger
 * /upload/fichier:
 *   post:
 *     summary: Uploader un fichier (avatar, logo)
 *     description: Upload vers Cloudinary (production) ou stockage local (développement). Retourne l'URL publique du fichier.
 *     tags: [Upload]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [fichier]
 *             properties:
 *               fichier:
 *                 type: string
 *                 format: binary
 *                 description: Fichier image ou document (max 5 Mo)
 *     responses:
 *       200:
 *         description: Fichier uploadé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 url: { type: string, description: URL publique CDN ou locale }
 *       400:
 *         description: Fichier manquant ou type non autorisé
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/fichier', authenticate, upload.single('fichier'), uploadFichier);

/**
 * @swagger
 * /upload/document:
 *   post:
 *     summary: Uploader un document (CV, lettre de motivation)
 *     description: Upload d'un document PDF vers Cloudinary ou stockage local. Retourne l'URL du document.
 *     tags: [Upload]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [fichier]
 *             properties:
 *               fichier:
 *                 type: string
 *                 format: binary
 *                 description: Document PDF (max 10 Mo)
 *     responses:
 *       200:
 *         description: Document uploadé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 url: { type: string }
 *       400:
 *         description: Document manquant ou type non autorisé
 */
router.post('/document', authenticate, upload.single('fichier'), uploadDocument);

export default router;