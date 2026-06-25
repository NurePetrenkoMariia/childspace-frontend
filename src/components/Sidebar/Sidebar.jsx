import { useAuth } from '../../auth/AuthContext';
import { useNavigate, useLocation } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import './Sidebar.css';

import homeIcon from '../../assets/icons/home.png';
import adminIcon from '../../assets/icons/admin.png';
import scheduleIcon from '../../assets/icons/schedule.png';
import attendanceIcon from '../../assets/icons/tick.png';
import chatIcon from '../../assets/icons/chat.png';
import materialsIcon from '../../assets/icons/books.png';
import logoutIcon from '../../assets/icons/logout-48.png';
import profileIcon from '../../assets/icons/profile.png';

const Sidebar = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const isAdmin = user?.roles?.includes('SuperAdmin') || user?.roles?.includes('CenterAdmin');
    const isGuest = !user;
    const canViewAttend = user?.roles?.includes('SuperAdmin') || user?.roles?.includes('CenterAdmin') || user?.roles?.includes('Teacher');
    const [hasUnreadChats, setHasUnreadChats] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    useEffect(() => {
        const checkUnread = async () => {
            try {
                const response = await api.get('/chat/has-unread');
                setHasUnreadChats(response.data.hasUnread);
            } catch (error) {
                console.error("Помилка перевірки непрочитаних повідомлень:", error);
            }
        };

        checkUnread();

        const intervalId = setInterval(checkUnread, 30000);

        const handleChatRead = () => {
            checkUnread();
        };
        window.addEventListener('chats-read-update', handleChatRead);

        return () => {
            clearInterval(intervalId);
            window.removeEventListener('chats-read-update', handleChatRead);
        };

    }, []);

    const confirmLogout = async () => {
        setIsLogoutModalOpen(false);
        await logout();
        navigate("/login");
    };

    const handleNavigation = (path, isRestricted = false) => {
        if (isRestricted && isGuest) {
            navigate("/login", {
                state: {
                    from: path,
                    message: "Будь ласка, увійдіть у систему, щоб отримати доступ до цього розділу."
                }
            });
        } else{
            navigate(path); 
        }
    };

    const getNavItemClass = (path, isRestricted = false) => {
        let baseClass = "nav-item";

        if (isRestricted && isGuest) {
            baseClass += " restricted-item";
        }

        if (path === "/") {
            const isHomeChild =
                location.pathname === "/" ||
                location.pathname.startsWith("/center") ||
                location.pathname.startsWith("/subject");

            return isHomeChild ? "nav-item active" : "nav-item";
        }
        if (location.pathname.startsWith(path)) {
            return `${baseClass} active`;
        }
        return baseClass;
    };

    return (
        <>
            <div className="sidebar">
                <div className="nav-icons">
                    <div className={getNavItemClass("/")} onClick={() => handleNavigation("/")} title="Головна">
                        <img src={homeIcon} alt="Home" className="sidebar-custom-icon" />
                    </div>
                    {isAdmin && (
                        <div className={getNavItemClass("/admin")} onClick={() => handleNavigation("/admin")} title='Адмін-панель'>
                            <img src={adminIcon} alt="Admin" className="sidebar-custom-icon" />
                        </div>
                    )}
                    <div className={getNavItemClass("/schedule", true)} onClick={() => handleNavigation("/schedule", true)} title='Розклад'>
                        <img src={scheduleIcon} alt="Schedule" className="sidebar-custom-icon" />
                    </div>
                    {canViewAttend && (
                        <div className={getNavItemClass("/attendance")} onClick={() => handleNavigation("/attendance")} title='Відвідування'>
                            <img src={attendanceIcon} alt="Attendance" className="sidebar-custom-icon" />
                        </div>
                    )}
                    <div className={getNavItemClass("/chats", true)} onClick={() => handleNavigation("/chats", true)} title='Чати'>
                        <img src={chatIcon} alt="Chat" className="sidebar-custom-icon" />
                        {hasUnreadChats && (
                            <span className="sidebar-unread-dot" title="Є нові повідомлення"></span>
                        )}
                    </div>
                    <div className={getNavItemClass("/materials", true)} onClick={() => handleNavigation("/materials", true)} title='Матеріали'>
                        <img src={materialsIcon} alt="Materials" className="sidebar-custom-icon" />
                    </div>
                </div>
                {!isGuest && (
                    <div className='nav-icons-bottom'>
                        <div className={getNavItemClass("/profile")} onClick={() => handleNavigation("/profile")} title='Профіль'>
                            <img src={profileIcon} alt="Profile" className="sidebar-custom-icon" />
                        </div>
                        <button className="logout-btn" onClick={() => setIsLogoutModalOpen(true)} title='Вихід з акаунта'>
                            <img src={logoutIcon} alt="Logout" className="sidebar-custom-icon" />
                        </button>
                    </div>
                )}
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
                            >
                                Так, вийти
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Sidebar;