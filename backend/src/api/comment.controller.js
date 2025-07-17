const commentService = require('../services/comment.service');

class CommentController {
    /**
     * 处理创建评论的请求
     * @param {object} req 请求对象
     * @param {object} res 响应对象
     * @param {function} next 错误处理
     */
    async create(req, res, next) {
        try {
            const { activityId } = req.params;
            const { content } = req.body;
            const userId = Number(req.user.id);
            const newComment = await commentService.createComment(activityId, content, userId);
            res.status(201).json({
                message: '评论创建成功',
                data: newComment
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * 处理获取活动评论的请求
     * @param {object} req 请求对象
     * @param {object} res 响应对象
     * @param {function} next 错误处理
     */
    async getByActivity(req, res, next) {
        try {
            const { activityId } = req.params;
            const comments = await commentService.getCommentsByActivityId(Number(activityId));
            res.status(200).json(comments);
        } catch (error) {
            next(error);
        }
    }

    /**
     * 处理获取某个用户所有评论的请求
     * @param {object} req 请求对象
     * @param {object} res 响应对象
     * @param {function} next 错误处理
     */
    async getByUser(req, res, next) {
        try {
            const { userId } = req.params;
            const comments = await commentService.getCommentsByUserId(Number(userId));
            res.status(200).json(comments);
        } catch (error) {
            next(error);
        }
    }


    /**
     * 处理更新评论的请求
     * @param {object} req 请求对象
     * @param {object} res 响应对象
     * @param {function} next 错误处理
     */
    async updateComment(req, res, next) {
        try {
            const { commentId } = req.params;
            const { content } = req.body;
            const user = req.user;
            const updatedComment = await commentService.updateComment(Number(commentId), content, user);
            res.status(200).json({
                message: '评论更新成功',
                data: updatedComment
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * 处理删除评论的请求
     * @param {object} req 请求对象
     * @param {object} res 响应对象
     * @param {function} next 错误处理
     */
    async deleteComment(req, res, next) {
        try {
            const { commentId } = req.params;
            const user = req.user;

            await commentService.deleteComment(Number(commentId), user);
            res.status(204).json({
                message: '评论删除成功'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new CommentController();