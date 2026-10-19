import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { pool, query } from '../src/config/db.js';

describe('Phase 2: Authentication Backend Tests', () => {
  const testUser = {
    name: 'Test Runner',
    email: 'test.auth@example.com',
    password: 'Password123!',
  };

  beforeAll(async () => {
    // Clean up test user if previously left in DB
    await query('DELETE FROM users WHERE email = $1 OR email = $2', [
      testUser.email,
      'google.mock@example.com',
    ]);
  });

  afterAll(async () => {
    // Clean up created test accounts
    await query('DELETE FROM users WHERE email = $1 OR email = $2', [
      testUser.email,
      'google.mock@example.com',
    ]);
  });

  // T-AUTH-01: Valid Registration
  it('T-AUTH-01: Register user with valid credentials returns 201 and user object without password_hash', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('user');
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe(testUser.email.toLowerCase());
    expect(res.body.user.name).toBe(testUser.name);
    expect(res.body.user.password_hash).toBeUndefined();
    expect(res.body.user.password).toBeUndefined();
  });

  // T-AUTH-02: Registration Validation Failure
  it('T-AUTH-02: Register rejects invalid email format or short password (< 8 chars) with 400', async () => {
    const invalidEmailRes = await request(app).post('/api/auth/register').send({
      name: 'Bad Email User',
      email: 'not-an-email',
      password: 'ValidPassword123',
    });
    expect(invalidEmailRes.status).toBe(400);
    expect(invalidEmailRes.body.error.code).toBe('VALIDATION_ERROR');

    const shortPassRes = await request(app).post('/api/auth/register').send({
      name: 'Short Pass User',
      email: 'shortpass@example.com',
      password: '123',
    });
    expect(shortPassRes.status).toBe(400);
    expect(shortPassRes.body.error.code).toBe('VALIDATION_ERROR');
  });

  // T-AUTH-03: Duplicate Registration Conflict
  it('T-AUTH-03: Register rejects duplicate email with 409 Conflict', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('EMAIL_EXISTS');
  });

  // T-AUTH-04: Valid Login
  it('T-AUTH-04: Login with valid credentials returns 200 with JWT token', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe(testUser.email.toLowerCase());
  });

  // T-AUTH-05: Invalid Login Credentials
  it('T-AUTH-05: Login with incorrect password returns 401 Unauthorized', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: 'WrongPassword999',
    });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  // T-AUTH-06: Protected Route /api/auth/me
  it('T-AUTH-06: GET /api/auth/me validates Bearer token and returns profile; rejects missing token', async () => {
    // 1. Missing token
    const unauthRes = await request(app).get('/api/auth/me');
    expect(unauthRes.status).toBe(401);
    expect(unauthRes.body.error.code).toBe('UNAUTHORIZED');

    // 2. Login to get token
    const loginRes = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });
    const token = loginRes.body.token;

    // 3. Authorized request with Bearer token
    const authRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(authRes.status).toBe(200);
    expect(authRes.body.user.email).toBe(testUser.email.toLowerCase());
  });

  // T-AUTH-07: Google OAuth Authentication
  it('T-AUTH-07: POST /api/auth/google rejects invalid token and provisions valid token', async () => {
    // 1. Invalid credential token
    const invalidGoogleRes = await request(app).post('/api/auth/google').send({
      credential: 'invalid-garbage-google-token',
    });
    expect(invalidGoogleRes.status).toBe(401);

    // 2. Valid mock Google credential
    const validGoogleRes = await request(app).post('/api/auth/google').send({
      credential: 'mock-google-valid-token',
    });
    expect(validGoogleRes.status).toBe(200);
    expect(validGoogleRes.body).toHaveProperty('token');
    expect(validGoogleRes.body.user.email).toBe('google.mock@example.com');
  });
});
