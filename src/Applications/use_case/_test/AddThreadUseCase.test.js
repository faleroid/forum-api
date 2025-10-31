const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const AddThreadUseCase = require('../AddThreadUseCase');

describe('AddThreadUseCase', () => {
    it('should orchestrating the add thread action correctly', async () => {
        //arrange
        const useCasePayload = {
            title: 'Ini Title',
            body: 'Ini body',
            owner: 'user-123'
        }

        const mockAddedThread = new AddedThread({
            id : 'id-123',
            title : useCasePayload.title,
            owner : useCasePayload.owner
        });

        const mockThreadRepository = new ThreadRepository();

        mockThreadRepository.addThread = jest.fn()
        .mockImplementation(() => Promise.resolve(mockAddedThread));

        const addThreadUseCase = new AddThreadUseCase({
            threadRepository : mockThreadRepository,
        })

        //action
        const addedThread = await addThreadUseCase.execute(useCasePayload);

        //expected
        expect(addedThread).toStrictEqual(mockAddedThread);
        expect(mockThreadRepository.addThread).toHaveBeenCalledTimes(1);
        expect(mockThreadRepository.addThread).toBeCalledWith(
            new AddThread({
                title: useCasePayload.title,
                body: useCasePayload.body,
                owner: useCasePayload.owner,
            }),
        );
    })
})