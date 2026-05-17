/**
 * Integration tests for Global Gamification Leaderboard API
 * Tests GET /api/header/leaderboard endpoint
 */
const request = require('supertest');
const app = require('../src/app');
const db = require('../src/db/knex');
const jwt = require('jsonwebtoken');

describe('Leaderboard API Endpoints', () => {
  let testUser1;
  let testUser2;
  let testUser3;
  let testSpace;
  let authToken;

  beforeAll(async () => {
    // Self-healing: delete any leftover test data matching our unique constraints first
    await db('space_contributor_points').whereIn('user_id', function() {
      this.select('id').from('users').whereIn('username', ['leader_level1', 'leader_level2', 'leader_level3']);
    }).del();
    await db('spaces').where('space_slug', 'spaces/leaderboard-test').del();
    await db('users').whereIn('username', ['leader_level1', 'leader_level2', 'leader_level3']).del();

    // 1. Create test users with different EXP and levels
    [testUser1] = await db('users').insert({
      email: 'leaderboard_user1@example.com',
      username: 'leader_level1',
      exp_points: 500,
      level: 6,
      firebase_uid: 'uid_leader1'
    }).returning('*');

    [testUser2] = await db('users').insert({
      email: 'leaderboard_user2@example.com',
      username: 'leader_level2',
      exp_points: 1000,
      level: 9,
      firebase_uid: 'uid_leader2'
    }).returning('*');

    [testUser3] = await db('users').insert({
      email: 'leaderboard_user3@example.com',
      username: 'leader_level3',
      exp_points: 150,
      level: 3,
      firebase_uid: 'uid_leader3'
    }).returning('*');

    // 2. Create test space using correct database column 'space_description'
    [testSpace] = await db('spaces').insert({
      space_name: 'Leaderboard Test Space',
      space_slug: 'spaces/leaderboard-test',
      space_description: 'Test space description',
      created_by: testUser1.id
    }).returning('*');

    // 3. Create space contributor points with distinct point values
    await db('space_contributor_points').insert([
      {
        space_id: testSpace.id,
        user_id: testUser1.id,
        points: 120,
        posts_count: 5,
        comments_count: 10
      },
      {
        space_id: testSpace.id,
        user_id: testUser2.id,
        points: 50,
        posts_count: 2,
        comments_count: 4
      },
      {
        space_id: testSpace.id,
        user_id: testUser3.id,
        points: 200,
        posts_count: 8,
        comments_count: 20
      }
    ]);

    // 4. Generate Auth Token
    authToken = jwt.sign({ userId: testUser1.id }, process.env.JWT_SECRET);
  });

  afterAll(async () => {
    // Clean up test data with safe checks
    if (testSpace && testSpace.id) {
      await db('space_contributor_points').where('space_id', testSpace.id).del();
      await db('spaces').where('id', testSpace.id).del();
    }
    const userIds = [];
    if (testUser1) userIds.push(testUser1.id);
    if (testUser2) userIds.push(testUser2.id);
    if (testUser3) userIds.push(testUser3.id);
    if (userIds.length > 0) {
      await db('users').whereIn('id', userIds).del();
    }
  });

  describe('GET /api/header/leaderboard', () => {
    it('should reject unauthorized requests', async () => {
      await request(app)
        .get('/api/header/leaderboard')
        .expect(401);
    });

    it('should return successfully with correct lists structure', async () => {
      const response = await request(app)
        .get('/api/header/leaderboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.levels)).toBe(true);
      expect(Array.isArray(response.body.contributors)).toBe(true);
    });

    it('should correctly sort global levels leaderboard in descending order', async () => {
      const response = await request(app)
        .get('/api/header/leaderboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const levels = response.body.levels;
      // Filter out other users that might be in the database seed to only check our test users
      const testLevels = levels.filter(u => 
        [testUser1.username, testUser2.username, testUser3.username].includes(u.username)
      );

      expect(testLevels).toHaveLength(3);
      // Expected order by exp_points descending: testUser2 (1000) -> testUser1 (500) -> testUser3 (150)
      expect(testLevels[0].username).toBe(testUser2.username);
      expect(testLevels[1].username).toBe(testUser1.username);
      expect(testLevels[2].username).toBe(testUser3.username);
    });

    it('should correctly aggregate and sort contributors leaderboard in descending order', async () => {
      const response = await request(app)
        .get('/api/header/leaderboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const contributors = response.body.contributors;
      const testContributors = contributors.filter(u => 
        [testUser1.username, testUser2.username, testUser3.username].includes(u.username)
      );

      expect(testContributors).toHaveLength(3);
      // Expected order by total_points descending: testUser3 (200) -> testUser1 (120) -> testUser2 (50)
      expect(testContributors[0].username).toBe(testUser3.username);
      expect(testContributors[0].total_points).toBe(200);
      expect(testContributors[1].username).toBe(testUser1.username);
      expect(testContributors[1].total_points).toBe(120);
      expect(testContributors[2].username).toBe(testUser2.username);
      expect(testContributors[2].total_points).toBe(50);
    });
  });
});
