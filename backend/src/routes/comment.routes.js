const express = require('express');
const router = express.Router();
const commentController = require('../api/comment.controller');
const authMiddleware = require('../middleware/user.middleware');

/**
 * @description 更新单条评论 (需要认证)
 * @method PUT /api/comments/:id
 */
router.put('/:id', authMiddleware, commentController.updateComment);

/**
 * @description 删除单条评论 (需要认证)
 * @method DELETE /api/comments/:id
 */
router.delete('/:id', authMiddleware, commentController.deleteComment);

module.exports = router;