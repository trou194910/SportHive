import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.resolve(__dirname, '..', '..', 'SportHive.db');
const schemaPath = path.join(__dirname, 'schema.sql');
const db = new Database(dbPath, { verbose: console.log });

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

try {
  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schema);
  console.log('数据库已成功连接并初始化 Schema。');
} catch (error) {
  console.error('初始化数据库失败:', error);
}

export default db;
