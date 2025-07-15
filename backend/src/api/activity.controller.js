const activityService = require('../services/activity.service');

class ActivityController {
    /**
     * 处理活动创建请求
     * @param {object} req 请求对象
     * @param {object} res 响应对象
     */
    async create(req, res) {
        try {
            const activityData = req.body;
            const user = req.user;
            const newActivity = await activityService.createActivity(activityData, user);
            res.status(201).json(newActivity);
        } catch (error) {
            res.status(400).json({
                message: error.message
            })
        }
    }

    /**
     * 处理所有活动获取请求
     * @param {object} req 请求对象
     * @param {object} res 响应对象
     */
    async getAll(req, res) {
        try {
            const activities = await activityService.getAllActivities();
            res.status(200).json(activities);
        } catch (error) {
            res.status(401).json({
                message: error.message
            })
        }
    }

    /**
     * 处理单个活动获取请求
     * @param {object} req 请求对象
     * @param {object} res 响应对象
     */
    async getById(req, res) {
        try {
            const id = req.params.id;
            const activity = await activityService.getActivityById(id);
            res.status(200).json(activity);
        } catch (error) {
            res.status(401).json({
                message: error.message
            })
        }
    }

    /**
     * 处理活动更新请求
     * @param {object} req 请求对象
     * @param {object} res 响应对象
     */
    async update(req, res) {
        try {
            const id = req.params.id;
            const updateData = req.body;
            const user = req.user;
            const updatedActivity = await activityService.updateActivityById(id, updateData, user);
            res.status(200).json(updatedActivity);
        } catch (error) {
            res.status(401).json({
                message: error.message
            })
        }
    }

    /**
     * 处理删除活动的请求
     * @param {object} req 请求对象
     * @param {object} res 响应对象
     */
    async delete(req, res) {
        try {
            const id = req.params.id;
            const user = req.user;
            await activityService.deleteActivity(id, user);
            res.status(204).json({
                message: '删除成功'
            });
        } catch (error) {
            res.status(403).json({
                message: error.message
            })
        }
    }
}

module.exports = new ActivityController();