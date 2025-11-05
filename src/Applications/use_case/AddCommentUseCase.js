const AddComment = require("../../Domains/comments/entities/AddComment");

class AddCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this.threadRepository = threadRepository;
    this.commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const { threadId } = useCasePayload;

    await this.threadRepository.verifyThreadExists(threadId);
    const addComment = new AddComment(useCasePayload);

    return this.commentRepository.addComment(addComment);
  }
}

module.exports = AddCommentUseCase;
