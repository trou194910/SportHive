import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ActivityCard from '../components/ui/ActivityCard';
import { Button } from '@/components/ui/button';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/apiClient';

export default function MyActivitiesPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [publishedActivities, setPublishedActivities] = useState([]);
    const [registeredActivities, setRegisteredActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pendingAction, setPendingAction] = useState(null);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            setError("请先登录以查看您的活动。");
            return;
        }
        const fetchActivities = async () => {
            setLoading(true);
            setError('');
            try {
                const [publishedRes, registeredRes] = await Promise.all([
                    apiClient.get(`/users/${user.id}/activities/create`),
                    apiClient.get('/users/registrations')
                ]);
                setPublishedActivities(publishedRes.data || []);
                setRegisteredActivities(registeredRes.data || []);
            } catch (err) {
                console.error("获取活动失败:", err);
                setError("无法加载活动列表，请稍后再试。");
            } finally {
                setLoading(false);
            }
        };
        fetchActivities();
    }, [user]);

    const handleDeleteActivity = async (activityId) => {
        if (window.confirm("确定要永久删除这个活动吗？")) {
            setPendingAction(activityId);
            try {
                await apiClient.delete(`/activities/${activityId}`);
                setPublishedActivities(prev => prev.filter(act => act.id !== activityId));
            } catch (err) {
                console.error("删除活动失败:", err);
                alert("删除失败，请重试。");
            } finally {
                setPendingAction(null);
            }
        }
    };

    const handleCancelRegistration = async (activityId) => {
        if (window.confirm("确定要取消报名这个活动吗？")) {
            setPendingAction(activityId);
            try {
                await apiClient.delete(`/activities/${activityId}/cancel`);
                setRegisteredActivities(prev => prev.filter(act => act.id !== activityId));
            } catch (err) {
                console.error("取消报名失败:", err);
                alert("取消报名失败，请重试。");
            } finally {
                setPendingAction(null);
            }
        }
    };

    const renderPublishedList = () => (
        <div className="bg-gray-50/80 rounded-lg shadow-inner flex-1 overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 border-b sticky top-0 bg-gray-50/80 backdrop-blur-sm z-10 px-6 pt-6 pb-4">
                我发布的活动
            </h2>
            <div className="p-6">
                {publishedActivities.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">您还没有发布任何活动。</div>
                ) : (
                    <div className="space-y-6">
                        {publishedActivities.map(activity => (
                            <div key={activity.id} className="bg-white rounded-lg shadow-md border border-gray-200">
                                <ActivityCard activity={activity} onCardClick={() => navigate(`/activities/${activity.id}`)} />
                                <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-x-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => navigate(`/activities/edit/${activity.id}`)}
                                    >
                                        修改内容
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDeleteActivity(activity.id)}
                                        disabled={pendingAction === activity.id}
                                    >
                                        {pendingAction === activity.id ? '处理中...' : '删除活动'}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    const renderRegisteredList = () => (
        <div className="bg-gray-50/80 rounded-lg shadow-inner flex-1 overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 border-b sticky top-0 bg-gray-50/80 backdrop-blur-sm z-10 px-6 pt-6 pb-4">
                我报名的活动
            </h2>
            <div className="p-6">
                {registeredActivities.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">您还没有报名任何活动。</div>
                ) : (
                    <div className="space-y-6">
                        {registeredActivities.map(activity => (
                            <div key={activity.id} className="bg-white rounded-lg shadow-md border border-gray-200">
                                <ActivityCard activity={activity} onCardClick={() => navigate(`/activities/${activity.id}`)} />
                                <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleCancelRegistration(activity.id)}
                                        disabled={pendingAction === activity.id}
                                    >
                                        {pendingAction === activity.id ? '处理中...' : '取消报名'}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="h-screen pt-16">
            <div className="container mx-auto px-4 h-full">
                <main className="flex flex-col md:flex-row gap-8 h-full py-8">
                    {loading ? (
                        <p className="w-full text-center">正在加载您的活动...</p>
                    ) : error ? (
                        <p className="w-full text-center text-red-500">{error}</p>
                    ) : (
                        <>
                            {renderPublishedList()}
                            {renderRegisteredList()}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}