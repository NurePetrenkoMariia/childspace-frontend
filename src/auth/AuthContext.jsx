import { createContext, useState, useContext, useEffect } from 'react';
import api from '../../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const response = await api.get('/auth/status');
                if (response.data.isLoggedIn) {
                    setUser(response.data);
                }
            } catch (error) {
                localStorage.removeItem('token');
            }
        };
        checkStatus();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, ...userData } = response.data;
            if (token) {
                localStorage.setItem('token', token);
                setUser(userData);
                return true
            }
        } catch (error) {
            console.error("Login context error:", error);
            throw error;
        }
    };

    const logout = async () => {
        await api.post('/auth/logout');
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);