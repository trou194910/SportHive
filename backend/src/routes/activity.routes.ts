import express from 'express';
import { activityController } from "../controllers/activity.controller";
import { isAuthenticated } from "../middleware/user.middleware";
import { registrationController } from "../controllers/registration.controller";
import { commentController } from "../controllers/comment.controller";

const activityRoutes = express.Router();

/**
 * @route  GET api/activities/search
 * @desc   活动搜索
 */
activityRoutes.get(
    '/search',
    activityController.search
)

/**
 * @route  GET api/activities
 * @decs   查找所有活动
 */
activityRoutes.get(
    '/',
    activityController.findAll
)

/**
 * @route  POST /api/activities
 * @decs   创建新活动
 */
activityRoutes.post(
    '/',
    isAuthenticated,
    activityController.create
)

/**
 * @route  GET /api/activities/:id
 * @desc   使用 ID 查找活动
 */
activityRoutes.get(
    '/:id',
    activityController.findById
)

/**
 * @route  PUT /api/activities/:id
 * @desc   更新活动内容
 */
activityRoutes.put(
    '/:id',
    isAuthenticated,
    activityController.update
)

/**
 * @route  PUT /api/activities/:id/pass
 * @desc   审核活动
 */
activityRoutes.put(
    '/:id/pass',
    isAuthenticated,
    activityController.approve
)

/**
 * @route  DELETE /api/activities/:id
 * @desc   删除活动
 */
activityRoutes.delete(
    '/:id',
    isAuthenticated,
    activityController.delete
)

/**
 * @route  GET /api/activities/:id/comments
 * @desc   获取某个活动的所有评论
 */
activityRoutes.get(
    '/:id/comments',
    commentController.getByActivity
)

/**
 * @route  GET /api/activities/:id/registration
 * @desc   获取某个活动的所有报名用户
 */
activityRoutes.get(
    '/:id/registration',
    registrationController.findUsersByActivityId
)

/**
 * @route  POST /api/activities/:id/comments
 * @desc   在某个活动下创建评论
 */
activityRoutes.post(
    '/:id/comments',
    isAuthenticated,
    commentController.create
)

/**
 * @route  POST api/activities/:id/register
 * @desc   报名活动
 */
activityRoutes.post(
    '/:id/register',
    isAuthenticated,
    registrationController.register
)

/**
 * @route  GET api/activities/:id/register
 * @desc   是否已经报名活动
 */
activityRoutes.get(
    '/:id/register',
    isAuthenticated,
    registrationController.isExist
)

/**
 * @route  DELETE api/activities/:id/cancel
 * @desc   取消报名活动
 */
activityRoutes.delete(
    '/:id/cancel',
    isAuthenticated,
    registrationController.withdraw
)


export default activityRoutes;