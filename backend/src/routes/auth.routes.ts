import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Trop de tentatives. Reessayez dans 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

router.post('/register', authLimiter, authController.register);
router.post('/login',    authLimiter, authController.login);
router.post('/refresh',  authController.refresh);
router.post('/logout',   authenticate, authController.logout);
router.get('/me',        authenticate, authController.me);


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
