const userRepository = require('../repositories/user.repository')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class UserService {
    /**
     * 用户注册
     * @param {string} username
     * @param {string} email
     * @param {string} password
     */
    async register(username, email, password) {
        if (!/^[a-zA-Z0-9_]*$/.test(username)) {
            const error = new Error('用户名只能由字母、数字和下划线组成');
            error.statusCode = 403;
            throw error;
        }
        if (!/^[a-zA-Z0-9_]+@[a-zA-Z0-9_.-]+\.[a-zA-Z0-9]{2,}$/.test(email)) {
            const error = new Error('请输入正确的邮箱');
            error.statusCode = 403;
            throw error;
        }
        if (await userRepository.findUserByUsername(username)) {
            const error = new Error('用户名已存在');
            error.statusCode = 409;
            throw error;
        }
        if (await userRepository.findUserByEmail(email)) {
            const error = new Error('邮箱已被注册');
            error.statusCode = 409;
            throw error;
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        return await userRepository.createUser(username, email, passwordHash);
    }

    /**
     * 用户登录
     * @param {string} str 可能是用户名，也可能是邮箱
     * @param {string} password
     * @returns {Promise<object>}
     */
    async login(str, password) {
        let user;
        if (str.includes("@")) {
            user = await userRepository.findUserByEmail(str);
            if (!user) {
                const error = new Error('邮箱不存在');
                error.statusCode = 404;
                throw error;
            }
        } else {
            user = await userRepository.findUserByUsername(str);
            if (!user) {
                const error = new Error('用户名不存在');
                error.statusCode = 404;
                throw error;
            }
        }

        const isMatch = await bcrypt.compare(password, user.passwordhash);
        if (!isMatch) {
            const error = new Error('密码错误');
            error.statusCode = 401;
            throw error;
        }

        const payload = {
            id: user.id,
            username: user.username,
            permission: user.permission
        };
        const secret = process.env.JWT_SECRET;
        const token = jwt.sign(payload, secret, {
            expiresIn: '1h',
        });

        return {
            message: '登陆成功',
            token: token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                permission: user.permission
            },
        };
    }

    /**
     * 用户删除
     * @param {string} username
     * @param {string} password
     * @param {object} loggedUser
     * @returns {Promise<void>}
     */
    async deleteUser(username, password, loggedUser) {
        if (loggedUser.username !== username) {
            const error = new Error('无法删除他人账号');
            error.statusCode = 403;
            throw error;
        }
        const user = await userRepository.findUserByUsername(username);
        if (!user) {
            const error = new Error('用户不存在');
            error.statusCode = 404;
            throw error;
        }

        const isMatch = await bcrypt.compare(password, user.passwordhash);
        if (!isMatch) {
            const error = new Error('密码错误');
            error.statusCode = 401;
            throw error;
        }
        await userRepository.deleteUserByUsername(username);
    }
}

module.exports = new UserService();