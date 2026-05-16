const request = require('supertest');
const knex = require('../src/db/knex');
const app = require('../src/app');

describe('Comment Edit/Delete API', () => {
  let testUser;
  let testSpace;
  let testThread;
  let testComment;
  let testSpaceMember;
  let authToken;

  beforeAll(async () => {
    // Create a test user
    testUser = await knex('users').insert({
      username: 'test_comment_user',
      email: 'test_comment_user@example.com',
      password: 'hashed_password'
    }).returning('*');

    // Create a test space
    testSpace = await knex('spaces').insert({
      name: 'Test Space for Comments',
      description: 'Test space description',
      space_avatar_url: null,
      created_by: testUser[0].id
    }).returning('*');

    // Add user as owner of the space
    testSpaceMember = await knex('space_members').insert({
      space_id: testSpace[0].id,
      user_id: testUser[0].id,
      role: 'owner'
    }).returning('*');

    // Create a test thread
    testThread = await knex('threads').insert({
      title: 'Test Thread for Comments',
      content: 'Test thread content',
      space_id: testSpace[0].id,
      created_by: testUser[0].id
    }).returning('*');

    // Create a test comment
    testComment = await knex('comments').insert({
      content: 'Test comment content',
      thread_id: testThread[0].id,
      created_by: testUser[0].id
    }).returning('*');

    // Get auth token (this would normally come from your auth system)
    authToken = 'test_token'; // Replace with actual token generation
  });

  afterAll(async () => {
    // Clean up test data
    await knex('comments').where('id', testComment[0].id).del();
    await knex('threads').where('id', testThread[0].id).del();
    await knex('space_members').where('id', testSpaceMember[0].id).del();
    await knex('spaces').where('id', testSpace[0].id).del();
    await knex('users').where('id', testUser[0].id).del();
  });

  describe('PUT /api/comments/:id - Edit Comment', () => {
    it('should edit a comment successfully when user is author within time limit', async () => {
      const response = await request(app)
        .put(`/api/comments/${testComment[0].id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: 'Updated comment content' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.comment.content).toBe('Updated comment content');
    });

    it('should fail to edit comment when content is empty', async () => {
      const response = await request(app)
        .put(`/api/comments/${testComment[0].id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: '' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error_message).toBe('Content is required');
    });

    it('should fail to edit comment when user is not author', async () => {
      // Create another user
      const otherUser = await knex('users').insert({
        username: 'other_test_user',
        email: 'other_test_user@example.com',
        password: 'hashed_password'
      }).returning('*');

      const otherToken = 'other_test_token'; // Replace with actual token

      const response = await request(app)
        .put(`/api/comments/${testComment[0].id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ content: 'Updated by other user' });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);

      // Clean up
      await knex('users').where('id', otherUser[0].id).del();
    });

    it('should fail to edit comment when time limit is exceeded', async () => {
      // Create an old comment (older than 5 minutes)
      const oldComment = await knex('comments').insert({
        content: 'Old comment',
        thread_id: testThread[0].id,
        created_by: testUser[0].id,
        created_at: knex.raw("NOW() - INTERVAL '10 minutes'")
      }).returning('*');

      const response = await request(app)
        .put(`/api/comments/${oldComment[0].id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: 'Trying to edit old comment' });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error_message).toContain('Edit time limit exceeded');

      // Clean up
      await knex('comments').where('id', oldComment[0].id).del();
    });
  });

  describe('DELETE /api/comments/:id - Soft Delete Comment', () => {
    let commentToDelete;

    beforeEach(async () => {
      // Create a fresh comment for each test
      commentToDelete = await knex('comments').insert({
        content: 'Comment to delete',
        thread_id: testThread[0].id,
        created_by: testUser[0].id
      }).returning('*');
    });

    afterEach(async () => {
      // Clean up
      if (commentToDelete) {
        await knex('comments').where('id', commentToDelete[0].id).del();
      }
    });

    it('should soft delete a comment successfully when user is author', async () => {
      const response = await request(app)
        .delete(`/api/comments/${commentToDelete[0].id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify soft delete in database
      const deletedComment = await knex('comments')
        .where('id', commentToDelete[0].id)
        .first();

      expect(deletedComment.is_active).toBe(false);
      expect(deletedComment.deleted_at).not.toBeNull();
      expect(deletedComment.deleted_by).toBe(testUser[0].id);
    });

    it('should soft delete a comment successfully when user is space moderator', async () => {
      // Create another user as moderator
      const moderatorUser = await knex('users').insert({
        username: 'moderator_user',
        email: 'moderator_user@example.com',
        password: 'hashed_password'
      }).returning('*');

      await knex('space_members').insert({
        space_id: testSpace[0].id,
        user_id: moderatorUser[0].id,
        role: 'moderator'
      });

      const moderatorToken = 'moderator_token'; // Replace with actual token

      const response = await request(app)
        .delete(`/api/comments/${commentToDelete[0].id}`)
        .set('Authorization', `Bearer ${moderatorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Clean up
      await knex('space_members')
        .where({ user_id: moderatorUser[0].id, space_id: testSpace[0].id })
        .del();
      await knex('users').where('id', moderatorUser[0].id).del();
    });

    it('should soft delete a comment successfully when user is space owner', async () => {
      // Test user is already owner, so this should work
      const response = await request(app)
        .delete(`/api/comments/${commentToDelete[0].id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should fail to delete comment when user is not author or moderator', async () => {
      // Create a regular member
      const regularUser = await knex('users').insert({
        username: 'regular_user',
        email: 'regular_user@example.com',
        password: 'hashed_password'
      }).returning('*');

      await knex('space_members').insert({
        space_id: testSpace[0].id,
        user_id: regularUser[0].id,
        role: 'member'
      });

      const regularToken = 'regular_token'; // Replace with actual token

      const response = await request(app)
        .delete(`/api/comments/${commentToDelete[0].id}`)
        .set('Authorization', `Bearer ${regularToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error_message).toBe('Not authorized to delete this comment');

      // Clean up
      await knex('space_members')
        .where({ user_id: regularUser[0].id, space_id: testSpace[0].id })
        .del();
      await knex('users').where('id', regularUser[0].id).del();
    });

    it('should fail to delete non-existent comment', async () => {
      const response = await request(app)
        .delete('/api/comments/999999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error_message).toBe('Comment not found');
    });
  });

  describe('GET /api/comments - Fetch Comments with Deletion Status', () => {
    it('should return comments with deletion status', async () => {
      // Create a deleted comment
      const deletedComment = await knex('comments').insert({
        content: 'This will be deleted',
        thread_id: testThread[0].id,
        created_by: testUser[0].id,
        is_active: false,
        deleted_at: knex.fn.now(),
        deleted_by: testUser[0].id
      }).returning('*');

      const response = await request(app)
        .get(`/api/comments?thread_id=${testThread[0].id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Find the deleted comment in the response
      const comment = response.body.comments.find(c => c.id === deletedComment[0].id);
      expect(comment).toBeDefined();
      expect(comment.is_active).toBe(false);
      expect(comment.deleted_at).not.toBeNull();

      // Clean up
      await knex('comments').where('id', deletedComment[0].id).del();
    });

    it('should display "This comment is deleted by user" for soft-deleted comments', async () => {
      const deletedComment = await knex('comments').insert({
        content: 'Original content',
        thread_id: testThread[0].id,
        created_by: testUser[0].id,
        is_active: false,
        deleted_at: knex.fn.now(),
        deleted_by: testUser[0].id
      }).returning('*');

      const response = await request(app)
        .get(`/api/comments?thread_id=${testThread[0].id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);

      const comment = response.body.comments.find(c => c.id === deletedComment[0].id);
      expect(comment.content).toBe('This comment is deleted by user');

      // Clean up
      await knex('comments').where('id', deletedComment[0].id).del();
    });
  });
});
