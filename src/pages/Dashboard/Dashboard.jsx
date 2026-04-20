import { useAuth } from '../../auth/AuthContext';
import SubjectGrid from '../../components/SubjectGrid/SubjectGrid';
import CenterGrid from '../../components/CenterGrid/CenterGrid';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    const [selectedCenterId, setSelectedCenterId] = useState(null);
    const isSuperAdmin = user?.roles?.includes('SuperAdmin');
    const isGuest = !user;

    useEffect(() => {
        if (!loading && !isGuest && !isSuperAdmin && user?.centerId) {
            setSelectedCenterId(user.centerId);
        }
    }, [user, loading, isGuest, isSuperAdmin]);

    if (loading) {
        return <div className="loading-spinner">Завантаження...</div>;
    }

    const greetingText = user ? `Привіт, ${user.firstName} 👋` : 'Привіт, гостю 👋';
    const mainTitle = selectedCenterId
        ? "Ось доступні гуртки:"
        : "Оберіть центр дитячого розвитку:";

    const title = (
        <header className="dashboard-header">
            <div className='dashboard-header-top'>
                <div>
                    <p className="greeting">{greetingText}</p>
                    <h1 className="welcome-text">{mainTitle}</h1>
                </div>
                {isGuest && (
                    <button className='dashboard-header-top-btn'
                        onClick={() => navigate('/login')}
                    >
                        Увійти
                    </button>
                )}
            </div>
            {(isSuperAdmin || isGuest) && selectedCenterId && (
                <button 
                className='dashboard-header-center-btn'
                    onClick={() => setSelectedCenterId(null)}
                >
                    ← Обрати інший центр
                </button>
            )}

        </header>
    );

    const getRedirectPath = (subjectId) => `/subject/${subjectId}`;

    return (
        <div className="dashboard-container">
            {!selectedCenterId && (isGuest || isSuperAdmin) ? (
                <CenterGrid
                    titleComponent={title}
                    onCenterSelect={(id) => setSelectedCenterId(id)}
                />
            ) : (
                <SubjectGrid
                    titleComponent={title}
                    getBaseRedirectUrl={getRedirectPath}
                    centerId={selectedCenterId}
                />
            )}
        </div>
    );
};

export default Dashboard;