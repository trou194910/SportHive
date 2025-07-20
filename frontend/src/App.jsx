import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './components/layout/Header';
import LoginModal from './components/auth/LoginModal';
import { useAuth } from './context/AuthContext.jsx';
import mainBg from './assets/backgrounds/home.png';

function App() {
    const { isLoginModalOpen, openLoginModal, closeLoginModal } = useAuth();

    return (
        // 1. 设置全局背景，并添加 relative 定位，作为子元素绝对定位的参照物
        <div
            className="relative min-h-screen bg-cover bg-center"
            style={{ backgroundImage: `url(${mainBg})` }}
        >
            <Header />

            <main>
                <Outlet />
            </main>

            {/* 4. 根据从 Context 获取的状态来决定是否渲染 LoginModal */}
            {isLoginModalOpen && <LoginModal onClose={closeLoginModal} />}
        </div>
    );
}

export default App;