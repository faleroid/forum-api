/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const ThreadTableTestHelper = {

    async addThread(payload){
        const { 
            id = 'thread-123', 
            title = 'judul thread', 
            body = 'isi body', 
            owner,
            date = new Date().toISOString(),
        } = payload;
        const query = {
            text: 'INSERT INTO threads(id, title, body, owner, date) VALUES($1, $2, $3, $4, $5)',
            values: [id, title, body, owner, date],
        };
        
        await pool.query(query);
    },

    async findThreadById(id){
        const query = {
            text: 'SELECT * FROM threads WHERE id = $1',
            values: [id],
        }

        const result = await pool.query(query);
        return result.rows;
    },

    async cleanTable() {
        await pool.query('DELETE FROM threads WHERE 1=1');
    }
}

module.exports = ThreadTableTestHelper;