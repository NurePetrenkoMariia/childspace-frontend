import './CourseCard.css'
import { useNavigate} from 'react-router-dom'

const CourseCard = ({ id, title, image, redirectUrl }) => {
    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate(redirectUrl);
    };

    return (
        <div className='course-card' onClick={handleCardClick}>
            <div className='card-image-container'>
                <img 
                    src={image} 
                    alt={title} 
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