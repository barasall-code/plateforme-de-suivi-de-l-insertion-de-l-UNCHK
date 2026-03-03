import { Router } from 'express';
import { uploadFichier, uploadDocument } from '../controllers/upload.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

router.post('/fichier', authenticate, upload.single('fichier'), uploadFichier);
router.post('/document', authenticate, upload.single('fichier'), uploadDocument);

export default router;