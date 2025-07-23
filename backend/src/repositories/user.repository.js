const db = require('../config/db.config');

class UserRepository {
    /**
     * 创建新用户
     * @param {string} username
     * @param {string} email
     * @param {string} passwordHash
     * @returns {Promise<Object>}
     */
    async createUser(username, email, passwordHash){
        const query = 'INSERT INTO users (username, email, passwordHash, permission) VALUES ($1, $2, $3, $4) RETURNING id, username, email';
        const values = [username, email, passwordHash, 3];
        const { rows } = await db.query(query, values);
        return rows[0];
    }

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
     * 通过用 ID 查找用户
     * @param {number} id
     * @returns {Promise<Object|undefined>}
     */
    async findUserById(id) {
        if (!id) return undefined;
        const query = 'SELECT * FROM users WHERE id = $1';
        const { rows } = await db.query(query, [id]);
        return rows[0];
    }

    /**
     * 通过用户名删除用户
     * @param {string} username
     */
    async deleteUserByUsername(username) {
        const query = 'DELETE FROM users WHERE username = $1';
        await db.query(query, [username]);
    }

    /**
     * 通过 ID 修改用户权限
     * @param {number} newPermission - 1:黑名单(只能浏览[权限同未登录用户])
     *                                 2:被警告用户(不能创建活动)
     *                                 3:普通用户(默认)
     *                                 4:管理员(审核用户创建的活动[管理权限123用户])
     *                                 5:超级管理员(任命管理员[管理权限1234用户])
     * @param {number} id
     * @returns {Promise<object|undefined>}
     */
    async changePermission(newPermission, id) {
        if (!newPermission) return undefined;
        const query = 'UPDATE users SET permission = $1 WHERE id = $2 RETURNING id, username, permission';
        const { rows } = await db.query(query, [newPermission, id]);
        return rows[0];
    }

    /**
     * 查看用户列表
     * @reuturn {Promise<Array<object>>}
     */
    async getAllUsers() {
        const query = 'SELECT id, username, email, permission FROM users ORDER BY id DESC';
        const { rows } = await db.query(query);
        return rows;
    }

    /**
     * 通过 ID 关注用户
     * @param {number} userId
     * @param {number} followId
     * @returns {Promise<object>}
     */
    async followUser(userId, followId) {
        const query = 'UPDATE users SET follows = COALESCE(follows, ARRAY[]::bigint[]) || ARRAY[$1::bigint] WHERE id = $2 AND NOT ($1 = ANY(COALESCE(follows, ARRAY[]::bigint[]))) RETURNING id, username, follows';
        const value = [followId, userId];
        const { rows } = await db.query(query, value);
        return rows[0];
    }

    /**
     * 通过 ID 取关用户
     * @param {number} userId
     * @param {number} followId
     * @returns {Promise<object|undefined>}
     */
    async unfollowUser(userId, followId) {
        const query = 'UPDATE users SET follows = array_remove(follows, $1) WHERE id = $2 RETURNING id, username, follows';
        const value = [followId, userId];
        const { rows, rowCount } = await db.query(query, value);
        if (rowCount === 0) return undefined;
        return rows[0];
    }

    /**
     * 获取已关注用户发布的活动
     * @param {number} userId
     * @returns {Promise<Array<object>>}
     */
    async getFollowedUsersActivities(userId) {
        const query = 'SELECT * FROM activities WHERE organizer_id = ANY((SELECT follows FROM users WHERE id = $1)::bigint[]) ORDER BY start_time DESC';
        const { rows } = await db.query(query, [userId]);
        return rows;
    }

    /**
     * 获取关注者列表
     * @param {object} user
     * @returns {Promise<Array<object>>}
     */
    async getFollows(user) {
        const query = 'SELECT id, username, permission, email FROM users WHERE id = ANY($1::bigint[]) ORDER BY username DESC';
        const { rows } = await db.query(query, [user.follows]);
        return rows;
    }
}

module.exports = new UserRepository();