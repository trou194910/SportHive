import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import ActivityCardPlus from '../ui/ActivityCardPlus';
import ActivityDetailModal from '../ui/ActivityDetailModal';
import { Link } from 'react-router-dom';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import useDebounce from '../../hooks/useDebounce';

export default function AllActivitiesPanel() {
    const [activities, setActivities] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('all');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                let response;
                const params = {};

                if (!debouncedSearchTerm) {
                    response = await apiClient.get('/activities');
                } else {
                    switch (searchType) {
                        case 'all':
                            params.searchText = debouncedSearchTerm;
                            break;
                        case 'name':
                            params.name = debouncedSearchTerm;
                            break;
                        case 'description':
                            params.description = debouncedSearchTerm;
                            break;
                        case 'type':
                            params.type = debouncedSearchTerm;
                            break;
                        default:
                            break;
                    }
                    response = await apiClient.get('/activities/search', { params });
                }
                let activitiesData = [];
                if (response.data && response.data.success && Array.isArray(response.data.data)) {
                    activitiesData = response.data.data;
                } else if (Array.isArray(response.data)) {
                    activitiesData = response.data;
                } else {
                    console.warn("收到的活动数据格式不符合预期:", response.data);
                }
                setActivities(activitiesData);
            } catch (err) {
                console.error("获取活动数据失败:", err);
                setError("无法加载活动数据，请稍后重试。");
                setActivities([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [debouncedSearchTerm, searchType]);

    const handleViewDetails = (activity) => setSelectedActivity(activity);
    const handleCloseDetails = () => setSelectedActivity(null);

    return (
        <>
            <div className="p-4 h-full flex flex-col">
                {/* 顶部操作栏 */}
                <div className="flex items-center justify-between mb-4 flex-shrink-0 gap-x-4">
                    <h2 className="text-2xl font-bold text-gray-800 hidden lg:block">活动广场</h2>

                    {/* 搜索区域 */}
                    <div className="flex-1 flex items-center gap-x-2 max-w-xl">
                        <select
                            value={searchType}
                            onChange={(e) => setSearchType(e.target.value)}
                            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 h-10"
                        >
                            <option value="all">所有字段</option>
                            <option value="name">按名称</option>
                            <option value="description">按描述</option>
                            <option value="type">按类型</option>
                        </select>

                        <Input
                            type="text"
                            placeholder="输入搜索内容..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1"
                        />
                    </div>

                    <Link to="/create-activity">
                        <Button>发布活动</Button>
                    </Link>
                </div>

                {/* 内容区域 */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {isLoading && <div className="text-center text-gray-500 pt-10">搜索中...</div>}
                    {error && <div className="text-center text-red-500 bg-red-100 p-3 rounded-lg">{error}</div>}
                    {!isLoading && !error && activities.length === 0 && (
                        <div className="text-center text-gray-500 pt-10">
                            {debouncedSearchTerm ? '未找到匹配的活动。' : '当前没有活动，快来发布第一个吧！'}
                        </div>
                    )}
                    {!isLoading && !error && activities.map(activity => (
                        <ActivityCardPlus
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