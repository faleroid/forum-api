const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');

class ThreadsHandler{
	constructor(container){
		this._container = container;

		this.postThreadsHandler = this.postThreadsHandler.bind(this);
		this.postCommentToThreadHandler = this.postCommentToThreadHandler.bind(this);
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
}

module.exports = ThreadsHandler;