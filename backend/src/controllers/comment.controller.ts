import { NextFunction, Request, Response } from "express";
import { commentService } from "../services/comment.service";
import { User } from "../repositories/user.repository";

class CommentController {
    /**
     * 处理创建评论的请求
     */
    public create(req: Request, res: Response, next: NextFunction): void {
        try {
            const activityId = parseInt(req.params.id, 10);
            const { content } = req.body;
            const user = req.user as User;
            if (!user) {
                res.status(401).json({ message: '未授权或 Token 无效' });
                return;
            }
            const newComment = commentService.createComment(activityId, content, user);
            res.status(201).json({
                message: '评论创建成功',
                data: newComment
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * 处理获取某个活动下所有评论的请求。
     */
    public getByActivity(req: Request, res: Response, next: NextFunction): void {
        try {
            const activityId = parseInt(req.params.id, 10);
            const comments = commentService.getCommentsByActivityId(activityId);
            res.status(200).json(comments);
        } catch (error) {
            next(error);
        }
    }

    /**
     * 处理获取某个用户所有评论的请求。
     */
    public getByUser(req: Request, res: Response, next: NextFunction): void {
        try {
            const userId = parseInt(req.params.id, 10);
            const comments = commentService.getCommentsByUserId(userId);
            res.status(200).json(comments);
        } catch (error) {
            next(error);
        }
    }


    /**
     * 处理更新评论的请求。
     */
    public updateComment(req: Request, res: Response, next: NextFunction): void {
        try {
            const commentId = parseInt(req.params.id, 10);
            const { content } = req.body;
            const user = req.user as User;
            if (!user) {
                res.status(401).json({ message: '未授权或 Token 无效' });
                return;
            }
            const updatedComment = commentService.updateComment(commentId, content, user);
            res.status(200).json({
                message: '评论更新成功',
                data: updatedComment
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * 处理删除评论的请求。
     */
    public deleteComment(req: Request, res: Response, next: NextFunction): void {
        try {
            const commentId = parseInt(req.params.id, 10);
            const user = req.user as User;
            if (!user) {
                res.status(401).json({ message: '未授权或 Token 无效' });
                return;
            }
            commentService.deleteComment(commentId, user);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}

export const commentController = new CommentController();