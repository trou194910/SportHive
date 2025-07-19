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
        const query = 'UPDATE activities SET name = $1, type = $2, description = $3, location = $4, start_time = $5, end_time = $6, capacity = $7, condition = 1 WHERE id = $8 RETURNING *';
        const values = [name, type, description, location, startTime, endTime, capacity, id];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    /**
     * 通过活动审核
     * @param {number} id
     * @returns {Promise<object>}
     */
    async passActivity(id) {
        const query = 'UPDATE activities SET condition = 2 WHERE id = $1 RETURNING *';
        const { rows } = await db.query(query, [id]);
        return rows[0];
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

    /**
     * 根据动态查询条件查找活动
     * @param {object} queryOptions
     * @returns {Promise<Array<object>>}
     */
    async findActivities(queryOptions) {
        const { searchText, name, description, type } = queryOptions;

        let baseQuery = 'SELECT * FROM activities';
        const conditions = [];
        const params = [];

        // 1. 全文（不完全匹配）查找
        if (searchText) {
            params.push(`%${searchText}%`);
            conditions.push(`(name ILIKE $${params.length} OR description ILIKE $${params.length})`);
        }

        // 2. 按标题（不完全匹配）查找
        if (name && !searchText) {
            params.push(`%${name}%`);
            conditions.push(`name ILIKE $${params.length}`);
        }

        // 3. 按正文（不完全匹配）查找
        if (description && !searchText) {
            params.push(`%${description}%`);
            conditions.push(`description ILIKE $${params.length}`);
        }

        // 4. 分类（完全匹配）查找
        if (type) {
            params.push(type);
            conditions.push(`type = $${params.length}`);
        }

        if (conditions.length > 0) {
            baseQuery += ' WHERE ' + conditions.join(' AND ');
        }
        baseQuery += ' ORDER BY start_time DESC';
        try {
            console.log('Executing Query:', baseQuery);
            console.log('With Params:', params);
            const { rows } = await db.query(baseQuery, params);
            return rows;
        } catch (error) {
            console.error('Repository Error: Failed to find activities.', error);
            throw new Error('数据库查询活动失败');
        }
    }

    /**
     * [自动任务] 更新所有已过期的活动状态为 3
     * @returns {Promise<number>} 返回被更新的行数
     */
    async updateExpiredActivities() {
        const query = 'UPDATE activities SET condition = 3 WHERE start_time < NOW() AND condition != 3';
        try {
            const { rowCount } = await db.query(query);
            return rowCount;
        } catch (error) {
            console.error('Repository Error: Failed to update expired activities.', error);
            throw error;
        }
    }
}

module.exports = new ActivityRepository();