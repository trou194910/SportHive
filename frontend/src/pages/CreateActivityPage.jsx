import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import apiClient from '@/services/apiClient';
import TypeSelector from "@/components/ui/TypeSelector.jsx";

const activityTypes = [
    '羽毛球', '乒乓球', '篮球', '足球', '跑步', '力量训练', '自行车',
    '游泳', '太极', '瑜伽', '网球', '台球', '匹克球', '保龄球',
    '高尔夫', '棒球', '冰上运动', '水上运动', '越野运动', '其他'
];

const getLocalDateTimeString = (date = new Date()) => {
    const tzoffset = date.getTimezoneOffset() * 60000; // 时区偏移，单位毫秒
    return (new Date(date - tzoffset)).toISOString().slice(0, 16);
};

export default function CreateActivityPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        location: '',
        start_time: getLocalDateTimeString(),
        end_time: getLocalDateTimeString(new Date(Date.now() + 60 * 60 * 1000)),
        capacity: '10',
        type: activityTypes[0],
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleTypeChange = (newType) => {
        setFormData(prev => ({ ...prev, type: newType }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = "活动名称不能为空。";
        if (formData.name.length > 10) newErrors.name = "活动名称不能超过10个字。";
        if (!formData.description) newErrors.description = "活动描述不能为空。";
        if (formData.description.length > 200) newErrors.description = "活动描述不能超过200个字。";
        if (!formData.location) newErrors.location = "活动地点不能为空。";
        if (formData.location.length > 50) newErrors.location = "活动地点不能超过50个字。";
        if (!formData.capacity || formData.capacity <= 0) newErrors.capacity = "容量必须是正数。";

        const startTime = new Date(formData.start_time);
        const endTime = new Date(formData.end_time);
        if (startTime >= endTime) {
            newErrors.end_time = "结束时间必须晚于开始时间。";
        }
        if (startTime < new Date()) {
            newErrors.start_time = "开始时间不能早于当前时间。";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        try {
            const submissionData = {
                ...formData,
                startTime: new Date(formData.start_time).toISOString(),
                endTime: new Date(formData.end_time).toISOString(),
                capacity: parseInt(formData.capacity, 10),
            };
            await apiClient.post('/activities', submissionData);
            alert('活动发布成功！');
            navigate('/');
        } catch (err) {
            console.error("发布活动失败:", err);
            setErrors({ submit: err.response?.data?.message || '发布失败，请稍后重试。' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="pt-16 bg-gray-50/50 flex flex-col h-screen">
            <div className="container mx-auto px-4 py-10 flex-1 overflow-hidden">
                <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-200 h-full overflow-y-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800">发布新活动</h1>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <fieldset className="space-y-6">
                            {/* 活动名称 */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">活动名称</label>
                                <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="例如：周末轻松羽毛球局" maxLength="10" required />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>
                            {/* 活动描述 */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">详细描述</label>
                                <textarea
                                    id="description" name="description" value={formData.description} onChange={handleChange}
                                    rows="5" maxLength="200" required placeholder="介绍一下活动的亮点、注意事项、面向人群等..."
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                />
                                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                            </div>
                        </fieldset>
                        <fieldset className="space-y-6">
                            {/* 地点 */}
                            <div>
                                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">活动地点</label>
                                <Input id="location" name="location" value={formData.location} onChange={handleChange} placeholder="例如：奥体中心羽毛球馆 5号场地" maxLength="50" required />
                                {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
                            </div>
                            {/* 类型 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">活动类型</label>
                                <TypeSelector
                                    options={activityTypes}
                                    value={formData.type}
                                    onChange={handleTypeChange}
                                />
                            </div>
                        </fieldset>
                        <fieldset>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {/* 开始时间 */}
                                <div className="sm:col-span-2 md:col-span-1">
                                    <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-1">开始时间</label>
                                    <Input id="start_time" name="start_time" type="datetime-local" value={formData.start_time} onChange={handleChange} required />
                                    {errors.start_time && <p className="text-red-500 text-xs mt-1">{errors.start_time}</p>}
                                </div>
                                {/* 结束时间 */}
                                <div className="sm:col-span-2 md:col-span-1">
                                    <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-1">结束时间</label>
                                    <Input id="end_time" name="end_time" type="datetime-local" value={formData.end_time} onChange={handleChange} required />
                                    {errors.end_time && <p className="text-red-500 text-xs mt-1">{errors.end_time}</p>}
                                </div>
                                {/* 容量 */}
                                <div>
                                    <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">容量 (人)</label>
                                    <Input id="capacity" name="capacity" type="number" min="1" value={formData.capacity} onChange={handleChange} required />
                                    {errors.capacity && <p className="text-red-500 text-xs mt-1">{errors.capacity}</p>}
                                </div>
                            </div>
                        </fieldset>
                        {/* --- 提交区域 --- */}
                        <div className="text-center pt-6">
                            {errors.submit && <p className="bg-red-100 text-red-700 p-3 rounded-md text-sm mb-4">{errors.submit}</p>}
                            <Button type="submit" disabled={isSubmitting} className="w-full max-w-xs py-3 text-lg">
                                {isSubmitting ? '发布中...' : '确认发布'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}