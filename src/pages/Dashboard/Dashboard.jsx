import { useAuth } from '../../auth/AuthContext';
import SubjectGrid from '../../components/SubjectGrid/SubjectGrid';

const Dashboard = () => {
    const { user } = useAuth();

    const title = (
        <header className="dashboard-header">
            <p className="greeting">Привіт, {user?.firstName || 'Користувач'} 👋</p>
            <h1 className="welcome-text">Вас вітає центр дитячого розвитку “Сонечко”</h1>
        </header>
    );

    const getRedirectPath = (subjectId) => `/subject/${subjectId}`;

    return (
        <div className="dashboard-container">
            <SubjectGrid
                titleComponent={title}
                getBaseRedirectUrl={getRedirectPath}
            />
        </div>
    );
};

export default Dashboard;