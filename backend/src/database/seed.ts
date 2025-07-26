import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import { PermissionLevel } from '../types/permission.enum';

const ADMIN_NAME = 'admin';
const ADMIN_EMAIL = 'admin@sporthive.com';
const ADMIN_PASSWORD = 'password';

const dbPath = path.resolve(__dirname, '..', '..', 'SportHive.db');
const db = new Database(dbPath, { verbose: console.log });
console.log('🌱 开始播种超级管理员用户...');
const existingUser = db.prepare('SELECT id FROM users WHERE name = ? OR email = ?')
    .get(ADMIN_NAME, ADMIN_EMAIL);
if (existingUser) {
    console.log('🟡 超级管理员用户已存在，跳过创建。');
    process.exit(0);
}

bcrypt.hash(ADMIN_PASSWORD, 10)
    .then(hashedPassword => {
        const sql = `
            INSERT INTO users (name, email, password_hash, permission)
            VALUES (@name, @email, @password_hash, @permission)
        `;
        const stmt = db.prepare(sql);

        try {
            stmt.run({
                name: ADMIN_NAME,
                email: ADMIN_EMAIL,
                password_hash: hashedPassword,
                permission: PermissionLevel.Administrator,
            });
            console.log('✅ 超级管理员用户创建成功！');
            console.log(`   - 用户名: ${ADMIN_NAME}`);
            console.log(`   - 密  码: ${ADMIN_PASSWORD}`);
        } catch (error) {
            console.error('❌ 创建超级管理员时发生错误:', error);
            process.exit(1);
        }
    })
    .catch(err => {
        console.error('❌ 密码加密失败:', err);
        process.exit(1);
    });