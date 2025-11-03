const GetThreadUseCase = require('../GetThreadUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadDetail = require('../../../Domains/threads/entities/ThreadDetail');
const CommentDetail = require('../../../Domains/comments/entities/CommentDetail');

describe('GetThreadUseCase', () => {
  it('should orchestrating the get thread details action correctly', async () => {
    const threadId = 'thread-123';

    const dbThread = {
      id: 'thread-123',
      title: 'Judul Thread',
      body: 'Body Thread',
      date: new Date('2023-10-28T07:00:00Z'),
      username: 'dicoding',
    };

    const dbComments = [
      {
        id: 'comment-123',
        username: 'johndoe',
        date: new Date('2023-10-28T07:10:00Z'),
        content: 'Komentar pertama',
        is_delete: false,
      },
      {
        id: 'comment-456',
        username: 'dicoding',
        date: new Date('2023-10-28T07:15:00Z'),
        content: 'Komentar yang dihapus',
        is_delete: true,
      },
    ];

    const expectedThreadDetail = {
      id: 'thread-123',
      title: 'Judul Thread',
      body: 'Body Thread',
      date: new Date('2023-10-28T07:00:00Z'),
      username: 'dicoding',
      comments: [
        {
          id: 'comment-123',
          username: 'johndoe',
          date: new Date('2023-10-28T07:10:00Z'),
          content: 'Komentar pertama',
        },
        {
          id: 'comment-456',
          username: 'dicoding',
          date: new Date('2023-10-28T07:15:00Z'),
          content: '**komentar telah dihapus**',
        },
      ],
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(dbThread));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(dbComments));

    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    const threadDetail = await getThreadUseCase.execute(threadId);

    expect(threadDetail).toStrictEqual(expectedThreadDetail);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(threadId);
  });
});