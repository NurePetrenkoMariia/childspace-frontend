import { useEffect, useState } from 'react';
import api from '../../../api/axios'; 
import { useAuth } from '../../auth/AuthContext';
import CourseCard from '../../components/CourseCard/CourseCard';
import './Dashboard.css';
import defaultCourseImg from '../../assets/icons/default-course.jpg'

const Dashboard = () => {
    const { user } = useAuth();
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const response = await api.get('/subject');
                setSubjects(response.data);
            } catch (error) {
                console.error("Помилка при завантаженні предметів:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSubjects();
    }, []);

    return (
        <div className="dashboard-content">
            <header className="dashboard-header">
                <p className="greeting">Привіт, {user?.userName || 'Користувач'} 👋</p>
                <h1 className="welcome-text">Вас вітає центр дитячого розвитку “Сонечко”</h1>
            </header>

            {loading ? (
                <p>Завантаження занять...</p>
            ) : (
                <div className="courses-grid">
                    {subjects.map((subject) => (
                        <CourseCard 
                            key={subject.id} 
                            id={subject.id}
                            title={subject.name} 
                            image={subject.imageUrl || defaultCourseImg} 
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;