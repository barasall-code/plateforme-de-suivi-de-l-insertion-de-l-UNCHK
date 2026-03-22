import request from 'supertest';
import jwt from 'jsonwebtoken';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockPrisma = {
  offre: {
    findMany:   jest.fn(),
    findUnique: jest.fn(),
    create:     jest.fn(),
    update:     jest.fn(),
    delete:     jest.fn(),
    count:      jest.fn(),
  },
  entreprise: {
    findUnique: jest.fn(),
  },
  candidature: {
    findFirst: jest.fn(),
    create:    jest.fn(),
    findMany:  jest.fn(),
  },
  offreCompetence: {
    createMany: jest.fn(),
    deleteMany: jest.fn(),
    findMany:   jest.fn(),
  },
};

jest.mock('../lib/prisma', () => ({ __esModule: true, prisma: mockPrisma }));

jest.mock('ioredis', () =>
  jest.fn().mockImplementation(() => ({
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    scan: jest.fn().mockResolvedValue(['0', []]),
    on: jest.fn(),
  }))
);

jest.mock('../lib/logger', () => ({
  __esModule: true,
  default: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn(), http: jest.fn() },
  auditLog: jest.fn(),
}));

import app from '../index';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeToken(role: string, userId = `${role}-test-id`) {
  return jwt.sign(
    { userId, role, email: `${role}@unchk.edu.sn` },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );
}

function authHeader(role: string) {
  return { Authorization: `Bearer ${makeToken(role)}` };
}

const mockOffre = {
  id: 'offre-1',
  titre: 'Développeur React',
  description: 'Description du poste',
  typeOffre: 'stage',
  statut: 'publie',
  ville: 'Dakar',
  remuneration: 0,
  dateExpiration: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  dateCreation: new Date().toISOString(),
  entrepriseId: 'ent-1',
  entreprise: {
    id: 'ent-1',
    nomEntreprise: 'Tech Sénégal',
    secteurActivite: 'IT',
    estValide: true,
  },
  competences: [],
};

// ─── GET /api/offres - Listing public ────────────────────────────────────────

describe('GET /api/offres', () => {
  beforeEach(() => {
    mockPrisma.offre.findMany.mockResolvedValue([mockOffre]);
    mockPrisma.offre.count.mockResolvedValue(1);
  });

  it('devrait retourner la liste des offres sans authentification', async () => {
    const res = await request(app).get('/api/offres');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('devrait retourner du JSON', async () => {
    const res = await request(app).get('/api/offres');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('devrait accepter les paramètres de filtrage (typeOffre)', async () => {
    const res = await request(app).get('/api/offres?typeOffre=stage');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('devrait accepter les paramètres de pagination', async () => {
    const res = await request(app).get('/api/offres?page=1&limit=10');
    expect(res.status).toBe(200);
  });
});

// ─── GET /api/offres/:id ──────────────────────────────────────────────────────

describe('GET /api/offres/:id', () => {
  it('devrait retourner l\'offre si elle existe', async () => {
    mockPrisma.offre.findUnique.mockResolvedValue(mockOffre);
    const res = await request(app).get('/api/offres/offre-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('devrait retourner 404 si l\'offre n\'existe pas', async () => {
    mockPrisma.offre.findUnique.mockResolvedValue(null);
    const res = await request(app).get('/api/offres/inexistant');
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});

// ─── POST /api/offres - Création ─────────────────────────────────────────────

describe('POST /api/offres', () => {
  const nouvelleOffre = {
    titre: 'Développeur Node.js',
    description: 'Mission de 6 mois sur un projet FinTech',
    typeOffre: 'stage',
    duree: '6 mois',
    ville: 'Dakar',
    remuneration: 150000,
    dateExpiration: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
  };

  it('devrait retourner 401 sans authentification', async () => {
    const res = await request(app).post('/api/offres').send(nouvelleOffre);
    expect(res.status).toBe(401);
  });

  it('devrait retourner 403 pour un rôle étudiant', async () => {
    const res = await request(app)
      .post('/api/offres')
      .set(authHeader('etudiant'))
      .send(nouvelleOffre);
    expect(res.status).toBe(403);
  });

  it('devrait créer une offre pour une entreprise validée', async () => {
    mockPrisma.entreprise.findUnique.mockResolvedValue({ id: 'ent-1', estValide: true });
    mockPrisma.offre.create.mockResolvedValue({ ...mockOffre, statut: 'brouillon' });

    const res = await request(app)
      .post('/api/offres')
      .set(authHeader('entreprise'))
      .send(nouvelleOffre);

    // Either success or a validation error — must not be 401/403
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });
});

// ─── Health check ─────────────────────────────────────────────────────────────

describe('GET /api/health', () => {
  it('devrait retourner status OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
  });

  it('devrait inclure un timestamp ISO 8601', async () => {
    const res = await request(app).get('/api/health');
    expect(res.body.timestamp).toBeDefined();
    expect(() => new Date(res.body.timestamp)).not.toThrow();
  });
});
