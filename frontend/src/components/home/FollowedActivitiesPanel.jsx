import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import ActivityCard from '../ui/ActivityCard';
import { useAuth } from '../../context/AuthContext';
import ActivityDetailModal from '../ui/ActivityDetailModal';

export default function FollowedActivitiesPanel() {
    const { isInitialized, isLoggedIn } = useAuth();
    const [activities, setActivities] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedActivity, setSelectedActivity] = useState(null);

    useEffect(() => {
        if (isInitialized && isLoggedIn) {
            const fetchFollowedActivities = async () => {
                setIsLoading(true);
                try {
                    const response = await apiClient.get('/users/follows/activities');
                    setActivities(response.data);
                } catch (err) {
                    console.error("获取已关注活动失败:", err);
                    setError("无法加载已关注活动，请稍后重试");
                } finally {
                    setIsLoading(false);
                }
            };
            fetchFollowedActivities();
        }
    }, [isInitialized, isLoggedIn]);

    if (!isInitialized) {
        return <div className="p-4 text-center text-gray-500">初始化中...</div>;
    }

    if (!isLoggedIn) {
        return (
            <div className="p-4 text-center text-gray-500">
                <p className="mt-2 text-sm">请先登录以查看您关注的活动</p>
            </div>
        );
    }

    if (isLoading) {
        return <div className="p-4 text-center text-gray-500">加载中...</div>;
    }

    if (error) {
        return <div className="p-4 text-center text-red-500 bg-red-100 rounded-lg">{error}</div>;
    }

    if (activities.length === 0) {
        return (
            <div className="p-4 text-center text-gray-500">
                <p className="mt-2 text-sm">您还没有关注任何用户</p>
                <p className="mt-2 text-sm">或者您关注的用户尚未发布活动</p>
            </div>
        );
    }

    const handleViewDetails = (activity) => {
        setSelectedActivity(activity);
    };

    const handleCloseDetails = () => {
        setSelectedActivity(null);
    };

    return (
        <>
            <div className="flex flex-col h-full p-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex-shrink-0">
                    我关注的活动
                </h2>
                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {activities.map(activity => (
                        <ActivityCard
                            key={activity.id}
                            activity={activity}
                            onCardClick={handleViewDetails}
                        />
                    ))}
                </div>
            </div>
            {/* 详情弹窗 */}
            <ActivityDetailModal
                activity={selectedActivity}
                onClose={handleCloseDetails}
            />
        </>
    );
}