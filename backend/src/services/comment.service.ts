import { commentRepository, CommentCreationData, ActivityComment } from '../repositories/comment.repository';
import { activityRepository } from '../repositories/activity.repository';
import { AppError } from '../middleware/errorHandler';
import { User } from '../repositories/user.repository';
import { PermissionLevel } from '../types/permission.enum';

class CommentService {
    /**
     * 创建一条新评论，包含了权限和存在性检查。
     * @param activityId 评论所属的活动 ID。
     * @param content 评论内容。
     * @param user 发表评论的用户对象。
     * @returns 新创建的评论对象。
     */
    public createComment(activityId: number, content: string, user: User): ActivityComment {
        if (user.permission < PermissionLevel.Banned) {
            throw new AppError('您没有权限评论', 403);
        }
        if (!content || content.trim() === '') {
            throw new AppError('评论内容不能为空', 400);
        }
        const activity = activityRepository.findById(activityId);
        if (!activity) {
            throw new AppError('评论的活动不存在', 404);
        }
        const creationData: CommentCreationData = {
            activity_id: activityId,
            activity_name: activity.name,
            user_id: user.id,
            user_name: user.name,
            content: content.trim(),
        };
        return commentRepository.createComment(creationData);
    }

    /**
     * 获取某个活动下的所有评论
     * @param activityId 活动的 ID
     * @returns 评论对象数组
     */
    public getCommentsByActivityId(activityId: number): ActivityComment[] {
        const activity = activityRepository.findById(activityId);
        if (!activity) {
            throw new AppError('查询评论的活动不存在', 404);
        }
        return commentRepository.findCommentsByActivityId(activityId);
    }

    /**
     * 获取某个用户发表的所有评论
     * @param userId 用户的 ID
     * @returns 评论对象数组
     */
    public getCommentsByUserId(userId: number): ActivityComment[] {
        return commentRepository.findCommentsByUserId(userId);
    }

    /**
     * 更新一条评论
     * @param commentId 要更新的评论 ID
     * @param newContent 新的评论内容
     * @param user 发起操作的用户对象
     * @returns 更新后的评论对象
     */
    public updateComment(commentId: number, newContent: string, user: User): ActivityComment {
        if (!newContent || newContent.trim() === '') {
            throw new AppError('评论内容不能为空', 400);
        }
        const comment = commentRepository.findCommentById(commentId);
        if (!comment) {
            throw new AppError('评论未找到', 404);
        }
        if (comment.user_id !== user.id) {
            throw new AppError('您没有权限修改此评论', 403);
        }
        const updatedComment = commentRepository.updateCommentById(commentId, newContent.trim());
        if (!updatedComment) {
            throw new AppError('评论更新失败，可能已被删除', 404);
        }
        return updatedComment;
    }

    /**
     * 删除一条评论
     * @param commentId 要删除的评论 ID
     * @param user 发起操作的用户对象
     */
    public deleteComment(commentId: number, user: User): void {
        const comment = commentRepository.findCommentById(commentId);
        if (!comment) {
            throw new AppError('该评论不存在', 404);
        }
        if (comment.user_id !== user.id && user.permission < PermissionLevel.Manager) {
            throw new AppError('您没有权限删除此评论', 403);
        }
        const info = commentRepository.deleteCommentById(commentId);
        if (info.changes === 0) {
            throw new AppError('该评论已经被其他人删除', 404);
        }
    }
}

export const commentService = new CommentService();