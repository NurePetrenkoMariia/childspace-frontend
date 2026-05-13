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
        return () => clearInterval(intervalId);

    }, []);

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    const getNavItemClass = (path) => {
        return location.pathname === path ? "nav-item active" : "nav-item";
    };

    return (
        <div className="sidebar">
            <div className="nav-icons">
                <div className={getNavItemClass("/")} onClick={() => navigate("/")}>
                    <img src={homeIcon} alt="Home" className="sidebar-custom-icon" />
                </div>
                {isAdmin && (
                    <div className={getNavItemClass("/admin")} onClick={() => navigate("/admin")}>
                        <img src={adminIcon} alt="Admin" className="sidebar-custom-icon" />
                    </div>
                )}
                <div className={getNavItemClass("/schedule")} onClick={() => navigate("/schedule")}>
                    <img src={scheduleIcon} alt="Schedule" className="sidebar-custom-icon" />
                </div>
                {canViewAttend && (
                    <div className={getNavItemClass("/attendance")} onClick={() => navigate("/attendance")}>
                        <img src={attendanceIcon} alt="Attendance" className="sidebar-custom-icon" />
                    </div>
                )}
                <div className={getNavItemClass("/chats")} onClick={() => navigate("/chats")}>
                    <img src={chatIcon} alt="Chat" className="sidebar-custom-icon" />
                    {hasUnreadChats && (
                        <span className="sidebar-unread-dot" title="Є нові повідомлення"></span>
                    )}
                </div>
                <div className={getNavItemClass("/materials")} onClick={() => navigate("/materials")}>
                    <img src={materialsIcon} alt="Materials" className="sidebar-custom-icon" />
                </div>
            </div>
            {!isGuest && (
                <div className='nav-icons-bottom'>
                    <div className={getNavItemClass("/profile")} onClick={() => navigate("/profile")}>
                        <img src={profileIcon} alt="Profile" className="sidebar-custom-icon" />
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                        <img src={logoutIcon} alt="Logout" className="sidebar-custom-icon" />
                    </button>
                </div>
            )}

        </div>
    );
};

export default Sidebar;