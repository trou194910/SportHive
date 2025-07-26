import { NextFunction, Request, Response } from "express";
import { registrationService } from "../services/registration.service";
import { User } from "../repositories/user.repository"; // 导入 User 类型

class RegistrationController {
    /**
     * 处理用户报名活动的请求。
     */
    public register(req: Request, res: Response, next: NextFunction): void {
        try {
            const user = req.user as User;
            if (!user) {
                res.status(401).json({ message: '未授权或 Token 无效' });
                return;
            }
            const activityId = parseInt(req.params.id, 10);
            const newRegistration = registrationService.registerForActivity(activityId, user);
            res.status(201).json({
                message: '报名成功',
                data: newRegistration
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * 处理用户取消报名活动的请求。
     */
    public withdraw(req: Request, res: Response, next: NextFunction): void {
        try {
            const user = req.user as User;
            if (!user) {
                res.status(401).json({ message: '未授权或 Token 无效' });
                return;
            }
            const activityId = parseInt(req.params.id, 10);
            registrationService.withdrawFromActivity(activityId, user);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    /**
     * 处理获取某个用户已报名活动列表的请求。
     */
    public getRegisteredActivities(req: Request, res: Response, next: NextFunction): void {
        try {
            const user = req.user as User;
            if (!user) {
                res.status(401).json({ message: '未授权或 Token 无效' });
                return;
            }
            const activities = registrationService.getRegisteredActivitiesByUserId(user.id);
            res.status(200).json(activities);
        } catch (error) {
            next(error);
        }
    }

    /**
     * 处理根据活动ID查找所有报名用户的信息的请求。
     */
    public findUsersByActivityId(req: Request, res: Response, next: NextFunction): void {
        try {
            const activityId = parseInt(req.params.id, 10);
            const users = registrationService.getParticipantsByActivityId(activityId);
            res.status(200).json(users);
        } catch (error) {
            next(error);
        }
    }

    /**
     * 处理判断用户是否已报名某个活动的请求。
     */
    public isExist(req: Request, res: Response, next: NextFunction): void {
        try {
            const user = req.user as User;
            if (!user) {
                res.status(401).json({ message: '未授权或 Token 无效' });
                return;
            }
            const activityId = parseInt(req.params.id, 10);
            const hasRegistered = registrationService.isExist(user.id, activityId);
            res.status(200).json({ isRegistered: hasRegistered });
        } catch (error) {
            next(error);
        }
    }
}

export const registrationController = new RegistrationController();