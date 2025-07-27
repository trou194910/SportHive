import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/apiClient';
import { Button } from './button';

export default function UserButton({ userId, userName = "momo" }) {
    const { user: currentUser, isInitialized } = useAuth();
    const [user, setUser] = useState(null);
    const [activities, setActivities] = useState([]);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isAlreadyFollowed, setIsAlreadyFollowed] = useState(false);
    const [hideTimeoutId, setHideTimeoutId] = useState(null);
    const containerRef = useRef(null);
    const [isRightAligned, setIsRightAligned] = useState(false);

    const fetchData = async () => {
        if (user || !userId) {
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const promisesToRun = [
                apiClient.get(`/users/${userId}`),
                apiClient.get(`/users/${userId}/activities/create`),
                apiClient.get(`/users/${userId}/comments`)
            ];
            if (currentUser) {
                promisesToRun.push(apiClient.get(`/users/follows/${userId}`));
            }
            const [userResponse, activitiesResponse, commentsResponse, followResponse] = await Promise.all(promisesToRun);
            setUser(userResponse.data);
            setActivities(Array.isArray(activitiesResponse.data) ? activitiesResponse.data : []);
            setComments(Array.isArray(commentsResponse.data) ? commentsResponse.data : []);
            if (followResponse && followResponse.data) {
                setIsAlreadyFollowed(followResponse.data.isFollowed);
            }
        } catch (err) {
            console.error("Failed to fetch user data:", err);
            setError("无法加载用户详情。");
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = async (e) => {
        e.stopPropagation();
        if (!currentUser) {
            alert("请先登录再关注用户！");
            return;
        }
        setIsFollowing(true);
        try {
            await apiClient.post(`/users/follows/${userId}`, { follow_name: user.name });
            setIsAlreadyFollowed(true);
            alert(`成功关注 ${user.name}!`);
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
            setIsRightAligned(rect.left + popoverWidth > viewportWidth);
        }
        setIsExpanded(true);
        fetchData();
    };

    const handleMouseLeave = () => {
        const timeoutId = setTimeout(() => {
            setIsExpanded(false);
        }, 100);
        setHideTimeoutId(timeoutId);
    };

    if (!isInitialized) {
        return (
            <div className="inline-block px-4 py-2 bg-gray-400 text-white text-sm font-bold rounded-md animate-pulse">
                {userName || '...'}
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="relative inline-block w-fit"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 font-bold rounded-md cursor-pointer">
                {userName || '未知用户'}
            </span>

            {isExpanded && (
                <div className={`absolute top-full mt-2 w-72 bg-white rounded-lg shadow-xl border z-20 p-4 ${isRightAligned ? 'right-0' : 'left-0'}`}>
                    {loading ? (
                        <div className="text-center text-gray-500">加载中...</div>
                    ) : error ? (
                        <div className="text-center text-red-500 bg-red-100 p-2 rounded">{error}</div>
                    ) : user ? (
                        <>
                            {currentUser && String(currentUser.id) !== String(user.id) && (
                                <div className="absolute top-4 right-4">
                                    <Button size="sm" onClick={handleFollow} disabled={isFollowing || isAlreadyFollowed}>
                                        {isFollowing ? '处理中...' : (isAlreadyFollowed ? '已关注' : '关注')}
                                    </Button>
                                </div>
                            )}

                            <div className="pr-16">
                                <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
                                <p className="text-sm text-gray-500">{user.email}</p>
                            </div>

                            <hr className="my-3" />

                            <div>
                                <h4 className="font-semibold text-gray-700 mb-2">最近发布的活动</h4>
                                {activities.length > 0 ? (
                                    <ul className="space-y-2">
                                        {activities.slice(0, 3).map(activity => (
                                            <li key={activity.id}>
                                                <Link
                                                    to={`/activities/${activity.id}`}
                                                    className="flex items-center justify-between p-1 -m-1 rounded-md hover:bg-gray-100 transition-colors"
                                                >
                                                    <span className="text-gray-800 truncate pr-2">{activity.name}</span>
                                                    <span className="flex-shrink-0 px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                                                        {activity.type}
                                                    </span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-gray-400">该用户还没有发布任何活动。</p>
                                )}
                            </div>

                            <hr className="my-3" />

                            <div>
                                <h4 className="font-semibold text-gray-700 mb-2">最近发布的评论</h4>
                                {comments.length > 0 ? (
                                    <ul className="space-y-2">
                                        {comments.slice(0, 3).map(comment => (
                                            <li key={comment.id}>
                                                <Link
                                                    to={`/activities/${comment.activity_id}`}
                                                    className="flex items-center justify-between p-1 -m-1 rounded-md hover:bg-gray-100 transition-colors text-sm"
                                                >
                                                    <span className="text-gray-800 truncate pr-4">
                                                        {comment.content}
                                                    </span>
                                                    <span className="flex-shrink-0 text-xs text-gray-500 whitespace-nowrap">
                                                        in {comment.activity_name}
                                                    </span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-gray-400">该用户还没有发表任何评论。</p>
                                )}
                            </div>
                        </>
                    ) : null}
                </div>
            )}
        </div>
    );
}