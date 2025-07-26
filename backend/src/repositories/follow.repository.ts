import db from '../database/database';

export interface Follow {
    id: number;
    user_id: number;
    follow_id: number;
    follow_name: string;
}

export interface FollowCreationData {
    user_id: number;
    follow_id: number;
    follow_name: string;
}

class FollowRepository {
    /**
     * 关注用户
     * @param followData
     * @returns 返回关注信息
     */
    public follow(followData : FollowCreationData) : Follow {
        const sql = `
            INSERT INTO follows (user_id, follow_id, follow_name)
            VALUES (@user_id, @follow_id, @follow_name)
            `;
        const stmt =db.prepare(sql);
        const info = stmt.run(followData);
        const newFollowId = Number(info.lastInsertRowid);
        return {
            id: newFollowId,
            user_id: followData.user_id,
            follow_id: followData.follow_id,
            follow_name: followData.follow_name
        };
    }

    /**
     * 取消关注用户
     * @param id 要删除的 follow ID
     * @returns 返回一个包含变更行数的对象，如果为 0 则表示没有用户被删除
     */
    public deleteById(id: number): { changes: number } {
        const sql = `DELETE FROM follows WHERE id = ?`;
        const stmt = db.prepare(sql);
        const info = stmt.run(id);
        return { changes: info.changes };
    }

    /**
     * 查找某个 follow 关系
     * @param user_id 已登录的用户 ID
     * @param follow_id 被关注的用户 ID
     * @returns 返回 follow，如果为 null 则表示不存在该关系
     */
    public find(user_id : number, follow_id : number): Follow | null {
        const sql = `SELECT * FROM follows WHERE user_id = @user_id AND follow_id = @follow_id`;
        const stmt = db.prepare(sql);
        const row = stmt.get({user_id : user_id, follow_id : follow_id});
        return row ? row as Follow : null;
    }

    /**
     * 获取某个用户的关注列表
     * @param user_id 已登录的用户 ID
     * @returns {Follow[]}
     */
    public findByUserId(user_id : number) : Follow[] {
        const sql =`SELECT * FROM follows WHERE user_id = ?`;
        const stmt = db.prepare(sql);
        const follows = stmt.all(user_id);
        return follows as Follow[];
    }
}

export const followRepository = new FollowRepository();