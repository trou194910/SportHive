import React from 'react';
import { Button } from './button';

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

const formatShortDateWithWeekday = (dateString) => {
    if (!dateString) return '时间未知';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '无效日期';
    return date.toLocaleString('zh-CN', {
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });
};

const calculateDuration = (start, end) => {
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

const truncateText = (text, maxLength) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

export default function ActivityCard({ activity, onCardClick }) {
    const status = getActivityStatus(activity);
    const handleOrganizerClick = (e) => {
        e.stopPropagation();
        console.log("查看发布者:", activity.organizer_id);
    };

    return (
        <div
            onClick={() => onCardClick(activity)}
            className="bg-white/95 p-5 rounded-lg shadow-md border border-gray-200 space-y-3 cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all duration-200"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onCardClick(activity)}
        >
            {/* 卡片头部：标题和状态 */}
            <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-gray-800 pr-4">{activity.name}</h3>
                <div className="flex flex-col items-end text-xs font-semibold flex-shrink-0">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full mb-1">
                        {activity.type || '未分类'}
                    </span>
                    <span className={`px-2 py-1 rounded-full ${status.className}`}>
                        {status.text}
                    </span>
                </div>
            </div>
            {/* 卡片主体：时间、描述、发布者 */}
            <div className="space-y-3 text-sm text-gray-600">
                {/* 时间信息 */}
                <div className="flex flex-wrap items-center text-xs text-gray-500 gap-x-3">
                    <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <span>{formatShortDateWithWeekday(activity.start_time)}</span>
                    </div>
                    <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>{calculateDuration(activity.start_time, activity.end_time)}</span>
                    </div>
                </div>
                {/* 描述 */}
                <p className="pt-1">{truncateText(activity.description, 70)}</p>
                {/* 发布者 */}
                <div className="flex items-center text-xs pt-2">
                    <span>发布者:</span>
                    <Button
                        variant="link"
                        className="p-0 h-auto ml-1 text-blue-600"
                        onClick={handleOrganizerClick}
                    >
                        用户ID: {activity.organizer_id}
                    </Button>
                </div>
            </div>
        </div>
    );
}