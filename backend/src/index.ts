import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import offresRoutes from './routes/offres.routes';

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

const server = app.listen(PORT, () => {
  console.log(`🚀 Serveur demarre sur http://localhost:${PORT}`);
  console.log(`🔐 Auth : http://localhost:${PORT}/api/auth`);
  console.log(`📋 Offres : http://localhost:${PORT}/api/offres`);
});

process.on('SIGTERM', () => server.close());
process.stdin.resume();

export default app;