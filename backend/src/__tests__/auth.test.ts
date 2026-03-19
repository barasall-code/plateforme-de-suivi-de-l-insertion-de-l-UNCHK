import request from 'supertest';
import app from '../index';

/**
 * Tests d'intégration — Authentification
 * Couvre les cas d'erreur de validation (sans accès BD)
 */
describe('POST /api/auth/register - Validation', () => {
  it('devrait rejeter une requête vide avec 400', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.status).toBe(400);
  });

  it('devrait rejeter un email avec format invalide', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'pas-un-email', mot_de_passe: 'Test1234!', type_utilisateur: 'etudiant' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('devrait rejeter un mot de passe trop court', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@unchk.edu.sn', mot_de_passe: '123', type_utilisateur: 'etudiant' });
    expect(res.status).toBe(400);
  });

  it('devrait rejeter un type_utilisateur invalide', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@unchk.edu.sn', mot_de_passe: 'Test1234!', type_utilisateur: 'inconnu' });
    expect(res.status).toBe(400);
  });

  it('la réponse doit être du JSON', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
});

describe('POST /api/auth/login - Validation', () => {
  it('devrait rejeter une requête vide avec 400', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
  });

  it('devrait rejeter un email manquant', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ mot_de_passe: 'Test1234!' });
    expect(res.status).toBe(400);
  });

  it('devrait rejeter un mot de passe manquant', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@unchk.edu.sn' });
    expect(res.status).toBe(400);
  });

  it('devrait retourner 401 pour des identifiants incorrects', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'utilisateur.inexistant@unchk.edu.sn', mot_de_passe: 'MauvaisMotDePasse!' });
    // 401 Unauthorized ou 400 selon implémentation
    expect([400, 401, 404]).toContain(res.status);
  });
});

describe('GET /api/auth/me - Protection JWT', () => {
  it('devrait rejeter une requête sans token avec 401', async () => {
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
