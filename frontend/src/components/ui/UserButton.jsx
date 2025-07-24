import React, { useState, useEffect, useRef } from 'react'; // 1. 引入 useRef
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/apiClient';
import { Button } from './button';

export default function UserButton({ description = '发布者', userId }) {
    const { user: currentUser, isInitialized } = useAuth();
    const [user, setUser] = useState(null);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hideTimeoutId, setHideTimeoutId] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isAlreadyFollowed, setIsAlreadyFollowed] = useState(false);
    const containerRef = useRef(null);
    const [isRightAligned, setIsRightAligned] = useState(false);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            setError("User ID is required.");
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [userResponse, activitiesResponse] = await Promise.all([
                    apiClient.get(`/users/${userId}`),
                    apiClient.get(`/users/${userId}/activities/create`)
                ]);
                setUser(userResponse.data.data);
                setActivities(Array.isArray(activitiesResponse.data) ? activitiesResponse.data : []);
            } catch (err) {
                console.error("Failed to fetch user data:", err);
                setError("Could not load user details.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    useEffect(() => {
        if (isInitialized) {
            if (currentUser && currentUser.follows && userId) {
                const followedIdsAsString = currentUser.follows.map(id => String(id));
                const isFollowed = followedIdsAsString.includes(String(userId));
                setIsAlreadyFollowed(isFollowed);
            } else {
                setIsAlreadyFollowed(false);
            }
        }
    }, [isInitialized, currentUser, userId]);

    const handleFollow = async (e) => {
        e.stopPropagation();
        if (!currentUser) {
            alert("请先登录再关注用户！");
            return;
        }
        setIsFollowing(true);
        try {
            await apiClient.post(`/users/follows/${userId}`);
            setIsAlreadyFollowed(true);
            alert(`成功关注 ${user.username}!`);
        } catch (err) {
            console.error("Follow failed:", err);
            alert("关注失败，请稍后再试。");
        } finally {
            setIsFollowing(false);
        }
    };

    const handleMouseEnter = () => {
        clearTimeout(hideTimeoutId);
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const popoverWidth = 288;
            const viewportWidth = window.innerWidth;
            if (rect.left + popoverWidth > viewportWidth) {
                setIsRightAligned(true);
            } else {
                setIsRightAligned(false);
            }
        }
        setIsExpanded(true);
    };

    const handleMouseLeave = () => {
        const timeoutId = setTimeout(() => {
            setIsExpanded(false);
        }, 100);
        setHideTimeoutId(timeoutId);
    };

    if (!isInitialized) {
        return (
            <div className="flex items-center gap-1 p-1 rounded-lg bg-gray-200 border">
                <div className="text-xs font-semibold text-gray-500 whitespace-nowrap pl-1">
                    {description}
                </div>
                <div className="px-2 py-0.5 rounded-md bg-gray-400 text-white text-xs text-center font-bold">
                    ...
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="text-xs text-red-500 bg-red-100 px-2 py-1 rounded">加载失败</div>;
    }

    return (
        <div
            ref={containerRef}
            className="relative w-fit"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="flex items-center gap-1 p-1 rounded-lg bg-pink-100 border border-pink-200 shadow-sm">
                <div className="text-xs font-semibold text-pink-700 whitespace-nowrap pl-1">
                    {description}
                </div>
                <div className="px-2 py-0.5 rounded-md bg-pink-500 text-white text-xs text-center font-bold truncate">
                    {loading ? '加载中...' : (user?.username || '未知用户')}
                </div>
            </div>

            {/* 展开视图 */}
            {isExpanded && user && (
                <div className={`absolute top-full mt-2 w-72 bg-white rounded-lg shadow-xl border z-20 p-4 ${isRightAligned ? 'right-0' : 'left-0'}`}>
                    <div className="absolute top-4 right-4">
                        <Button
                            size="sm"
                            onClick={handleFollow}
                            disabled={!currentUser || isFollowing || isAlreadyFollowed || currentUser.id === user.id}
                        >
                            {isFollowing ? '处理中...' : (isAlreadyFollowed ? '已关注' : '关注')}
                        </Button>
                    </div>

                    <div className="pr-16">
                        <h3 className="text-xl font-bold text-gray-900">{user.username}</h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                    </div>

                    <hr className="my-3" />

                    <div>
                        <h4 className="font-semibold text-gray-700 mb-2">最近的动态</h4>
                        {activities.length > 0 ? (
                            <ul className="space-y-2">
                                {activities.slice(0, 3).map(activity => (
                                    <li key={activity.id} className="flex items-center justify-between">
                                        <span className="text-gray-800 truncate pr-2">{activity.name}</span>
                                        <span className="flex-shrink-0 px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                                            {activity.type}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-400">该用户还没有发布任何活动。</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
