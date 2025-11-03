// Impor Helpers
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

// Impor Infrastruktur
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

// Impor Entities
const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');

describe('CommentRepositoryPostgres integration test', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist new comment and return added comment correctly', async () => {
      // 1. Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });

      const newComment = new AddComment({
        content: 'Ini adalah komentar tes',
        threadId: 'thread-123',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // 2. Action
      const addedComment = await commentRepositoryPostgres.addComment(newComment);

      // 3. Assert
      const comments = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comments).toHaveLength(1);
      expect(comments[0].id).toEqual('comment-123');
      expect(comments[0].content).toEqual('Ini adalah komentar tes');
      expect(comments[0].owner).toEqual('user-123');
      expect(comments[0].thread_id).toEqual('thread-123'); // Sesuaikan nama kolom jika berbeda

      //    (B. Cek nilai yang dikembalikan oleh fungsi)
      expect(addedComment).toBeInstanceOf(AddedComment);
      expect(addedComment.id).toEqual('comment-123');
      expect(addedComment.content).toEqual('Ini adalah komentar tes');
      expect(addedComment.owner).toEqual('user-123');
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should throw NotFoundError when comment not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const invalidCommentId = 'comment-xxxx';
      const owner = 'user-123';

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner(invalidCommentId, owner))
        .rejects.toThrow(NotFoundError);
    });

    it('should throw AuthorizationError when user is not the owner', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'owner' });
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'impostor' });
      // 2. Buat thread
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123', threadId: 'thread-123' });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const validCommentId = 'comment-123';
      const invalidOwner = 'user-456';

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner(validCommentId, invalidOwner))
        .rejects.toThrow(AuthorizationError);
    });

    it('should not throw error when user is the owner', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123', threadId: 'thread-123' });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const validCommentId = 'comment-123';
      const validOwner = 'user-123';

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner(validCommentId, validOwner))
        .resolves.not.toThrow();
    });
  });

  describe('deleteComment function', () => {
    it('should perform soft delete on the comment', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123', threadId: 'thread-123' });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const commentId = 'comment-123';

      // 2. Action
      await commentRepositoryPostgres.deleteComment(commentId);

      // 3. Assert (Cek ke database)
      const comments = await CommentsTableTestHelper.findCommentById(commentId);
      expect(comments).toHaveLength(1);
      expect(comments[0].is_delete).toEqual(true);
    });
  });
});