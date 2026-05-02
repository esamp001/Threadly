/**
 * Reply Upvote EXP Tests
 * Tests the EXP awarding functionality for comment upvotes
 */
const request = require('supertest');
const app = require('../src/app');
const db = require('../src/db/knex');
const { calculateLevel, getExpForAction } = require('../src/utils/rankingHelpers');

describe('Reply Upvote EXP System', () => {
  let testUser, testCommentAuthor, testThread, testComment;

  beforeAll(async () => {
    // Create test users
    [testUser] = await db('users').insert({
      email: 'testvoter@example.com',
      username: 'TestVoter',
      exp_points: 0,
      level: 1
    }).returning('*');

    [testCommentAuthor] = await db('users').insert({
      email: 'author@example.com',
      username: 'CommentAuthor',
      exp_points: 50,
      level: 2
    }).returning('*');

    // Create test thread
    [testThread] = await db('threads').insert({
      title: 'Test Thread',
      content: 'Test content',
      space_id: 1,
      created_by: testCommentAuthor.id
    }).returning('*');

    // Create test comment
    [testComment] = await db('comments').insert({
      content: 'Test comment',
      thread_id: testThread.id,
      created_by: testCommentAuthor.id
    }).returning('*');
  });

  afterAll(async () => {
    // Clean up test data
    await db('comment_votes').where({ user_id: testUser.id }).del();
    await db('user_exp_history').where({ user_id: testCommentAuthor.id }).del();
    await db('comments').where('id', testComment.id).del();
    await db('threads').where('id', testThread.id).del();
    await db('users').where('id', testUser.id).del();
    await db('users').where('id', testCommentAuthor.id).del();
  });

  describe('New Upvote EXP Awarding', () => {
    test('should award 1 EXP to comment author for new upvote', async () => {
      const initialExp = testCommentAuthor.exp_points;
      const expectedExp = initialExp + getExpForAction('reply_upvote');

      const response = await request(app)
        .post('/api/comments/vote')
        .set('Authorization', `Bearer mock-token-${testUser.id}`)
        .send({
          commentId: testComment.id,
          voteType: 'upvote'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Check EXP was awarded
      const updatedAuthor = await db('users').where('id', testCommentAuthor.id).first();
      expect(updatedAuthor.exp_points).toBe(expectedExp);

      // Check EXP history was created
      const expHistory = await db('user_exp_history')
        .where({ user_id: testCommentAuthor.id })
        .where('action_type', 'reply_upvote')
        .first();
      expect(expHistory).toBeTruthy();
      expect(expHistory.reference_id).toBe(testComment.id);
      expect(expHistory.exp_amount).toBe(1);
    });

    test('should not award EXP for self-upvote', async () => {
      const initialExp = testCommentAuthor.exp_points;

      const response = await request(app)
        .post('/api/comments/vote')
        .set('Authorization', `Bearer mock-token-${testCommentAuthor.id}`)
        .send({
          commentId: testComment.id,
          voteType: 'upvote'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // EXP should not be awarded for self-upvote
      const updatedAuthor = await db('users').where('id', testCommentAuthor.id).first();
      expect(updatedAuthor.exp_points).toBe(initialExp);
    });
  });

  describe('Vote Switching EXP Awarding', () => {
    beforeEach(async () => {
      // Start with a downvote
      await db('comment_votes').insert({
        user_id: testUser.id,
        comment_id: testComment.id,
        vote_type: -1
      });
    });

    afterEach(async () => {
      // Clean up votes
      await db('comment_votes').where({ user_id: testUser.id }).del();
    });

    test('should award EXP when switching from downvote to upvote', async () => {
      const initialExp = testCommentAuthor.exp_points;
      const expectedExp = initialExp + getExpForAction('reply_upvote');

      const response = await request(app)
        .post('/api/comments/vote')
        .set('Authorization', `Bearer mock-token-${testUser.id}`)
        .send({
          commentId: testComment.id,
          voteType: 'upvote'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Check EXP was awarded
      const updatedAuthor = await db('users').where('id', testCommentAuthor.id).first();
      expect(updatedAuthor.exp_points).toBe(expectedExp);
    });

    test('should not award EXP when switching from upvote to downvote', async () => {
      // First upvote
      await db('comment_votes').where({ user_id: testUser.id }).update({ vote_type: 1 });
      const initialExp = testCommentAuthor.exp_points;

      const response = await request(app)
        .post('/api/comments/vote')
        .set('Authorization', `Bearer mock-token-${testUser.id}`)
        .send({
          commentId: testComment.id,
          voteType: 'downvote'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // EXP should not be awarded for switching to downvote
      const updatedAuthor = await db('users').where('id', testCommentAuthor.id).first();
      expect(updatedAuthor.exp_points).toBe(initialExp);
    });
  });

  describe('EXP Cap and Limits', () => {
    test('should respect daily EXP cap', async () => {
      // Fill up daily EXP cap for comment author
      const dailyCap = 150;
      await db('user_exp_history').insert({
        user_id: testCommentAuthor.id,
        exp_amount: dailyCap,
        action_type: 'thread_created',
        created_at: new Date()
      });

      const initialExp = testCommentAuthor.exp_points;

      const response = await request(app)
        .post('/api/comments/vote')
        .set('Authorization', `Bearer mock-token-${testUser.id}`)
        .send({
          commentId: testComment.id,
          voteType: 'upvote'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // EXP should not be awarded due to daily cap
      const updatedAuthor = await db('users').where('id', testCommentAuthor.id).first();
      expect(updatedAuthor.exp_points).toBe(initialExp);
    });
  });
});

module.exports = {
  testUser,
  testCommentAuthor,
  testThread,
  testComment
};
