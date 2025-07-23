const registrationService = require("../services/registration.services");

class RegistrationController {
    /**
     * 处理用户报名活动的请求
     * @param {object} req 请求对象
     * @param {object} res 响应对象
     * @param {function} next 错误处理
     */
    async register(req, res, next) {
        try {
            const activityId = req.params.id;
            const user = req.user;
            const newRegistration = await registrationService.registerActivity((Number)(activityId), user);
            res.status(201).json({
                message: '报名成功',
                data: newRegistration
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * 处理用取消报名活动的请求
     * @param {object} req 请求对象
     * @param {object} res 响应对象
     * @param {function} next 错误处理
     */
    async withdraw(req, res, next) {
        try {
            const activityId = req.params.id;
            const user = req.user;
            await registrationService.withdrawRegistration((Number)(activityId), user);
            res.status(204).json({
                message: "取消报名成功"
            })
        } catch (error) {
            next(error);
        }
    }

    /**
     * 处理获取某个用户已报名活动表的请求
     * @param {object} req 请求对象
     * @param {object} res 响应对象
     * @param {function} next 错误处理
     */
    async getRegisteredActivities(req, res, next) {
        try {
            const userId = req.user.id;
            const activities = await registrationService.getRegisteredActivity(userId);
            res.status(201).json(activities);
        } catch (error) {
            next(error);
        }
    }

    /**
     * 处理根据活动ID查找所有报名用户的信息的请求
     * @param {object} req 请求对象
     * @param {object} res 响应对象
     * @param {function} next 错误处理
     */
    async findUsersByActivityId(req, res, next) {
        try {
            const activityId = Number(req.params.id);
            const users = await registrationService.findUsersByActivityId(activityId);
            res.status(201).json(users);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new RegistrationController();