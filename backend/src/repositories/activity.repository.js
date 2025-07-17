const db = require('../config/db.config');

class ActivityRepository {
    /**
     * 创建新活动
     * @param {object} activityData
     * @param {string} activityData.name
     * @param {number} activityData.condition - 1:审核中 2:招募中 3:已结束
     * @param {string} activityData.type
     * @param {string} activityData.description
     * @param {string} activityData.location
     * @param {string} activityData.startTime (ISO)
     * @param {string} activityData.endTime (ISO)
     * @param {number} activityData.capacity - 人数上限
     * @param {number} activityData.organizerId
     * @returns {Promise<object>}
     */
    async createActivity({name, condition, type, description, location, startTime, endTime, capacity, organizerId}) {
        const query = 'INSERT INTO activities (name, condition, type, description, location, start_time, end_time, capacity, organizer_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *';
        const values = [name, condition, type, description, location, startTime, endTime, capacity, organizerId];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    /**
     * 查找所有活动
     * @returns {Promise<Array<object>>}
     */
    async findAllActivities() {
        const query = 'SELECT * FROM activities ORDER BY start_time DESC';
        const result = await db.query(query);
        return result.rows;
    }
    /**
     * 通过 ID 查找活动
     * @param {number} id
     * @returns {Promise<object|undefined>}
     */
    async findActivityById(id) {
        const query = 'SELECT * FROM activities WHERE id = $1';
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    /**
     * 通过 organizerId 查找活动
     * @param {number} id
     * @returns {Promise<Array<Object>>}
     */
    async findActivityByOrganizerId(id) {
        const query = 'SELECT * FROM activities WHERE organizer_id = $1';
        const result = await db.query(query, [id]);
        return result.rows;
    }

    /**
     * 通过 ID 更新活动内容
     * @param {number} id
     * @param {object} activityData
     * @returns {Promise<object>}
     */
    async updateActivityById(id, {name, type, description, location, startTime, endTime, capacity}) {
        const query = 'UPDATE activities SET name = $1, type = $2, description = $3, location = $4, start_time = $5, end_time = $6, capacity = $7 WHERE id = $8 RETURNING *';
        const values = [name, type, description, location, startTime, endTime, capacity, id];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    /**
     * 通过 ID 增加参与人数
     * @param {number} id
     * @returns {Promise<object>}
     */
    async addParticipants(id) {
        const query = 'UPDATE activities SET participants = participants+1 WHERE id = $1 RETURNING *';
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    /**
     * 通过 ID 减少参与人数
     * @param {number} id
     * @returns {Promise<object>}
     */
    async decParticipants(id) {
        const query = 'UPDATE activities SET participants = participants-1 WHERE id = $1 RETURNING *';
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    /**
     * 通过 ID 删除活动
     * @param {number} id
     */
    async deleteActivityById(id) {
        const query = 'DELETE FROM activities WHERE id = $1';
        await db.query(query, [id]);
    }
}

module.exports = new ActivityRepository();