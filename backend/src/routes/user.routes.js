const express = require('express');
const router = express.Router();
const userController = require('../api/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

/**
 * @description 定义用户注册路由
 * @method POST /api/users/register
 * @access Public
 */
router.post('/register', userController.register);

/**
 * @description 定义用户登录路由
 * @method POST /api/users/login
 * @access Public
 */
router.post('/login', userController.login);

/**
 * @description 定义用户删除路由
 * @method DELETE /api/users/delete
 * @access Public
 */
router.delete('/delete', authMiddleware, userController.deleteUser);

module.exports = router;