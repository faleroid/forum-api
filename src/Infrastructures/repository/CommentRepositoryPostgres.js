const CommentRepository = require('../../Domains/comments/CommentRepository');
const AddedComment = require('../../Domains/comments/entities/AddedComment');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

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

    async verifyCommentOwner(commentId, owner){
        const query = {
            text: 'SELECT owner FROM comments WHERE id = $1',
            values: [commentId],
        };

        const result = await this._pool.query(query);
        const comment = result.rows[0];

        if (result.rowCount === 0) {
            throw new NotFoundError('Komentar tidak ditemukan');
        }

        if (comment.owner !== owner){
            throw new AuthorizationError('Anda tidak berhak untuk mengakses resource ini')
        }
    }

    async deleteComment(commentId){
        const query = {
            text: 'UPDATE comments SET is_delete = true WHERE id = $1',
            values: [commentId]
        }

        await this._pool.query(query);
    }
}

module.exports = CommentRepositoryPostgres;