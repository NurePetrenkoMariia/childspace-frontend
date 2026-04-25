import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../api/axios';
import { useAuth } from '../../auth/AuthContext';
import './MaterialsPage.css';

const MaterialsPage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    console.log("Дані юзера:", user);
    const isAdmin = user?.roles?.includes('SuperAdmin') || user?.roles?.includes('CenterAdmin');
    const isTeacher = user?.roles?.includes('Teacher');

    const canAddMaterial = isAdmin || isTeacher;
    const [subjectName, setSubjectName] = useState('');
    const [loadingName, setLoadingName] = useState(true);
    const [materials, setMaterials] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newMaterial, setNewMaterial] = useState({
        title: '',
        description: '',
        type: 0,
        file: null
    });

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editMaterial, setEditMaterial] = useState({
        id: '',
        title: '',
        description: '',
        type: 0,
        file: null
    });

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
    }, [id, refreshTrigger]);

    useEffect(() => {
        const fetchMaterials = async () => {
            if (!id) {
                return;
            }
            setIsLoading(true);
            try {
                const response = await api.get(`/material/subject/${id}`);

                const sortedMaterials = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setMaterials(sortedMaterials);
            } catch (error) {
                console.error("Помилка завантаження матеріалів:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMaterials();
    }, [id, refreshTrigger]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('uk-UA', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const handleCreateMaterial = async () => {
        if (!newMaterial.title || !newMaterial.file) {
            alert("Будь ласка, введіть назву та оберіть файл!");
            return;
        }

        try {
            const formData = new FormData();
            formData.append('SubjectId', id);
            formData.append('TeacherId', user.id);
            formData.append('Title', newMaterial.title);
            formData.append('Description', newMaterial.description || "");
            formData.append('Type', newMaterial.type);
            formData.append('file', newMaterial.file);
            await api.post('/material', formData);

            setIsAddModalOpen(false);
            setNewMaterial({ title: '', description: '', type: 0, file: null });
            setRefreshTrigger(prev => prev + 1);
        } catch (err) {
            console.error("Помилка при створенні матеріалу:", err);
            alert("Не вдалося додати матеріал. Перевірте, чи підтримує бекенд завантаження файлів.");
        }
    };

    const handleDeleteMaterial = async (materialId) => {
        if (window.confirm("Ви впевнені, що хочете видалити цей матеріал? Цю дію неможливо скасувати.")) {
            try {
                await api.delete(`/material/${materialId}`);

                setRefreshTrigger(prev => prev + 1);
            } catch (err) {
                console.error("Помилка при видаленні матеріалу:", err);
                alert("Не вдалося видалити матеріал. Спробуйте пізніше.");
            }
        }
    };

    const handleEditClick = (mat) => {
        setEditMaterial({
            id: mat.id,
            title: mat.title,
            description: mat.description || '',
            type: mat.type,
            file: null
        });
        setIsEditModalOpen(true);
    };

    const handleEditMaterial = async () => {
        if (!editMaterial.title) {
            alert("Будь ласка, введіть назву!");
            return;
        }

        try {
            const formData = new FormData();
            formData.append('Title', editMaterial.title);
            formData.append('Description', editMaterial.description || "");
            formData.append('Type', editMaterial.type);

            if (editMaterial.file) {
                formData.append('file', editMaterial.file);
            }

            await api.put(`/material/${editMaterial.id}`, formData);

            setIsEditModalOpen(false);
            setRefreshTrigger(prev => prev + 1);
        } catch (err) {
            console.error("Помилка при оновленні матеріалу:", err);
            if (err.response && err.response.status === 403) {
                alert("У вас немає прав для редагування цього матеріалу.");
            } else {
                alert("Не вдалося оновити матеріал.");
            }
        }
    };

    return (
        <div className="materials-container">
            <h1 className="materials-page-title">Матеріали {loadingName ? '...' : (subjectName ? `> ${subjectName}` : '')} </h1>
            <div className="materials-content-wrapper">
                {canAddMaterial && (
                    <div className="materials-actions-top">
                        <button
                            className="add-material-btn"
                            onClick={() => setIsAddModalOpen(true)}
                        >
                            + Додати матеріал
                        </button>
                    </div>
                )}

                <div className="materials-list">
                    {isLoading ? (
                        <p style={{ textAlign: 'center', color: '#6A35C2' }}>Завантаження матеріалів...</p>
                    ) : materials.length > 0 ? (
                        materials.map(mat => {
                            const isAuthor = mat.teacherId == user?.id;
                            const canManageMaterial = isAdmin || (isTeacher && isAuthor);
                            return (
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
                                        {canManageMaterial && (
                                            <div className='material-info-right'>
                                                <button className="material-text-btn" onClick={() => handleEditClick(mat)}>Редагувати</button>
                                                <button className="material-text-btn" onClick={() => handleDeleteMaterial(mat.id)}>Видалити</button>
                                            </div>
                                        )}
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
                            );
                        })
                    ) : (
                        <p style={{ textAlign: 'center', color: '#9384A6', padding: '20px' }}>
                            Матеріали не знайдені
                        </p>
                    )
                    }
                </div>
            </div>
            {isAddModalOpen && (
                <div className="event-modal-overlay" onClick={() => setIsAddModalOpen(false)}>
                    <div className="event-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="event-modal-header">
                            <h3>Додати новий матеріал</h3>
                            <button className="close-event-btn" onClick={() => setIsAddModalOpen(false)}>×</button>
                        </div>

                        <div className="event-modal-body">
                            <div className="form-group" >
                                <label>Назва матеріалу *</label>
                                <input
                                    type="text"
                                    value={newMaterial.title}
                                    onChange={e => setNewMaterial({ ...newMaterial, title: e.target.value })}
                                    placeholder="Наприклад: Група 1: Домашнє завдання на 10.04.2026"
                                />
                            </div>

                            <div className="form-group">
                                <label>Тип матеріалу</label>
                                <select
                                    value={newMaterial.type}
                                    onChange={e => setNewMaterial({ ...newMaterial, type: parseInt(e.target.value) })}
                                >
                                    <option value={0}>Домашнє завдання</option>
                                    <option value={1}>Фото</option>
                                    <option value={2}>Документ</option>
                                    <option value={3}>Відео</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label >Опис (необов'язково)</label>
                                <textarea
                                    value={newMaterial.description}
                                    onChange={e => setNewMaterial({ ...newMaterial, description: e.target.value })}
                                    rows="3"
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <label>Файл *</label>
                                <input
                                    type="file"
                                    onChange={e => setNewMaterial({ ...newMaterial, file: e.target.files[0] })}
                                />
                            </div>

                            <div className='edit-form-btns'>
                                <button className="cancel-btn" onClick={() => setIsAddModalOpen(false)}>Скасувати</button>
                                <button className="apply-btn" onClick={handleCreateMaterial}>Завантажити</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {isEditModalOpen && (
                <div className="event-modal-overlay" onClick={() => {
                    setIsEditModalOpen(false)
                }}>
                    <div className="event-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="event-modal-header">
                            <h3>Редагування матеріалу</h3>
                            <button className="close-event-btn" onClick={() => {
                                setIsEditModalOpen(false);
                            }}>×</button>
                        </div>


                        <div className="event-modal-body">
                            <div className="form-group">
                                <label>Назва матеріалу*</label>
                                <input
                                    type="text"
                                    value={editMaterial.title}
                                    onChange={e => setEditMaterial({ ...editMaterial, title: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Тип матеріалу</label>
                                <select
                                    value={editMaterial.type}
                                    onChange={e => setEditMaterial({ ...editMaterial, type: parseInt(e.target.value) })}
                                >
                                    <option value={0}>Домашнє завдання</option>
                                    <option value={1}>Фото</option>
                                    <option value={2}>Документ</option>
                                    <option value={3}>Відео</option>

                                </select>
                            </div>
                            <div className="form-group">
                                <label >Опис</label>
                                <textarea
                                    value={editMaterial.description}
                                    onChange={e => setEditMaterial({ ...editMaterial, description: e.target.value })}
                                    rows="3"
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <label>Новий файл (залиште порожнім, щоб не змінювати)</label>
                                <input
                                    type="file"
                                    onChange={e => setEditMaterial({ ...editMaterial, file: e.target.files[0] })}
                                />
                            </div>
                            <div className='edit-form-btns'>
                                <button className="cancel-btn" onClick={() => setIsEditModalOpen(false)} style={{ flex: 1 }}>Скасувати</button>
                                <button className="apply-btn" onClick={handleEditMaterial} style={{ flex: 1 }}>Завантажити</button>
                            </div>
                        </div>
                    </div>
                </div>
            )
            }
        </div>
    );
};

export default MaterialsPage;