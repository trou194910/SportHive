import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '@/services/apiClient';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import UserButton from "@/components/ui/UserButton.jsx";
import { getActivityStatus, formatFullDate, calculateDuration, formatRelativeTime } from '@/utils/activityUtils';
import { Calendar, Clock, MapPin, Tag, Users, Send } from 'lucide-react';

export default function ActivityDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isLoggedIn, openLoginModal } = useAuth();
    const [activity, setActivity] = useState(null);
    const [comments, setComments] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newComment, setNewComment] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [registerError, setRegisterError] = useState(null);
    const [isRegistered, setIsRegistered] = useState(false);
    const [isLoadingStatus, setIsLoadingStatus] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchData = useCallback(async () => {
        setError(null);
        try {
            const [activityRes, commentsRes, registrationsRes] = await Promise.all([
                apiClient.get(`/activities/${id}`),
                apiClient.get(`/activities/${id}/comments`),
                apiClient.get(`/activities/${id}/registration`)
            ]);
            setActivity(activityRes.data);
            const fetchedComments = commentsRes.data;
            setComments(fetchedComments.slice().reverse());
            setRegistrations(registrationsRes.data);
        } catch (err) {
            console.error("加载活动详情失败:", err);
            setError("无法加载活动详情，请稍后重试。");
            if (err.response && err.response.status === 404) {
                setTimeout(() => navigate('/404'), 2000);
            }
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        if (isLoggedIn && id) {
            setIsLoadingStatus(true);
            const checkRegistrationStatus = async () => {
                try {
                    const response = await apiClient.get(`/activities/${id}/register`);
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
    }, [id, isLoggedIn]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        if (!isLoggedIn) {
            alert("请先登录再发表评论！");
            openLoginModal();
            return;
        }
        setIsSubmittingComment(true);
        try {
            await apiClient.post(`/activities/${id}/comments`, { content: newComment });
            fetchData();
        } catch (err) {
            console.error("发布评论失败:", err);
            alert("评论发布失败：" + (err.response?.data?.message || '请检查网络或稍后再试'));
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleRegisterClick = async () => {
        if (!isLoggedIn) {
            alert('请先登录再报名活动！');
            openLoginModal();
            return;
        }
        setIsRegistering(true);
        setRegisterError(null);
        try {
            await apiClient.post(`/activities/${id}/register`);
            alert('报名成功！');
            setIsRegistered(true);
            await fetchData();
        } catch (err) {
            console.error("报名失败:", err);
            setRegisterError(err.response?.data?.message || '报名失败，请稍后重试。');
        } finally {
            setIsRegistering(false);
        }
    };

    const handleDeleteActivity = async () => {
        if (window.confirm('您确定要删除这个活动吗？此操作不可撤销。')) {
            setIsDeleting(true);
            try {
                await apiClient.delete(`/activities/${id}`);
                alert('活动删除成功！');
                navigate(-1);
            } catch (err) {
                console.error("删除活动失败:", err);
                alert("删除失败：" + (err.response?.data?.message || '请稍后重试'));
                setIsDeleting(false);
            }
        }
    };

    if (loading) {
        return <div className="pt-16 flex justify-center items-center h-screen"><p>加载中...</p></div>;
    }

    if (error) {
        return <div className="pt-16 flex justify-center items-center h-screen"><p className="text-red-500">{error}</p></div>;
    }

    if (!activity) {
        return <div className="pt-16 flex justify-center items-center h-screen"><p>未找到活动。</p></div>;
    }

    const status = getActivityStatus(activity);
    const duration = calculateDuration(activity.start_time, activity.end_time);
    const isOrganizer = isLoggedIn && user?.id === activity.organizer_id;
    const isAdmin = isLoggedIn && user?.permission >= 4;
    const canRegister = status.text === '招募中';

    return (
        <div className="pt-16 bg-gray-50/50 flex flex-col h-screen">
            <div className="container mx-auto px-4 py-8 flex-1 overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
                    {/* 左侧主内容区 */}
                    <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-200 overflow-y-auto">
                        <div className="pb-6 border-b border-gray-200">
                            <h1 className="text-3xl font-bold text-gray-900">{activity.name}</h1>
                            <p className="mt-2 text-md text-gray-600">{activity.description}</p>
                        </div>

                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
                            <div className="flex items-center space-x-3"><Calendar className="h-5 w-5 text-gray-500 flex-shrink-0" /><span>开始于: {formatFullDate(activity.start_time)}</span></div>
                            <div className="flex items-center space-x-3"><Clock className="h-5 w-5 text-gray-500 flex-shrink-0" /><span>持续: {duration}</span></div>
                            <div className="flex items-center space-x-3"><MapPin className="h-5 w-5 text-gray-500 flex-shrink-0" /><span>地点: {activity.location}</span></div>
                            <div className="flex items-center space-x-3"><Tag className="h-5 w-5 text-gray-500 flex-shrink-0" /><span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">{activity.type}</span></div>
                        </div>

                        <div className="mt-10">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">评论区 ({comments.length})</h2>
                            <form onSubmit={handleCommentSubmit} className="flex items-start space-x-3 mb-6">
                                <Textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder={isLoggedIn ? "发表你的看法..." : "请先登录再发表评论"}
                                    className="flex-1 resize-none"
                                    rows="2"
                                    disabled={isSubmittingComment || !isLoggedIn}
                                />
                                <Button type="submit" disabled={isSubmittingComment || !newComment.trim()} size="icon">
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                            <div className="space-y-5">
                                {comments.length > 0 ? comments.map(comment => (
                                    <div key={comment.id} className="flex items-start space-x-3">
                                        <UserButton userId={comment.user_id} userName={comment.user_name} />
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-xs text-gray-500">{formatRelativeTime(comment.created_at)}</span>
                                            </div>
                                            <p className="mt-1 text-gray-700 break-words">{comment.content}</p>
                                        </div>
                                    </div>
                                )) : <p className="text-gray-500 text-sm py-4 text-center">还没有评论，快来抢沙发吧！</p>}
                            </div>
                        </div>
                    </div>

                    {/* 右侧边栏 */}
                    <div className="h-full flex flex-col">
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col flex-1 overflow-y-auto">
                            <div className="flex-grow">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">活动状态与操作</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center"><span className="text-gray-600">当前状态</span><span className={`px-2 py-1 text-xs font-bold rounded-full ${status.className}`}>{status.text}</span></div>
                                    <div className="flex justify-between items-center"><span className="text-gray-600">参与人数</span><div className="flex items-center space-x-1 text-gray-800"><Users className="h-5 w-5" /><span className="font-medium">{activity.participants} / {activity.capacity}</span></div></div>
                                    <div className="flex justify-between items-center"><span className="text-gray-600">发布者</span><UserButton userId={activity.organizer_id} userName={activity.organizer_name} /></div>
                                    <div className="flex justify-between items-center"><span className="text-gray-600">发布于</span><span className="font-medium text-gray-800">{formatRelativeTime(activity.created_at)}</span></div>

                                    <div className="pt-4 border-t border-gray-200">
                                        <h4 className="font-semibold text-gray-800 mb-3">已报名 ({registrations.length})</h4>
                                        {registrations.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {registrations.map(reg => (
                                                    <UserButton key={reg.id} userId={reg.id} userName={reg.name} />
                                                ))}
                                            </div>
                                        ) : <p className="text-sm text-gray-500">暂无用户报名</p>}
                                    </div>
                                </div>
                            </div>

                            {/* 操作按钮区域 */}
                            <div className="mt-6 pt-6 border-t border-gray-200 text-center space-y-3">
                                {registerError && <p className="text-red-500 text-sm mb-2">{registerError}</p>}
                                {isLoadingStatus ? (
                                    <Button disabled className="w-full py-2.5 text-base font-semibold bg-gray-400 cursor-not-allowed">加载状态...</Button>
                                ) : isOrganizer ? (
                                    <Button disabled className="w-full py-2.5 text-base font-semibold bg-gray-400 cursor-not-allowed">我发布的活动</Button>
                                ) : isRegistered ? (
                                    <Button disabled className="w-full py-2.5 text-base font-semibold bg-gray-400 cursor-not-allowed">您已报名</Button>
                                ) : !canRegister ? (
                                    <Button disabled className="w-full py-2.5 text-base font-semibold bg-gray-400 cursor-not-allowed">无法报名</Button>
                                ) :  (
                                    <Button
                                        onClick={handleRegisterClick}
                                        disabled={isRegistering}
                                        className="w-full py-2.5 text-base font-semibold bg-orange-500 hover:bg-orange-600"
                                    >
                                        {isRegistering ? '报名中...' : '立即报名'}
                                    </Button>
                                )}
                                {isOrganizer ? (
                                    <>
                                            <div className="relative py-2">
                                                <div className="absolute inset-0 flex items-center"><span className="w-full border-t"></span></div>
                                                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-500">发布者操作</span></div>
                                            </div>
                                            <Button
                                                onClick={() => navigate(`/activities/edit/${id}`)}
                                                className="w-full bg-blue-600 hover:bg-blue-700"
                                            >
                                                修改内容
                                            </Button>
                                            <Button
                                                onClick={handleDeleteActivity}
                                                disabled={isDeleting}
                                                variant="destructive"
                                                className="w-full"
                                            >
                                                {isDeleting ? '删除中...' : '删除活动'}
                                            </Button>
                                    </>
                                    ) : (
                                    <>
                                        {isAdmin && (
                                            <>
                                                <div className="relative py-2">
                                                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t"></span></div>
                                                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-500">管理员操作</span></div>
                                                </div>
                                                <Button
                                                    onClick={handleDeleteActivity}
                                                    disabled={isDeleting}
                                                    variant="destructive"
                                                    className="w-full"
                                                >
                                                    {isDeleting ? '删除中...' : '删除活动 (管理员)'}
                                                </Button>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}