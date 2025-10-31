const CommentRepository = require('../../Domains/comments/CommentRepository');
const AddedComment = require('../../Domains/comments/entities/AddedComment');

class CommentRepositoryPostgres extends CommentRepository{
    constructor(pool, idGenerator){
        super();

        this._pool = pool;
        this._idGenerator = idGenerator;
    }

    async addComment(addComment){
        const{ content, threadId, owner } = addComment;

        const commentId = `comment-${this._idGenerator()}`; 
        const date = new Date().toISOString();

        const query = {
            text: 'INSERT INTO comments(id, content, owner, thread_id, date) VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner',
            values: [commentId, content, owner, threadId, date],
        }

        const result = await this._pool.query(query);

        return new AddedComment({...result.rows[0]});
    }
}

module.exports = CommentRepositoryPostgres;