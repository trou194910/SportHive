const express = require('express');
const router = express.Router();
const activityController = require('../api/activity.controller.js');
const commentController = require('../api/comment.controller.js');
const registrationController = require('../api/registration.controller.js');
const authMiddleware = require('../middleware/user.middleware'); // 引入你的认证中间件

/**
 * @description 活动搜索路由
 * @method GET api/activities/search
 */
router.get('/search', activityController.searchActivities);

/**
 * @description 定义所有活动查找路由
 * @method GET /api/activities
 */
router.get('/', activityController.getAll);

/**
 * @description 定义活动创建路由
 * @method POST /api/activities
 */
router.post('/', authMiddleware, activityController.create);

/**
 * @description 定义单个活动查找路由
 * @method GET /api/activities/:id
 */
router.get('/:id', activityController.getById);

/**
 * @description 定义活动更新路由
 * @method PUT /api/activities/:id
 */
router.put('/:id', authMiddleware, activityController.update);

/**
 * @description 定义活动删除路由
 * @method DELETE /api/activities/:id
 */
router.delete('/:id', authMiddleware, activityController.delete);

/**
 * @description 获取某个活动的所有评论
 * @method GET /api/activities/:id/comments
 */
router.get('/:id/comments', commentController.getByActivity);

/**
 * @description 在某个活动下创建评论 (需要认证)
 * @method POST /api/activities/:id/comments
 */
router.post('/:id/comments', authMiddleware, commentController.create);

/**
 * @description 报名活动路由
 * @method POST api/activities/:id/register
 */
router.post('/:id/register', authMiddleware, registrationController.register);

/**
 * @description 取消报名活动路由
 * @method DELETE api/activities/:id/cancel
 */
router.delete('/:id/cancel', authMiddleware, registrationController.withdraw);

module.exports = router;