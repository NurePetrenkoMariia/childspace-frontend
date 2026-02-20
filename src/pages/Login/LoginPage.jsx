import React, { useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import './LoginPage.css'

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            //alert('Успішний вхід!');
        } catch (err) {
            setError('Неправильний логін або пароль');
        }
    };
    return (
        <div className="login-container">
            <div className="login-card">
                <h1 className="login-title">Увійдіть у свій акаунт</h1>

                <form onSubmit={handleSubmit} className="login-form">
                    <input
                        type="email"
                        placeholder="Ваш email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="login-input"
                    />
                    <input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="login-input"
                    />
                    <button type="submit" className="login-button">Увійти</button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;