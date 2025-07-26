import db from '../database/database';
import { PermissionLevel } from "../types/permission.enum";

export interface User {
    id: number;
    name: string;
    email: string;
    permission: PermissionLevel;
}

export interface UserWithPassword {
    id: number;
    name: string;
    email: string;
    permission: PermissionLevel;
    password_hash: string;
}

export interface UserCreationData {
    name: string;
    email: string;
    password_hash: string;
    permission: PermissionLevel;
}

class UserRepository {
    /**
     * 通过用户名查找用户
     * @param name 用户名
     * @returns 用户对象或 null
     */
    public findByName(name: string): User | null {
        const sql = `SELECT id, name, email, permission FROM users WHERE name = ?`;
        const stmt = db.prepare(sql);
        const user = stmt.get(name);
        return user ? (user as User) : null;
    }

    /**
     * 通过邮箱查找用户
     * @param email 邮箱地址
     * @returns 用户对象或 null
     */
    public findByEmail(email: string): User | null {
        const sql = `SELECT id, name, email, permission FROM users WHERE email = ?`;
        const stmt = db.prepare(sql);
        const user = stmt.get(email);
        return user ? (user as User) : null;
    }

    /**
     * 通过用户名或邮箱查找用户，并包含密码哈希
     * @param identifier 用户名或邮箱
     * @returns 包含密码哈希的完整用户对象或 null
     */
    public findForAuth(identifier: string): UserWithPassword | null {
        const sql = 'SELECT * FROM users WHERE name = ? OR email = ?';
        const stmt = db.prepare(sql);
        const user = stmt.get(identifier, identifier);
        return user ? (user as UserWithPassword) : null;
    }

    /**
     * 通过 ID 查找用户
     * @param id 邮箱地址
     * @returns 包含密码哈希的完整用户对象或 null
     */
    public findById(id: number): UserWithPassword | null {
        const sql = `SELECT * FROM users WHERE id = ?`;
        const stmt = db.prepare(sql);
        const user = stmt.get(id);
        return user ? (user as UserWithPassword) : null;
    }

    /**
     * 创建一个新用户
     * @param userData 包含加密后密码的用户数据
     * @returns 新创建用户的完整信息
     */
    public create(userData: UserCreationData): User {
        const sql = `
            INSERT INTO users (name, email, password_hash, permission)
            VALUES (@name, @email, @password_hash, @permission)
            `;
        const stmt = db.prepare(sql);
        const info = stmt.run(userData);
        const newUserId = Number(info.lastInsertRowid);
        return {
            id: newUserId,
            name: userData.name,
            email: userData.email,
            permission: userData.permission,
        };
    }

    /**
     * 通过 ID 更新用户信息
     * @param id 用户 ID
     * @param password_hash 要更新的密码
     * @returns 返回更新后的用户信息
     */
    public updateById(id: number, password_hash : string): User {
        const sql = `UPDATE users SET password_hash = @password_hash WHERE id = @id RETURNING *`;
        const stmt = db.prepare(sql);
        const user = stmt.get({password_hash, id});
        return user as User;
    }

    /**
     * 通过 ID 修改用户权限
     * @param id 用户 ID
     * @param permission
     * @returns 返回更新后的用户信息
     */
    public changePermission(id: number, permission: PermissionLevel): User {
        const sql = `UPDATE users SET permission = @permission WHERE id = @id RETURNING *`;
        const stmt = db.prepare(sql);
        const user = stmt.get({permission, id});
        return user as User;
    }

    /**
     * 查看用户列表
     * @returns 返回一个列表，包含所有用户信息
     */
    public findAll() : User[] {
        const sql = `SELECT id, name, email, permission FROM users ORDER BY id`;
        const stmt = db.prepare(sql);
        return stmt.all() as User[];
    }

    /**
     * 通过 ID 删除用户
     * @param id 要删除的用户 ID
     * @returns 返回一个包含变更行数的对象，如果为 0 则表示没有用户被删除
     */
    public deleteById(id: number): { changes: number } {
        const sql = 'DELETE FROM users WHERE id = ?';
        const stmt = db.prepare(sql);
        const info = stmt.run(id);
        return { changes: info.changes };
    }
}

export const userRepository = new UserRepository();