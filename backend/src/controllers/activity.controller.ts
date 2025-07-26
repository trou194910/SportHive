import { Request, Response, NextFunction } from 'express';
import { activityService } from '../services/activity.service';
import { ActivityUpdateData, ActivityQueryOptions } from '../repositories/activity.repository';
import { ActivityCreationPayload } from '../services/activity.service';

class ActivityController {
    /**
     * @desc    处理创建新活动的请求
     * @access  Private
     */
    public create(req: Request, res: Response, next: NextFunction): void {
        try {
            const activityData: ActivityCreationPayload = req.body;
            const user = req.user;
            if (!user) {
                res.status(401).json({ message: '用户未认证' });
                return;
            }
            const newActivity = activityService.create(activityData, user);
            res.status(201).json({
                message: '活动创建成功',
                data: newActivity,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    处理获取所有活动的请求
     * @access  Public
     */
    public findAll(req: Request, res: Response, next: NextFunction): void {
        try {
            const activities = activityService.findAll();
            res.status(200).json(activities);
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    处理根据 ID 获取单个活动的请求
     * @access  Public
     */
    public findById(req: Request, res: Response, next: NextFunction): void {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: '无效的活动 ID' });
                return;
            }
            const activity = activityService.findById(id);
            res.status(200).json(activity);
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    处理获取指定用户创建的所有活动的请求
     * @access  Public
     */
    public findByOrganizerId(req: Request, res: Response, next: NextFunction): void {
        try {
            const organizerId = parseInt(req.params.id, 10);
            if (isNaN(organizerId)) {
                res.status(400).json({ message: '无效的组织者 ID' });
                return;
            }
            const activities = activityService.findByOrganizerId(organizerId);
            res.status(200).json(activities);
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    处理更新活动的请求
     * @access  Private
     */
    public update(req: Request, res: Response, next: NextFunction): void {
        try {
            const id = parseInt(req.params.id, 10);
            const updateData: ActivityUpdateData = req.body;
            const user = req.user;
            if (isNaN(id)) {
                res.status(400).json({ message: '无效的活动 ID' });
                return;
            }
            if (!user) {
                res.status(401).json({ message: '用户未认证' });
                return;
            }

            const updatedActivity = activityService.update(id, updateData, user);
            res.status(200).json(updatedActivity);
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    处理活动审核通过的请求
     * @access  Private
     */
    public approve(req: Request, res: Response, next: NextFunction): void {
        try {
            const id = parseInt(req.params.id, 10);
            const user = req.user;
            if (isNaN(id)) {
                res.status(400).json({ message: '无效的活动 ID' });
                return;
            }
            if (!user) {
                res.status(401).json({ message: '用户未认证' });
                return;
            }
            const activity = activityService.approve(id, user);
            res.status(200).json({
                message: '审核通过',
                data: activity,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    处理删除活动的请求
     * @access  Private
     */
    public delete(req: Request, res: Response, next: NextFunction): void {
        try {
            const id = parseInt(req.params.id, 10);
            const user = req.user;
            if (!user) {
                res.status(401).json({ message: '用户未认证' });
                return;
            }
            if (isNaN(id)) {
                res.status(400).json({ message: '无效的活动 ID' });
                return;
            }
            activityService.delete(id, user);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    处理活动搜索请求
     * @access  Public
     */
    public search(req: Request, res: Response, next: NextFunction): void {
        try {
            const searchCriteria = req.query as ActivityQueryOptions;
            const activities = activityService.search(searchCriteria);
            res.status(200).json({
                success: true,
                count: activities.length,
                data: activities,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const activityController = new ActivityController();