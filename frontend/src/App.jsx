import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './components/layout/Header';
import LoginModal from './components/auth/LoginModal';
import { useAuth } from './context/AuthContext.jsx';
import mainBg from './assets/backgrounds/home.png';

function App() {
    const { isLoginModalOpen, openLoginModal, closeLoginModal } = useAuth();

    return (
        <div
            className="relative min-h-screen bg-cover bg-center"
            style={{ backgroundImage: `url(${mainBg})` }}
        >
            <Header />
            <main>
                <Outlet />
            </main>
            {isLoginModalOpen && <LoginModal onClose={closeLoginModal} />}
        </div>
    );
}

export default App;