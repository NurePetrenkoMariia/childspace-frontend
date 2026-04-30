import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import './LoginPage.css'

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const success = await login(email, password);
            if (success) {
                navigate('/');
            } else {
                setError('Неправильний email або пароль');
            }
        } catch (err) {
            if (!err.response) {
                setError('Помилка сервера. Перевірте з\'єднання з інтернетом');
            } else if (err.response.status === 401) {
                setError('Неправильний email або пароль');
            } else {
                setError('Щось пішло не так. Спробуйте пізніше');
            }
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className="login-container">
            <div className="login-card">
                <h1 className="login-title">Увійдіть у свій акаунт</h1>

                {error && (
                    <div className='login-error-msg'>
                        {error}
                    </div>
                )

                }
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
                    <button type="submit" className="login-button">
                        {isLoading ? 'Вхід...' : 'Увійти'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;