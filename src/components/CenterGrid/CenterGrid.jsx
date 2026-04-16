import { useEffect, useState } from 'react';
import api from '../../../api/axios';
import CourseCard from '../../components/CourseCard/CourseCard';
import '../SubjectGrid/SubjectGrid.css';
import defaultCourseImg from '../../assets/icons/default-course.jpg';

const CenterGrid = ({ onCenterSelect, titleComponent }) => {
    const [centers, setCenters] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCenters = async () => {
            setLoading(true);
            try {
                const response = await api.get('/center');
                setCenters(response.data);
            } catch (error) {
                console.error("Помилка при завантаженні предметів:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCenters();
    }, []);

    return (
        <div className="subjects-content">
            {titleComponent}
            {loading ? (
                <p>Завантаження центрів...</p>
            ) : (
                <div className="courses-grid">
                    {centers.map((center) => (
                       <div key={center.id} onClick={() => onCenterSelect(center.id)} style={{cursor: 'pointer'}}>
                            <CourseCard
                                id={center.id}
                                title={center.name}
                                image={center.photoUrl || defaultCourseImg}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CenterGrid;