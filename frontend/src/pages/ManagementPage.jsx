import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/apiClient';
import { Button } from '@/components/ui/button';

const ActivityItem = ({ activity, onApprove, onDelete, isProcessing }) => (
    <li className="p-4 rounded-lg hover:bg-gray-100 transition-colors duration-200">
        <div className="flex items-center justify-between gap-4">
            {/* 左侧：可点击的活动信息 */}
            <Link to={`/activities/${activity.id}`} className="flex-grow group">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-700">{activity.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{activity.description}</p>
            </Link>

            {/* 右侧：操作按钮组 */}
            <div className="flex-shrink-0 flex gap-x-2">
                <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => { e.stopPropagation(); onApprove(activity.id); }}
                    disabled={isProcessing}
                >
                    {isProcessing ? '处理中...' : '审核通过'}
                </Button>
                <Button
                    size="sm"
                    variant="destructive"
                    onClick={(e) => { e.stopPropagation(); onDelete(activity.id); }}
                    disabled={isProcessing}
                >
                    {isProcessing ? '处理中...' : '删除活动'}
                </Button>
            </div>
        </div>
    </li>
);

const UserItem = ({ user, currentUser, onUpdatePermission, isProcessing }) => {
    const PERMISSION_LEVELS = [
        { level: 1, label: '黑名单', className: 'bg-black text-white hover:bg-gray-800' },
        { level: 2, label: '被警告', className: 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500' },
        { level: 3, label: '普通用户', className: 'bg-blue-500 text-white hover:bg-blue-600' },
        { level: 4, label: '管理员', className: 'bg-green-500 text-white hover:bg-green-600' },
        { level: 5, label: '超级管理员', className: 'bg-indigo-600 text-white hover:bg-indigo-700' },
    ];
    const inactiveBtnClass = "bg-white text-gray-500 border border-gray-300 hover:bg-gray-100";

    return (
        <li className="p-4 rounded-lg bg-gray-50 border">
            {/* 第一行：用户名和权限按钮 */}
            <div className="flex flex-wrap items-center justify-between gap-y-3 mb-3">
                <h3 className="font-bold text-lg text-gray-900">{user.name}</h3>
                <div className="flex items-center gap-x-2 flex-wrap gap-y-2">
                    {PERMISSION_LEVELS.map(p => {
                        const isActive = user.permission === p.level;
                        const isSelf = currentUser?.id === user.id;

                        return (
                            <Button
                                key={p.level}
                                size="sm"
                                className={`px-3 py-1 text-xs font-semibold rounded-full ${isActive ? p.className : inactiveBtnClass}`}
                                onClick={() => onUpdatePermission(user.id, p.level)}
                                disabled={isProcessing || isActive || isSelf}
                            >
                                {p.label}
                            </Button>
                        );
                    })}
                </div>
            </div>

            {/* 第二行：ID 和 Email */}
            <div className="flex items-center gap-x-4 text-sm text-gray-500 font-mono">
                <span>ID: {user.id}</span>
                <span>{user.email}</span>
            </div>
        </li>
    );
};

export default function ManagementPage() {
    const { user: currentUser } = useAuth();
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [processingId, setProcessingId] = useState(null);
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(true);
    const [usersError, setUsersError] = useState('');
    const [processingUserId, setProcessingUserId] = useState(null);

    const fetchUsers = async () => {
        setUsersLoading(true);
        setUsersError('');
        try {
            const response = await apiClient.get('/users/user_management');
            setUsers(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error("获取用户列表失败:", err);
            setUsersError("无法加载用户列表，请稍后再试。");
        } finally {
            setUsersLoading(false);
        }
    };

    useEffect(() => {
        const fetchActivities = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await apiClient.get('/activities');
                setActivities(Array.isArray(response.data) ? response.data : []);
            } catch (err) {
                console.error("获取活动列表失败:", err);
                setError("无法加载活动列表，请稍后再试。");
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
        fetchUsers();
    }, []);

    const handleApprove = async (activityId) => {
        setProcessingId(activityId);
        try {
            await apiClient.put(`/activities/${activityId}/pass`);
            setActivities(prevActivities => prevActivities.filter(a => a.id !== activityId));
        } catch (err) {
            console.error("审核通过失败:", err);
            alert("操作失败，请稍后重试。");
        } finally {
            setProcessingId(null);
        }
    };

    const handleDelete = async (activityId) => {
        if (window.confirm("确定要永久删除这个活动吗？")) {
            setProcessingId(activityId);
            try {
                await apiClient.delete(`/activities/${activityId}`);
                setActivities(prevActivities => prevActivities.filter(a => a.id !== activityId));
            } catch (err) {
                console.error("删除活动失败:", err);
                alert("删除失败，请稍后重试。");
            } finally {
                setProcessingId(null);
            }
        }
    };

    const handleUpdatePermission = async (userId, newPermission) => {
        setProcessingUserId(userId);
        try {
            const response = await apiClient.put(`/users/user_management/${userId}`, { newPermission });
            setUsers(prevUsers =>
                prevUsers.map(u => (u.id === userId ? response.data : u))
            );
            fetchUsers();
        } catch (err) {
            console.error("更新用户权限失败:", err);
            alert("操作失败，该权限可能高于或等于您。");
        } finally {
            setProcessingUserId(null);
        }
    };

    const pendingActivities = activities.filter(activity => activity.condition === 1);

    const renderActivityApproval = () => (
        <div className="bg-white rounded-lg shadow-md h-full flex flex-col">
            <h2 className="text-2xl font-bold text-gray-800 border-b p-6">活动审核</h2>
            <div className="overflow-y-auto flex-1 p-4">
                {loading ? (
                    <p className="text-center text-gray-500 p-10">正在加载待审核活动...</p>
                ) : error ? (
                    <p className="text-center text-red-500 p-10">{error}</p>
                ) : pendingActivities.length === 0 ? (
                    <p className="text-center text-gray-500 p-10">没有需要审核的活动。</p>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {pendingActivities.map(activity => (
                            <ActivityItem
                                key={activity.id}
                                activity={activity}
                                onApprove={handleApprove}
                                onDelete={handleDelete}
                                isProcessing={processingId === activity.id}
                            />
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );

    const renderUserManagement = () => (
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md h-full flex flex-col">
            <h2 className="text-2xl font-bold text-gray-800 border-b p-6">用户管理</h2>
            <div className="overflow-y-auto flex-1 p-4">
                {usersLoading ? (
                    <p className="text-center text-gray-500 p-10">正在加载用户列表...</p>
                ) : usersError ? (
                    <p className="text-center text-red-500 p-10">{usersError}</p>
                ) : (
                    <ul className="space-y-4">
                        {users.map(user => (
                            <UserItem
                                key={user.id}
                                user={user}
                                currentUser={currentUser}
                                onUpdatePermission={handleUpdatePermission}
                                isProcessing={processingUserId === user.id}
                            />
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );


    return (
        <div className="h-screen pt-16">
            <div className="container mx-auto px-4 h-full py-8">
                <main className="flex flex-col md:flex-row gap-8 h-full">
                    {/* 左栏 */}
                    <aside className="w-full md:w-1/2 h-full">
                        {renderActivityApproval()}
                    </aside>

                    {/* 右栏 */}
                    <section className="w-full md:w-1/2 h-full">
                        {renderUserManagement()}
                    </section>
                </main>
            </div>
        </div>
    );
}