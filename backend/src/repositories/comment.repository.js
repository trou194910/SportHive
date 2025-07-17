const db = require('../config/db.config');

class CommentRepository {
    /**
     * 创建新评论
     * @param {number} activityId
     * @param {number} userId
     * @param {string} content
     * @returns {Promise<object>}
     */
    async createComment(activityId, userId, content) {
        const query = 'INSERT INTO activity_comments (activity_id, user_id, content) VALUES ($1, $2, $3) RETURNING *';
        const values = [activityId, userId, content];
        const { rows } = await db.query(query, values);
        return rows[0];
    }

    /**
     * 通过 ID 查找评论
     * @param {number} id
     * @return {Promise<object>}
     */
    async findCommentById(id) {
        const query = 'SELECT * FROM activity_comments WHERE id = $1';
        const {rows} = await db.query(query, [id]);
        return rows[0];
    }

    /**
     * 通过 活动ID 查找评论
     * @param {number} id
     * @returns {Promise<Array<object>>}
     */
    async findCommentByActivityId(id) {
        const query = 'SELECT * FROM activity_comments WHERE activity_id = $1';
        const result = await db.query(query, [id]);
        return result.rows;
    }

    /**
     * 通过 用户ID 查找评论
     * @param {number} id
     * @returns {Promise<Array<object>>}
     */
    async findCommentByUserId(id) {
        const query = 'SELECT * FROM activity_comments WHERE user_id = $1';
        const result = await db.query(query, [id]);
        return result.rows;
    }

    /**
     * 通过 ID 更新评论
     * @param {number} id
     * @param {string} content
     * @returns {Promise<object>}
     */
    async updateCommentById(id, content) {
        const query = 'UPDATE activity_comments SET content = $1 WHERE id = $2 RETURNING *';
        const {rows} = await db.query(query, [content, id]);
        return rows[0];
    }

    /**
     * 通过 ID 删除评论
     * @param {number} id
     * @returns {Promise<object>}
     */
    async deleteCommentById(id) {
        const query = 'DELETE FROM activity_comments WHERE id = $1';
        await db.query(query, [id]);
    }
}

module.exports = new CommentRepository();