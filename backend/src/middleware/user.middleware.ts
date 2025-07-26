import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';
import { PermissionLevel } from '../types/permission.enum';

// 定义 JWT payload 的类型接口，与生成 token 时使用的 payload 保持一致
interface JwtPayload {
    id: number;
    name: string;
    email: string;
    permission: PermissionLevel;
}

/**
 * 身份验证中间件
 * 检查请求头中是否包含有效的 JWT
 */
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new AppError('未提供认证令牌', 401));
    }

    const token = authHeader.split(' ')[1]; // 提取 'Bearer ' 后面的 token 部分

    try {
        const secret = process.env.JWT_SECRET || 'just_it';
        const decodedPayload = jwt.verify(token, secret) as JwtPayload;
        req.user = {
            id: decodedPayload.id,
            name: decodedPayload.name,
            permission: decodedPayload.permission,
        };
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return next(new AppError('无效的认证令牌', 401));
        }
        return next(error);
    }
};