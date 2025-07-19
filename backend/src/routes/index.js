const express = require('express');
const router = express.Router();
const userRoutes = require('./user.routes');
const activityRoutes = require('./activity.routes');
const commentRoutes = require('./comment.routes');
const activityRepository = require('../repositories/activity.repository');

router.use('/users', userRoutes);
router.use('/activities', activityRoutes);
router.use('/comments', commentRoutes);
setInterval(() => {
    console.log('[Cron Job] Running job to update expired activities...');
    activityRepository.updateExpiredActivities()
        .then(updatedCount => {
            if (updatedCount > 0) {
                console.log(`[Cron Job] Successfully updated ${updatedCount} activities.`);
            }
        })
        .catch(err => {
            console.error('[Cron Job] Error updating activities:', err);
        });
}, 10000);


module.exports = router;