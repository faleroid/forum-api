/* eslint-disable no-unused-vars */

class CommentRepository {
  async addComment(addComment) {
    throw new Error("COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }

  async verifyCommentOwner(commentId, owner) {
    throw new Error("COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }

  async getCommentsByThreadId(threadId) {
    throw new Error("COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }

  async verifyCommentExists(commentId) {
    throw new Error("COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }
}

module.exports = CommentRepository;
