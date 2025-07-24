import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { getActivityStatus, calculateDuration, formatFullDate } from '@/utils/activityUtils.js';
import { Button } from './button';
import apiClient from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import UserButton from "@/components/ui/UserButton.jsx";

export default function ActivityDetailModal({ activity, onClose }) {
    const { isLoggedIn, openLoginModal } = useAuth();

    const [isRegistering, setIsRegistering] = useState(false);
    const [registerError, setRegisterError] = useState(null);

    if (!activity) return null;

    const status = getActivityStatus(activity);
    const canRegister = activity.condition === 2 && activity.participants < activity.capacity;
    const handleRegisterClick = async () => {
        if (!isLoggedIn) {
            alert('请先登录再报名活动！');
            onClose();
            openLoginModal();
            return;
        }

        setIsRegistering(true);
        setRegisterError(null);
        try {
            await apiClient.post(`/activities/${activity.id}/register`);
            alert('报名成功！');
            onClose();
        } catch (err) {
            console.error("报名失败:", err);
            setRegisterError(err.response?.data?.message || '报名失败，请稍后重试。');
        } finally {
            setIsRegistering(false);
        }
    };

    const handleContentClick = (e) => e.stopPropagation();

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white p-8 rounded-lg shadow-2xl relative w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={handleContentClick}>
                <button onClick={onClose} className="absolute top-4 right-4 ..."> ... </button>
                {/* 第一行 */}
                <div className="flex items-center gap-x-4 mb-4 flex-shrink-0">
                    <h2 className="text-3xl font-bold text-gray-900">{activity.name}</h2>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">{activity.type}</span>
                    <div className="flex-grow"></div>
                    <UserButton description="发布者" userId={activity.organizer_id} />
                </div>

                {/* 描述 */}
                <p className="text-base text-gray-600 mb-6 flex-shrink-0">{activity.description}</p>

                {/* 分割线 */}
                <hr className="mb-6" />

                {/* 主要信息区 */}
                <div className="flex-1 overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        {/* 左栏 */}
                        <div className="space-y-4">
                            <div><strong className="w-20 inline-block">状态:</strong> <span className={`font-semibold px-2 py-1 rounded-full text-xs ${status.className}`}>{status.text}</span></div>
                            <div><strong className="w-20 inline-block">容量:</strong> {activity.participants || 0} / {activity.capacity} 人</div>
                            <div><strong className="w-20 inline-block">地点:</strong> {activity.location}</div>
                        </div>
                        {/* 右栏 */}
                        <div className="space-y-4">
                            <div><strong className="w-20 inline-block">开始时间:</strong> {formatFullDate(activity.start_time)}</div>
                            <div><strong className="w-20 inline-block">结束时间:</strong> {formatFullDate(activity.end_time)}</div>
                            <div><strong className="w-20 inline-block">持续时间:</strong> {calculateDuration(activity.start_time, activity.end_time)}</div>
                        </div>
                    </div>
                </div>

                {/* 底部操作区 */}
                <div className="relative mt-8 pt-6 border-t flex flex-col items-center flex-shrink-0">
                    {registerError && <p className="text-red-500 text-sm mb-4">{registerError}</p>}
                    <Button
                        onClick={handleRegisterClick}
                        disabled={!canRegister || isRegistering}
                        className={`w-full max-w-xs text-lg py-3 ${canRegister ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-400 cursor-not-allowed'}`}
                    >
                        {isRegistering ? '报名中...' : (canRegister ? '立即报名' : '无法报名')}
                    </Button>
                    <div className="absolute right-0">
                        <Link
                            to={`/activities/${activity.id}`}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                        >
                            <span>查看更多</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>
        </div>,
        document.getElementById('modal-root')
    );
}