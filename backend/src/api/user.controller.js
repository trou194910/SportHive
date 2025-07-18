const userService = require('../services/user.service');

class UserController {
    /**
     * 处理用户注册请求
     * @param {object} req 请求对象
     * @param {object} res 响应对象
     * @param {function} next 错误处理
     */
    async register(req, res, next) {
        try {
            const { username, email, password } = req.body;
            const user = await userService.register(username, email, password);
            res.status(201).json({
                message: '注册成功！',
                data: user
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * 处理用户登录请求
     * @param {object} req 请求对象
     * @param {object} res 响应对象
     * @param {function} next 错误处理
     */
    async login(req, res, next) {
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
            next(error);
        }
    }

    /**
     * @param {object} req 请求对象
     * @param {object} res 响应对象
     * @param {function} next 错误处理
     */
    async changePermission(req, res, next) {
        try {
            const loggedUser = req.user;
            const userId = req.params.id;
            const { newPermission } = req.body;
            const changedUser = await userService.changPermission(Number(userId), Number(newPermission), loggedUser);
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
     * @param {object} req 请求对象
     * @param {object} res 响应对象
     * @param {function} next 错误处理
     */
    async getAllUsers(req, res, next) {
        try {
            const loggedUsers = req.user;
            const users = await userService.getAllUsers(loggedUsers);
            res.status(200).json(users);
        } catch (error) {
            next(error);
        }
    }

    /**
     * 处理用户删除请求
     * @param {object} req 请求对象
     * @param {object} res 响应对象
     * @param {function} next 错误处理
     */
    async deleteUser(req, res, next) {
        try {
            const { username, password } = req.body;
            const loggedUser = req.user;
            if (!username || !password) {
                return res.status(400).json({
                    message: '请输入用户名和密码以确认删除操作'
                });
            }
            await userService.deleteUser(username, password, loggedUser);
            res.status(204).json({
                message: '删除成功'
            })
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new UserController();