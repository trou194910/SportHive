import { followRepository, Follow, FollowCreationData } from "../repositories/follow.repository";
import { activityRepository, Activity } from "../repositories/activity.repository";
import { PermissionLevel } from "../types/permission.enum";
import { AppError } from "../middleware/errorHandler";

class FollowService {
    /**
     * 关注用户
     * @param {FollowCreationData} followData
     * @param userPermission 已登录用户的权限
     */
    public async follow(followData : FollowCreationData, userPermission : PermissionLevel) : Promise<Follow> {
        if (PermissionLevel.Banned >= userPermission) {
            throw new AppError('您没有权限关注用户', 403);
        }
        if (followData.follow_id === followData.user_id) {
            throw new AppError('您不能关注自己', 409);
        }
        if (followRepository.find(followData.user_id, followData.follow_id)) {
            throw new AppError('您已关注该用户', 409);
        }
        return followRepository.follow(followData);
    }

    /**
     * 取消关注用户
     * @param userId 已登录的用户 ID
     * @param followId 要取消关注的用户 ID
     */
    public async unfollow(userId : number, followId :number) : Promise<void> {
        const follow = followRepository.find(userId, followId);
        if (!follow) {
            throw new AppError('您还没有关注该用户', 409);
        }
        if (follow.user_id !== userId) {
            throw new AppError('您没有权限删除此关注记录', 403);
        }
        followRepository.deleteById(follow.id);
    }

    /**
     * 获取关注的用户列表
     * @param userId 已登录的用户 ID
     */
    public async findByUserId(userId : number) : Promise<Follow[]> {
        return followRepository.findByUserId(userId);
    }

    /**
     * 判断用户是否关注另一个用户
     * @param userId
     * @param followId
     */
    public async isExist(userId : number, followId : number) : Promise<boolean> {
        return !!followRepository.find(userId, followId);
    }

    /**
     * 获取用户关注的人所发布的活动列表
     * @param userId 已登录用户的 ID
     * @returns 一个活动对象的数组
     */
    public async getActivitiesFromFollows(userId: number): Promise<Activity[]> {
        return activityRepository.findActivitiesFromFollowedUsers(userId);
    }
}

export const followService = new FollowService();