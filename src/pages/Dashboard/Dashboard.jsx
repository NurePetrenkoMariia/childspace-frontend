import { useAuth } from '../../auth/AuthContext';
import SubjectGrid from '../../components/SubjectGrid/SubjectGrid';
import CenterGrid from '../../components/CenterGrid/CenterGrid';
import { useState, useEffect } from 'react';

const Dashboard = () => {
    const { user, loading } = useAuth();

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
        <header className="dashboard-header"  style={{paddingBottom: '15px'}}>
            <p className="greeting">{greetingText}</p>
            <h1 className="welcome-text">{mainTitle}</h1>
            {(isSuperAdmin || isGuest) && selectedCenterId && (
                <button 
                    onClick={() => setSelectedCenterId(null)}
                    style={{marginTop: '10px', padding: '5px 15px', borderRadius: '8px', cursor: 'pointer', background: '#F9F6FC', border: '1px solid #A384D6', color: '#6A35C2'}}
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