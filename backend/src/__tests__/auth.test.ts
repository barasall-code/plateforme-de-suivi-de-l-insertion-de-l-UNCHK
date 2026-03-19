import request from 'supertest';

jest.mock('../lib/prisma', () => ({
  __esModule: true,
  default: {
    utilisateur: {
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
    },
    etudiant: { create: jest.fn() },
    entreprise: { create: jest.fn() },
  },
}));

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    on: jest.fn(),
  }));
});

import app from '../index';

describe('POST /api/auth/register - Validation', () => {
  it('devrait rejeter une requete vide (4xx)', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  });

  it('devrait rejeter un email invalide (4xx)', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'pas-un-email',
      mot_de_passe: 'Test1234!',
      type_utilisateur: 'etudiant',
    });
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  });

  it('devrait rejeter un mot de passe trop court (4xx)', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'test@unchk.edu.sn',
      mot_de_passe: '123',
      type_utilisateur: 'etudiant',
    });
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  });

  it('devrait retourner du JSON', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('la reponse doit avoir success=false', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/auth/login - Validation', () => {
  it('devrait rejeter une requete vide (4xx)', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  });

  it('devrait rejeter un email manquant (4xx)', async () => {
    const res = await request(app).post('/api/auth/login').send({ mot_de_passe: 'Test1234!' });
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  });

  it('devrait rejeter un mot de passe manquant (4xx)', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'test@unchk.edu.sn' });
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  });
});

describe('GET /api/auth/me - Protection JWT', () => {
  it('devrait rejeter sans token avec 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('devrait rejeter un token malformé avec 401', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer token-invalide-xyz');
    expect(res.status).toBe(401);
  });
});
