const pool = require("../../database/postgres/pool");

const AuthorizationError = require("../../../Commons/exceptions/AuthorizationError");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");

const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const RepliesTableTestHelper = require("../../../../tests/RepliesTestTableHelper");
const ReplyRepositoryPostgres = require("../ReplyRepositoryPostgres");
const AddReply = require("../../../Domains/replies/entities/AddReply");
const AddedReply = require("../../../Domains/replies/entities/AddedReply");

describe("ReplyRepositoryPostgres integration test", () => {
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("addReply function", () => {
    it("should persist new reply and return added reply correctly", async () => {
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

      const newReply = new AddReply({
        content: "Ini adalah balasan tes",
        commentId: "comment-123",
        owner: "user-123",
      });

      const fakeIdGenerator = () => "123";
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      const addedReply = await replyRepositoryPostgres.addReply(newReply);

      const replies = await RepliesTableTestHelper.findReplyById("reply-123");
      expect(replies).toHaveLength(1);
      expect(replies[0].id).toEqual("reply-123");
      expect(replies[0].content).toEqual("Ini adalah balasan tes");
      expect(replies[0].owner).toEqual("user-123");
      expect(replies[0].comment_id).toEqual("comment-123");

      expect(addedReply).toBeInstanceOf(AddedReply);
      expect(addedReply.id).toEqual("reply-123");
      expect(addedReply.content).toEqual("Ini adalah balasan tes");
      expect(addedReply.owner).toEqual("user-123");
    });
  });

  describe("verifyReplyOwner function", () => {
    it("should throw NotFoundError when reply not found", async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      const invalidReplyId = "reply-xxxx";
      const owner = "user-123";

      await expect(
        replyRepositoryPostgres.verifyReplyOwner(invalidReplyId, owner),
      ).rejects.toThrow(NotFoundError);
    });

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
      await RepliesTableTestHelper.addReply({
        id: "reply-123",
        owner: "user-123",
        commentId: "comment-123",
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      const validReplyId = "reply-123";
      const invalidOwner = "user-456";

      await expect(
        replyRepositoryPostgres.verifyReplyOwner(validReplyId, invalidOwner),
      ).rejects.toThrow(AuthorizationError);
    });

    it("should not throw error when user is the owner", async () => {
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
      await RepliesTableTestHelper.addReply({
        id: "reply-123",
        owner: "user-123",
        commentId: "comment-123",
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      const validReplyId = "reply-123";
      const validOwner = "user-123";

      await expect(
        replyRepositoryPostgres.verifyReplyOwner(validReplyId, validOwner),
      ).resolves.not.toThrow();
    });
  });

  describe("deleteReply function", () => {
    it("should perform soft delete on the reply", async () => {
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
      await RepliesTableTestHelper.addReply({
        id: "reply-123",
        owner: "user-123",
        commentId: "comment-123",
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      const replyId = "reply-123";

      await replyRepositoryPostgres.deleteReply(replyId);

      const replies = await RepliesTableTestHelper.findReplyById(replyId);
      expect(replies).toHaveLength(1);
      expect(replies[0].is_delete).toEqual(true);
    });
  });

  describe("getRepliesByThreadId function", () => {
    it("should return an empty array if thread has no replies", async () => {
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

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      const replies =
        await replyRepositoryPostgres.getRepliesByThreadId("thread-123");

      expect(replies).toBeInstanceOf(Array);
      expect(replies).toHaveLength(0);
    });

    it("should return all replies from a thread with correct details and order", async () => {
      await UsersTableTestHelper.addUser({
        id: "user-123",
        username: "dicoding",
      });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        threadId: "thread-123",
        owner: "user-123",
      });

      const date1 = new Date("2023-10-28T10:10:00Z").toISOString();
      const date2 = new Date("2023-10-28T10:05:00Z").toISOString();

      await RepliesTableTestHelper.addReply({
        id: "reply-123",
        content: "Balasan kedua",
        commentId: "comment-123",
        owner: "user-123",
        date: date1,
      });
      await RepliesTableTestHelper.addReply({
        id: "reply-456",
        content: "Balasan pertama (dihapus)",
        commentId: "comment-123",
        owner: "user-123",
        date: date2,
        isDelete: true,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      const replies =
        await replyRepositoryPostgres.getRepliesByThreadId("thread-123");

      expect(replies).toHaveLength(2);

      expect(replies[0].id).toEqual("reply-456");
      expect(replies[0].username).toEqual("dicoding");
      expect(replies[0].content).toEqual("Balasan pertama (dihapus)");
      expect(replies[0].is_delete).toEqual(true);
      expect(replies[0].comment_id).toEqual("comment-123");
      expect(new Date(replies[0].date).toISOString()).toBeTruthy();

      expect(replies[1].id).toEqual("reply-123");
      expect(replies[1].username).toEqual("dicoding");
      expect(replies[1].content).toEqual("Balasan kedua");
      expect(replies[1].is_delete).toEqual(false);
      expect(replies[1].comment_id).toEqual("comment-123");
      expect(new Date(replies[1].date).toISOString()).toBeTruthy();
    });
  });
});
