const commentRepository = require('../repositories/comment.repository')
const activityRepository = require('../repositories/activity.repository');

class CommentService {
    /**
     * 创建新评论
     * @param {number} activityId
     * @param {string} content
     * @param {object} user
     * @returns {Promise<object>}
     */
    async createComment(activityId, content, user) {
        if (user.permission < 2) {
            const error = new Error('您没有权限评论');
            error.status = 403;
            throw error;
        }
        if (!content || content.trim() === '') {
            const error = new Error('评论内容不能为空');
            error.statusCode = 400;
            throw error;
        }
        const activity = await activityRepository.findActivityById(activityId);
        if (!activity) {
            const error = new Error('评论的活动不存在');
            error.statusCode = 404;
            throw error;
        }
        return await commentRepository.createComment(activityId, user.id, content.trim());
    }

    /**
     * 获取某个活动的所有评论
     * @param {number} activityId
     * @returns {Promise<Array<object>>}
     */
    async getCommentsByActivityId(activityId) {
        const activity = await activityRepository.findActivityById(activityId);
        if (!activity) {
            const error = new Error('查询评论的活动不存在');
            error.statusCode = 404;
            throw error;
        }
        return await commentRepository.findCommentByActivityId(activityId);
    }

    /**
     * 获取某个用户的所有评论
     * @param {number} userId
     * @returns {Promise<Array<object>>}
     */
    async getCommentsByUserId(userId) {
        return await commentRepository.findCommentByUserId(userId);
    }

    /**
     * 更新评论
     * @param {number} commentId
     * @param {string} newContent
     * @param {object} user
     * @returns {Promise<object>}
     */
    async updateComment(commentId, newContent, user) {
        if (!newContent || newContent.trim() === '') {
            const error = new Error('评论内容不能为空');
            error.statusCode = 400;
            throw error;
        }
        const comment = await commentRepository.findCommentById(commentId);
        if (!comment) {
            const error = new Error('评论未找到');
            error.statusCode = 404;
            throw error;
        }
        if (comment.user_id !== (Number)(user.id)) {
            const error = new Error('您没有权限修改此评论');
            error.statusCode = 403;
            throw error;
        }
        return await commentRepository.updateCommentById(commentId, newContent.trim());
    }

    /**
     * 删除评论
     * @param {number} commentId
     * @param {object} user
     * @returns {Promise<void>}
     */
    async deleteComment(commentId, user) {
        const comment = await commentRepository.findCommentById(commentId);
        if (!comment) {
            const error = new Error('评论未找到');
            error.statusCode = 404;
            throw error;
        }
        if (comment.user_id !== (Number)(user.id) && user.permission < 4) {
            const error = new Error('您没有权限删除此评论');
            error.statusCode = 403;
            throw error;
        }
        await commentRepository.deleteCommentById(commentId);
    }
}

module.exports = new CommentService();