const express = require('express');
const router = express.Router();
const userRoutes = require('./user.routes');
const activityRoutes = require('./activity.routes');

router.use('/users', userRoutes);
router.use('/activities', activityRoutes);

module.exports = router;