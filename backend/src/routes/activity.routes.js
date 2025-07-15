const express = require('express');
const router = express.Router();
const activityController = require('../api/activity.controller.js');
const authMiddleware = require('../middleware/user.middleware'); // 引入你的认证中间件

/**
 * @description 定义所有活动查找路由
 * @method GET /api/activities
 */
router.get('/', activityController.getAll);

/**
 * @description 定义单个活动查找路由
 * @method GET /api/activities/:id
 */
router.get('/:id', activityController.getById);

/**
 * @description 定义活动创建路由
 * @method POST /api/activities
 */
router.post('/', authMiddleware, activityController.create);

/**
 * @description 定义活动更新由
 * @method PUT /api/activities/:id
 */
router.put('/:id', authMiddleware, activityController.update);

/**
 * @description 定义活动删除路由
 * @method DELETE /api/activities/:id
 */
router.delete('/:id', authMiddleware, activityController.delete);

module.exports = router;