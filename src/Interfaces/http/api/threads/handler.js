const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const GetThreadUseCase = require('../../../../Applications/use_case/GetThreadUseCase');
const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');

class ThreadsHandler{
	constructor(container){
		this._container = container;

		this.postThreadsHandler = this.postThreadsHandler.bind(this);
		this.postCommentToThreadHandler = this.postCommentToThreadHandler.bind(this);
		this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
		this.getThreadByIdHandler = this.getThreadByIdHandler.bind(this);
	}

	async postThreadsHandler(request, h){

		const { id: owner } = request.auth.credentials;

		const useCasePayload = {
			...request.payload,
			owner,
		};

		const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
		const addedThread = await addThreadUseCase.execute(useCasePayload);

		const response = h.response({
			status: 'success',
			data: {
				addedThread,
			},
		});
		response.code(201);

		return response;
	}

	async postCommentToThreadHandler(request, h){
		const { id: owner } = request.auth.credentials;
		const { threadId } = request.params;

		const useCasePayload = {
			threadId,
			content: request.payload.content,
			owner,
		}

		const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);
		const addedComment = await addCommentUseCase.execute(useCasePayload)

		const response = h.response({
			status: 'success',
			data: {
				addedComment,
			},
		});
		response.code(201);

		return response;
	}

	async deleteCommentHandler(request){
		const { id: owner } = request.auth.credentials;
		const { threadId, commentId } = request.params;

		const useCasePayload = {
			threadId,
			commentId,
			owner
		}

		const deleteCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name);
		await deleteCommentUseCase.execute(useCasePayload)

		return {
			status: 'success',
		};
	}

	async getThreadByIdHandler(request) {
		const { threadId } = request.params;

		const getThreadUseCase = this._container.getInstance(GetThreadUseCase.name);

		const thread = await getThreadUseCase.execute(threadId);

		return {
			status: 'success',
			data: {
				thread,
			},
		};
  }
}

module.exports = ThreadsHandler;