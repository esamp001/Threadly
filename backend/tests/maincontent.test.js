const request = require('supertest');
const app = require('../src/app');

describe('Main Content Routes', () => {
  describe('GET /api/maincontent/hot_spaces', () => {
    it('should return array of hot spaces', async () => {
      const response = await request(app)
        .get('/api/maincontent/hot_spaces')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('spaces');
      expect(Array.isArray(response.body.spaces)).toBe(true);
    });

    it('should return spaces with required fields', async () => {
      const response = await request(app)
        .get('/api/maincontent/hot_spaces')
        .expect(200);

      if (response.body.spaces.length > 0) {
        const space = response.body.spaces[0];
        expect(space).toHaveProperty('id');
        expect(space).toHaveProperty('space_name');
        expect(space).toHaveProperty('avatar_url');
        expect(space).toHaveProperty('thread_count');
        expect(space).toHaveProperty('activity_score');
      }
    });

    it('should return spaces ordered by activity_score DESC', async () => {
      const response = await request(app)
        .get('/api/maincontent/hot_spaces')
        .expect(200);

      if (response.body.spaces.length > 1) {
        const scores = response.body.spaces.map(s => parseFloat(s.activity_score));
        for (let i = 0; i < scores.length - 1; i++) {
          expect(scores[i]).toBeGreaterThanOrEqual(scores[i + 1]);
        }
      }
    });

    it('should limit to 5 spaces', async () => {
      const response = await request(app)
        .get('/api/maincontent/hot_spaces')
        .expect(200);

      expect(response.body.spaces.length).toBeLessThanOrEqual(5);
    });
  });

  describe('GET /api/maincontent/hot_threads', () => {
    it('should return array of hot threads', async () => {
      const response = await request(app)
        .get('/api/maincontent/hot_threads')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('threads');
      expect(Array.isArray(response.body.threads)).toBe(true);
    });

    it('should return threads with required fields', async () => {
      const response = await request(app)
        .get('/api/maincontent/hot_threads')
        .expect(200);

      if (response.body.threads.length > 0) {
        const thread = response.body.threads[0];
        expect(thread).toHaveProperty('id');
        expect(thread).toHaveProperty('title');
        expect(thread).toHaveProperty('space_id');
        expect(thread).toHaveProperty('comments');
        expect(thread).toHaveProperty('net_score');
        expect(thread).toHaveProperty('space_name');
      }
    });

    it('should return threads ordered by activity score DESC', async () => {
      const response = await request(app)
        .get('/api/maincontent/hot_threads')
        .expect(200);

      if (response.body.threads.length > 1) {
        // Calculate activity score for each thread
        const scores = response.body.threads.map(t => (t.comments * 2) + t.net_score);
        for (let i = 0; i < scores.length - 1; i++) {
          expect(scores[i]).toBeGreaterThanOrEqual(scores[i + 1]);
        }
      }
    });

    it('should limit to 5 threads', async () => {
      const response = await request(app)
        .get('/api/maincontent/hot_threads')
        .expect(200);

      expect(response.body.threads.length).toBeLessThanOrEqual(5);
    });
  });

  afterAll(async () => {
    // Close database connection
    const db = require('../src/db/knex');
    await db.destroy();
  });
});
