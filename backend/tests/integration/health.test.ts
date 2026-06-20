/**
 * Integration tests for health endpoints.
 *
 * Per AGENT_RULES.md §22.3: every API endpoint must have integration tests
 * covering the happy path at minimum.
 *
 * Health endpoints are always public (no auth required per §21.2).
 *
 * NOTE: Environment variables must be set before any module that reads
 * process.env at load time (env.ts evaluates on import). They are set
 * here at the top of the file, before jest executes any imports, using
 * the jest `setupFiles` mechanism via jest.config.ts.
 */

// env vars are set via jest.config.ts → setupFiles → jest.setup.ts
// This import is safe because jest setup runs before test modules load.
import request from 'supertest';

import { createApp } from '../../src/app';

const app = createApp();

describe('GET /health', () => {
  it('returns 200 with status ok and uptime', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: 'ok',
    });
    expect(typeof res.body.uptime).toBe('number');
    expect(typeof res.body.timestamp).toBe('string');
  });
});

describe('GET /health/ready', () => {
  it('returns 503 when the database is not connected', async () => {
    // In this test environment no real MongoDB is connected,
    // so the readiness probe should return 503.
    const res = await request(app).get('/health/ready');

    expect(res.status).toBe(503);
    expect(res.body).toMatchObject({
      status: 'not_ready',
      database: 'disconnected',
    });
  });
});

describe('GET /api/v1/nonexistent-route', () => {
  it('returns 404 with ROUTE_NOT_FOUND error code', async () => {
    const res = await request(app).get('/api/v1/nonexistent-route');

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({
      success: false,
      error: {
        code: 'ROUTE_NOT_FOUND',
      },
    });
  });
});
