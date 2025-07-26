/**
 * 用户权限枚举
 * 1: 被封禁的用户，只能查看，无法进行其他任何操作
 * 2: 被警告的用户，无法发布活动
 * 3: 标准用户，这是新用户注册后的默认等级
 * 4: 管理员，拥有管理活动、管理用户等权限
 * 5: 超级管理员，拥有管理用户、管理管理员、系统设置等所有权限
 */
export enum PermissionLevel {
    Banned = 1,
    Warned = 2,
    Standard = 3,
    Manager = 4,
    Administrator = 5,
}