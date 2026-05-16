const request = require('supertest');
const knex = require('../src/db/knex');
const app = require('../src/app');

describe('Profile API Endpoints', () => {
  let testUser;
  let testUser2;
  let testSpace;
  let testThread;
  let testComment;
  let authToken;
  let authToken2;

  beforeAll(async () => {
    // Create test users
    testUser = await knex('users').insert({
      username: 'profile_test_user',
      email: 'profile_test_user@example.com',
      password: 'hashed_password',
      exp_points: 150,
      level: 2,
      bio: 'Test user bio'
    }).returning('*');

    testUser2 = await knex('users').insert({
      username: 'profile_test_user2',
      email: 'profile_test_user2@example.com',
      password: 'hashed_password',
      exp_points: 75,
      level: 1
    }).returning('*');

    // Create a test space
    testSpace = await knex('spaces').insert({
      name: 'Test Space for Profile',
      description: 'Test space description',
      space_avatar_url: null,
      created_by: testUser[0].id
    }).returning('*');

    // Add users as members of the space
    await knex('space_members').insert({
      space_id: testSpace[0].id,
      user_id: testUser[0].id,
      role: 'owner'
    });

    await knex('space_members').insert({
      space_id: testSpace[0].id,
      user_id: testUser2[0].id,
      role: 'member'
    });

    // Create a test thread
    testThread = await knex('threads').insert({
      title: 'Test Thread for Profile',
      content: 'Test thread content',
      space_id: testSpace[0].id,
      created_by: testUser[0].id,
      net_score: 5,
      comments_count: 1
    }).returning('*');

    // Create a test comment
    testComment = await knex('comments').insert({
      content: 'Test comment content',
      thread_id: testThread[0].id,
      created_by: testUser[0].id,
      net_score: 3
    }).returning('*');

    // Get auth tokens (this would normally come from your auth system)
    authToken = 'test_token_1';
    authToken2 = 'test_token_2';
  });

  afterAll(async () => {
    // Clean up test data
    await knex('comments').where('id', testComment[0].id).del();
    await knex('threads').where('id', testThread[0].id).del();
    await knex('space_members').where('space_id', testSpace[0].id).del();
    await knex('spaces').where('id', testSpace[0].id).del();
    await knex('user_follows').del();
    await knex('users').where('id', testUser[0].id).del();
    await knex('users').where('id', testUser2[0].id).del();
  });

  describe('GET /api/users/:username', () => {
    it('should return user profile data successfully', async () => {
      const response = await request(app)
        .get(`/api/users/${testUser[0].username}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.profile).toBeDefined();
      expect(response.body.profile.username).toBe(testUser[0].username);
      expect(response.body.profile.bio).toBe(testUser[0].bio);
      expect(response.body.profile.expPoints).toBe(testUser[0].exp_points);
      expect(response.body.profile.level).toBe(testUser[0].level);
      expect(response.body.profile.stats.threadsCount).toBe(1);
      expect(response.body.profile.stats.commentsCount).toBe(1);
      expect(response.body.profile.stats.followersCount).toBe(0);
      expect(response.body.profile.stats.followingCount).toBe(0);
      expect(response.body.profile.spaces).toHaveLength(1);
      expect(response.body.profile.spaces[0].name).toBe(testSpace[0].name);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/users/nonexistent_user')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error_message).toBe('User not found');
    });

    it('should work without authentication', async () => {
      const response = await request(app)
        .get(`/api/users/${testUser[0].username}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.profile.isFollowing).toBe(false);
    });
  });

  describe('GET /api/users/:username/comments', () => {
    it('should return user comments with pagination', async () => {
      const response = await request(app)
        .get(`/api/users/${testUser[0].username}/comments`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.comments).toBeDefined();
      expect(response.body.comments).toHaveLength(1);
      expect(response.body.comments[0].content).toBe(testComment[0].content);
      expect(response.body.comments[0].thread.title).toBe(testThread[0].title);
      expect(response.body.comments[0].thread.spaceName).toBe(testSpace[0].name);
      expect(response.body.hasMore).toBe(false);
      expect(response.body.currentPage).toBe(1);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/users/nonexistent_user/comments')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error_message).toBe('User not found');
    });

    it('should respect pagination parameters', async () => {
      const response = await request(app)
        .get(`/api/users/${testUser[0].username}/comments?page=1&limit=10`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.currentPage).toBe(1);
    });
  });

  describe('GET /api/users/:username/threads', () => {
    it('should return user threads with pagination', async () => {
      const response = await request(app)
        .get(`/api/users/${testUser[0].username}/threads`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.threads).toBeDefined();
      expect(response.body.threads).toHaveLength(1);
      expect(response.body.threads[0].title).toBe(testThread[0].title);
      expect(response.body.threads[0].space.name).toBe(testSpace[0].name);
      expect(response.body.hasMore).toBe(false);
      expect(response.body.currentPage).toBe(1);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/users/nonexistent_user/threads')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error_message).toBe('User not found');
    });
  });

  describe('Follow System Tests', () => {
    describe('POST /api/follow/:userId', () => {
      it('should follow a user successfully', async () => {
        const response = await request(app)
          .post(`/api/follow/${testUser[0].id}`)
          .set('Authorization', `Bearer ${authToken2}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.result.isFollowing).toBe(true);
        expect(response.body.result.followersCount).toBe(1);
      });

      it('should prevent self-follow', async () => {
        const response = await request(app)
          .post(`/api/follow/${testUser[0].id}`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.error_message).toBe('Cannot follow yourself');
      });

      it('should prevent duplicate follows', async () => {
        // First follow (already done above)
        const response = await request(app)
          .post(`/api/follow/${testUser[0].id}`)
          .set('Authorization', `Bearer ${authToken2}`);

        expect(response.status).toBe(409);
        expect(response.body.success).toBe(false);
        expect(response.body.error_message).toBe('Already following this user');
      });

      it('should return 404 for non-existent user', async () => {
        const response = await request(app)
          .post('/api/follow/999999')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
        expect(response.body.error_message).toBe('User not found');
      });
    });

    describe('DELETE /api/follow/:userId', () => {
      it('should unfollow a user successfully', async () => {
        const response = await request(app)
          .delete(`/api/follow/${testUser[0].id}`)
          .set('Authorization', `Bearer ${authToken2}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.result.isFollowing).toBe(false);
        expect(response.body.result.followersCount).toBe(0);
      });

      it('should return 404 when trying to unfollow someone not followed', async () => {
        const response = await request(app)
          .delete(`/api/follow/${testUser[0].id}`)
          .set('Authorization', `Bearer ${authToken2}`);

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
        expect(response.body.error_message).toBe('Not following this user');
      });
    });

    describe('GET /api/follow/:userId/status', () => {
      it('should return follow status', async () => {
        // First follow
        await request(app)
          .post(`/api/follow/${testUser[0].id}`)
          .set('Authorization', `Bearer ${authToken2}`);

        const response = await request(app)
          .get(`/api/follow/${testUser[0].id}/status`)
          .set('Authorization', `Bearer ${authToken2}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.result.isFollowing).toBe(true);
        expect(response.body.result.followersCount).toBe(1);
      });

      it('should return false for not following', async () => {
        // Unfollow first
        await request(app)
          .delete(`/api/follow/${testUser[0].id}`)
          .set('Authorization', `Bearer ${authToken2}`);

        const response = await request(app)
          .get(`/api/follow/${testUser[0].id}/status`)
          .set('Authorization', `Bearer ${authToken2}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.result.isFollowing).toBe(false);
        expect(response.body.result.followersCount).toBe(0);
      });
    });

    describe('GET /api/follow/:userId/followers', () => {
      it('should return user followers', async () => {
        // Follow first
        await request(app)
          .post(`/api/follow/${testUser[0].id}`)
          .set('Authorization', `Bearer ${authToken2}`);

        const response = await request(app)
          .get(`/api/follow/${testUser[0].id}/followers`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.followers).toHaveLength(1);
        expect(response.body.followers[0].username).toBe(testUser2[0].username);
        expect(response.body.hasMore).toBe(false);
      });
    });

    describe('GET /api/follow/:userId/following', () => {
      it('should return user following', async () => {
        const response = await request(app)
          .get(`/api/follow/${testUser2[0].id}/following`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.following).toHaveLength(1);
        expect(response.body.following[0].username).toBe(testUser[0].username);
        expect(response.body.hasMore).toBe(false);
      });
    });
  });
});
