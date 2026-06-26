import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';

import { createApp } from '../../src/app';

const app = createApp();

const TEST_USER = {
  name: 'E2E Test User',
  email: `e2e-${Date.now()}@crewmutetest.com`,
  password: 'StrongP123',
  college: 'E2E University',
};

let mongoServer: MongoMemoryServer;
let accessToken: string;
let refreshToken: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
}, 30000);

afterAll(async () => {
  await mongoose.connection.db?.collection('users').deleteMany({
    email: { $regex: /^e2e-.*@crewmutetest\.com$/ },
  });
  await mongoose.disconnect();
  await mongoServer.stop();
}, 10000);

describe('Auth Flow', () => {
  it('POST /api/v1/auth/register — creates a new unverified user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(TEST_USER);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(TEST_USER.email);
    expect(res.body.data.user.name).toBe(TEST_USER.name);
    expect(res.body.data.user.isEmailVerified).toBe(false);
    expect(res.body.data.message).toContain('OTP');
  });

  it('POST /api/v1/auth/verify-otp — verifies email with magic OTP', async () => {
    const res = await request(app)
      .post('/api/v1/auth/verify-otp')
      .send({ email: TEST_USER.email, otp: '123456' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.isEmailVerified).toBe(true);
    expect(res.body.data.tokens.accessToken).toBeDefined();
    expect(res.body.data.tokens.refreshToken).toBeDefined();
  });

  it('POST /api/v1/auth/register — returns success for duplicate email (anti-enumeration)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(TEST_USER);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    // Verify the original account still works
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password });
    expect(loginRes.status).toBe(200);
  });

  it('POST /api/v1/auth/login — logs in with valid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tokens.accessToken).toBeDefined();
    expect(res.body.data.tokens.refreshToken).toBeDefined();

    accessToken = res.body.data.tokens.accessToken;
    refreshToken = res.body.data.tokens.refreshToken;
  });

  it('POST /api/v1/auth/refresh — issues new tokens', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();

    accessToken = res.body.data.accessToken;
    refreshToken = res.body.data.refreshToken;
  });

  it('GET /api/v1/auth/me — returns the authenticated user profile', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(TEST_USER.email);
    expect(res.body.data.user.name).toBe(TEST_USER.name);
  });

  it('POST /api/v1/auth/logout — globally invalidates refresh tokens', async () => {
    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(204);
  });

  it('POST /api/v1/auth/refresh — old refresh token is rejected after global logout', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});
