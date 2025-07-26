import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {User, UserCreationData, userRepository} from '../repositories/user.repository';
import {AppError} from '../middleware/errorHandler';
import {PermissionLevel} from '../types/permission.enum';

interface LoginCredentials {
    identifier: string;
    password: string;
}

// 定义登录成功后返回的数据结构
interface LoginResponse {
    token: string;
    user: User;
}

class UserService {
    /**
     * 处理用户注册逻辑
     * @param userData 用户信息
     * @param password 明文密码
     * @returns 用户信息的对象
     */
    public async register(userData: UserCreationData, password: string): Promise<User> {
        if (password.length < 8)
            throw new AppError('密码过短', 400);
        if (!/^[a-zA-Z0-9_]*$/.test(userData.name))
            throw new AppError('用户名只能由字母、数字和下划线组成', 400);
        if (!/^[a-zA-Z0-9_]+@[a-zA-Z0-9_.-]+\.[a-zA-Z0-9]{2,}$/.test(userData.email))
            throw new AppError('请输入正确的邮箱', 400);
        if (userRepository.findByName(userData.name))
            throw new AppError('用户名已存在', 409);
        if (userRepository.findByEmail(userData.email))
            throw new AppError('邮箱已被注册', 409);

        userData.password_hash = await bcrypt.hash(password, 10);
        return userRepository.create(userData);
    }

    /**
     * 处理用户登录逻辑
     * @param credentials 包含用户名/邮箱和明文密码
     * @returns 包含 JWT 和用户信息的对象
     */
    public async login(credentials: LoginCredentials): Promise<LoginResponse> {
        const { identifier, password } = credentials;
        const user = userRepository.findForAuth(identifier);
        if (!user) {
            throw new AppError('认证失败: 用户名或密码错误', 401);
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordMatch) {
            throw new AppError('认证失败: 用户名或密码错误', 401);
        }

        const payload = {
            id: user.id,
            name: user.name,
            email: user.email,
            permission: user.permission,
        };
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new AppError('服务器配置错误: JWT 秘钥未设置', 500);
        }

        const token = jwt.sign(payload, secret, { expiresIn: '10d' });
        const userToReturn: User = {
            id: user.id,
            name: user.name,
            email: user.email,
            permission: user.permission,
        };
        return { token, user: userToReturn };
    }

    /**
     * 更新用户信息
     * @param userId 要更新的用户 ID
     * @param password 旧密码
     * @param newPassword 新密码
     */
    public async updateUser(userId: number, password : string, newPassword : string): Promise<User> {
        const user = userRepository.findById(userId);
        if (!user) {
            throw new AppError('用户不存在', 409);
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordMatch) {
            throw new AppError('认证失败: 用户名或密码错误', 401);
        }
        if (newPassword.length < 8) {
            throw new AppError('密码过短', 400);
        }
        const newPassWordHash = await bcrypt.hash(newPassword, 10);
        return userRepository.updateById(userId, newPassWordHash);
    }

    /**
     * 删除一个指定用户
     * @param id 要删除的用户 ID
     * @param userData 用来确认的信息
     */
    public async deleteUser(id: number, userData : LoginCredentials): Promise<void> {
        const user = userRepository.findById(id);
        if (!user) {
            throw new AppError('用户不存在', 409);
        }
        const isIdentifierMatch = user.name === userData.identifier || user.email === userData.identifier;
        const isPasswordMatch = await bcrypt.compare(userData.password, user.password_hash);
        if (!isPasswordMatch || !isIdentifierMatch) {
            throw new AppError('用户名或密码错误', 401);
        }
        userRepository.deleteById(id);
    }

    /**
     * 修改用户权限
     * @param id 要修改的用户 ID
     * @param permission 新权限
     * @param userPermission 已登录的用户的权限
     */
    public async changePermission(id : number, permission : PermissionLevel, userPermission : PermissionLevel): Promise<User> {
        if (!userRepository.findById(id)) {
            throw new AppError('用户不存在', 409);
        }
        if (userPermission < PermissionLevel.Manager || permission >= userPermission) {
            throw new AppError('您没有权限完成该权限修改', 403);
        }
        return userRepository.changePermission(id, permission);
    }

    /**
     * 获取用户列表
     * @param userPermission 已登录的用户的权限
     * @returns 用户信息对象列表
     */
    public async findAll(userPermission : PermissionLevel) : Promise<User[]> {
        if (userPermission < PermissionLevel.Manager) {
            throw new AppError('您没有权限查看用户列表', 403);
        }
        return userRepository.findAll();
    }

    /**
     * 通过 ID 查找用户
     * @param id 需查找的用户 ID
     */
    public async findOne(id: number) : Promise<User> {
        const user = userRepository.findById(id);
        if (!user) {
            throw new AppError('用户不存在', 409);
        }
        return user;
    }
}

export const userService = new UserService();