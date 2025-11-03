const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');
const container = require('../../container');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');

describe('/threads endpoint', () => {
  let server;
  let accessToken;
  let userId;

  beforeEach(async () => {
    server = await createServer(container);

    const { accessToken: token, userId: uid } = await ServerTestHelper.getAccessTokenAndUserId({ server });
    accessToken = token;
    userId = uid;
  });

  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should respond 201 and persisted thread', async () => {

      const requestPayload = {
        title: 'Judul Thread Test',
        body: 'Ini adalah body',
      };

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
      expect(responseJson.data.addedThread.title).toEqual(requestPayload.title);
      expect(responseJson.data.addedThread.owner).toEqual(userId);

      const threads = await ThreadsTableTestHelper.findThreadById(responseJson.data.addedThread.id);
      expect(threads).toHaveLength(1);
    });

    it('should respond 400 when request payload not contain needed property', async () => {
      const requestPayload = {
        title: 'Judul Saja',
      };

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });

    it('should respond 401 when request missing authentication', async () => {
      const requestPayload = {
        title: 'Judul Thread',
        body: 'Body thread',
      };

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
    });
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should respond 201 and persisted comment', async () => {
      const threadId = 'thread-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });

      const requestPayload = {
        content: 'Komentar',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      //Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
      expect(responseJson.data.addedComment.content).toEqual(requestPayload.content);
      expect(responseJson.data.addedComment.owner).toEqual(userId);

      const comments = await CommentsTableTestHelper.findCommentById(responseJson.data.addedComment.id);
      expect(comments).toHaveLength(1);
    });

    it('should respond 400 when request payload not contain needed property', async () => {
      // Arrange
      const threadId = 'thread-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      const requestPayload = {}; // Payload kosong

      // 2. Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // 3. Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
    });

    it('should respond 404 when thread is not found', async () => {
      // 1. Arrange
      const invalidThreadId = 'thread-xxxx';
      const requestPayload = {
        content: 'Komentar',
      };

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${invalidThreadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // 3. Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should respond 200 and soft delete the comment', async () => {
      // 1. Arrange
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId });

      // 2. Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // 3. Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');

      // 4. Assert
      const comments = await CommentsTableTestHelper.findCommentById(commentId);
      expect(comments).toHaveLength(1);
      expect(comments[0].is_delete).toEqual(true);
    });

    it('should respond 403 when user is not the owner', async () => {
      // 1. Arrange
      const ownerId = 'user-123';
      const impostorId = 'user-456';
      await UsersTableTestHelper.addUser({ id: ownerId, username: 'owner' });

      const { accessToken: impostorToken } = await ServerTestHelper
        .getAccessTokenAndUserId({ server, username: 'impostor', id: impostorId });

      const threadId = 'thread-123';
      const commentId = 'comment-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: ownerId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: ownerId });

      // 2. Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${impostorToken}`,
        },
      });

      // 3. Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
    });

    it('should respond 404 when comment is not found', async () => {
      // 1. Arrange
      const threadId = 'thread-123';
      const invalidCommentId = 'comment-xxxx';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });

      // 2. Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${invalidCommentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // 3. Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });
  });
});