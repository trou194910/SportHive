const activityService = require('../services/activity.service');

class ActivityController {
    /**
     * 处理活动创建请求
     * @param {object} req 请求对象
     * @param {object} res 响应对象
     * @param {function} next 错误处理
     */
    async create(req, res, next) {
        try {
            const activityData = req.body;
            const user = req.user;
            const newActivity = await activityService.createActivity(activityData, user);
            res.status(201).json({
                message: '活动创建成功',
                data: newActivity
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * 处理所有活动获取请求
     * @param {object} req 请求对象
     * @param {object} res 响应对象
     * @param {function} next 错误处理
     */
    async getAll(req, res, next) {
        try {
            const activities = await activityService.getAllActivities();
            res.status(200).json(activities);
        } catch (error) {
            next(error);
        }
    }

    /**
     * 处理单个活动获取请求
     * @param {object} req 请求对象
     * @param {object} res 响应对象
     * @param {function} next 错误处理
     */
    async getById(req, res, next) {
        try {
            const id = req.params.id;
            const activity = await activityService.getActivityById(id);
            res.status(200).json(activity);
        } catch (error) {
            next(error);
        }
    }

    /**
     * 处理某个用户创建的活动获取请求
     * @param {object} req 请求对象
     * @param {object} res 响应对象
     * @param {function} next 错误处理
     */
    async getByOrganizerId(req, res, next) {
        try {
            const activities = await activityService.getActivitiesByOrganizerId(req.params.id);
            res.status(200).json(activities);
        } catch (error) {
            next(error);
        }
    }

    /**
     * 处理活动更新请求
     * @param {object} req 请求对象
     * @param {object} res 响应对象
     * @param {function} next 错误处理
     */
    async update(req, res, next) {
        try {
            const id = req.params.id;
            const updateData = req.body;
            const user = req.user;
            const updatedActivity = await activityService.updateActivityById(id, updateData, user);
            res.status(200).json(updatedActivity);
        } catch (error) {
            next(error);
        }
    }

    /**
     * 处理删除活动的请求
     * @param {object} req 请求对象
     * @param {object} res 响应对象
     * @param {function} next 错误处理
     */
    async delete(req, res, next) {
        try {
            const id = req.params.id;
            const user = req.user;
            await activityService.deleteActivity(id, user);
            res.status(204).json({
                message: '删除成功'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ActivityController();