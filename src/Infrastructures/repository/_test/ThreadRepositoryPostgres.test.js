// Impor Helpers
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadsRepositoryPostgres');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ThreadRepositoryPostgres', () => {
	afterEach(async () => {
		await ThreadsTableTestHelper.cleanTable();
		await UsersTableTestHelper.cleanTable();
	});

	afterAll(async () => {
		await pool.end();
	});

	describe('addThread function', () => {
		it('should persist register user and return registered user correctly', async () => {
			await UsersTableTestHelper.addUser({ 
				id: 'user-123', 
				username: 'dicoding', 
				password: 'secret_password', 
				fullname: 'Dicoding Indonesia',
			});

			const newThread = new AddThread({
				title: 'Ini Judul Thread',
				body: 'Ini isi body thread.',
				owner: 'user-123',
			});

			const fakeIdGenerator = () => '123';
      		const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

			const addedThread = await threadRepositoryPostgres.addThread(newThread);

			const threads = await ThreadsTableTestHelper.findThreadById('thread-123');

			expect(threads).toHaveLength(1);
			expect(threads[0].id).toEqual('thread-123');
			expect(threads[0].title).toEqual('Ini Judul Thread');
			expect(threads[0].owner).toEqual('user-123');

			expect(addedThread).toBeInstanceOf(AddedThread);
			expect(addedThread.id).toEqual('thread-123');
			expect(addedThread.title).toEqual('Ini Judul Thread');
			expect(addedThread.owner).toEqual('user-123');
		})
	})

	describe('verifyThreadExists function', () => {
		it('should throw NotFoundError when thread not found', async () => {
			// Arrange
			const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
			const invalidThreadId = 'thread-xxxx';

			// Action & Assert
			await expect(threadRepositoryPostgres.verifyThreadExists(invalidThreadId))
				.rejects.toThrow(NotFoundError);
		});

		it('should not throw NotFoundError when thread exists', async () => {
			// Arrange
			await UsersTableTestHelper.addUser({ id: 'user-123' });
			await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
			
			const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
			const validThreadId = 'thread-123';

			// Action & Assert
			await expect(threadRepositoryPostgres.verifyThreadExists(validThreadId))
				.resolves.not.toThrow(NotFoundError);
		});
	})

	describe('getThreadById function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      const invalidThreadId = 'thread-xxxx';

      // Action & Assert
      await expect(threadRepositoryPostgres.getThreadById(invalidThreadId))
        .rejects.toThrow(NotFoundError);
    });

    it('should return thread details correctly when thread is found', async () => {
      // Arrange
      const dateTestHelper = new Date().toISOString();
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'Judul Thread',
        body: 'Body Thread',
        owner: 'user-123',
        date: dateTestHelper,
      });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const thread = await threadRepositoryPostgres.getThreadById('thread-123');

      // Assert
      expect(thread).toBeDefined();
      expect(thread.id).toEqual('thread-123');
      expect(thread.title).toEqual('Judul Thread');
      expect(thread.body).toEqual('Body Thread');
      expect(thread.username).toEqual('dicoding');
    //   expect(new Date(thread.date).toISOString()).toEqual(dateTestHelper);
    });
  });
})