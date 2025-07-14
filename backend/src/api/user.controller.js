const userService = require('../services/user.service');

class UserController {
    /**
     * 处理用户注册请求
     * @param {object} req 请求对象
     * @param {object} res 响应对象
     */
    async register(req, res) {
        try {
            const { username, email, password } = req.body;
            const user = await userService.register(username, email, password);
            res.status(201).json({
                message: '注册成功！',
                data: user
            });
        } catch (error) {
            console.error('注册过程中捕获到未处理的错误:', error);
            res.status(400).json({
                message: error.message
            })
        }
    }
}

module.exports = new UserController();