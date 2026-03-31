const request = require('supertest');
const app = require('../src/app');

describe('Authentication Routes', () => {
  it('should return 401 when no token is provided', async () => {
    const response = await request(app)
      .get('/api/auth/context')
      .expect(401);

    expect(response.body).toHaveProperty('error', 'No token provided');
  });
});