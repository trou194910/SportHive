import { activityRepository } from '../repositories/activity.repository';

interface CronJob {
    name: string;
    schedule: number;
    action: () => void;
    start: () => void;
}

/**
 * 负责更新过期活动的定时任务
 */
const expiredActivitiesJob: CronJob = {
    name: '[Cron Job] Update Expired Activities',
    schedule: 60 * 1000,

    action: () => {
        try {
            console.log(`🚀 ${expiredActivitiesJob.name}: Running job...`);
            const updatedCount = activityRepository.updateExpiredActivities();
            if (updatedCount > 0) {
                console.log(`✅ ${expiredActivitiesJob.name}: Successfully updated ${updatedCount} activities.`);
            }
        } catch (err) {
            console.error(`❌ ${expiredActivitiesJob.name}: An error occurred.`, err);
        }
    },

    start: () => {
        console.log(`🕒 ${expiredActivitiesJob.name}: Scheduled to run every ${expiredActivitiesJob.schedule / 1000} seconds.`);
        expiredActivitiesJob.action();
        setInterval(expiredActivitiesJob.action, expiredActivitiesJob.schedule);
    }
};

/**
 * 启动所有后台定时任务
 */
export const startBackgroundJobs = () => {
    expiredActivitiesJob.start();
};