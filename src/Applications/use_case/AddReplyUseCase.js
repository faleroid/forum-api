const AddReply = require("../../Domains/replies/entities/AddReply");

class AddReplyUseCase{
    constructor({ threadRepository, commentRepository, replyRepository }){
        this.threadRepository = threadRepository;
        this.commentRepository = commentRepository;
        this.replyRepository = replyRepository;
    }

    async execute(useCasePayload){
        const { threadId, commentId } = useCasePayload;

        await this.threadRepository.verifyThreadExists(threadId);
        await this.commentRepository.verifyCommentExists(commentId);

        const addReply = new AddReply(useCasePayload);

        return this.replyRepository.addReply(addReply);
    }
}

module.exports = AddReplyUseCase;