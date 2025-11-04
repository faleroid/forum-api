const AddedReply = require("../../Domains/replies/entities/AddedReply");
const ReplyRepository = require('../../Domains/replies/ReplyRepository');

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
}

module.exports = ReplyRepositoryPostgres;