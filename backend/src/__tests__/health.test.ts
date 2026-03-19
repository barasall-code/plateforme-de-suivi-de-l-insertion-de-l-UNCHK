import request from 'supertest';
import app from '../index';

describe('GET /api/health', () => {
  it('devrait retourner un statut 200', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
  });

  it('devrait retourner status OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.body.status).toBe('OK');
  });

  it('devrait inclure un timestamp valide', async () => {
    const res = await request(app).get('/api/health');
    expect(res.body).toHaveProperty('timestamp');
    expect(new Date(res.body.timestamp).toString()).not.toBe('Invalid Date');
  });

  it('devrait inclure le numero de version', async () => {
    const res = await request(app).get('/api/health');
    expect(res.body).toHaveProperty('version');
  });

  it('devrait retourner du JSON', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
});

describe('Routes inconnues', () => {
  it('devrait retourner 404 pour une route inexistante', async () => {
    const res = await request(app).get('/api/route-qui-nexiste-pas');
    expect(res.status).toBe(404);
  });
});
