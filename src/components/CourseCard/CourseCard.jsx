import './CourseCard.css'
import { useNavigate } from 'react-router-dom'

const getGradientIndex = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
};

const gradients = [
    'linear-gradient(135deg, #7245B1 0%, #4F169E 100%)', 
    'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%)', 
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', 
    'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)', 
    'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)', 
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 
    'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', 
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)', 
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', 
    'linear-gradient(135deg, #2af598 0%, #009efd 100%)', 
    'linear-gradient(135deg, #c471ed 0%, #f64f59 100%)', 
    'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)', 
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
];

const CourseCard = ({ id, title, image, redirectUrl, address, phone, email }) => {
    const navigate = useNavigate();

    const initials = title ? title.charAt(0).toUpperCase() : '?';

    const gradient = gradients[getGradientIndex(title) % gradients.length];

    const handleCardClick = () => {
        navigate(redirectUrl);
    };

    return (
        <div className='course-card' onClick={handleCardClick}>
            <div className='card-image-container'>
                {image && !image.includes('default') ? (
                    <img src={image} alt={title} />
                ) : (
                    <div 
                        className="default-gradient-placeholder"
                        style={{ background: gradient }}
                    >
                        {initials}
                    </div>
                )}
            </div>
            <div className="card-footer">
                <div className='card-info'>
                    <span className="card-title">{title}</span>
                    {(address || phone || email) && (
                        <div className="card-contacts">
                            {address && <span className="contact-item">📍 {address}</span>}
                            {phone && <span className="contact-item">📞 {phone}</span>}
                            {email && <span className="contact-item">✉️ {email}</span>}
                        </div>
                    )}
                </div>
                <div className="card-arrow">→</div>
            </div>
        </div>
    );
};

export default CourseCard;