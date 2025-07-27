import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '../context/AuthContext.jsx';
import ImageCarousel from '@/components/ui/ImageCarousel';
import apiClient from '../services/apiClient';

export default function ChangePasswordPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user) {
            alert("请先登录再修改密码。");
            navigate('/');
        }
    }, [user, navigate]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('两次输入的新密码不一致。');
            return;
        }
        if (password === newPassword) {
            setError('新密码不能与旧密码相同。');
            return;
        }
        setError(null);
        setIsLoading(true);

        try {
            const passwordData = { password, newPassword };
            await apiClient.put('/users/update', passwordData);
            alert('密码修改成功！即将跳转到个人中心页面。');
            navigate('/my-center');

        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('密码修改失败，请稍后重试。');
            }
            console.error('密码修改错误:', err);
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return null;
    }

    return (
        <div className="pt-16">
            <div className="h-[calc(100vh-4rem)] flex">
                <div className="w-1/2 h-full p-4 hidden md:block">
                    <ImageCarousel />
                </div>
                <div className="w-full md:w-1/2 h-full flex justify-center items-center p-4">
                    <div className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-xl rounded-lg p-8 space-y-6">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-gray-900">修改您的密码</h2>
                            <p className="mt-2 text-sm text-gray-600">请输入您的旧密码和新密码。</p>
                        </div>

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">旧密码</label>
                                <Input value={password} onChange={(e) => setPassword(e.target.value)} id="password" type="password" placeholder="输入您当前的密码" required />
                            </div>
                            <div>
                                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">新密码</label>
                                <Input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} id="new-password" type="password" placeholder="设置一个安全的新密码" required />
                            </div>
                            <div>
                                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">确认新密码</label>
                                <Input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} id="confirm-password" type="password" placeholder="再次输入新密码" required />
                            </div>

                            {error && (
                                <p className="text-sm text-red-600 bg-red-100 p-2 rounded-md">{error}</p>
                            )}

                            <div className="pt-2">
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? '保存中...' : '确认修改'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}