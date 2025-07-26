import db from '../database/database';
import { RegisteredActivity, RegisteredUser, Registration, RegistrationCreationData, registrationRepository } from '../repositories/registration.repository';
import { activityRepository } from '../repositories/activity.repository';
import { User } from '../repositories/user.repository';
import { AppError } from '../middleware/errorHandler';
import { PermissionLevel } from '../types/permission.enum';
import { ActivityCondition } from "../types/condition.enum";

class RegistrationService {
    /**
     * 用户报名活动
     * @param activityId 要报名的活动 ID
     * @param user 发起操作的用户对象
     * @returns 新创建的报名记录
     */
    public registerForActivity(activityId: number, user: User): Registration {
        const activity = activityRepository.findById(activityId);
        if (!activity) {
            throw new AppError('活动不存在', 404);
        }
        if (activity.condition !== ActivityCondition.Recruiting) {
            throw new AppError('该活动当前不可报名', 400);
        }
        if (user.permission < PermissionLevel.Warned) {
            throw new AppError('您的账户权限不足，无法报名活动', 403);
        }
        if (activity.participants >= activity.capacity) {
            throw new AppError('活动报名人数已满', 409);
        }

        const isAlreadyRegistered = registrationRepository.findRegistrationByUserAndActivity(user.id, activityId);
        if (isAlreadyRegistered) {
            throw new AppError('您已报名该活动，请勿重复报名', 409);
        }

        const registrationTx = db.transaction(() => {
            const registrationData: RegistrationCreationData = {
                user_id: user.id,
                user_name: user.name,
                activity_id: activityId,
            };
            const newRegistration = registrationRepository.createRegistration(registrationData);
            activityRepository.incrementParticipants(activityId);
            return newRegistration;
        });

        return registrationTx();
    }

    /**
     * 用户取消报名
     * @param activityId 要取消报名的活动 ID
     * @param user 发起操作的用户对象
     */
    public withdrawFromActivity(activityId: number, user: User): void {
        const registration = registrationRepository.findRegistrationByUserAndActivity(user.id, activityId);
        if (!registration) {
            throw new AppError('您并未报名该活动，无法取消', 404);
        }

        const withdrawalTx = db.transaction(() => {
            registrationRepository.deleteRegistration(user.id, activityId);
            activityRepository.decrementParticipants(activityId); // 假设 activityRepository 有此方法
        });

        withdrawalTx();
    }

    /**
     * 获取某个用户已报名的活动列表
     * @param userId 用户的 ID
     * @returns 该用户报名的活动列表
     */
    public getRegisteredActivitiesByUserId(userId: number): RegisteredActivity[] {
        return registrationRepository.findActivitiesByUserId(userId);
    }

    /**
     * 根据活动ID查找所有报名者信息
     * @param activityId 活动的 ID
     * @returns 报名该活动的用户列表
     */
    public getParticipantsByActivityId(activityId: number): RegisteredUser[] {
        return registrationRepository.findUsersByActivityId(activityId);
    }

    /**
     * 判断是否报名
     * @param userId 用户的 ID
     * @param activityId 活动的 ID
     * @returns true or false
     */
    public isExist(userId: number, activityId : number): boolean {
        return !!registrationRepository.findRegistrationByUserAndActivity(userId, activityId);
    }
}

export const registrationService = new RegistrationService();