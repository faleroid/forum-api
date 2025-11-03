class DeleteCommentUseCase{
    constructor({ threadRepository, commentRepository }){
        this.threadRepository = threadRepository;
        this.commentRepository = commentRepository;
    }

    async execute(useCasePayload){
        const { threadId, commentId, owner } = useCasePayload;

        await this.threadRepository.verifyThreadExists(threadId);
        await this.commentRepository.verifyCommentOwner(commentId, owner);

        return this.commentRepository.deleteComment(commentId);
    }
}

module.exports = DeleteCommentUseCase;