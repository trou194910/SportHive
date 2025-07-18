const registrationRepository = require('../repositories/registration.repository');
const activityRepository = require('../repositories/activity.repository');

class RegistrationService {
    /**
     * 用户报名活动
     * @param {number} activityId
     * @param {object} user
     * @return {Promise<object>}
     */
    async registerActivity(activityId, user) {
        const activity = await activityRepository.findActivityById(activityId);
        if (!activity) {
            const error = new Error('活动不存在');
            error.status = 404;
            throw error;
        }
        if (activity.condition !== 2) {
            const error = new Error('该活动不可报名');
            error.status = 400;
            throw error;
        }
        if (user.permission < 2) {
            const error = new Error('您没有权限报名活动');
            error.status = 403;
            throw error;
        }
        const isRegister = await registrationRepository.findRegistrationByUserAndActivity(user.id, activityId);
        if (isRegister) {
            const error = new Error('您已报名该活动');
            error.status = 409;
            throw error;
        }
        if (activity.participants >= activity.capacity) {
            const error = new Error('活动报名人数已满');
            error.status = 400;
            throw error;
        }
        const newRegistration = await registrationRepository.createRegistration(user.id, activityId);
        await activityRepository.addParticipants(activityId);
        return newRegistration;
    }

    /**
     * 用户取消报名
     * @param {number} activityId
     * @param {object} user
     */
    async withdrawRegistration(activityId, user) {
        const isRegister = await registrationRepository.findRegistrationByUserAndActivity(user.id, activityId);
        if (!isRegister) {
            const error = new Error('您未报名该活动');
            error.status = 409;
            throw error;
        }
        await registrationRepository.deleteRegistration(user.id, activityId);
        await activityRepository.decParticipants(activityId);
    }

    /**
     * 获取某个用户已报名的活动表
     * @param {number} userId
     * @returns {Promise<Array<object>>}
     */
    async getRegisteredActivity(userId) {
        return await registrationRepository.findActivitiesByUserId(userId);
    }
}

module.exports = new RegistrationService();
