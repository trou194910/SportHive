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
        // 检查用户名和邮箱是否存在
        if (await userRepository.findUserByUsername(username))
            throw new Error('用户名已存在');
        if (await userRepository.findUserByEmail(email))
            throw new Error('邮箱已被注册');

        //密码加密存储
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        return await userRepository.createUser(username, email, passwordHash);
    }

    /**
     *
     * @param {string} str 可能是用户名，也可能是邮箱
     * @param {string} password
     * @returns {Promise<object>}
     */
    async login(str, password) {
        let user;
        if (str.includes("@")) {
            user = await userRepository.findUserByEmail(str);
            if (!user) {
                throw new Error('邮箱不存在');
            }
        } else {
            user = await userRepository.findUserByUsername(str);
            if (!user) {
                throw new Error('用户名不存在');
            }
        }

        const isMatch = await bcrypt.compare(password, user.passwordhash);
        if (!isMatch) {
            throw new Error('密码错误');
        }

        const payload = {
            id: user.id,
            username: user.username,
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
            },
        };
    }
}

module.exports = new UserService();