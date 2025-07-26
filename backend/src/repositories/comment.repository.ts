import db from '../database/database';

export interface ActivityComment {
    id: number;
    activity_id: number;
    activity_name: string;
    user_id: number;
    user_name: string;
    content: string;
    created_at: string;
    updated_at: string;
}

export interface CommentCreationData {
    activity_id: number;
    activity_name: string;
    user_id: number;
    user_name: string;
    content: string;
}

class CommentRepository {
    /**
     * 在数据库中创建一条新评论
     * @param data 一个包含所有必要评论数据的对象
     * @returns 新创建的评论对象
     */
    public createComment(data: CommentCreationData): ActivityComment {
        const sql = `
            INSERT INTO activity_comments (activity_id, activity_name, user_id, user_name, content)
            VALUES (@activity_id, @activity_name, @user_id, @user_name, @content)
            RETURNING *
        `;
        const stmt = db.prepare(sql);
        const newComment = stmt.get(data);
        return newComment as ActivityComment;
    }

    /**
     * 通过主键 ID 查找单条评论
     * @param id 要查找的评论 ID
     * @returns 如果找到则返回评论对象，否则返回 null
     */
    public findCommentById(id: number): ActivityComment | null {
        const sql = 'SELECT * FROM activity_comments WHERE id = @id';
        const stmt = db.prepare(sql);
        const comment = stmt.get({ id });
        return comment ? (comment as ActivityComment) : null;
    }

    /**
     * 查找某个特定活动下的所有评论
     * @param activity_id 活动的 ID
     * @returns 一个评论对象的数组，按创建时间升序排列
     */
    public findCommentsByActivityId(activity_id: number): ActivityComment[] {
        const sql = 'SELECT * FROM activity_comments WHERE activity_id = @activity_id ORDER BY created_at';
        const stmt = db.prepare(sql);
        const comments = stmt.all({ activity_id });
        return comments as ActivityComment[];
    }

    /**
     * 查找某个特定用户发表的所有评论
     * @param user_id 用户的 ID
     * @returns 一个评论对象的数组，按创建时间降序排列
     */
    public findCommentsByUserId(user_id: number): ActivityComment[] {
        const sql = 'SELECT * FROM activity_comments WHERE user_id = @user_id ORDER BY created_at DESC';
        const stmt = db.prepare(sql);
        const comments = stmt.all({ user_id });
        return comments as ActivityComment[];
    }

    /**
     * 通过 ID 更新一条已存在评论的内容
     * @param id 要更新的评论 ID
     * @param content 评论的新内容
     * @returns 更新后的评论对象，如果 ID 不存在则返回 null
     */
    public updateCommentById(id: number, content: string): ActivityComment | null {
        const sql = `
            UPDATE activity_comments
            SET content = @content, updated_at = CURRENT_TIMESTAMP
            WHERE id = @id
            RETURNING *
        `;
        const stmt = db.prepare(sql);
        const updatedComment = stmt.get({ id, content });
        return updatedComment ? (updatedComment as ActivityComment) : null;
    }

    /**
     * 通过 ID 从数据库中删除一条评论
     * @param id 要删除的评论 ID
     * @returns 一个包含变更行数（0 或 1）的对象
     */
    public deleteCommentById(id: number): { changes: number } {
        const sql = 'DELETE FROM activity_comments WHERE id = @id';
        const stmt = db.prepare(sql);
        const info = stmt.run({ id });
        return { changes: info.changes };
    }
}

export const commentRepository = new CommentRepository();