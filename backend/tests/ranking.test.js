/**
 * Unit tests for ranking system
 * Tests EXP calculation, level determination, and title assignment
 */
const request = require('supertest');
const app = require('../src/app');
const db = require('../src/db/knex');
const { calculateLevel, getTitle, getExpForAction, canGainExpToday } = require('../src/utils/rankingHelpers');

describe('Ranking System Utilities', () => {
  describe('calculateLevel', () => {
    test('should return level 1 for 0 EXP', () => {
      expect(calculateLevel(0)).toBe(1);
    });

    test('should return level 2 for 50 EXP', () => {
      expect(calculateLevel(50)).toBe(2);
    });

    test('should return level 3 for 120 EXP', () => {
      expect(calculateLevel(120)).toBe(3);
    });

    test('should return level 15 for 4100 EXP', () => {
      expect(calculateLevel(4100)).toBe(15);
    });

    test('should return level 15 for EXP above 4100', () => {
      expect(calculateLevel(5000)).toBe(15);
    });

    test('should return correct level for various EXP amounts', () => {
      expect(calculateLevel(25)).toBe(1);  // Between 0-50
      expect(calculateLevel(75)).toBe(2);  // Between 50-120
      expect(calculateLevel(200)).toBe(3);  // Between 120-220
      expect(calculateLevel(300)).toBe(4);  // Between 220-350
      expect(calculateLevel(450)).toBe(5);  // Between 350-500
    });
  });

  describe('getTitle', () => {
    test('should return correct title for each level', () => {
      expect(getTitle(1)).toBe('Newbie');
      expect(getTitle(2)).toBe('Explorer');
      expect(getTitle(3)).toBe('Contributor');
      expect(getTitle(4)).toBe('Advocate');
      expect(getTitle(5)).toBe('Engager');
      expect(getTitle(6)).toBe('Collaborator');
      expect(getTitle(7)).toBe('Influencer');
      expect(getTitle(8)).toBe('Mentor');
      expect(getTitle(9)).toBe('Leader');
      expect(getTitle(10)).toBe('Pioneer');
      expect(getTitle(11)).toBe('Visionary');
      expect(getTitle(12)).toBe('Luminary');
      expect(getTitle(13)).toBe('Sage');
      expect(getTitle(14)).toBe('Master');
      expect(getTitle(15)).toBe('Grandmaster');
    });

    test('should return Newbie for invalid levels', () => {
      expect(getTitle(0)).toBe('Newbie');
      expect(getTitle(16)).toBe('Newbie');
      expect(getTitle(-1)).toBe('Newbie');
    });
  });

  describe('getExpForAction', () => {
    test('should return correct EXP amounts for different actions', () => {
      expect(getExpForAction('thread_created')).toBe(10);
      expect(getExpForAction('thread_upvote')).toBe(2);
      expect(getExpForAction('thread_helpful')).toBe(15);
      expect(getExpForAction('thread_pinned')).toBe(30);
      expect(getExpForAction('reply_posted')).toBe(5);
      expect(getExpForAction('reply_upvote')).toBe(1);
      expect(getExpForAction('sub_reply_posted')).toBe(3);
      expect(getExpForAction('daily_login')).toBe(3);
      expect(getExpForAction('first_post_daily')).toBe(2);
      expect(getExpForAction('space_created')).toBe(20);
      expect(getExpForAction('accepted_answer')).toBe(20);
      expect(getExpForAction('moderation_approved')).toBe(7);
    });

    test('should return 0 for invalid action types', () => {
      expect(getExpForAction('invalid_action')).toBe(0);
      expect(getExpForAction('')).toBe(0);
      expect(getExpForAction(null)).toBe(0);
    });
  });

  describe('canGainExpToday', () => {
    test('should return true when below daily cap', () => {
      expect(canGainExpToday(100)).toBe(true);
      expect(canGainExpToday(0)).toBe(true);
      expect(canGainExpToday(149)).toBe(true);
    });

    test('should return false when at or above daily cap', () => {
      expect(canGainExpToday(150)).toBe(false);
      expect(canGainExpToday(200)).toBe(false);
    });

    test('should work with custom daily cap', () => {
      expect(canGainExpToday(90, 100)).toBe(true);
      expect(canGainExpToday(100, 100)).toBe(false);
      expect(canGainExpToday(150, 200)).toBe(true);
    });
  });
});

describe('EXP API Endpoints', () => {
  let testUser;
  let authToken;

  beforeAll(async () => {
    // Create test user
    const testUserData = {
      email: 'test@example.com',
      username: 'testuser',
      firebase_uid: 'test123'
    };

    [testUser] = await db('users').insert(testUserData).returning('*');

    // Generate auth token
    const jwt = require('jsonwebtoken');
    authToken = jwt.sign({ userId: testUser.id }, process.env.JWT_SECRET);
  });

  afterAll(async () => {
    // Clean up test data
    await db('user_exp_history').where('user_id', testUser.id).del();
    await db('users').where('id', testUser.id).del();
  });

  describe('POST /api/exp/award', () => {
    test('should award EXP for valid action', async () => {
      const response = await request(app)
        .post('/api/exp/award')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ actionType: 'thread_created' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.result.expAwarded).toBe(10);
      expect(response.body.result.newLevel).toBe(2);
    });

    test('should reject invalid action type', async () => {
      const response = await request(app)
        .post('/api/exp/award')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ actionType: 'invalid_action' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid action type');
    });

    test('should reject unauthorized requests', async () => {
      const response = await request(app)
        .post('/api/exp/award')
        .send({ actionType: 'thread_created' })
        .expect(401);
    });

    test('should respect daily EXP cap', async () => {
      // Award enough EXP to hit the cap
      for (let i = 0; i < 15; i++) {
        await request(app)
          .post('/api/exp/award')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ actionType: 'space_created' });
      }

      // Next request should be rejected
      const response = await request(app)
        .post('/api/exp/award')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ actionType: 'thread_created' })
        .expect(429);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Daily EXP cap reached');
    });
  });

  describe('GET /api/exp/history', () => {
    test('should return user EXP history', async () => {
      const response = await request(app)
        .get('/api/exp/history')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.history)).toBe(true);
      expect(response.body.history.length).toBeGreaterThan(0);
    });

    test('should support pagination', async () => {
      const response = await request(app)
        .get('/api/exp/history?limit=5&offset=0')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.history.length).toBeLessThanOrEqual(5);
    });
  });

  describe('GET /api/exp/stats', () => {
    test('should return user EXP stats', async () => {
      const response = await request(app)
        .get('/api/exp/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.stats).toHaveProperty('currentExp');
      expect(response.body.stats).toHaveProperty('currentLevel');
      expect(response.body.stats).toHaveProperty('todayExpGained');
      expect(response.body.stats).toHaveProperty('dailyCapRemaining');
    });
  });
});

describe('Database Integration', () => {
  let testUser;

  beforeAll(async () => {
    const testUserData = {
      email: 'dbtest@example.com',
      username: 'dbtestuser',
      firebase_uid: 'dbtest123'
    };

    [testUser] = await db('users').insert(testUserData).returning('*');
  });

  afterAll(async () => {
    await db('user_exp_history').where('user_id', testUser.id).del();
    await db('users').where('id', testUser.id).del();
  });

  test('should create EXP history records', async () => {
    const expRecord = {
      user_id: testUser.id,
      exp_amount: 10,
      action_type: 'thread_created',
      reference_id: 123
    };

    const [record] = await db('user_exp_history').insert(expRecord).returning('*');

    expect(record.user_id).toBe(testUser.id);
    expect(record.exp_amount).toBe(10);
    expect(record.action_type).toBe('thread_created');
    expect(record.reference_id).toBe(123);
    expect(record.created_at).toBeDefined();
  });

  test('should update user EXP and level', async () => {
    await db('users')
      .where('id', testUser.id)
      .update({ exp_points: 150, level: 3 });

    const user = await db('users').where('id', testUser.id).first();

    expect(user.exp_points).toBe(150);
    expect(user.level).toBe(3);
  });
});
