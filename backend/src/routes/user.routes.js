const express = require('express');
const router = express.Router();
const userController = require('../api/user.controller');
const authMiddleware = require('../middleware/user.middleware');

/**
 * @description 定义用户注册路由
 * @method POST /api/users/register
 */
router.post('/register', userController.register);

/**
 * @description 定义用户登录路由
 * @method POST /api/users/login
 */
router.post('/login', userController.login);

/**
 * @description 定义用户删除路由
 * @method DELETE /api/users/:id
 */
router.delete('/:id', authMiddleware, userController.deleteUser);

module.exports = router;