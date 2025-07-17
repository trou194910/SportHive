const express = require('express');
const router = express.Router();
const userRoutes = require('./user.routes');
const activityRoutes = require('./activity.routes');
const commentRoutes = require('./comment.routes');

router.use('/users', userRoutes);
router.use('/activities', activityRoutes);
router.use('/comments', commentRoutes);

module.exports = router;