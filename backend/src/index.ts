import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET non defini dans .env');
  process.exit(1);
}

import authRoutes from './routes/auth.routes';
import offresRoutes from './routes/offres.routes';
import candidaturesRoutes from './routes/candidatures.routes';
import profilRoutes from './routes/profil.routes';
import notificationsRoutes from './routes/notifications.routes';
import adminRoutes from './routes/admin.routes';
import superviseurRoutes from './routes/superviseur.routes';
import uploadRoutes from './routes/upload.routes';
import messagerieRoutes from './routes/messagerie.routes';
import statutProfessionnelRoutes from './routes/statutProfessionnel.routes';
import competencesRoutes from './routes/competences.routes';

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = (process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',').map(o => o.trim());

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS: origine non autorisee'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'OK',
    message: 'Plateforme UNCHK API operationnelle',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.use('/api/auth',          authRoutes);
app.use('/api/offres',        offresRoutes);
app.use('/api/candidatures',  candidaturesRoutes);
app.use('/api/profil',        profilRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/superviseur',   superviseurRoutes);
app.use('/api/upload',        uploadRoutes);
app.use('/api/messagerie',           messagerieRoutes);
app.use('/api/statut-professionnel', statutProfessionnelRoutes);
app.use('/api/competences',          competencesRoutes);

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[ERROR]', err);
  const status  = err.statusCode || err.status || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Erreur interne du serveur'
    : err.message;
  res.status(status).json({ success: false, message });
});

process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED REJECTION]', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err);
  process.exit(1);
});

const server = app.listen(PORT, () => {
  console.log('Serveur demarre sur http://localhost:' + PORT);
});

process.on('SIGTERM', () => server.close());

export default app;
