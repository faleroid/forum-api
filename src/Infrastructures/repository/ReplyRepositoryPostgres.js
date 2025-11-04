const AddedReply = require("../../Domains/replies/entities/AddedReply");
const ReplyRepository = require('../../Domains/replies/ReplyRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError')

class ReplyRepositoryPostgres extends ReplyRepository{
    constructor(pool, idGenerator){
        super();
        
        this._pool = pool;
        this._idGenerator = idGenerator;
    }

    async addReply(addReply){
        const { content, owner, commentId } = addReply;
        const id = `reply-${this._idGenerator()}`;
        const date = new Date().toISOString();

        const query = {
            text : 'INSERT INTO replies(id, content, owner, comment_id, date) VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner  ',
            values : [id, content, owner, commentId, date]
        }

        const result = await this._pool.query(query);

        return new AddedReply({ ...result.rows[0] })
    }

    async verifyReplyOwner(replyId, owner) {
        const query = {
            text: 'SELECT owner FROM replies WHERE id = $1',
            values: [replyId],
        };

        const result = await this._pool.query(query);

        if (result.rowCount === 0) {
            throw new NotFoundError('balasan tidak ditemukan');
        }

        const reply = result.rows[0];
            if (reply.owner !== owner) {
                throw new AuthorizationError('anda tidak berhak mengakses resource ini');
            }
        }

        async deleteReply(replyId) {
            const query = {
            text: 'UPDATE replies SET is_delete = true WHERE id = $1',
            values: [replyId],
        };

        await this._pool.query(query);
    }
}

module.exports = ReplyRepositoryPostgres;