import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '@/services/apiClient';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { getActivityStatus, formatFullDate, calculateDuration, formatRelativeTime } from '@/utils/activityUtils';
import { Calendar, Clock, MapPin, Tag, Users, Send } from 'lucide-react';

export default function ActivityDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [activity, setActivity] = useState(null);
    const [comments, setComments] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [activityRes, commentsRes, registrationsRes] = await Promise.all([
                apiClient.get(`/activities/${id}`),
                apiClient.get(`/activities/${id}/comments`),
                apiClient.get(`/activities/${id}/registration`)
            ]);
            setActivity(activityRes.data);
            setComments(commentsRes.data);
            setRegistrations(registrationsRes.data);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch activity details:", err);
            setError("无法加载活动详情，请稍后重试。");
            if (err.response && err.response.status === 404) {
                setTimeout(() => navigate('/404'), 2000);
            }
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        setIsSubmittingComment(true);
        try {
            await apiClient.post(`/activities/${id}/comments`, { content: newComment });
            setNewComment('');
            const commentsRes = await apiClient.get(`/activities/${id}/comments`);
            setComments(commentsRes.data);
        } catch (err) {
            console.error("Failed to post comment:", err);
            alert("评论发布失败：" + (err.response?.data?.message || '请检查登录状态或稍后再试'));
        } finally {
            setIsSubmittingComment(false);
        }
    };

    if (loading) {
        return <div className="pt-16 flex justify-center items-center min-h-screen"><p>加载中...</p></div>;
    }

    if (error) {
        return <div className="pt-16 flex justify-center items-center min-h-screen"><p className="text-red-500">{error}</p></div>;
    }

    if (!activity) {
        return <div className="pt-16 flex justify-center items-center min-h-screen"><p>未找到活动。</p></div>;
    }

    const status = getActivityStatus(activity);
    const duration = calculateDuration(activity.start_at, activity.end_at);

    return (
        <div className="pt-16 bg-gray-50/50 min-h-screen">
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* 左侧主内容区 */}
                    <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-200">
                        <div className="pb-6 border-b border-gray-200">
                            <h1 className="text-3xl font-bold text-gray-900">{activity.name}</h1>
                            <p className="mt-2 text-md text-gray-600">{activity.description}</p>
                        </div>

                        <div className="mt-6 space-y-4 text-gray-700">
                            <div className="flex items-center space-x-3">
                                <Calendar className="h-5 w-5 text-gray-500" />
                                <span>{formatFullDate(activity.start_at)}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Clock className="h-5 w-5 text-gray-500" />
                                <span>持续时间: {duration}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <MapPin className="h-5 w-5 text-gray-500" />
                                <span>{activity.location}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Tag className="h-5 w-5 text-gray-500" />
                                <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">{activity.type}</span>
                            </div>
                        </div>

                        <div className="mt-10">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">评论区</h2>
                            <form onSubmit={handleCommentSubmit} className="flex items-start space-x-3 mb-6">
                                <Textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="发表你的看法..."
                                    className="flex-1 resize-none"
                                    rows="1"
                                    disabled={isSubmittingComment}
                                />
                                <Button type="submit" disabled={isSubmittingComment} size="icon">
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                            <div className="space-y-5">
                                {comments.length > 0 ? comments.map(comment => (
                                    <div key={comment.id} className="flex flex-col">
                                        <div className="flex items-center space-x-2">
                                            <span className="font-semibold text-gray-800">用户 {comment.user_id}</span>
                                            <span className="text-xs text-gray-500">{formatRelativeTime(comment.created_at)}</span>
                                        </div>
                                        <p className="mt-1 text-gray-700">{comment.content}</p>
                                    </div>
                                )) : <p className="text-gray-500 text-sm">还没有评论，快来抢沙发吧！</p>}
                            </div>
                        </div>
                    </div>

                    {/* 右侧边栏 */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-20 bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">活动状态与操作</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">当前状态</span>
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${status.className}`}>
                                        {status.text}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">参与人数</span>
                                    <div className="flex items-center space-x-1 text-gray-800">
                                        <Users className="h-5 w-5" />
                                        <span className="font-medium">{activity.participants} / {activity.capacity}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">发布者</span>
                                    <span className="font-medium text-gray-800">用户 {activity.creator_id}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">发布于</span>
                                    <span className="font-medium text-gray-800">{formatRelativeTime(activity.created_at)}</span>
                                </div>
                                <div className="pt-2 border-t border-gray-200">
                                    <h4 className="font-semibold text-gray-800 mb-2">已报名 ({registrations.length})</h4>
                                    <div className="text-gray-600">
                                        {registrations.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {registrations.map(reg => (
                                                    <span key={reg.user_id} className="bg-gray-100 px-2 py-1 rounded text-sm">用户 {reg.user_id}</span>
                                                ))}
                                            </div>
                                        ) : <p className="text-sm">暂无用户报名</p>}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6">
                                <Button className="w-full py-2.5">
                                    立即报名
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}