const userRepository = require('../repositories/user.repository')
const bcrypt = require('bcryptjs');

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
}

module.exports = new UserService();