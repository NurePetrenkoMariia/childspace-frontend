import { useAuth } from '../../auth/AuthContext';
import { useNavigate, useLocation } from "react-router-dom";
import './Sidebar.css';

import homeIcon from '../../assets/icons/home.png';
import adminIcon from '../../assets/icons/admin.png';
import scheduleIcon from '../../assets/icons/schedule.png';
import attendanceIcon from '../../assets/icons/tick.png';
import chatIcon from '../../assets/icons/chat.png';
import materialsIcon from '../../assets/icons/books.png';
import logoutIcon from '../../assets/icons/logout-48.png';

const Sidebar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

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
                <div className={getNavItemClass("/admin")} onClick={() => navigate("/admin")}>
                    <img src={adminIcon} alt="Admin" className="sidebar-custom-icon" />
                </div>
                <div className={getNavItemClass("/schedule")}>
                    <img src={scheduleIcon} alt="Schedule" className="sidebar-custom-icon" />
                </div>
                <div className="nav-item">
                    <img src={attendanceIcon} alt="Attendance" className="sidebar-custom-icon" />
                </div>
                <div className={getNavItemClass("/chats")} onClick={() => navigate("/chats")}>
                    <img src={chatIcon} alt="Chat" className="sidebar-custom-icon" />
                </div>
                <div className="nav-item">
                    <img src={materialsIcon} alt="Materials" className="sidebar-custom-icon" />
                </div>
            </div>

            <button className="logout-btn" onClick={handleLogout}>
                <img src={logoutIcon} alt="Logout" className="sidebar-custom-icon" />
            </button>
        </div>
    );
};

export default Sidebar;