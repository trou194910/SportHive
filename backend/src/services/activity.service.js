const activityRepository = require('../repositories/activity.repository')

class ActivityService {
    /**
     * 活动创建
     * @param {object} activityData
     * @param {object} user
     * @returns {Promise<object>}
     */
    async createActivity(activityData, user) {
        if (user.permission < 3) {
            throw new Error('您没有创建活动的权限');
        }
        if (new Date(activityData.startTime) >= new Date(activityData.endTime) ||
            new Date(activityData.startTime) <= new Date()) {
            throw new Error('活动时间异常');
        }
        const fullActivityData = {
            ...activityData,
            organizerId: user.id,
            condition: user.permission > 3 ? 2 : 1
        }
        return await activityRepository.createActivity(fullActivityData);
    }

    /**
     * 所有活动获取
     * @returns {Promise<Array<object>>}
     */
    async getAllActivities() {
        return await activityRepository.findAllActivities();
    }

    /**
     * 单个活动获取
     * @param {number} id
     * @returns {Promise<object>}
     */
    async getActivityById(id) {
        const activity = await activityRepository.findActivityById(id);
        if (!activity) {
            const error = new Error('活动未找到');
            error.status = 404;
            throw error;
        }
        return activity;
    }

    /**
     * 某个用户创建的活动的获取
     * @param {number} id
     * @returns {Promise<Array<object>>}
     */
    async getActivitiesByOrganizerId(id) {
        return await activityRepository.findActivityByOrganizerId(id);
    }

    /**
     * 活动更新
     * @param {number} id
     * @param {object} updateData
     * @param {object} user
     * @returns {Promise<object>}
     */
    async updateActivityById(id, updateData, user) {
        const activity = await this.getActivityById(id);
        if (activity.organizer_id !== user.id && user.permission < 4) {
            const error = new Error('您没有权限更改活动内容');
            error.status = 403;
            throw error;
        }
        return await activityRepository.updateActivityById(id, updateData);
    }

    /**
     * 活动审核
     * @param {number} id
     * @param {object} user
     * @returns {Promise<object>}
     */
    async passActivity(id, user) {
        if (user.permission < 4) {
            const error = new Error('您没有权限更改活动状态');
            error.status = 403;
            throw error;
        }
        const activity = await this.getActivityById(id);
        if (activity.condition !== 1) {
            const error = new Error('该状态不可修改');
            error.status = 409;
            throw error;
        }
        return await activityRepository.passActivity(id);
    }

    /**
     * 活动删除
     * @param {number} id
     * @param {object} user
     */
    async deleteActivity(id, user) {
        const activity = await this.getActivityById(id);
        if (activity.organizer_id !== user.id && user.permission < 4) {
            const error = new Error('您没有权限删除活动');
            error.status = 403;
            throw error;
        }
        await activityRepository.deleteActivityById(id);
    }

    /**
     * 搜索活动
     * @param {object} searchCriteria
     * @returns {Promise<Array<object>>}
     */
    async searchActivities(searchCriteria) {
        try {
            return await activityRepository.findActivities(searchCriteria);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new ActivityService();