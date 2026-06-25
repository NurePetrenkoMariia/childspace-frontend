import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import './LoginPage.css'
import showIcon from '../../assets/icons/login-eye.png';
import hideIcon from '../../assets/icons/login-closed-eye.png';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
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
            <button className='dashboard-header-center-btn login-back-btn'
                onClick={() => navigate(-1)}
                title='Повернутися на попередню сторінку'
            >
                ← Повернутися назад
            </button>
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
                    <div className='password-input-container'>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Пароль"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="login-input"
                        />
                        <button
                            type="button"
                            className='show-hide-password-btn'
                            onClick={() => setShowPassword(!showPassword)}
                            title={showPassword ? "Сховати пароль" : "Показати пароль"}
                        >
                            {showPassword ? <img src={hideIcon} alt='Hide password' className='hide-password-icon' /> : <img src={showIcon} alt='Show password' className='hide-password-icon' />}
                        </button>
                    </div>

                    <button type="submit" className="login-button">
                        {isLoading ? 'Вхід...' : 'Увійти'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;