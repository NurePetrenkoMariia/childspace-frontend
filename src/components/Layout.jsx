import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar/Sidebar';

const Layout = () => {
    return (
        <div className='dashboard-layout'>
            <Sidebar />
            <main className='main-content'>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;