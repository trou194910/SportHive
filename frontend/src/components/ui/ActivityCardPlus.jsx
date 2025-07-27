import React from 'react';
import { getActivityStatus, calculateDuration } from '@/utils/activityUtils.js';
import UserButton from "@/components/ui/UserButton.jsx";

const formatDetailedTime = (dateString) => {
    if (!dateString) return '时间未知';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '无效日期';
    return date.toLocaleString('zh-CN', {
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
};

export default function ActivityCardPlus({ activity, onCardClick }) {
    const status = getActivityStatus(activity);

    return (
        <div
            onClick={() => onCardClick(activity)}
            className="bg-white/95 p-5 rounded-lg shadow-md border border-gray-200 space-y-4 cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all duration-200"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onCardClick(activity)}
        >
            {/* 第一行：name, type, condition, 发布者 */}
            <div className="flex justify-between items-start gap-4">
                <h3 className="text-xl font-bold text-gray-800">{activity.name}</h3>
                <div className="flex flex-col items-end flex-shrink-0 text-xs gap-y-1.5">
                    <div className='flex items-center gap-x-2'>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold">
                            {activity.type || '未分类'}
                        </span>
                        <span className={`px-2 py-1 rounded-full font-semibold ${status.className}`}>
                            {status.text}
                        </span>
                        <UserButton userId={activity.organizer_id} userName={activity.organizer_name} />
                    </div>
                </div>
            </div>

            {/* 第二行：开始时间, 持续时间、地点 */}
            <div className="flex flex-wrap items-center text-sm text-gray-600 gap-x-4">
                <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span>{formatDetailedTime(activity.start_time)}</span>
                </div>
                <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>持续 {calculateDuration(activity.start_time, activity.end_time)}</span>
                </div>
                <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="{2}"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <span>{activity.location || '地点未提供'}</span>
                </div>
            </div>

            {/* 第三行往下：description */}
            <div className="pt-2">
                <p className="text-sm text-gray-600 whitespace-pre-wrap break-words">
                    {activity.description}
                </p>
            </div>
        </div>
    );
}