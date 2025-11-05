const AddThreadUseCase = require("../../../../Applications/use_case/AddThreadUseCase");
const GetThreadUseCase = require("../../../../Applications/use_case/GetThreadUseCase");
const AddCommentUseCase = require("../../../../Applications/use_case/AddCommentUseCase");
const AddReplyUseCase = require("../../../../Applications/use_case/AddReplyUseCase");
const DeleteCommentUseCase = require("../../../../Applications/use_case/DeleteCommentUseCase");
const DeleteReplyUseCase = require("../../../../Applications/use_case/DeleteReplyUseCase");

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadsHandler = this.postThreadsHandler.bind(this);
    this.postCommentToThreadHandler =
      this.postCommentToThreadHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
    this.getThreadByIdHandler = this.getThreadByIdHandler.bind(this);
    this.postReplyToCommentHandler = this.postReplyToCommentHandler.bind(this);
    this.deleteReplyHandler = this.deleteReplyHandler.bind(this);
  }

  async postThreadsHandler(request, h) {
    const { id: owner } = request.auth.credentials;

    const useCasePayload = {
      ...request.payload,
      owner,
    };

    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    const addedThread = await addThreadUseCase.execute(useCasePayload);

    const response = h.response({
      status: "success",
      data: {
        addedThread,
      },
    });
    response.code(201);

    return response;
  }

  async postCommentToThreadHandler(request, h) {
    const { id: owner } = request.auth.credentials;
    const { threadId } = request.params;

    const useCasePayload = {
      threadId,
      content: request.payload.content,
      owner,
    };

    const addCommentUseCase = this._container.getInstance(
      AddCommentUseCase.name,
    );
    const addedComment = await addCommentUseCase.execute(useCasePayload);

    const response = h.response({
      status: "success",
      data: {
        addedComment,
      },
    });
    response.code(201);

    return response;
  }

  async deleteCommentHandler(request) {
    const { id: owner } = request.auth.credentials;
    const { threadId, commentId } = request.params;

    const useCasePayload = {
      threadId,
      commentId,
      owner,
    };

    const deleteCommentUseCase = this._container.getInstance(
      DeleteCommentUseCase.name,
    );
    await deleteCommentUseCase.execute(useCasePayload);

    return {
      status: "success",
    };
  }

  async getThreadByIdHandler(request) {
    const { threadId } = request.params;

    const getThreadUseCase = this._container.getInstance(GetThreadUseCase.name);

    const thread = await getThreadUseCase.execute(threadId);

    return {
      status: "success",
      data: {
        thread,
      },
    };
  }

  async postReplyToCommentHandler(request, h) {
    const { id: owner } = request.auth.credentials;
    const { threadId, commentId } = request.params;

    const useCasePayload = {
      owner,
      threadId,
      commentId,
      content: request.payload.content,
    };

    const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name);
    const addedReply = await addReplyUseCase.execute(useCasePayload);

    const response = h.response({
      status: "success",
      data: {
        addedReply,
      },
    });
    response.code(201);

    return response;
  }

  async deleteReplyHandler(request) {
    const { id: owner } = request.auth.credentials;
    const { threadId, commentId, replyId } = request.params;

    const useCasePayload = {
      threadId,
      commentId,
      replyId,
      owner,
    };

    const deleteReplyUseCase = this._container.getInstance(
      DeleteReplyUseCase.name,
    );
    await deleteReplyUseCase.execute(useCasePayload);

    return {
      status: "success",
    };
  }
}

module.exports = ThreadsHandler;
