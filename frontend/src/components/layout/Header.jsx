import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import logo from '@/assets/icons/app.png';
import { useAuth } from '@/context/AuthContext';


function Header() {
    const { isLoggedIn, user, openLoginModal, logout } = useAuth();

    return (
        <header className="absolute top-0 left-0 right-0 z-10 bg-[linear-gradient(to_right,transparent_0%,transparent_20%,#dbeafe_60%,#dbeafe_100%)] border-b border-blue-100">
            <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* 左侧 Logo 等内容 */}
                <div className="flex items-center space-x-9">
                    <div className="flex items-center gap-x-4">
                        <img src={logo} alt="Logo" className="h-8 w-8" />
                        <Link to="/" className="text-2xl font-bold text-blue-800 hover:text-blue-600 transition-colors">
                            SportHive
                        </Link>
                    </div>
                    <div className="flex items-center gap-x-2 font-bold">
                        <span role="img" aria-label="runner">🏃</span>
                        专属于你的运动社区
                        <span role="img" aria-label="fire">🔥</span>
                    </div>
                </div>

                {/* 右侧根据登录状态动态显示 */}
                <div className="flex items-center space-x-6">
                    {isLoggedIn ? (
                        <>
                            {/* 如果用户存在，显示用户名 */}
                            {user && <span className="text-sm text-gray-700">欢迎，{user.username} !</span>}
                            <Link to="/my-activity">
                                <Button variant="outline">我的活动</Button>
                            </Link>
                            <div className="flex items-center space-x-9">
                                <Link to="/my-center">
                                    <Button variant="outline">个人中心</Button>
                                </Link>
                                <Button variant="ghost" onClick={logout}>退出登录</Button>
                                </div>
                        </>
                    ) : (
                        <>
                            <Button onClick={openLoginModal}>
                                登录
                            </Button>
                            <Link to="/register">
                                <Button variant="ghost">注册</Button>
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
}

export default Header;