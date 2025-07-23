const express = require('express');
const router = express.Router();
const userController = require('../api/user.controller');
const activitiesController = require('../api/activity.controller');
const commentController = require('../api/comment.controller');
const registrationController = require('../api/registration.controller');
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
 * @description 获取用户已报名列表路由
 * @method GET api/users/registrations
 */
router.get('/registrations', authMiddleware, registrationController.getRegisteredActivities);

/**
 * @decription 定义获取关注用户列表路由
 * @method GET /api/users/follows
 */
router.get('/follows', authMiddleware, userController.getFollows);

/**
 * @description 定义获取已关注的用户发布的所有活动的路由
 * @method GET /api/users/follows/activities
 */
router.get('/follows/activities', authMiddleware, userController.getFollowedActivities);

/**
 * @description 获取用户列表(管理员)
 * @method GET api/users/user_management
 */
router.get('/user_management', authMiddleware, userController.getAllUsers);

/**
 * @description 修改用户权限(管理员)
 * @method PUT api/users/user_management/:id
 */
router.put('/user_management/:id', authMiddleware, userController.changePermission);

/**
 * @description 定义查找用户路由
 * @method GET /api/users/:id
 */
router.get('/:id', authMiddleware, userController.findUser);

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

/**
 * @description 定义关注用户路由
 * @method POST /api/users/follows/:id
 */
router.post('/follows/:id', authMiddleware, userController.follow);

/**
 * @description 定义取关用户路由
 * @method DELETE /api/users/follows/:id
 */
router.delete('/follows/:id', authMiddleware, userController.unfollow);

module.exports = router;