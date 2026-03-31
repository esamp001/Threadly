const request = require('supertest');
const jwt = require('jsonwebtoken');
const express = require('express');
const { checkAuth } = require('../src/middleware/checkAuth');

describe('Authentication Middleware', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Test route that uses the middleware
    app.get('/protected', checkAuth, (req, res) => {
      res.json({ user: req.user, token: req.token });
    });
  });

  it('should allow access with valid token', async () => {
    const token = jwt.sign(
      { userId: 1 },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const response = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.user).toHaveProperty('userId', 1);
    expect(response.body).toHaveProperty('token');
  });

  it('should reject request without authorization header', async () => {
    const response = await request(app)
      .get('/protected')
      .expect(401);

    expect(response.body).toHaveProperty('error_message', 'Unauthorized - No authorization header provided');
  });

  it('should reject request with invalid token', async () => {
    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer invalid-token')
      .expect(403);

    expect(response.body).toHaveProperty('error_message', 'Forbidden - Invalid token');
  });
});