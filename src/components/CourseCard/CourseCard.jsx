import './CourseCard.css'
import { useNavigate } from 'react-router-dom'

const CourseCard = ({ id, title, image }) => {
    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate(`/subject/${id}`);
    };

    return (
        <div className="course-card" onClick={handleCardClick}>
            <div className="card-image-container" style={{ height: '180px', overflow: 'hidden' }}>
                <img 
                    src={image} 
                    alt={title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
            </div>
            <div className="card-footer">
                <span className="card-title">{title}</span>
                <div className="card-arrow">→</div>
            </div>
        </div>
    );
};

export default CourseCard;