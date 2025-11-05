class GetThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(threadId) {
    await this._threadRepository.verifyThreadExists(threadId);

    const thread = await this._threadRepository.getThreadById(threadId);
    const rawComments =
      await this._commentRepository.getCommentsByThreadId(threadId);
    const rawReplies =
      await this._replyRepository.getRepliesByThreadId(threadId);

    const comments = rawComments.map((comment) => {
      const replies = rawReplies
        .filter((reply) => reply.comment_id === comment.id)
        .map((reply) => ({
          id: reply.id,
          username: reply.username,
          date: reply.date,
          content: reply.is_delete
            ? "**balasan telah dihapus**"
            : reply.content,
        }));

      return {
        id: comment.id,
        username: comment.username,
        date: comment.date,
        content: comment.is_delete
          ? "**komentar telah dihapus**"
          : comment.content,
        replies,
      };
    });

    return {
      ...thread,
      comments,
    };
  }
}

module.exports = GetThreadUseCase;
