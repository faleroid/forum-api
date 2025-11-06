const GetThreadUseCase = require("../GetThreadUseCase");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ReplyRepository = require("../../../Domains/replies/ReplyRepository");

describe("GetThreadUseCase", () => {
  it("should orchestrating the get thread details action correctly (with replies)", async () => {
    const threadId = "thread-123";

    const dbThread = {
      id: "thread-123",
      title: "Judul Thread",
      body: "Body Thread",
      date: new Date("2023-10-28T07:00:00Z"),
      username: "dicoding",
    };

    const dbComments = [
      {
        id: "comment-123",
        username: "johndoe",
        date: new Date("2023-10-28T07:10:00Z"),
        content: "Komentar pertama",
        is_delete: false,
      },
      {
        id: "comment-456",
        username: "dicoding",
        date: new Date("2023-10-28T07:15:00Z"),
        content: "Komentar yang dihapus",
        is_delete: true,
      },
    ];

    const dbReplies = [
      {
        id: "reply-123",
        comment_id: "comment-123",
        username: "dicoding",
        date: new Date("2023-10-28T07:11:00Z"),
        content: "Balasan pertama",
        is_delete: false,
      },
      {
        id: "reply-456",
        comment_id: "comment-123",
        username: "johndoe",
        date: new Date("2023-10-28T07:12:00Z"),
        content: "Balasan yang dihapus",
        is_delete: true,
      },
    ];

    const expectedThreadDetail = {
      id: "thread-123",
      title: "Judul Thread",
      body: "Body Thread",
      date: dbThread.date.toISOString(),
      username: "dicoding",
      comments: [
        {
          id: "comment-123",
          username: "johndoe",
          date: dbComments[0].date.toISOString(),
          content: "Komentar pertama",
          replies: [
            {
              id: "reply-123",
              username: "dicoding",
              date: dbReplies[0].date.toISOString(),
              content: "Balasan pertama",
            },
            {
              id: "reply-456",
              username: "johndoe",
              date: dbReplies[1].date.toISOString(),
              content: "**balasan telah dihapus**",
            },
          ],
        },
        {
          id: "comment-456",
          username: "dicoding",
          date: dbComments[1].date.toISOString(),
          content: "**komentar telah dihapus**",
          replies: [],
        },
      ],
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.verifyThreadExists = jest.fn(() => Promise.resolve());
    mockThreadRepository.getThreadById = jest.fn(() =>
      Promise.resolve(dbThread),
    );
    mockCommentRepository.getCommentsByThreadId = jest.fn(() =>
      Promise.resolve(dbComments),
    );
    mockReplyRepository.getRepliesByThreadId = jest.fn(() =>
      Promise.resolve(dbReplies),
    );

    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    const threadDetail = await getThreadUseCase.execute(threadId);

    expect(threadDetail).toStrictEqual(expectedThreadDetail);
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(threadId);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(
      threadId,
    );
    expect(mockReplyRepository.getRepliesByThreadId).toBeCalledWith(threadId);
  });
});
