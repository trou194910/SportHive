import db from '../database/database';
import {ActivityCondition} from "../types/condition.enum";

export interface Activity {
    id: number;
    name: string;
    condition: ActivityCondition;
    type: string | null;
    description: string | null;
    location: string | null;
    start_time: string; // ISO 8601 string
    end_time: string; // ISO 8601 string
    capacity: number;
    organizer_id: number;
    organizer_name: string;
    created_at: string;
    updated_at: string;
    participants: number;
}

export type ActivityCreationData = Omit<Activity, 'id' | 'created_at' | 'updated_at' | 'participants' | 'organizer_name'>;

export type ActivityUpdateData = Partial<Pick<Activity, 'name' | 'type' | 'description' | 'location' | 'start_time' | 'end_time' | 'capacity' | 'condition'>>;

export interface ActivityQueryOptions {
    searchText?: string;
    name?: string;
    description?: string;
    type?: string;
}

class ActivityRepository {
    /**
     * 创建新活动
     * @param {ActivityCreationData} data - 包含新活动基本信息的对象
     * @param {string} organizerName - 组织者的名称，将被一同存入记录
     * @returns {Activity} 创建成功后返回完整的活动对象
     */
    public create(data: ActivityCreationData, organizerName: string): Activity {
        const sql = `
            INSERT INTO activities (
                name, "condition", type, description, location, start_time, end_time, capacity, organizer_id, organizer_name
            ) VALUES (
                @name, @condition, @type, @description, @location, @start_time, @end_time, @capacity, @organizer_id, @organizer_name
            ) RETURNING *
            `;
        const stmt = db.prepare(sql);
        const newActivity = stmt.get({ ...data, organizer_name: organizerName });
        return newActivity as Activity;
    }

    /**
     * 查找所有活动
     * @returns {Activity[]} 包含所有活动对象的数组，按开始时间降序排列
     */
    public findAll(): Activity[] {
        const sql = 'SELECT * FROM activities ORDER BY start_time DESC';
        const stmt = db.prepare(sql);
        return stmt.all() as Activity[];
    }

    /**
     * 通过 ID 查找活动
     * @param {number} id - 要查找的活动的唯一 ID
     * @returns {Activity | null} 如果找到，返回活动对象；否则返回 null
     */
    public findById(id: number): Activity | null {
        const sql = 'SELECT * FROM activities WHERE id = ?';
        const stmt = db.prepare(sql);
        const activity = stmt.get(id);
        return activity ? (activity as Activity) : null;
    }

    /**
     * 通过 organizerId 查找其发布的所有活动
     * @param {number} organizerId - 组织者的用户 ID
     * @returns {Activity[]} 包含该组织者所有活动对象的数组
     */
    public findByOrganizerId(organizerId: number): Activity[] {
        const sql = 'SELECT * FROM activities WHERE organizer_id = ? ORDER BY start_time DESC';
        const stmt = db.prepare(sql);
        return stmt.all(organizerId) as Activity[];
    }

    /**
     * 通过 ID 更新活动内容
     * @param {number} id - 要更新的活动的 ID
     * @param {ActivityUpdateData} data - 包含要更新字段的对象
     * @returns {Activity | null} 更新成功后返回更新后的活动对象；如果未找到则返回 null
     */
    public updateById(id: number, data: ActivityUpdateData): Activity | null {
        const sql = `
            UPDATE activities
            SET name = @name,
                type = @type,
                description = @description,
                location = @location,
                start_time = @start_time,
                end_time = @end_time,
                capacity = @capacity,
                "condition" = @condition
            WHERE id = @id
            RETURNING *
            `;
        const stmt = db.prepare(sql);
        const updatedActivity = stmt.get({ id, ...data });
        return updatedActivity ? (updatedActivity as Activity) : null;
    }

    /**
     * 通过活动审核，将状态更新为 “ 招募中 ”
     * @param {number} id - 活动的 ID
     * @returns {Activity | null} 更新成功后返回活动对象；如果未找到则返回 null
     */
    public setStatusToRecruiting(id: number): Activity | null {
        const sql = `UPDATE activities SET "condition" = ? WHERE id = ? RETURNING *`;
        const stmt = db.prepare(sql);
        const activity = stmt.get(ActivityCondition.Recruiting, id);
        return activity ? (activity as Activity) : null;
    }

    /**
     * 通过 ID 增加参与人数
     * @param {number} id - 活动的 ID。
     * @returns {Activity | null} 更新成功后返回活动对象；如果未找到则返回 null
     */
    public incrementParticipants(id: number): Activity | null {
        const sql = 'UPDATE activities SET participants = participants + 1 WHERE id = ? RETURNING *';
        const stmt = db.prepare(sql);
        const activity = stmt.get(id);
        return activity ? (activity as Activity) : null;
    }

    /**
     * 通过 ID 减少参与人数
     * @param {number} id - 活动的 ID
     * @returns {Activity | null} 更新成功后返回活动对象；如果未找到则返回 null
     */
    public decrementParticipants(id: number): Activity | null {
        const sql = 'UPDATE activities SET participants = participants - 1 WHERE id = ? AND participants > 0 RETURNING *';
        const stmt = db.prepare(sql);
        const activity = stmt.get(id);
        return activity ? (activity as Activity) : null;
    }

    /**
     * 通过 ID 删除活动
     * @param {number} id - 要删除的活动的 ID
     * @returns {boolean} 返回删除是否成功
     */
    public deleteById(id: number): boolean {
        const sql = 'DELETE FROM activities WHERE id = ?';
        const stmt = db.prepare(sql);
        const info = stmt.run(id);
        return info.changes > 0;
    }

    /**
     * 获取某个用户关注的用户发布的活动列表
     * @param user_id 已登录用户的 ID
     * @returns {Activity[]} 一个活动列表，按开始时间降序排列
     */
    public findActivitiesFromFollowedUsers(user_id: number): Activity[] {
        const sql = `
            SELECT a.* 
            FROM activities AS a
            JOIN follows AS f ON a.organizer_id = f.follow_id
            WHERE f.user_id = @user_id
            ORDER BY a.start_time DESC
            `;
        const stmt = db.prepare(sql);
        const activities = stmt.all({ user_id });
        return activities as Activity[];
    }

    /**
     * 根据动态查询条件查找活动
     * @param {ActivityQueryOptions} options - 包含查询条件的对, 如 searchText, name, type 等
     * @returns {Activity[]} 返回匹配查询条件的活动数组
     */
    public findByQuery(options: ActivityQueryOptions): Activity[] {
        const { searchText, name, description, type } = options;
        let baseQuery = 'SELECT * FROM activities';
        const conditions: string[] = [];
        const params: (string | number)[] = [];
        if (searchText) {
            conditions.push(`(name LIKE ? OR description LIKE ?)`);
            params.push(`%${searchText}%`, `%${searchText}%`);
        }
        if (name && !searchText) {
            conditions.push(`name LIKE ?`);
            params.push(`%${name}%`);
        }
        if (description && !searchText) {
            conditions.push(`description LIKE ?`);
            params.push(`%${description}%`);
        }
        if (type) {
            conditions.push(`type = ?`);
            params.push(type);
        }

        if (conditions.length > 0) {
            baseQuery += ' WHERE ' + conditions.join(' AND ');
        }
        baseQuery += ' ORDER BY start_time DESC';

        const stmt = db.prepare(baseQuery);
        return stmt.all(...params) as Activity[];
    }

    /**
     * [自动任务] 更新所有已过期的活动状态为“已结束”
     * @returns 返回被更新的行数
     */
    public updateExpiredActivities(): number {
        const sql = `
            UPDATE activities 
            SET "condition" = ? 
            WHERE start_time < datetime('now') AND "condition" != ?
            `;
        const stmt = db.prepare(sql);
        const info = stmt.run(ActivityCondition.Finished, ActivityCondition.Finished);
        return info.changes;
    }
}

export const activityRepository = new ActivityRepository();