import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function DeleteAccountPage() {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.username || !formData.password) {
            setError('用户名和密码不能为空。');
            return;
        }
        setIsSubmitting(true);
        setError('');
        try {
            await apiClient.post('/users/delete', {
                username: formData.username,
                password: formData.password,
            });
            alert('账号已成功删除。再见！');
            logout();
            navigate('/');
        } catch (err) {
            console.error("删除账号确认失败:", err);
            setError(err.response?.data?.message || '验证失败，请检查您的用户名和密码。');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="pt-16 bg-gray-50/50 min-h-screen flex items-center justify-center">
            <div className="max-w-lg w-full mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-red-600">删除账号确认</h1>
                    <p className="mt-2 text-gray-600">这是一个不可逆的操作</p>
                    <p className="mt-2 text-gray-600">为了安全，请输入您的用户名和密码以确认删除您的账号</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                            用户名
                        </label>
                        <Input
                            id="username"
                            name="username"
                            type="text"
                            autoComplete="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            密码
                        </label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {error && (
                        <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row-reverse gap-4 pt-4">
                        <Button
                            type="submit"
                            variant="destructive"
                            className="w-full"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? '正在删除...' : '确认永久删除'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => navigate(-1)}
                        >
                            取消
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}