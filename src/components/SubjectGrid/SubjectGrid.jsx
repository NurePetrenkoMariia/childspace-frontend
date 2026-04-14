import { useEffect, useState } from 'react';
import api from '../../../api/axios';
import CourseCard from '../../components/CourseCard/CourseCard';
import './SubjectGrid.css';
import defaultCourseImg from '../../assets/icons/default-course.jpg'

const SubjectGrid = ({ titleComponent, getBaseRedirectUrl }) => {
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
        <div className="subjects-content">
            {titleComponent}
            {loading ? (
                <p>Завантаження занять...</p>
            ) : (
                <div className="courses-grid">
                    {subjects.map((subject) => {
                        const redirectUrl = getBaseRedirectUrl(subject.id);
                        return (
                            <CourseCard
                                key={subject.id}
                                id={subject.id}
                                title={subject.name}
                                image={subject.photoUrl || defaultCourseImg}
                                redirectUrl={redirectUrl} 
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default SubjectGrid;