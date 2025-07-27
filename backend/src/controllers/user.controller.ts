import {NextFunction, Request, Response} from 'express';
import {userService} from '../services/user.service';
import {UserCreationData} from '../repositories/user.repository';
import {PermissionLevel} from "../types/permission.enum";

class UserController {
    /**
     * 处理用户注册请求
     */
    public async register(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { name, email, password } = req.body;
            if (!name || !email || !password) {
                res.status(400).json({ message: '用户名、邮箱和密码不能为空' });
                return;
            }
            const userData : UserCreationData = {
                name: name,
                email: email,
                password_hash: "",
                permission: PermissionLevel.Standard
            }
            const newUser = await userService.register(userData, password);
            res.status(201).json({
                message: '用户注册成功',
                user: newUser,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * 处理用户登录请求
     */
    public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { identifier, password } = req.body;
            if (!identifier || !password) {
                res.status(400).json({ message: '用户名/邮箱和密码不能为空' });
                return;
            }
            const loginResult = await userService.login({
                identifier,
                password: password,
            });
            res.status(200).json(loginResult);
        } catch (error) {
            next(error);
        }
    }

    /**
     * 处理更新密码请求
     */
    public async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.id;
            const { password, newPassword } = req.body;
            if (!userId) {
                res.status(401).json({ message: '未授权或 Token 无效' });
                return;
            }
            if (!password || !newPassword) {
                res.status(400).json({ message: '密码不能为空' });
                return;
            }
            const user = await userService.updateUser(userId, password, newPassword);
            res.status(200).json({
                message: '用户信息更新成功',
                user: user
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * 处理删除用户请求
     */
    public async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { identifier, password } = req.body;
            if (!identifier || !password) {
                res.status(400).json({ message: '用户名/邮箱和密码不能为空' });
                return;
            }
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ message: '未授权或 Token 无效' });
                return;
            }

            await userService.deleteUser(userId, {identifier, password});
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    /**
     * 处理修改用户权限请求
     */
    public async changePermission(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userPermission = req.user?.permission;
            if (!userPermission) {
                res.status(401).json({ message: '未授权或 Token 无效' });
                return;
            }
            const id = parseInt(req.params.id, 10);
            const { newPermission } = req.body;
            const changedUser = await userService.changePermission(id, newPermission, userPermission);
            res.status(200).json({
                message: "权限修改成功",
                data: changedUser
            })
        } catch (error) {
            next(error);
        }
    }

    /**
     * 处理获取用户列表请求
     */
    public async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userPermission = req.user?.permission;
            if (!userPermission) {
                res.status(401).json({ message: '未授权或 Token 无效' });
                return;
            }
            const users = await userService.findAll(userPermission);
            res.status(200).json(users);
        } catch (error) {
            next(error);
        }
    }

    /**
     * 处理 ID 查找用户请求
     */
    public async findUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = parseInt(req.params.id, 10);
            const user = await userService.findOne(id);
            res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    }
}

export const userController = new UserController();