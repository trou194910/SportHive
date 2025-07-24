import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/apiClient';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatRelativeTime } from '../utils/activityUtils';

const PermissionBadge = ({ permission, className = '' }) => {
    const styles = {
        1: { label: '黑名单用户', className: 'bg-black text-white' },
        2: { label: '被警告用户', className: 'bg-yellow-400 text-yellow-900' },
        3: { label: '普通用户', className: 'bg-blue-100 text-blue-800' },
        4: { label: '管理员', className: 'bg-green-100 text-green-800' },
        5: { label: '超级管理员', className: 'bg-indigo-600 text-white' },
    };
    const style = styles[permission] || { label: '未知', className: 'bg-gray-200 text-gray-800' };

    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full shrink-0 ${style.className} ${className}`}>
            {style.label}
        </span>
    );
};

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [followedUsers, setFollowedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [unfollowingId, setUnfollowingId] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(true);
    const [commentsError, setCommentsError] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingText, setEditingText] = useState('');
    const [processingCommentId, setProcessingCommentId] = useState(null);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            setError("请先登录以查看个人中心。");
            return;
        }

        const fetchFollowedUsers = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await apiClient.get('/users/follows');
                if (Array.isArray(response.data)) {
                    setFollowedUsers(response.data);
                } else {
                    console.warn("API /users/follows did not return an array:", response.data);
                    setFollowedUsers([]);
                }
            } catch (err) {
                console.error("获取关注列表失败:", err);
                setError("无法加载关注列表，请稍后再试。");
                setFollowedUsers([]);
            } finally {
                setLoading(false);
            }
        };

    const fetchComments = async () => {
        setCommentsLoading(true);
        setCommentsError('');
        try {
            const response = await apiClient.get(`/users/${user.id}/comments`);
            setComments(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error("获取评论列表失败:", err);
            setCommentsError("无法加载评论列表，请稍后再试。");
        } finally {
            setCommentsLoading(false);
        }
    };

    fetchFollowedUsers();
    fetchComments();

}, [user]);

    const handleUnfollow = async (userIdToUnfollow) => {
        setUnfollowingId(userIdToUnfollow);
        try {
            await apiClient.delete(`/users/follows/${userIdToUnfollow}`);
            setFollowedUsers(prevUsers => prevUsers.filter(u => u.id !== userIdToUnfollow));
        } catch (err) {
            console.error("取消关注失败:", err);
            alert("取消关注失败，请稍后重试。");
        } finally {
            setUnfollowingId(null);
        }
    };

    const handleDeleteAccount = async () => {
        navigate("/users/delete");
    };

    const handleStartEdit = (comment) => {
        setEditingCommentId(comment.id);
        setEditingText(comment.content);
    };

    const handleCancelEdit = () => {
        setEditingCommentId(null);
        setEditingText('');
    };

    const handleUpdateComment = async () => {
        if (!editingCommentId || !editingText.trim()) return;
        setProcessingCommentId(editingCommentId);
        try {
            const response = await apiClient.put(`/comments/${editingCommentId}`, { content: editingText });
            setComments(comments.map(c => c.id === editingCommentId ? response.data : c));
            handleCancelEdit();
            navigate(0);
        } catch (err) {
            console.error("更新评论失败:", err);
            alert("更新评论失败，请稍后重试。");
        } finally {
            setProcessingCommentId(null);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (window.confirm("确定要删除这条评论吗？")) {
            setProcessingCommentId(commentId);
            try {
                await apiClient.delete(`/comments/${commentId}`);
                setComments(comments.filter(c => c.id !== commentId));
            } catch (err) {
                console.error("删除评论失败:", err);
                alert("删除评论失败，请稍后重试。");
            } finally {
                setProcessingCommentId(null);
            }
        }
    };

    const handleNavigateToActivity = (activityId) => {
        if (activityId) {
            navigate(`/activities/${activityId}`);
        } else {
            console.warn("该评论没有关联的 activityId，无法跳转。");
        }
    };

    const renderUserInfo = () => (
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between gap-6">
                {/* 左侧信息区 */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">{user.username}</h1>
                    <div className="flex items-center gap-x-4 text-sm text-gray-600">
                        <span>{user.email}</span>
                        <span className="font-mono text-gray-500">(ID: {user.id})</span>
                        <PermissionBadge permission={user.permission} />
                    </div>
                </div>
                {/* 右侧按钮区 */}
                <div className="shrink-0 flex items-center gap-x-9">
                    {user && user.permission >= 4 && (
                        <Link to="/user-management">
                            <Button
                                className="
                            bg-transparent
                            border border-indigo-600
                            text-indigo-600
                            hover:bg-indigo-600
                            hover:text-white
                            font-semibold
                            transition-colors duration-200
                        "
                            >
                                管理员界面
                            </Button>
                        </Link>
                    )}
                    <Button
                        variant="destructive"
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                    >
                        {isDeleting ? '删除中...' : '删除账号'}
                    </Button>
                </div>
            </div>
        </div>
    );

    const renderFollowedUsersList = () => (
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-inner h-full flex flex-col">
            <h2 className="text-2xl font-bold text-gray-800 border-b sticky top-0 bg-white/80 backdrop-blur-sm z-10 px-6 pt-6 pb-4">
                我关注的用户
            </h2>
            <div className="overflow-y-auto p-6 flex-1">
                {followedUsers.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">您还没有关注任何用户。</div>
                ) : (
                    <ul className="space-y-4">
                        {followedUsers.map(followedUser => (
                            <li key={followedUser.id} className="flex items-start justify-between gap-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                                {/* 左侧：用户信息 */}
                                <div>
                                    <p className="font-semibold text-gray-800">{followedUser.username}</p>
                                    <p className="text-sm text-gray-600">{followedUser.email}</p>
                                    <PermissionBadge permission={followedUser.permission} />
                                </div>

                                {/* 右侧：徽章和按钮。设置为一个垂直的 flex 容器，内容靠右对齐 */}
                                <div className="flex flex-col items-end gap-y-2 shrink-0">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleUnfollow(followedUser.id)}
                                        disabled={unfollowingId === followedUser.id}
                                    >
                                        {unfollowingId === followedUser.id ? '处理中...' : '取消关注'}
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );

    const renderMyCommentsPanel = () => (
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-inner h-full flex flex-col">
            <h2 className="text-2xl font-bold text-gray-800 border-b sticky top-0 bg-white/80 backdrop-blur-sm z-10 px-6 pt-6 pb-4">
                我的评论
            </h2>
            <div className="overflow-y-auto p-6 flex-1">
                {commentsLoading ? (
                    <div className="text-center text-gray-500 py-10">正在加载评论...</div>
                ) : commentsError ? (
                    <div className="text-center text-red-500 py-10">{commentsError}</div>
                ) : comments.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">您还没有发表任何评论。</div>
                ) : (
                    <ul className="space-y-5">
                        {comments.map(comment => {
                            const isEditing = editingCommentId === comment.id;
                            const isProcessing = processingCommentId === comment.id;
                            return (
                                <li key={comment.id} className="p-4 bg-gray-50 rounded-md border border-gray-200 flex flex-col gap-y-3">
                                    {isEditing ? (
                                        // 编辑视图
                                        <div className="space-y-3">
                                            <Textarea
                                                value={editingText}
                                                onChange={(e) => setEditingText(e.target.value)}
                                                className="w-full text-base"
                                                rows={3}
                                            />
                                            <div className="flex justify-end gap-x-2">
                                                <Button variant="ghost" size="sm" onClick={handleCancelEdit}>取消</Button>
                                                <Button size="sm" onClick={handleUpdateComment} disabled={isProcessing}>
                                                    {isProcessing ? '保存中...' : '保存'}
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        // 普通视图
                                        <>
                                            {/* 可点击的评论内容 */}
                                            <div
                                                className="cursor-pointer group"
                                                onClick={() => handleNavigateToActivity(comment.activity_id)}
                                            >
                                                <p className="text-gray-800 group-hover:text-blue-700 transition-colors duration-200">
                                                    {comment.content}
                                                </p>
                                            </div>
                                            {/* 底部信息栏：时间和操作按钮 */}
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-gray-500">
                                                    {formatRelativeTime(comment.updated_at || comment.created_at)}
                                                </span>
                                                {/* 操作按钮组 */}
                                                <div className="flex gap-x-2">
                                                    <Button
                                                        variant="link"
                                                        size="sm"
                                                        onClick={(e) => { e.stopPropagation(); handleStartEdit(comment); }}
                                                        disabled={isProcessing}
                                                    >
                                                        编辑
                                                    </Button>
                                                    <Button
                                                        variant="link"
                                                        size="sm"
                                                        className="text-red-600"
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteComment(comment.id); }}
                                                        disabled={isProcessing}
                                                    >
                                                        {isProcessing ? '删除中...' : '删除'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );

    if (!user && !loading) {
        return (
            <div className="h-screen pt-16 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl text-red-500">{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="h-screen pt-16">
            <div className="container mx-auto px-4 h-full">
                {user && (
                    <main className="flex flex-col h-full py-8">
                        {renderUserInfo()}
                        <div className="flex-1 flex md:flex-row flex-col gap-8 overflow-hidden">
                            <aside className="md:w-5/12 lg:w-4/12 h-full">
                                {loading ? (
                                    <div className="flex items-center justify-center h-full"><p>正在加载关注列表...</p></div>
                                ) : error ? (
                                    <p className="text-center text-red-500 pt-10">{error}</p>
                                ) : (
                                    renderFollowedUsersList()
                                )}
                            </aside>
                            <section className="md:w-7/12 lg:w-8/12 h-full">
                                {renderMyCommentsPanel()}
                            </section>
                        </div>
                    </main>
                )}
            </div>
        </div>
    );
}