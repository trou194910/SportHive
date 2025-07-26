import { activityRepository } from '../repositories/activity.repository';

interface CronJob {
    name: string;
    schedule: number; // 执行间隔，单位：毫秒
    action: () => void; // 要执行的动作
    start: () => void;
}

/**
 * 负责更新过期活动的定时任务
 */
const expiredActivitiesJob: CronJob = {
    name: '[Cron Job] Update Expired Activities',
    schedule: 10 * 60 * 1000, // [建议] 10分钟执行一次就足够了，过于频繁会增加不必要的数据库负载

    action: () => {
        try {
            console.log(`🚀 ${expiredActivitiesJob.name}: Running job...`);
            // 直接调用同步方法
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
        // 立即执行一次，以确保服务启动时状态就是最新的
        expiredActivitiesJob.action();
        // 然后设置定时器
        setInterval(expiredActivitiesJob.action, expiredActivitiesJob.schedule);
    }
};

/**
 * 启动所有后台定时任务
 */
export const startBackgroundJobs = () => {
    expiredActivitiesJob.start();
};