import React, { useState, useEffect, useCallback } from 'react'; // 1. 引入 useCallback
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/apiClient';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatRelativeTime } from '../utils/activityUtils';
import UserButton from "@/components/ui/UserButton.jsx";

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
    const [loadingFollows, setLoadingFollows] = useState(true);
    const [errorFollows, setErrorFollows] = useState('');
    const [unfollowingId, setUnfollowingId] = useState(null);
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(true);
    const [errorComments, setErrorComments] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingText, setEditingText] = useState('');
    const [processingCommentId, setProcessingCommentId] = useState(null);

    useEffect(() => {
        if (!user) {
            setLoadingFollows(false);
            return;
        }
        const fetchFollowedUsers = async () => {
            setLoadingFollows(true);
            setErrorFollows('');
            try {
                const response = await apiClient.get('/users/follows');
                setFollowedUsers(Array.isArray(response.data) ? response.data : []);
            } catch (err) {
                console.error("获取关注列表失败:", err);
                setErrorFollows("无法加载关注列表，请稍后再试。");
            } finally {
                setLoadingFollows(false);
            }
        };
        fetchFollowedUsers();
    }, [user]);

    useEffect(() => {
        if (!user) {
            setLoadingComments(false);
            return;
        }
        const fetchComments = async () => {
            setLoadingComments(true);
            setErrorComments('');
            try {
                const response = await apiClient.get(`/users/${user.id}/comments`);
                setComments(Array.isArray(response.data) ? response.data : []);
            } catch (err) {
                console.error("获取评论列表失败:", err);
                setErrorComments("无法加载评论列表，请稍后再试。");
            } finally {
                setLoadingComments(false);
            }
        };
        fetchComments();
    }, [user]);

    const handleUnfollow = useCallback(async (userToUnfollow) => {
        setUnfollowingId(userToUnfollow.follow_id);
        try {
            await apiClient.delete(`/users/follows/${userToUnfollow.follow_id}`);
            setFollowedUsers(prevUsers => prevUsers.filter(u => u.id !== userToUnfollow.id));
        } catch (err) {
            console.error("取消关注失败:", err);
            alert("取消关注失败，请稍后重试。");
        } finally {
            setUnfollowingId(null);
        }
    }, []);

    const handleDeleteAccount = useCallback(() => {
        navigate("/users/delete");
    }, [navigate]);

    const handleStartEdit = useCallback((comment) => {
        setEditingCommentId(comment.id);
        setEditingText(comment.content);
    }, []);

    const handleCancelEdit = useCallback(() => {
        setEditingCommentId(null);
        setEditingText('');
    }, []);

    const handleUpdateComment = useCallback(async () => {
        if (!editingCommentId || !editingText.trim()) return;
        setProcessingCommentId(editingCommentId);
        try {
            const response = await apiClient.put(`/comments/${editingCommentId}`, { content: editingText });
            setComments(prevComments => prevComments.map(c => c.id === editingCommentId ? response.data.data : c));
            handleCancelEdit();
        } catch (err) {
            console.error("更新评论失败:", err);
            alert("更新评论失败，请稍后重试。");
        } finally {
            setProcessingCommentId(null);
        }
    }, [editingCommentId, editingText, handleCancelEdit]);

    const handleDeleteComment = useCallback(async (commentId) => {
        if (window.confirm("确定要删除这条评论吗？")) {
            setProcessingCommentId(commentId);
            try {
                await apiClient.delete(`/comments/${commentId}`);
                setComments(prevComments => prevComments.filter(c => c.id !== commentId));
            } catch (err) {
                console.error("删除评论失败:", err);
                alert("删除评论失败，请稍后重试。");
            } finally {
                setProcessingCommentId(null);
            }
        }
    }, []);

    const handleNavigateToActivity = useCallback((activityId) => {
        if (activityId) {
            navigate(`/activities/${activityId}`);
        } else {
            console.warn("该评论没有关联的 activityId，无法跳转。");
        }
    }, [navigate]);


    // --- 渲染逻辑部分保持不变，但现在它们依赖于更精确的状态 ---

    const renderUserInfo = () => (
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">{user.name}</h1>
                    <div className="flex items-center gap-x-4 text-sm text-gray-600">
                        <span>{user.email}</span>
                        <span className="font-mono text-gray-500">(ID: {user.id})</span>
                        <PermissionBadge permission={user.permission} />
                    </div>
                </div>
                <div className="shrink-0 flex items-center gap-x-9">
                    {user && user.permission >= 4 && (
                        <Link to="/user-management">
                            <Button className="bg-transparent border border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white font-semibold transition-colors duration-200">
                                管理员界面
                            </Button>
                        </Link>
                    )}
                    <Link to="/users/change-password">
                        <Button variant="outline">修改密码</Button>
                    </Link>
                    <Button variant="destructive" onClick={handleDeleteAccount}>
                        删除账号
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
                                <div className="shrink-0 flex items-center gap-x-4">
                                    <UserButton userId={followedUser.follow_id} userName={followedUser.follow_name} />
                                    <span className="text-xs text-gray-400 font-mono">
                                        (ID: {followedUser.follow_id})
                                    </span>
                                </div>
                                <div className="flex flex-col items-end gap-y-2 shrink-0">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleUnfollow(followedUser)}
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
                {loadingComments ? (
                    <div className="text-center text-gray-500 py-10">正在加载评论...</div>
                ) : errorComments ? (
                    <div className="text-center text-red-500 py-10">{errorComments}</div>
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
                                        <div className="space-y-3">
                                            <Textarea value={editingText} onChange={(e) => setEditingText(e.target.value)} className="w-full text-base" rows={3} />
                                            <div className="flex justify-end gap-x-2">
                                                <Button variant="ghost" size="sm" onClick={handleCancelEdit}>取消</Button>
                                                <Button size="sm" onClick={handleUpdateComment} disabled={isProcessing}>
                                                    {isProcessing ? '保存中...' : '保存'}
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="cursor-pointer group" onClick={() => handleNavigateToActivity(comment.activity_id)}>
                                                <p className="text-gray-800 group-hover:text-blue-700 transition-colors duration-200">
                                                    {comment.content}
                                                </p>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <div className="shrink-0 flex items-center gap-x-6">
                                                    <span className="text-xs text-gray-400">
                                                        {formatRelativeTime(comment.updated_at || comment.created_at)}
                                                    </span>
                                                    <span className="hidden sm:inline text-xs text-gray-200">
                                                        <span className="text-gray-400">{comment.activity_name}</span>
                                                    </span>
                                                </div>
                                                <div className="flex gap-x-2">
                                                    <Button variant="link" size="sm" onClick={(e) => { e.stopPropagation(); handleStartEdit(comment); }} disabled={isProcessing}>
                                                        编辑
                                                    </Button>
                                                    <Button variant="link" size="sm" className="text-red-600" onClick={(e) => { e.stopPropagation(); handleDeleteComment(comment.id); }} disabled={isProcessing}>
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

    if (!user && !loadingFollows && !loadingComments) {
        return (
            <div className="h-screen pt-16 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl text-red-500">请先登录以查看个人中心。</p>
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
                                {loadingFollows ? (
                                    <div className="flex items-center justify-center h-full"><p>正在加载关注列表...</p></div>
                                ) : errorFollows ? (
                                    <p className="text-center text-red-500 pt-10">{errorFollows}</p>
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