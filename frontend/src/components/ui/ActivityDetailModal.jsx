import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { getActivityStatus, calculateDuration, formatFullDate } from '@/utils/activityUtils.js';
import { Button } from './button';
import apiClient from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import UserButton from "@/components/ui/UserButton.jsx";

export default function ActivityDetailModal({ activity, onClose }) {
    const { user: currentUser, isLoggedIn, openLoginModal } = useAuth();
    const [isRegistering, setIsRegistering] = useState(false);
    const [registerError, setRegisterError] = useState(null);
    const [isRegistered, setIsRegistered] = useState(false);
    const [isLoadingStatus, setIsLoadingStatus] = useState(true);

    useEffect(() => {
        if (isLoggedIn && activity?.id) {
            setIsLoadingStatus(true);
            const checkRegistrationStatus = async () => {
                try {
                    const response = await apiClient.get(`/activities/${activity.id}/register`);
                    if (response.data) {
                        setIsRegistered(response.data.isRegistered);
                    }
                } catch (error) {
                    console.error("无法获取报名状态:", error);
                    setIsRegistered(false);
                } finally {
                    setIsLoadingStatus(false);
                }
            };
            checkRegistrationStatus();
        } else {
            setIsLoadingStatus(false);
            setIsRegistered(false);
        }
    }, [activity?.id, isLoggedIn]);

    if (!activity) return null;

    const status = getActivityStatus(activity);
    const canRegister = status.text === '招募中';
    const isOwner = currentUser && currentUser.id === activity.organizer_id;
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
            setIsRegistered(true);
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
                <div className="flex items-center gap-x-4 mb-4 flex-shrink-0">
                    <h2 className="text-3xl font-bold text-gray-900">{activity.name}</h2>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">{activity.type}</span>
                    <div className="flex-grow"></div>
                    <UserButton userId={activity.organizer_id} userName={activity.organizer_name} />
                </div>

                <p className="text-base text-gray-600 mb-6 flex-shrink-0">{activity.description}</p>
                <hr className="mb-6" />

                <div className="flex-1 overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        <div className="space-y-4">
                            <div><strong className="w-20 inline-block">状态:</strong> <span className={`font-semibold px-2 py-1 rounded-full text-xs ${status.className}`}>{status.text}</span></div>
                            <div><strong className="w-20 inline-block">容量:</strong> {activity.participants || 0} / {activity.capacity} 人</div>
                            <div><strong className="w-20 inline-block">地点:</strong> {activity.location}</div>
                        </div>
                        <div className="space-y-4">
                            <div><strong className="w-20 inline-block">开始时间:</strong> {formatFullDate(activity.start_time)}</div>
                            <div><strong className="w-20 inline-block">结束时间:</strong> {formatFullDate(activity.end_time)}</div>
                            <div><strong className="w-20 inline-block">持续时间:</strong> {calculateDuration(activity.start_time, activity.end_time)}</div>
                        </div>
                    </div>
                </div>

                <div className="relative mt-8 pt-6 border-t flex flex-col items-center flex-shrink-0">
                    {registerError && <p className="text-red-500 text-sm mb-4">{registerError}</p>}
                    {isLoadingStatus ? (
                        <Button disabled className="w-full max-w-xs text-lg py-3 bg-gray-400 cursor-not-allowed">加载状态...</Button>
                    ) : isOwner ? (
                        <Button disabled className="w-full max-w-xs text-lg py-3 bg-gray-400 cursor-not-allowed">我发布的活动</Button>
                    ) : isRegistered ? (
                        <Button disabled className="w-full max-w-xs text-lg py-3 bg-gray-400 cursor-not-allowed">您已报名</Button>
                    ) : !canRegister ? (
                        <Button disabled className="w-full max-w-xs text-lg py-3 bg-gray-400 cursor-not-allowed">无法报名</Button>
                    ) : (
                        <Button
                            onClick={handleRegisterClick}
                            disabled={isRegistering}
                            className="w-full max-w-xs text-lg py-3 bg-orange-500 hover:bg-orange-600"
                        >
                            {isRegistering ? '报名中...' : '立即报名'}
                        </Button>
                    )}

                    <div className="absolute right-0 bottom-0 pb-1">
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