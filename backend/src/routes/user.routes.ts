import express from 'express';
import { userController } from '../controllers/user.controller';
import { activityController } from "../controllers/activity.controller";
import { followController } from "../controllers/follow.controller";
import { isAuthenticated } from "../middleware/user.middleware";
import { registrationController } from "../controllers/registration.controller";
import { commentController } from "../controllers/comment.controller";

const userRoutes = express.Router();

/**
 * @route  POST /api/users/register
 * @desc   注册一个新用户
 */
userRoutes.post(
    '/register',
    userController.register
);

/**
 * @route  POST /api/users/login
 * @desc   用户登录 (支持用户名或邮箱)
 */
userRoutes.post(
    '/login',
    userController.login
);

/**
 * @route  GET /api/users/follows
 * @desc   获取用户关注列表
 */
userRoutes.get(
    '/follows',
    isAuthenticated,
    followController.findByUserId
)

/**
 * @route  GET api/users/registration
 * @desc   获取某个用户已经报名的活动列表
 */
userRoutes.get(
    '/registrations',
    isAuthenticated,
    registrationController.getRegisteredActivities
)

/**
 * @route  GET api/users/follows/activities
 * @desc   获取某个用户关注的用户发布的活动列表
 */
userRoutes.get(
    '/follows/activities',
    isAuthenticated,
    followController.getFollowsActivities
)

/**
 * @route  GET api/users/user_management
 * @desc   获取用户列表
 */
userRoutes.get(
    '/user_management',
    isAuthenticated,
    userController.findAll
)

/**
 * @route  PUT api/users/user_management/:id
 * @desc   修改用户权限
 */
userRoutes.put(
    '/user_management/:id',
    isAuthenticated,
    userController.changePermission
)

/**
 * @route  GET api/users/:id
 * @desc   通过 ID 查找用户
 */
userRoutes.get(
    '/:id',
    userController.findUser
)

/**
 * @route  PUT /api/users/update
 * @desc   用户修改密码
 */
userRoutes.put(
    '/update',
    isAuthenticated,
    userController.update
)

/**
 * @route  POST /api/users/delete
 * @desc   删除用户（只能由登录用户操作）
 */
userRoutes.post(
    '/delete',
    isAuthenticated,
    userController.delete
)

/**
 * @route  GET /api/users/:id/activities/create
 * @desc   获取某个用户创建的活动列表
 */
userRoutes.get(
    '/:id/activities/create',
    activityController.findByOrganizerId
)

/**
 * @route  GET /api/users/:id/comments
 * @desc   获取某个用户发布的评论列表
 */
userRoutes.get(
    '/:id/comments',
    commentController.getByUser
)

/**
 * @route  POST /api/users/follows/:id
 * @desc   关注用户
 */
userRoutes.post(
    '/follows/:id',
    isAuthenticated,
    followController.follow
)

/**
 * @route  DELETE /api/users/follows/:id
 * @desc   取消关注用户
 */
userRoutes.delete(
    '/follows/:id',
    isAuthenticated,
    followController.unfollow
)

/**
 * @route  GET /api/users/follows/:id
 * @desc  是否已经关注该用户
 */
userRoutes.get(
    '/follows/:id',
    isAuthenticated,
    followController.isExist
)

export default userRoutes;