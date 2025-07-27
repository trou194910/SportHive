import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '../context/AuthContext.jsx';
import ImageCarousel from '@/components/ui/ImageCarousel';
import apiClient from '../services/apiClient';

function RegistrationPage() {
    const navigate = useNavigate();
    const { openLoginModal } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (password !== confirmPassword) {
            setError('两次输入的密码不一致。');
            return;
        }

        setError(null);
        setIsLoading(true);

        try {
            const userData = { name: name, email, password };
            const response = await apiClient.post('/users/register', userData);
            console.log('注册成功:', response.data);
            alert('注册成功！即将跳转到登录页面。');
            navigate('/');
            openLoginModal();

        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('注册失败，请稍后重试。');
            }
            console.error('注册错误:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="pt-16">
            <div className="h-[calc(100vh-4rem)] flex">
                <div className="w-1/2 h-full p-4 hidden md:block">
                    <ImageCarousel />
                </div>
                <div className="w-full md:w-1/2 h-full flex justify-center items-center p-4">
                    <div className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-xl rounded-lg p-8 space-y-6">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-gray-900">创建您的账户</h2>
                            <p className="mt-2 text-sm text-gray-600">加入 SportHive，开始您的运动之旅！</p>
                        </div>

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            {/* 将每个输入框和它的状态绑定 */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">用户名</label>
                                <Input value={name} onChange={(e) => setName(e.target.value)} id="name" type="text" placeholder="设置一个独特的用户名" required />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">邮箱地址</label>
                                <Input value={email} onChange={(e) => setEmail(e.target.value)} id="email" type="email" placeholder="you@example.com" required />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">密码</label>
                                <Input value={password} onChange={(e) => setPassword(e.target.value)} id="password" type="password" placeholder="至少8个字符" required />
                            </div>
                            <div>
                                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">确认密码</label>
                                <Input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} id="confirm-password" type="password" placeholder="再次输入密码" required />
                            </div>

                            {/* 显示错误信息 */}
                            {error && (
                                <p className="text-sm text-red-600 bg-red-100 p-2 rounded-md">{error}</p>
                            )}

                            <div className="pt-2">
                                {/* 在加载时禁用按钮并显示提示 */}
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? '注册中...' : '立即注册'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegistrationPage;