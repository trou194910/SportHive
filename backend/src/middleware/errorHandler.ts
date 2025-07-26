import { Request, Response, NextFunction } from 'express';

/**
 * 自定义应用错误类
 * @param message 错误信息
 * @param statusCode HTTP 状态码
 */
export class AppError extends Error {
    public statusCode: number;
    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * 全局错误处理中间件
 */
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${err.stack || err.message}`);
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            message: err.message
        });
    }
    const message = process.env.NODE_ENV === 'production'
        ? '服务器发生了一个内部错误'
        : err.message;
    return res.status(500).json({
        message: message
    });
};