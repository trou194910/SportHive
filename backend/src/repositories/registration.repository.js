const db = require('../config/db.config');

class RegistrationRepository {
    /**
     * 创建新报名记录
     * @param {number} userId
     * @param {number} activityId
     * @return {Promise<object>}
     */
    async createRegistration(userId, activityId) {
        const query = 'INSERT INTO registrations (user_id, activity_id) VALUES ($1, $2) RETURNING *';
        const values = [userId, activityId];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    /**
     * 删除报名记录
     * @param {number} userId
     * @param {number} activityId
     */
    async deleteRegistration(userId, activityId) {
        const query = 'DELETE from registrations WHERE user_id = $1 AND activity_id = $2';
        const values = [userId, activityId];
        await db.query(query, values);
    }

    /**
     * 检查用户是否已报名某个活动
     * @param {number} userId
     * @param {number} activityId
     * @returns {Promise<object|null>}
     */
    async findRegistrationByUserAndActivity(userId, activityId) {
        const query = 'SELECT * FROM registrations WHERE user_id = $1 AND activity_id = $2';
        const values = [userId, activityId];
        const result = await db.query(query, values);
        return result.rows[0] || null;
    }

    /**
     * 获取某个用户报名的活动
     * @param {number} userId
     * @return {Promise<Array<object>>}
     */
    async findActivitiesByUserId(userId) {
        const query = 'SELECT a.id AS activity_id, a.name AS activity_name, a.id, a.name, a.description, a.type, a.location, a.start_time, a.end_time, a.condition, a.capacity, a.organizer_id, r.registration_time FROM registrations AS r JOIN activities AS a ON r.activity_id = a.id WHERE r.user_id = $1';
        const result = await db.query(query, [userId]);
        return result.rows;
    }

    /**
     * 根据活动ID查找所有报名用户的信息
     * @param {number} activityId
     * @return {Promise<Array<object>>}
     */
    async findUsersByActivityId(activityId) {
        const query = 'SELECT u.id, u.username, u.email FROM registrations AS r JOIN users AS u ON r.user_id = u.id WHERE r.activity_id = $1';
        const result = await db.query(query, [activityId]);
        return result.rows;
    }
}

module.exports = new RegistrationRepository();