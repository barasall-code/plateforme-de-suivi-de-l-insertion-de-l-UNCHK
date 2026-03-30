import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
import path from 'path';
import logger from './lib/logger';
import { swaggerSpec } from './lib/swagger';
import { startPurgeJobs } from './jobs/purge.job';

dotenv.config();

if (!process.env.JWT_SECRET) {
  logger.error('FATAL: JWT_SECRET non defini dans .env');
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
import entrepriseRoutes from './routes/entreprise.routes';
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

// HTTP request logger (skip in test env)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(
    ':method :url :status :res[content-length] - :response-time ms',
    { stream: { write: (msg: string) => logger.http(msg.trim()) } }
  ));
}

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

// API Documentation (désactivée en prod si souhaité)
if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_DOCS === 'true') {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'UNCHK API Docs',
    customCss: '.swagger-ui .topbar { background-color: #16a34a; }',
    swaggerOptions: { persistAuthorization: true },
  }));
  app.get('/api/docs.json', (_req, res) => res.json(swaggerSpec));
}

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
app.use('/api/entreprise', entrepriseRoutes);
app.use('/api/competences',          competencesRoutes);

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled error', { message: err.message, stack: err.stack, status: err.statusCode || err.status });
  const status  = err.statusCode || err.status || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Erreur interne du serveur'
    : err.message;
  res.status(status).json({ success: false, message });
});

process.on('unhandledRejection', (reason) => {
  logger.error('[UNHANDLED REJECTION]', { reason });
});
process.on('uncaughtException', (err) => {
  logger.error('[UNCAUGHT EXCEPTION]', { message: err.message, stack: err.stack });
  process.exit(1);
});

const server = app.listen(PORT, () => {
  logger.info(`Serveur demarre sur http://localhost:${PORT}`);
  // Démarrage des tâches cron de purge (tokens et emails expirés)
  if (process.env.NODE_ENV !== 'test') {
    startPurgeJobs();
  }
});

process.on('SIGTERM', () => server.close());

export default app;
