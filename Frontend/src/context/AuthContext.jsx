import { useCallback, useState } from 'react';
import { AuthContext } from './authContext';

const getStoredUser = () => {
    try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        return token && userStr ? JSON.parse(userStr) : null;
    } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(getStoredUser);
    const [loading, setLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getStoredUser()));

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        setUser(null);
        setIsAuthenticated(false);
        window.location.href = '/';
    }, []);

    const checkAuthStatus = useCallback(async () => {
        const storedUser = getStoredUser();
        setUser(storedUser);
        setIsAuthenticated(Boolean(storedUser));
        setLoading(false);
    }, []);

    const login = (userData, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));

        setUser(userData);
        setIsAuthenticated(true);
    };

    const updateUser = useCallback((updatedUserData) => {
        setUser((currentUser) => {
            const newUserData = { ...currentUser, ...updatedUserData };
            localStorage.setItem('user', JSON.stringify(newUserData));
            return newUserData;
        });
    }, []);

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        updateUser,
        checkAuthStatus
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
