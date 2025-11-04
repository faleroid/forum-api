const pool = require('../../database/postgres/pool');

const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTestTableHelper');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');

describe('ReplyRepositoryPostgres integration test', () => {
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply function', () => {
    it('should persist new reply and return added reply correctly', async () => {
        await UsersTableTestHelper.addUser({ id: 'user-123' });
        await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
        await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });

        const newReply = new AddReply({
            content: 'Ini adalah balasan tes',
            commentId: 'comment-123',
            owner: 'user-123',
        });

        const fakeIdGenerator = () => '123';
        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

        const addedReply = await replyRepositoryPostgres.addReply(newReply);

        const replies = await RepliesTableTestHelper.findReplyById('reply-123');
        expect(replies).toHaveLength(1);
        expect(replies[0].id).toEqual('reply-123');
        expect(replies[0].content).toEqual('Ini adalah balasan tes');
        expect(replies[0].owner).toEqual('user-123');
        expect(replies[0].comment_id).toEqual('comment-123');

        expect(addedReply).toBeInstanceOf(AddedReply);
        expect(addedReply.id).toEqual('reply-123');
        expect(addedReply.content).toEqual('Ini adalah balasan tes');
        expect(addedReply.owner).toEqual('user-123');
    });
  });
});