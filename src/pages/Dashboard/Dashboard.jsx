import { useAuth } from '../../auth/AuthContext';
import SubjectGrid from '../../components/SubjectGrid/SubjectGrid';
import CenterGrid from '../../components/CenterGrid/CenterGrid';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import './Dashboard.css';
import bannerImg from '../../assets/photos/preschool-banner.jpg';
import parentImg from '../../assets/icons/parent.png';
import ownerImg from '../../assets/icons/caretaker.png';


const Dashboard = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const isSuperAdmin = user?.roles?.includes('SuperAdmin');
    const isGuest = !user;

    const [selectedCenterId, setSelectedCenterId] = useState(() => {
        if (user?.centerId && !isSuperAdmin) {
            return user.centerId;
        }
        return null;
    });

    const [selectedCenterName, setSelectedCenterName] = useState('');
    useEffect(() => {
        const fetchCenterDetails = async () => {
            if (selectedCenterId) {
                try {
                    const response = await api.get(`/center/${selectedCenterId}`);
                    setSelectedCenterName(response.data.name || ''); 
                } catch (error) {
                    console.error("Помилка при завантаженні даних центру:", error);
                }
            } else {
                setSelectedCenterName('');
            }
        };

        fetchCenterDetails();
    }, [selectedCenterId]);
    const centersRef = useRef(null);

    useEffect(() => {
        if (!loading && !isGuest && !isSuperAdmin && user?.centerId) {
            setSelectedCenterId(user.centerId);
        }
    }, [user, loading, isGuest, isSuperAdmin]);

    const scrollToCenters = () => {
        centersRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    if (loading) {
        return <div className="loading-spinner">Завантаження...</div>;
    }

    const greetingText = user ? `Привіт, ${user.firstName} 👋` : 'Привіт, гостю 👋';
    const showCenterGrid = !selectedCenterId && (isGuest || isSuperAdmin);
    const mainTitle = showCenterGrid
        ? "Оберіть центр дитячого розвитку: "
        : `Ось доступні гуртки центру ${selectedCenterName}:`;

    const sectionTitle = <h1 className="welcome-text" style={{ marginTop: '20px' }}>{mainTitle}</h1>;

    const getRedirectPath = (subjectId) => `/subject/${subjectId}`;
    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className='dashboard-header-top'>
                    <p className="greeting">{greetingText}</p>
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
                        onClick={() => {
                            setSelectedCenterId(null);
                            setSelectedCenterName('');
                        }}
                    >
                        ← Обрати інший центр
                    </button>
                )}
            </header>
            {showCenterGrid && (
                <div
                    className='dashboard-container-banner'
                    style={{
                        backgroundImage: `linear-gradient(
                        rgba(42, 14, 44, 0.5), 
                        rgba(42, 14, 44, 0.5)),
                        url(${bannerImg})`
                    }}
                >

                    <div className='banner-content'>
                        <h1 className="banner-title">ChildSpace</h1>
                        <p className="banner-subtitle">
                            Єдина платформа для центрів дитячого розвитку.
                        </p>
                        <div className="banner-description">
                            <div className="role-column">
                                <div className="role-header">
                                    <img src={parentImg} alt="Для батьків" className="role-icon" />
                                    <strong>Для батьків:</strong>
                                </div>
                                <ul className="role-benefits-list">
                                    <li>Різноманіття центрів</li>
                                    <li>Запис на пробні заняття</li>
                                    <li>Зручне відстеження розкладу</li>
                                    <li>Доступ до навчальних матеріалів</li>
                                    <li>Спілкування з викладачами</li>
                                </ul>
                            </div>
                            <div className="role-column">
                                <div className="role-header">
                                    <img src={ownerImg} alt="Для власників" className="role-icon" />
                                    <strong>Для власників центрів:</strong>
                                </div>
                                <ul className="role-benefits-list">
                                    <li>Управління вашим центром</li>
                                    <li>Формування розкладу</li>
                                    <li>Облік відвідування</li>
                                    <li>Публікація навчальних матеріалів</li>
                                    <li>Спілкування з батьками</li>
                                </ul>
                            </div>
                        </div>
                        <button
                            className="banner-scroll-btn"
                            onClick={scrollToCenters}
                        >
                            Перейти до центрів ↓
                        </button>
                    </div>
                </div>

            )}
            <div ref={centersRef} className='centers-scroll-target'>
                {showCenterGrid ? (
                    <CenterGrid
                        titleComponent={sectionTitle}
                        onCenterSelect={(id) => setSelectedCenterId(id)}
                    />
                ) : (
                    <SubjectGrid
                        titleComponent={sectionTitle}
                        getBaseRedirectUrl={getRedirectPath}
                        centerId={selectedCenterId || user?.centerId}
                    />
                )}
            </div>
        </div>
    );
};

export default Dashboard;