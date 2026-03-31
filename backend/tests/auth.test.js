const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');

describe('Authentication Routes', () => {
  describe('POST /api/auth/google', () => {
    beforeEach(async () => {
      // Clean up test users before each test to ensure clean state
      const db = require('../src/db/knex');
      await db('users').where('email', 'like', '%@example.com').del();
    });

    it('should create new user and return token', async () => {
      const userData = {
        uid: 'test-uid-123',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: 'https://example.com/photo.jpg'
      };

      const response = await request(app)
        .post('/api/auth/google')
        .send(userData)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('userData');
      expect(response.body).toHaveProperty('isNewUser', true);
      expect(response.body.userData.email).toBe(userData.email);
    });

    it('should return existing user data', async () => {
      const userData = {
        uid: 'existing-uid-456',
        email: 'existing@example.com',
        displayName: 'Existing User',
        photoURL: 'https://example.com/existing.jpg'
      };

      // First request creates user
      await request(app)
        .post('/api/auth/google')
        .send(userData)
        .expect(200);

      // Second request should return existing user
      const response = await request(app)
        .post('/api/auth/google')
        .send(userData)
        .expect(200);

      expect(response.body).toHaveProperty('isNewUser', false);
    });
  });

  describe('GET /api/auth/context', () => {
    let validToken;
    let testUserId;

    beforeEach(async () => {
      // Create a test user for context tests
      const db = require('../src/db/knex');

      // Clean up any existing test user
      await db('users').where('email', 'context-test@example.com').del();

      // Create test user
      const [user] = await db('users').insert({
        email: 'context-test@example.com',
        username: 'context-test-user',
        created_at: new Date()
      }).returning('*');

      testUserId = user.id;

      validToken = jwt.sign(
        { userId: testUserId },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
    });

    it('should return 401 without token', async () => {
      await request(app)
        .get('/api/auth/context')
        .expect(401);
    });

    it('should return 403 with invalid token', async () => {
      await request(app)
        .get('/api/auth/context')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);
    });

    it('should return user context with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/context')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('context-test@example.com');
    });
  });

  describe('POST /api/auth/logout', () => {
    let validToken;

    beforeEach(() => {
      validToken = jwt.sign(
        { userId: 1 },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
    });

    it('should logout successfully with valid token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Logged out successfully');
    });
  });

  afterAll(async () => {
    // Clean up all test data after all tests
    const db = require('../src/db/knex');
    await db('users').where('email', 'like', '%@example.com').del();
    await db.destroy(); // Close database connection
  });
});