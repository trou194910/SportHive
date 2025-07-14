const db = require('../config/db.config');

class UserRepository {
    /**
     * 通过用户名查找用户
     * @param {string} username
     * @returns {Promise<Object|undefined>}
     */
    async findUserByUsername(username) {
        if (!username) return undefined;
        const query = 'SELECT * FROM users WHERE username = $1';
        const { rows } = await db.query(query, [username]);
        return rows[0];
    }
    /**
     * 通过邮箱查找用户
     * @param {string} email
     * @returns {Promise<Object|undefined>}
     */
    async findUserByEmail(email) {
        if (!email) return undefined;
        const query = 'SELECT * FROM users WHERE email = $1';
        const { rows } = await db.query(query, [email]);
        return rows[0];
    }

    /**
     * 创建新用户
     * @param {string} username
     * @param {string} email
     * @param {string} passwordHash
     * @returns {Promise<Object>}
     */
    async createUser(username, email, passwordHash){
        const query = 'INSERT INTO users (username, email, passwordHash) VALUES ($1, $2, $3) RETURNING id, username, email';
        const values = [username, email, passwordHash];
        const { rows } = await db.query(query, values);
        return rows[0];
    }
}

module.exports = new UserRepository();