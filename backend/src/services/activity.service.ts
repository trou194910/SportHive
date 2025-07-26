import { activityRepository } from '../repositories/activity.repository';
import { User } from '../repositories/user.repository';
import { Activity, ActivityCreationData, ActivityUpdateData, ActivityQueryOptions } from '../repositories/activity.repository';
import { ActivityCondition } from "../types/condition.enum";
import { PermissionLevel } from '../types/permission.enum';
import { AppError } from '../middleware/errorHandler';

export type ActivityCreationPayload = Omit<ActivityCreationData, 'organizer_id' | 'condition'>;

class ActivityService {
    /**
     * 创建一个新活动，包含业务逻辑校验
     * @param {ActivityCreationPayload} activityData - 来自 Controller 的活动数据
     * @param {User} user - 发起创建请求的当前登录用户对象
     * @returns {Activity} 创建成功的活动对象
     */
    public create(activityData: ActivityCreationPayload, user: User): Activity {
        if (user.permission < PermissionLevel.Standard) {
            throw new AppError('您没有创建活动的权限', 403);
        }
        if (new Date(activityData.start_time) >= new Date(activityData.end_time)) {
            throw new AppError('活动结束时间必须晚于开始时间', 400);
        }
        if (new Date(activityData.start_time) <= new Date()) {
            throw new AppError('活动开始时间必须在未来', 400);
        }
        const initialCondition = user.permission > PermissionLevel.Standard
            ? ActivityCondition.Recruiting
            : ActivityCondition.Pending;
        const fullActivityData: ActivityCreationData = {
            ...activityData,
            organizer_id: user.id,
            condition: initialCondition,
        };
        return activityRepository.create(fullActivityData, user.name);
    }

    /**
     * 获取所有活动列表
     * @returns {Activity[]} 活动对象数组
     */
    public findAll(): Activity[] {
        return activityRepository.findAll();
    }

    /**
     * 根据 ID 获取单个活动的详细信息
     * @param {number} id - 活动的 ID
     * @returns {Activity} 活动对象
     * @throws {AppError} 如果活动未找到，则抛出 404 错误
     */
    public findById(id: number): Activity {
        const activity = activityRepository.findById(id);
        if (!activity) {
            throw new AppError('活动未找到', 404);
        }
        return activity;
    }

    /**
     * 获取指定用户创建的所有活动
     * @param {number} organizerId - 组织者的用户 ID
     * @returns {Activity[]} 活动对象数组
     */
    public findByOrganizerId(organizerId: number): Activity[] {
        return activityRepository.findByOrganizerId(organizerId);
    }

    /**
     * 更新一个已存在的活动
     * @param {number} activityId - 要更新的活动的 ID
     * @param {ActivityUpdateData} updateData - 包含要更新字段的对象
     * @param {User} user - 执行操作的当前登录用户
     * @returns {Activity} 更新后的活动对象
     */
    public update(activityId: number, updateData: ActivityUpdateData, user: User): Activity {
        const activity = this.findById(activityId);
        if (activity.organizer_id !== user.id) {
            throw new AppError('您没有权限修改此活动', 403);
        }
        updateData.condition = user.permission > PermissionLevel.Standard
            ? ActivityCondition.Recruiting
            : ActivityCondition.Pending;
        const updatedActivity = activityRepository.updateById(activityId, updateData);
        if (!updatedActivity) {
            throw new AppError('活动更新失败', 500);
        }
        return updatedActivity;
    }

    /**
     * (管理员) 通过一个活动的审核
     * @param {number} activityId - 要审核的活动的 ID
     * @param {User} user - 执行操作的管理员
     * @returns {Activity} 状态更新后的活动对象
     */
    public approve(activityId: number, user: User): Activity {
        if (user.permission < PermissionLevel.Manager) {
            throw new AppError('您没有审核活动的权限', 403);
        }
        const activity = this.findById(activityId);
        if (activity.condition !== ActivityCondition.Pending) {
            throw new AppError('该活动当前状态无法被审核', 409);
        }
        const passedActivity = activityRepository.setStatusToRecruiting(activityId);
        if (!passedActivity) {
            throw new AppError('活动审核失败', 500);
        }
        return passedActivity;
    }

    /**
     * 删除一个活动。
     * @param {number} activityId - 要删除的活动的 ID。
     * @param {User} user - 执行操作的当前登录用户。
     */
    public delete(activityId: number, user: User): void {
        const activity = this.findById(activityId);
        if (activity.organizer_id !== user.id && user.permission < PermissionLevel.Manager) {
            throw new AppError('您没有权限删除此活动', 403);
        }
        const success = activityRepository.deleteById(activityId);
        if (!success) {
            throw new AppError('活动删除失败', 500);
        }
    }

    /**
     * 根据条件搜索活动。
     * @param {ActivityQueryOptions} searchCriteria - 搜索条件对象。
     * @returns {Activity[]} 匹配的活动对象数组。
     */
    public search(searchCriteria: ActivityQueryOptions): Activity[] {
        return activityRepository.findByQuery(searchCriteria);
    }
}

export const activityService = new ActivityService();