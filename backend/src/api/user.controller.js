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

    /**
     * 处理用户登录请求
     * @param {object} req 请求对象
     * @param {object} res 响应对象
     */
    async login(req, res) {
        try {
            const { str, password } = req.body;
            if (!str || !password) {
                return res.status(400).json({
                    message: '用户名和密码不能为空'
                });
            }
            const user = await userService.login(str, password);
            res.status(200).json(user);
        } catch (error) {
            res.status(401).json({
                message: error.message
            });
        }
    }

    /**
     * 处理用户删除请求
     * @param {object} req 请求对象
     * @param {object} res 响应对象
     */
    async deleteUser(req, res) {
        try {
            const { username, password } = req.body;
            const loggedUser = req.user;
            if (!username || !password) {
                return res.status(400).json({ message: '请输入用户名和密码以确认删除操作' });
            }
            await userService.deleteUser(username, password, loggedUser);
            res.status(200).json({
                message: '删除成功'
            })
        } catch (error) {
            return res.status(403).json({
                message: error.message
            })
        }
    }
}

module.exports = new UserController();