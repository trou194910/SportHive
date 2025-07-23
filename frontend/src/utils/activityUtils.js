import { format, formatDistanceToNowStrict } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export const getActivityStatus = (activity) => {
    if (activity.condition === 3) {
        return { text: '已结束', className: 'bg-red-100 text-red-800' };
    }
    if (activity.participants >= activity.capacity) {
        return { text: '已满', className: 'bg-orange-100 text-orange-800' };
    }
    if (activity.condition === 2) {
        return { text: '招募中', className: 'bg-green-100 text-green-800' };
    }
    return { text: '未开始', className: 'bg-yellow-100 text-yellow-800' };
};

export const formatFullDate = (dateString) => {
    if (!dateString) return '时间未知';
    return format(new Date(dateString), 'yyyy年M月d日 HH:mm', { locale: zhCN });
};

export const calculateDuration = (start, end) => {
    if (!start || !end) return '未知';
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return '无法计算';

    const diffMs = endDate - startDate;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.round((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    let durationString = '';
    if (diffHours > 0) {
        durationString += `${diffHours}小时 `;
    }
    if (diffMinutes > 0) {
        durationString += `${diffMinutes}分钟`;
    }
    return durationString.trim() || '片刻';
};

export const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    return formatDistanceToNowStrict(new Date(dateString), { addSuffix: true, locale: zhCN });
};