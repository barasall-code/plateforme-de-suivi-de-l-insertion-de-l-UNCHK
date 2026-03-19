import request from 'supertest';
import app from '../index';

/**
 * Tests d'intégration — Endpoint de santé API
 * Vérifie que le serveur répond correctement sur /api/health
 */
describe('GET /api/health', () => {
  it('devrait retourner un statut 200', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
  });

  it('devrait retourner status "OK"', async () => {
    const res = await request(app).get('/api/health');
    expect(res.body.status).toBe('OK');
  });

  it('devrait inclure un timestamp ISO valide', async () => {
    const res = await request(app).get('/api/health');
    expect(res.body).toHaveProperty('timestamp');
    const date = new Date(res.body.timestamp);
    expect(date.toString()).not.toBe('Invalid Date');
  });

  it('devrait inclure le numéro de version', async () => {
    const res = await request(app).get('/api/health');
    expect(res.body).toHaveProperty('version');
    expect(typeof res.body.version).toBe('string');
  });

  it('devrait retourner du JSON avec le bon Content-Type', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
});

/**
 * Tests — Route inconnue
 * Vérifie que les routes non définies retournent 404
 */
describe('Routes inconnues', () => {
  it('devrait retourner 404 pour une route inexistante', async () => {
    const res = await request(app).get('/api/route-inexistante');
    expect(res.status).toBe(404);
  });
});
