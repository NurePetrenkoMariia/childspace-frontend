import { useParams, useNavigate} from 'react-router-dom';
import { useEffect, useState} from 'react';
import api from '../../../api/axios';
import defaultCourseImg from '../../assets/icons/default-course.jpg';
import './SubjectDetailsPage.css';

const SubjectDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [subject, setSubject] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await api.get(`/subject/${id}`);
                setSubject(response.data);
            } catch (error) {
                console.error("Помилка при завантаженні деталей:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    if (loading) {
        return <div className="loading">Завантаження...</div>;
    }
    if (!subject) {
        return <div className="error">Предмет не знайдено</div>;
    }

    return (
        <div className='details-page'>
           <button className="back-button" onClick={() => navigate('/')}>
                На головну
            </button>
            <div className="details-container">
                <div className="details-main-card">
                    <div className="details-image-container">
                        <img 
                            src={subject.photoUrl || defaultCourseImg} 
                            alt={subject.name} 
                            className="details-image"
                        />
                    </div>
                    
                    <div className="details-info-short">
                        <h1 className="details-title">{subject.name}</h1>
                        <p className="details-info-text">
                            Не зволійкайте! Приєднуйтеся до нас прямо зараз! Для заповнення форми реєстрації просто натисність на кнопку нижче.
                        </p>
                        <button className="enroll-button">
                            Записатися на пробне заняття
                        </button>
                    </div>
                </div>

                <div className="details-full-description">
                    <p>{subject.description}</p>
                </div>
            </div>
        </div>
    );
}

export default SubjectDetailsPage;