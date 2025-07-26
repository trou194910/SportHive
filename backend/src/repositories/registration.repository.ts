import db from '../database/database';
import { User } from './user.repository';
import { Activity } from './activity.repository';

export interface Registration {
    id: number;
    user_id: number;
    user_name: string; // 新增字段
    activity_id: number;
    registration_time: string;
}

export interface RegistrationCreationData {
    user_id: number;
    user_name: string;
    activity_id: number;
}

export interface RegisteredActivity extends Activity {
    registration_time: string;
}

export type RegisteredUser = Pick<User, 'id' | 'name' | 'email'>;

class RegistrationRepository {
    /**
     * 创建新报名记录
     * @param data 包含 userId, userName 和 activityId 的对象
     * @returns 新创建的报名记录对象
     */
    public createRegistration(data: RegistrationCreationData): Registration {
        const sql = `
            INSERT INTO registrations (user_id, user_name, activity_id) 
            VALUES (@user_id, @user_name, @activity_id) 
            RETURNING *
            `;
        const stmt = db.prepare(sql);
        const newRegistration = stmt.get(data);
        return newRegistration as Registration;
    }

    /**
     * 删除报名记录
     * @param user_id 报名的用户 ID
     * @param activity_id 报名的活动 ID
     * @returns 包含变更行数的对象
     */
    public deleteRegistration(user_id: number, activity_id: number): { changes: number } {
        const sql = `DELETE FROM registrations WHERE user_id = @user_id AND activity_id = @activity_id`;
        const stmt = db.prepare(sql);
        const info = stmt.run({ user_id, activity_id });
        return { changes: info.changes };
    }

    /**
     * 检查用户是否已报名某个活动
     * @param user_id 报名的用户 ID
     * @param activity_id 报名的活动 ID
     * @returns 如果存在则返回报名记录，否则返回 null
     */
    public findRegistrationByUserAndActivity(user_id: number, activity_id: number): Registration | null {
        const sql = 'SELECT * FROM registrations WHERE user_id = @user_id AND activity_id = @activity_id';
        const stmt = db.prepare(sql);
        const registration = stmt.get({ user_id, activity_id });
        return registration ? (registration as Registration) : null;
    }

    /**
     * 获取某个用户报名的所有活动
     * @param user_id 用户的 ID
     * @returns 用户报名的活动列表
     */
    public findActivitiesByUserId(user_id: number): RegisteredActivity[] {
        const sql = `
            SELECT
                a.*,
                r.registration_time
            FROM registrations AS r
            JOIN activities AS a ON r.activity_id = a.id
            WHERE r.user_id = @user_id
            `;
        const stmt = db.prepare(sql);
        const activities = stmt.all({ user_id });
        return activities as RegisteredActivity[];
    }

    /**
     * 根据活动ID查找所有报名用户的信息
     * @param activity_id 活动的 ID
     * @returns 报名该活动的用户信息列表
     */
    public findUsersByActivityId(activity_id: number): RegisteredUser[] {
        const sql = `
            SELECT
                u.id, u.name, u.email
            FROM registrations AS r
            JOIN users AS u ON r.user_id = u.id
            WHERE r.activity_id = @activity_id
            `;
        const stmt = db.prepare(sql);
        const users = stmt.all({ activity_id });
        return users as RegisteredUser[];
    }
}

export const registrationRepository = new RegistrationRepository();