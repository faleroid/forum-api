const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const AuthorizationError = require("../../../Commons/exceptions/AuthorizationError");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");

const pool = require("../../database/postgres/pool");
const CommentRepositoryPostgres = require("../CommentRepositoryPostgres");

const AddComment = require("../../../Domains/comments/entities/AddComment");
const AddedComment = require("../../../Domains/comments/entities/AddedComment");

describe("CommentRepositoryPostgres integration test", () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("addComment function", () => {
    it("should persist new comment and return added comment correctly", async () => {
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });

      const newComment = new AddComment({
        content: "Ini adalah komentar tes",
        threadId: "thread-123",
        owner: "user-123",
      });

      const fakeIdGenerator = () => "123";
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      const addedComment =
        await commentRepositoryPostgres.addComment(newComment);

      const comments =
        await CommentsTableTestHelper.findCommentById("comment-123");

      expect(comments).toHaveLength(1);
      expect(comments[0].id).toEqual("comment-123");
      expect(comments[0].content).toEqual("Ini adalah komentar tes");
      expect(comments[0].owner).toEqual("user-123");
      expect(comments[0].thread_id).toEqual("thread-123");
      expect(addedComment).toBeInstanceOf(AddedComment);
      expect(addedComment.id).toEqual("comment-123");
      expect(addedComment.content).toEqual("Ini adalah komentar tes");
      expect(addedComment.owner).toEqual("user-123");
    });
  });

  describe("verifyCommentOwner function", () => {
    it("should throw AuthorizationError when user is not the owner", async () => {
      await UsersTableTestHelper.addUser({ id: "user-123", username: "owner" });
      await UsersTableTestHelper.addUser({
        id: "user-456",
        username: "impostor",
      });

      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });

      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        owner: "user-123",
        threadId: "thread-123",
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const validCommentId = "comment-123";
      const invalidOwner = "user-456";

      await expect(
        commentRepositoryPostgres.verifyCommentOwner(
          validCommentId,
          invalidOwner,
        ),
      ).rejects.toThrow(AuthorizationError);
    });

    it("should not throw Authorization error when user is the owner", async () => {
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        owner: "user-123",
        threadId: "thread-123",
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const validCommentId = "comment-123";
      const validOwner = "user-123";

      await expect(
        commentRepositoryPostgres.verifyCommentOwner(
          validCommentId,
          validOwner,
        ),
      ).resolves.not.toThrow(AuthorizationError);
    });
  });

  describe("deleteComment function", () => {
    it("should perform soft delete on the comment", async () => {
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        owner: "user-123",
        threadId: "thread-123",
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const commentId = "comment-123";

      await commentRepositoryPostgres.deleteComment(commentId);

      const comments = await CommentsTableTestHelper.findCommentById(commentId);
      expect(comments).toHaveLength(1);
      expect(comments[0].is_delete).toEqual(true);
    });
  });

  describe("getCommentsByThreadId function", () => {
    it("should return an empty array if thread has no comments", async () => {
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      const comments =
        await commentRepositoryPostgres.getCommentsByThreadId("thread-123");

      expect(comments).toBeInstanceOf(Array);
      expect(comments).toHaveLength(0);
    });

    it("should return all comments from a thread with correct details and order", async () => {
      await UsersTableTestHelper.addUser({
        id: "user-123",
        username: "dicoding",
      });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });

      const date1 = new Date().toISOString();
      const date2 = new Date().toISOString();

      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        content: "Komentar kedua",
        threadId: "thread-123",
        owner: "user-123",
        date: date1,
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-456",
        content: "Komentar pertama",
        threadId: "thread-123",
        owner: "user-123",
        date: date2,
        isDelete: true,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      const comments =
        await commentRepositoryPostgres.getCommentsByThreadId("thread-123");

      expect(comments).toHaveLength(2);
      
      expect(comments[0].id).toEqual("comment-456");
      expect(comments[0].username).toEqual("dicoding");
      expect(comments[0].content).toEqual("Komentar pertama");
      expect(comments[0].is_delete).toEqual(true);
      expect(new Date(comments[0].date).toISOString()).toStrictEqual(date2);

      expect(comments[1].id).toEqual("comment-123");
      expect(comments[1].username).toEqual("dicoding");
      expect(comments[1].content).toEqual("Komentar kedua");
      expect(comments[1].is_delete).toEqual(false);
      expect(new Date(comments[1].date).toISOString()).toStrictEqual(date1);
    });
  });

  describe("verifyCommentExists function", () => {
    it("should throw NotFoundError when comment not found", async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const invalidCommentId = "comment-xxxx";

      await expect(
        commentRepositoryPostgres.verifyCommentExists(invalidCommentId),
      ).rejects.toThrow(NotFoundError);
    });

    it("should not throw NotFoundError when comment exists", async () => {
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        threadId: "thread-123",
        owner: "user-123",
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(
        commentRepositoryPostgres.verifyCommentExists("comment-123"),
      ).resolves.not.toThrow(NotFoundError);
    });
  });
});
