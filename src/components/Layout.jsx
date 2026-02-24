import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar/Sidebar';

const Layout = () => {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#EDE4F5' }}>
            <Sidebar />
            <main style={{ flex: 1, marginLeft: '80px', padding: '40px' }}>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;