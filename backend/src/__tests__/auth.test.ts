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
  it('devrait rejeter une requete vide avec 400', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.status).toBe(400);
  });

  it('devrait rejeter un email invalide', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'pas-un-email',
      mot_de_passe: 'Test1234!',
      type_utilisateur: 'etudiant',
    });
    expect(res.status).toBe(400);
  });

  it('devrait rejeter un mot de passe trop court', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'test@unchk.edu.sn',
      mot_de_passe: '123',
      type_utilisateur: 'etudiant',
    });
    expect(res.status).toBe(400);
  });

  it('devrait retourner du JSON', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
});

describe('POST /api/auth/login - Validation', () => {
  it('devrait rejeter une requete vide avec 400', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
  });

  it('devrait rejeter un email manquant', async () => {
    const res = await request(app).post('/api/auth/login').send({ mot_de_passe: 'Test1234!' });
    expect(res.status).toBe(400);
  });

  it('devrait rejeter un mot de passe manquant', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'test@unchk.edu.sn' });
    expect(res.status).toBe(400);
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
