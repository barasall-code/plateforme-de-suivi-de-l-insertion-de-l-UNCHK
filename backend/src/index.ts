import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import offresRoutes from './routes/offres.routes';
import candidaturesRoutes from './routes/candidatures.routes';
import profilRoutes from './routes/profil.routes';
import notificationsRoutes from './routes/notifications.routes';
import adminRoutes from './routes/admin.routes';
import superviseurRoutes from './routes/superviseur.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Plateforme UNCHK API operationnelle',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/offres', offresRoutes);
app.use('/api/candidatures', candidaturesRoutes);
app.use('/api/profil', profilRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/superviseur', superviseurRoutes);

const server = app.listen(PORT, () => {
  console.log(`🚀 Serveur demarre sur http://localhost:${PORT}`);
  console.log(`🔐 Auth : http://localhost:${PORT}/api/auth`);
  console.log(`📋 Offres : http://localhost:${PORT}/api/offres`);
  console.log(`📝 Candidatures : http://localhost:${PORT}/api/candidatures`);
  console.log(`👤 Profil : http://localhost:${PORT}/api/profil`);
  console.log(`🔔 Notifications : http://localhost:${PORT}/api/notifications`);
  console.log(`⚙️  Admin : http://localhost:${PORT}/api/admin`);
  console.log(`👁️  Superviseur : http://localhost:${PORT}/api/superviseur`);
});

process.on('SIGTERM', () => server.close());
process.stdin.resume();

export default app;