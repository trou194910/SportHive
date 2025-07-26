import express from 'express';
import { commentController } from "../controllers/comment.controller";
import { isAuthenticated } from "../middleware/user.middleware";

const commentRoutes = express.Router();

/**
 * @route  PUT /api/comments/:id
 * @desc   更新评论
 */
commentRoutes.put(
    '/:id',
    isAuthenticated,
    commentController.updateComment
)

/**
 * @route  DELETE /api/comments/:id
 * @desc   删除评论
 */
commentRoutes.delete(
    '/:id',
    isAuthenticated,
    commentController.deleteComment
)

export default commentRoutes;