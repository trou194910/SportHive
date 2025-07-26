import {NextFunction, Request, Response} from "express";
import {followService} from "../services/follow.service";

class FollowController {
    /**
     * 处理关注用户请求
     */
    public async follow(req : Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {follow_name} = req.body;
            const follow_id = parseInt(req.params.id, 10);
            const user_id = req.user?.id;
            const user_permission = req.user?.permission;
            if (!user_id || !user_permission) {
                res.status(401).json({message: '未授权或 Token 无效'});
                return;
            }
            const followData = {
                user_id: user_id,
                follow_name: follow_name,
                follow_id: follow_id,
            }
            const follow = await followService.follow(followData, user_permission);
            res.status(200).json({
                message: '关注成功',
                data: follow
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * 处理取消关注用户请求
     */
    public async unfollow(req : Request, res : Response, next: NextFunction): Promise<void> {
        try {
            const user_id = req.user?.id;
            const follow_id = parseInt(req.params.id, 10);
            if (!user_id) {
                res.status(401).json({message: '未授权或 Token 无效'});
                return;
            }
            await followService.unfollow(user_id, follow_id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    /**
     * 处理获取关注列表请求
     */
    public async findByUserId(req : Request, res : Response, next: NextFunction): Promise<void> {
        try {
            const user_id = req.user?.id;
            if (!user_id) {
                res.status(401).json({message: '未授权或 Token 无效'});
                return;
            }
            const follows = await followService.findByUserId(user_id);
            res.status(200).json(follows);
        } catch (error) {
            next(error);
        }
    }

    /**
     * 处理判断是否关注请求
     */
    public async isExist(req : Request, res : Response, next: NextFunction): Promise<void> {
        try {
            const user_id = req.user?.id;
            const follow_id = parseInt(req.params.id, 10);
            if (!user_id) {
                res.status(401).json({message: '未授权或 Token 无效'});
                return;
            }
            const hasFollowed = await followService.isExist(user_id, follow_id);
            res.status(200).json({isFollowed: hasFollowed});
        } catch (error) {
            next(error);
        }
    }

    /**
     * 处理获取关注用户发布的活动列表的请求。
     */
    public async getFollowsActivities(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.user?.id;
            if (!id) {
                res.status(401).json({ message: '未授权或 Token 无效' });
                return;
            }
            const activities = await followService.getActivitiesFromFollows(id);
            res.status(200).json(activities);
        } catch (error) {
            next(error);
        }
    }
}

export const followController = new FollowController();