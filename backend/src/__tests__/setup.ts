// Configuration de l'environnement pour les tests Jest
// Ce fichier est chargé avant chaque suite de tests via "setupFiles" dans package.json

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-pour-les-tests-unitaires-unchk';
process.env.JWT_EXPIRES_IN = '15m';
process.env.REFRESH_TOKEN_EXPIRES_IN = '7d';
process.env.PORT = '3002';

// Désactiver Redis en tests (pas de connexion réelle nécessaire)
process.env.REDIS_URL = '';

// Base de données de test (SQLite en mémoire via Prisma si configuré,
// sinon utiliser une vraie DB de test isolée)
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL || '';
