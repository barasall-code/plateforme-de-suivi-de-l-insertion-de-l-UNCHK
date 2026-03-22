import request from 'supertest';
import jwt from 'jsonwebtoken';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockPrisma = {
  etudiant:     { count: jest.fn(), groupBy: jest.fn(), findMany: jest.fn() },
  entreprise:   { count: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
  offre:        { count: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
  candidature:  { count: jest.fn() },
  utilisateur:  { findMany: jest.fn(), count: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
  superviseur:  { findMany: jest.fn() },
  supervision:  { findMany: jest.fn() },
  $queryRaw:    jest.fn(),
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

function makeAdminToken() {
  return jwt.sign(
    { userId: 'admin-test-id', role: 'admin', email: 'admin@unchk.edu.sn' },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );
}

function authHeader() {
  return { Authorization: `Bearer ${makeAdminToken()}` };
}

// ─── GET /api/admin/stats ─────────────────────────────────────────────────────

describe('GET /api/admin/stats', () => {
  const mockStats = {
    totalEtudiants: 42,
    totalEntreprises: 10,
    totalOffres: 25,
    totalCandidatures: 100,
    entreprisesEnAttente: 3,
    offresPubliees: 20,
    candidaturesAcceptees: 15,
  };

  beforeEach(() => {
    mockPrisma.etudiant.count.mockResolvedValue(mockStats.totalEtudiants);
    mockPrisma.entreprise.count
      .mockResolvedValueOnce(mockStats.totalEntreprises)
      .mockResolvedValueOnce(mockStats.entreprisesEnAttente);
    mockPrisma.offre.count
      .mockResolvedValueOnce(mockStats.totalOffres)
      .mockResolvedValueOnce(mockStats.offresPubliees);
    mockPrisma.candidature.count
      .mockResolvedValueOnce(mockStats.totalCandidatures)
      .mockResolvedValueOnce(mockStats.candidaturesAcceptees);
  });

  it('devrait retourner 401 sans authentification', async () => {
    const res = await request(app).get('/api/admin/stats');
    expect(res.status).toBe(401);
  });

  it('devrait retourner 403 pour un rôle non-admin', async () => {
    const token = jwt.sign(
      { userId: 'etudiant-id', role: 'etudiant', email: 'etudiant@unchk.edu.sn' },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('devrait retourner les stats pour un admin authentifié', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set(authHeader());
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('totalEtudiants');
    expect(res.body.data).toHaveProperty('tauxInsertion');
  });

  it('devrait calculer un taux d\'insertion correct', async () => {
    mockPrisma.etudiant.count.mockResolvedValue(100);
    mockPrisma.entreprise.count.mockResolvedValue(10).mockResolvedValueOnce(10).mockResolvedValueOnce(2);
    mockPrisma.offre.count.mockResolvedValue(50).mockResolvedValueOnce(50).mockResolvedValueOnce(40);
    mockPrisma.candidature.count.mockResolvedValue(200).mockResolvedValueOnce(200).mockResolvedValueOnce(30);

    const res = await request(app)
      .get('/api/admin/stats')
      .set(authHeader());
    expect(res.status).toBe(200);
    expect(typeof res.body.data.tauxInsertion).toBe('number');
    expect(res.body.data.tauxInsertion).toBeGreaterThanOrEqual(0);
    expect(res.body.data.tauxInsertion).toBeLessThanOrEqual(100);
  });
});

// ─── GET /api/admin/entreprises ───────────────────────────────────────────────

describe('GET /api/admin/entreprises', () => {
  beforeEach(() => {
    mockPrisma.entreprise.findMany.mockResolvedValue([
      {
        id: 'ent-1',
        nomEntreprise: 'Tech Sénégal',
        estValide: false,
        secteurActivite: 'IT',
        utilisateur: { email: 'tech@sn.com', dateCreation: new Date(), estActif: true },
        offres: [],
      },
    ]);
  });

  it('devrait retourner 401 sans authentification', async () => {
    const res = await request(app).get('/api/admin/entreprises');
    expect(res.status).toBe(401);
  });

  it('devrait retourner la liste des entreprises', async () => {
    const res = await request(app)
      .get('/api/admin/entreprises')
      .set(authHeader());
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

// ─── PUT /api/admin/entreprises/:id/valider ───────────────────────────────────

describe('PUT /api/admin/entreprises/:id/valider', () => {
  it('devrait retourner 401 sans authentification', async () => {
    const res = await request(app).put('/api/admin/entreprises/non-existant/valider');
    expect(res.status).toBe(401);
  });

  it('devrait retourner 4xx si l\'entreprise n\'existe pas', async () => {
    mockPrisma.entreprise.findUnique.mockResolvedValue(null);
    const res = await request(app)
      .put('/api/admin/entreprises/non-existant/valider')
      .set(authHeader());
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  });

  it('devrait valider une entreprise existante', async () => {
    mockPrisma.entreprise.findUnique.mockResolvedValue({ id: 'ent-1', estValide: false });
    mockPrisma.entreprise.update.mockResolvedValue({ id: 'ent-1', estValide: true });

    const res = await request(app)
      .put('/api/admin/entreprises/ent-1/valider')
      .set(authHeader());
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('devrait rejeter si l\'entreprise est déjà validée', async () => {
    mockPrisma.entreprise.findUnique.mockResolvedValue({ id: 'ent-1', estValide: true });
    const res = await request(app)
      .put('/api/admin/entreprises/ent-1/valider')
      .set(authHeader());
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});

// ─── PUT /api/admin/utilisateurs/:id/toggle ───────────────────────────────────

describe('PUT /api/admin/utilisateurs/:id/toggle', () => {
  it('devrait retourner 401 sans authentification', async () => {
    const res = await request(app).put('/api/admin/utilisateurs/user-1/toggle');
    expect(res.status).toBe(401);
  });

  it('devrait activer / désactiver un utilisateur', async () => {
    mockPrisma.utilisateur.findUnique.mockResolvedValue({ id: 'user-1', estActif: true });
    mockPrisma.utilisateur.update.mockResolvedValue({ id: 'user-1', estActif: false });

    const res = await request(app)
      .put('/api/admin/utilisateurs/user-1/toggle')
      .set(authHeader());
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('ne doit pas permettre de désactiver son propre compte', async () => {
    // The admin token uses userId = 'admin-test-id'
    const res = await request(app)
      .put('/api/admin/utilisateurs/admin-test-id/toggle')
      .set(authHeader());
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});

// ─── GET /api/admin/superviseurs ─────────────────────────────────────────────

describe('GET /api/admin/superviseurs', () => {
  beforeEach(() => {
    mockPrisma.superviseur.findMany.mockResolvedValue([]);
  });

  it('devrait retourner 401 sans authentification', async () => {
    const res = await request(app).get('/api/admin/superviseurs');
    expect(res.status).toBe(401);
  });

  it('devrait retourner la liste (vide)', async () => {
    const res = await request(app)
      .get('/api/admin/superviseurs')
      .set(authHeader());
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
