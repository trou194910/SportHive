import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

export default function LoginModal({ onClose }) {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await login(identifier, password);
            navigate('/');
            navigate(0);
        } catch (err) {
            setError(err.response?.data?.message || '登录失败，请检查您的凭据。');
        } finally {
            setIsLoading(false);
        }
    };

    const handleContentClick = (e) => e.stopPropagation();

    return ReactDOM.createPortal(
        <div
            className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50"
            onClick={onClose}
        >
            {/* 弹窗内容区域 */}
            <div
                className="bg-white p-8 rounded-lg shadow-xl relative w-full max-w-md"
                onClick={handleContentClick}
            >
                {/* 右上角的关闭按钮 */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition-colors"
                    aria-label="关闭"
                >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* 登录表单 */}
                <h2 className="text-2xl font-bold mb-6 text-center">欢迎回来！</h2>

                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="login-str" className="block text-sm font-medium text-gray-700 mb-1">用户名或邮箱</label>
                        <Input
                            id="login-str"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            type="text"
                            placeholder="输入您的用户名或邮箱"
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">密码</label>
                        <Input
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            placeholder="••••••••"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    {/* 错误信息显示区域 */}
                    {error && (
                        <p className="text-sm text-center text-red-600 bg-red-100 p-2 rounded-md">
                            {error}
                        </p>
                    )}

                    <div className="pt-2">
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? '登录中...' : '登 录'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>,
        document.getElementById('modal-root')
    );
}