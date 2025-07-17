const express = require('express');
const router = express.Router();
const userController = require('../api/user.controller');
const activitiesController = require('../api/activity.controller');
const commentController = require('../api/comment.controller');
const authMiddleware = require('../middleware/user.middleware');

/**
 * @description 定义用户注册路由
 * @method POST /api/users/register
 */
router.post('/register', userController.register);

/**
 * @description 定义用户登录路由
 * @method POST /api/users/login
 */
router.post('/login', userController.login);

/**
 * @description 定义用户删除路由
 * @method DELETE /api/users/:id
 */
router.delete('/:id', authMiddleware, userController.deleteUser);

/**
 * @description 获取某个用户的所有评论
 * @method GET /api/users/:id/comments
 */
router.get('/:id/comments', authMiddleware, commentController.getByUser);

/**
 * @description 获取某个用户创建的活动
 * @method GET /api/users/:id/activities/create
 */
router.get('/:id/activities/create', activitiesController.getByOrganizerId);

module.exports = router;