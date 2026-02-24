import { useAuth } from '../../auth/AuthContext';
import './Sidebar.css';

import homeIcon from '../../assets/icons/home.png';
import adminIcon from '../../assets/icons/admin.png';
import scheduleIcon from '../../assets/icons/schedule.png';
import attendanceIcon from '../../assets/icons/tick.png';
import chatIcon from '../../assets/icons/chat.png';
import materialsIcon from '../../assets/icons/books.png';
import logoutIcon from '../../assets/icons/logout.png';

const Sidebar = () => {
    const { logout } = useAuth();

    return (
        <div className="sidebar">
            <div className="nav-icons">
                <div className="nav-item active">
                    <img src={homeIcon} alt="Home" className="sidebar-custom-icon" />
                </div>
                <div className="nav-item">
                    <img src={adminIcon} alt="Admin" className="sidebar-custom-icon" />
                </div>
                <div className="nav-item">
                    <img src={scheduleIcon} alt="Schedule" className="sidebar-custom-icon" />
                </div>
                <div className="nav-item">
                    <img src={attendanceIcon} alt="Attendance" className="sidebar-custom-icon" />
                </div>
                <div className="nav-item">
                    <img src={chatIcon} alt="Chat" className="sidebar-custom-icon" />
                </div>
                <div className="nav-item">
                    <img src={materialsIcon} alt="Materials" className="sidebar-custom-icon" />
                </div>
            </div>
            
            <button className="logout-btn" onClick={logout}>
                <img src={logoutIcon} alt="Logout" className="sidebar-custom-icon" />
            </button>
        </div>
    );
};

export default Sidebar;