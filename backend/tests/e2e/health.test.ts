import request from 'supertest';
import { createApp } from '../../src/app';

const app = createApp();

describe('GET /health', () => {
  it('returns 200 with status ok, uptime, and timestamp', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'ok' });
    expect(typeof res.body.uptime).toBe('number');
    expect(typeof res.body.timestamp).toBe('string');
  });
});

describe('GET /health/ready', () => {
  it('returns 503 when the database is not connected', async () => {
    const res = await request(app).get('/health/ready');

    expect(res.status).toBe(503);
    expect(res.body).toMatchObject({
      status: 'not_ready',
      database: 'disconnected',
    });
  });
});
