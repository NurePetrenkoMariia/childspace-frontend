import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import api from '../../../api/axios';
import './ProfilePage.css'

const ProfilePage = () => {
    const { user, logout } = useAuth();
    const [userData, setUserData] = useState(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [passwords, setPasswords] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const isParent = user.roles.includes('Parent');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/user/profile');
                setUserData(response.data);
            } catch (error) {
                console.error("Помилка завантаження профілю:", error);
                setMessage({ text: 'Не вдалося завантажити дані профілю', type: 'error' });
            } finally {
                setIsLoadingProfile(false);
            }
        }

        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
        setMessage({ text: '', type: '' });
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        const newPass = passwords.newPassword;
        if (newPass !== passwords.confirmPassword) {
            setMessage({ text: 'Нові паролі не співпадають!', type: 'error' });
            return;
        }

        if (newPass.length < 6) {
            setMessage({ text: 'Новий пароль має містити щонайменше 6 символів.', type: 'error' });
            return;
        }

        if (!/[A-Z]/.test(newPass)) {
            setMessage({ text: 'Пароль має містити хоча б 1 велику літеру (A-Z).', type: 'error' });
            return;
        }

        if (!/\d/.test(newPass)) {
            setMessage({ text: 'Пароль має містити хоча б 1 цифру (0-9).', type: 'error' });
            return;
        }

        if (!/[^a-zA-Z0-9]/.test(newPass)) {
            setMessage({ text: 'Пароль має містити хоча б 1 спец. символ (!, @, #, _ тощо).', type: 'error' });
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                currentPassword: passwords.oldPassword,
                newPassword: passwords.newPassword,
                confirmNewPassword: passwords.confirmPassword
            };
            await api.post(`/user/${user.id}/change-password`, payload);
            setMessage({ text: 'Пароль успішно змінено!', type: 'success' });
            setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            console.error("Помилка зміни пароля:", error);
            const errorMsg = error.response?.data?.message
                || error.response?.data?.errors?.[0]?.description
                || 'Неправильний старий пароль або помилка сервера.';

            setMessage({ text: errorMsg, type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLogoutClick = () => {
        setIsLogoutModalOpen(true);
    };

    const confirmLogout = () => {
        logout();
        navigate('/login');
    };

    if (isLoadingProfile) {
        return <div style={{ textAlign: 'center', marginTop: '50px', color: '#6A35C2' }}>Завантаження профілю...</div>;
    }

    if (!userData) {
        return <div style={{ textAlign: 'center', marginTop: '50px', color: '#D30000' }}>Помилка завантаження даних</div>;
    }

    return (
        <div className='profile-container'>
            <h1 className="profile-page-title">Мій профіль</h1>
            <div className='profile-content-wrapper'>
                <div className='profile-card profile-card-info' >

                    <div className='profile-card-avatar'>
                        {userData.firstName ? userData.firstName.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div className='profile-card-name'>
                        <h2 className="profile-card-name-field">{userData.firstName} {userData.lastName}</h2>
                    </div>
                    <div className='profile-card-details'>
                        <div className="detail-group">
                            <span className="detail-label">Email:</span>
                            <span className="detail-value">{userData.email}</span>
                        </div>
                        <div className="detail-group">
                            <span className="detail-label">Телефон:</span>
                            <span className="detail-value">{userData.phoneNumber || 'Не вказано'}</span>
                        </div>
                    </div>
                </div>
                {isParent && (
                    <div className='profile-card profile-children-card' >
                        <h3 style={{ color: '#4F169E' }}>Ваші діти</h3>
                        {userData.children && userData.children.length > 0 ? (
                            <div className="children-list">
                                {userData.children.map((child, index) => (
                                    <div key={index} className="child-item">

                                        <div className="child-info">
                                            <h4 className="child-name">{child.name}</h4>
                                            <p className="child-meta">
                                                <span className='detail-label'> Вік: </span>{child.age} {child.age === 1 ? 'рік' : (child.age > 1 && child.age < 5 ? 'роки' : 'років')}
                                            </p>
                                            {child.groupNames && child.groupNames.length > 0 && (
                                                <div className="profile-groups-container">
                                                    <span className="detail-label">Групи: </span>
                                                    <span className="groups-list">
                                                        {child.groupNames.join(', ')}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-children-placeholder">
                                <p>Інформація про дітей відсутня.</p>
                            </div>
                        )}
                    </div>
                )}
                <div className='profile-card profile-card-password'>
                    <h3>Зміна пароля</h3>
                    <form onSubmit={handlePasswordSubmit} className="password-form">
                        <div className="form-group">
                            <label>Старий пароль</label>
                            <input
                                type="password"
                                name="oldPassword"
                                required
                                value={passwords.oldPassword}
                                onChange={handleChange}
                                placeholder="Введіть поточний пароль"
                            />
                        </div>
                        <div className="password-rules">
                            <p>Пароль має містити:</p>
                            <ul>
                                <li>Мінімум 6 символів</li>
                                <li>Хоча б 1 спец. символ (наприклад: !, @, #, _);</li>
                                <li>Хоча б 1 цифру (0-9)</li>
                                <li>Хоча б 1 велику літеру (A-Z)</li>
                            </ul>
                        </div>
                        <div className="form-group">
                            <label>Новий пароль</label>
                            <input
                                type="password"
                                name="newPassword"
                                required
                                value={passwords.newPassword}
                                onChange={handleChange}
                                placeholder="Мінімум 6 символів"
                            />
                        </div>
                        <div className="form-group">
                            <label>Підтвердіть новий пароль</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                required
                                value={passwords.confirmPassword}
                                onChange={handleChange}
                                placeholder="Повторіть новий пароль"
                            />
                        </div>

                        {message.text && (
                            <div className={`message-alert ${message.type}`}>
                                {message.text}
                            </div>
                        )}

                        <button type="submit" className="apply-btn" disabled={isSubmitting}>
                            {isSubmitting ? 'Збереження...' : 'Змінити пароль'}
                        </button>
                    </form>
                </div>

                <div className="logout-section">
                    <button className="profile-logout-btn" onClick={handleLogoutClick}>
                        Вийти з акаунту
                    </button>
                </div>
            </div>
            {isLogoutModalOpen && (
                <div className="profile-modal-overlay" onClick={() => setIsLogoutModalOpen(false)}>
                    <div className="profile-modal-content" onClick={e => e.stopPropagation()}>
                        <h2 className="modal-title" style={{ marginTop: 0, textAlign: 'center' }}>
                            Вихід з системи
                        </h2>
                        <p className="profile-modal-text">
                            Ви впевнені, що хочете вийти з акаунту? Вам доведеться вводити логін та пароль знову.
                        </p>
                        <div className="profile-modal-actions">
                            <button
                                className="cancel-btn"
                                onClick={() => setIsLogoutModalOpen(false)}
                            >
                                Скасувати
                            </button>
                            <button
                                className="profile-logout-btn confirm-logout-btn"
                                onClick={confirmLogout}
                                style={{marginBottom: '0px'}}
                            >
                                Так, вийти
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

};

export default ProfilePage;