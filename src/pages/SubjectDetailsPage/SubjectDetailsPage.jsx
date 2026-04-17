import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../../../api/axios';
import defaultCourseImg from '../../assets/icons/default-course.jpg';
import './SubjectDetailsPage.css';

const SubjectDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [subject, setSubject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        parentName: '',
        phone: '',
        email: '',
        childName: '',
        childAge: '',
        comment: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [parentNameError, setParentNameError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [childNameError, setChildNameError] = useState('');

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            const hasInvalidElements = /[^\d+]/.test(value);

            if (hasInvalidElements) {
                setPhoneError('Номер телефону може містити лише цифри та знак "+"');
            }
            else {
                setPhoneError('');
            }
        }
        if (name === 'parentName') {
            const hasInvalidElements = /[^a-zA-Za-яА-ЯіІїЇєЄґҐ'’ʼ \-]/u.test(value);
            if (hasInvalidElements) {
                setParentNameError('Ім\'я може містити лише літери, пробіли, дефіс та апостроф!');
            }
            else {
                setParentNameError('');
            }
        }
        if (name === 'childName') {
            const hasInvalidElements = /[^a-zA-Za-яА-ЯіІїЇєЄґҐ'’ʼ \-]/u.test(value);
            if (hasInvalidElements) {
                setChildNameError('Ім\'я може містити лише літери, пробіли, дефіс та апостроф!');
            }
            else {
                setChildNameError('');
            }
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const payload = {
                ...formData,
                parentName: formData.parentName.trim(),
                childName: formData.childName.trim(),
                centerId: subject.centerId
            };

            await api.post('/trialrequest', payload);
            alert('Ваша заявка успішно відправлена! Ми зв\'яжемося з вами найближчим часом.');
            setIsRequestModalOpen(false);
            setFormData({
                parentName: '',
                phone: '',
                email: '',
                childName: '',
                childAge: '',
                comment: ''
            });
        } catch (error) {
            console.error("Помилка відправки заявки:", error);
            alert('Не вдалося відправити заявку. Перевірте введені дані.');
        } finally {
            setIsSubmitting(false);
        }
    }

    if (loading) {
        return <div className="loading">Завантаження...</div>;
    }
    if (!subject) {
        return <div className="error">Предмет не знайдено</div>;
    }

    return (
        <div className='details-page'>
            <button className="back-button" onClick={() => navigate(-1)}>
                Повернутися назад
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
                        <button className="enroll-button" onClick={() => setIsRequestModalOpen(true)}>
                            Записатися на пробне заняття
                        </button>
                    </div>
                </div>

                <div className="details-full-description">
                    <p>{subject.description}</p>
                </div>
            </div>
            {isRequestModalOpen && (
                <div className='event-modal-overlay' onClick={() => setIsAddModalOpen(false)}>
                    <div className="event-modal-content trial-modal" onClick={e => e.stopPropagation()}>
                        <div className="event-modal-header">
                            <h3>Заповніть форму для подання заявки</h3>
                            <button className="close-event-btn" onClick={() =>
                                setIsRequestModalOpen(false)}>×
                            </button>
                        </div>
                        <p className="modal-subtitle">Гурток: <strong>{subject.name}</strong></p>
                        <form onSubmit={handleSubmit} className='modal-form'>
                            <div className="form-group">
                                <label>Ваше ім'я та прізвище (Представник дитини) *</label>
                                <input
                                    type='text'
                                    name='parentName'
                                    required
                                    value={formData.parentName}
                                    onChange={handleChange}
                                    placeholder='Наприклад: Тарас Шевченко'
                                    style={parentNameError ? { borderColor: '#e74c3c', outline: 'none' } : {}}
                                />
                                {parentNameError && (
                                    <span style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                        {parentNameError}
                                    </span>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Телефон *</label>
                                <input
                                    type='tel'
                                    name='phone'
                                    required
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder='Формат: +3809123456789'
                                    style={phoneError ? { borderColor: '#e74c3c', outline: 'none' } : {}}
                                />
                                {phoneError && (
                                    <span style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                        {phoneError}
                                    </span>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Email *</label>
                                <input
                                    type='email'
                                    name='email'
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder='Наприклад: name@gmail.com'
                                />
                            </div>
                            <div className="form-group">
                                <label>Ім'я та прізвище дитини *</label>
                                <input
                                    type='text'
                                    name='childName'
                                    required
                                    value={formData.childName}
                                    onChange={handleChange}
                                    placeholder='Наприклад: Тарас Шевченко'
                                    style={childNameError ? { borderColor: '#e74c3c', outline: 'none' } : {}}
                                />
                                {childNameError && (
                                    <span style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                        {childNameError}
                                    </span>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Вік дитини *</label>
                                <input
                                    type='text'
                                    name='childAge'
                                    required
                                    value={formData.childAge}
                                    onChange={handleChange}
                                    placeholder='Наприклад: 11'
                                />
                                //ДОРОБИТИ ПЕРЕВІРКУ НА ВІК
                            </div>
                            <div className="form-group">
                                <label>Коментар (необов'язково)</label>
                                <textarea
                                    name='comment'
                                    rows='3'
                                    value={formData.comment}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="modal-footer" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                                <button type='button' className="cancel-btn" onClick={() => setIsRequestModalOpen(false)} style={{ flex: 1 }}>
                                    Скасувати
                                </button>
                                <button type='submit'
                                    className="apply-btn"
                                    disabled={isSubmitting || !!phoneError || !!parentNameError || !!childNameError}
                                    style={{ flex: 1 }}>
                                    {isSubmitting ? 'Відправка...' : 'Відправити заявку'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SubjectDetailsPage;