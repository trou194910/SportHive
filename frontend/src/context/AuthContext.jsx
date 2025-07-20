import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../services/apiClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [isInitialized, setIsInitialized] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    useEffect(() => {
        try {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                const storedUser = JSON.parse(localStorage.getItem('user'));
                setToken(storedToken);
                setUser(storedUser);
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            }
        } catch (error) {
            console.error("恢复认证状态失败:", error);
            localStorage.clear();
        } finally {
            setIsInitialized(true);
        }
    }, []);

    useEffect(() => {
        if (isInitialized) {
            if (token && user) {
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            } else {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                delete apiClient.defaults.headers.common['Authorization'];
            }
        }
    }, [token, user, isInitialized]);


    const openLoginModal = () => setIsLoginModalOpen(true);
    const closeLoginModal = () => setIsLoginModalOpen(false);

    const login = async (str, password) => {
        const response = await apiClient.post('/users/login', { str, password });
        const { user, token } = response.data;
        setUser(user);
        setToken(token);
        closeLoginModal();
    };

    const logout = () => {
        setUser(null);
        setToken(null);
    };

    const value = {
        isInitialized,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
        user,
        token,
        isLoggedIn: !!user,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {isInitialized ? children : null}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}