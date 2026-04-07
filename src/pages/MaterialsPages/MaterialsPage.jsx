import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../api/axios';
import './MaterialsPage.css';

const MaterialsPage = () => {
    const { id } = useParams();

    const [subjectName, setSubjectName] = useState('');
    const [loadingName, setLoadingName] = useState(true);
    const [materials, setMaterials] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchSubjectDetails = async () => {
            try {
                const response = await api.get(`/subject/${id}`);
                setSubjectName(response.data.name);
            } catch (error) {
                console.error("Помилка при завантаженні інформації про гурток:", error);
                setSubjectName("Невідомий гурток");
            } finally {
                setLoadingName(false);
            }
        };
        if (id) {
            fetchSubjectDetails();
        }
    }, [id]);

    useEffect(() => {
        const fetchMaterials = async () => {
            setIsLoading(true);
            try {
                //замінити на відфільтрований метод
                const response = await api.get('/material');

                const sortedMaterials = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setMaterials(sortedMaterials);
            } catch (error) {
                console.error("Помилка завантаження матеріалів:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMaterials();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('uk-UA', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }) + ' р.';
    };

    return (
        <div className="materials-container">
            <h1 className="materials-page-title">Матеріали {loadingName ? '...' : (subjectName ? `> ${subjectName}` : '')} </h1>
            <div className="materials-content-wrapper">
                <div className="materials-actions-top">
                    <button
                        className="add-material-btn"
                        onClick={() => console.log("Відкрити модалку додавання")}
                    //додавання 
                    >
                        Додати
                    </button>
                </div>

                <div className="materials-list">
                    {isLoading ? (
                        <p style={{ textAlign: 'center', color: '#6A35C2' }}>Завантаження матеріалів...</p>
                    ) : materials.length > 0 ? (
                        materials.map(mat => (
                            <div key={mat.id} className="material-card">
                                <div className='material-card-title'>
                                    <div className="material-info-left">
                                        <span className="material-author">
                                            {mat.teacherName || "Викладач"}
                                        </span>
                                        <span className="material-date">
                                            {formatDate(mat.createdAt)}
                                        </span>
                                    </div>
                                    <div className='material-info-right'>
                                        <button className="material-text-btn">Редагувати</button>
                                        <button className="material-text-btn">Видалити</button>
                                    </div>
                                </div>
                                <div className="material-card-body">
                                    {mat.title && <h3 className="material-title">{mat.title}</h3>}
                                    <p className="material-description">
                                        {mat.description || " "}
                                    </p>
                                </div>
                                <div className="material-card-footer">
                                    {mat.fileUrl && (
                                        <a 
                                            href={mat.fileUrl} 
                                            target="_blank" 
                                            rel="noreferrer" 
                                            className="material-file-pill"
                                        >
                                            Файл матеріалу 
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p style={{ textAlign: 'center', color: '#9384A6', padding: '20px' }}>
                            Матеріали не знайдені
                        </p>
                    )
                    }
                </div>
            </div>
        </div>
    );
};

export default MaterialsPage;