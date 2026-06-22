import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import { useAuth } from '../../auth/AuthContext';
import './MaterialsPage.css';

const MaterialsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const isAdmin = user?.roles?.includes('SuperAdmin') || user?.roles?.includes('CenterAdmin');
    const isTeacher = user?.roles?.includes('Teacher');

    const [subjectName, setSubjectName] = useState('');
    const [loadingName, setLoadingName] = useState(true);
    const [materials, setMaterials] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [groups, setGroups] = useState([]);
    const [selectedGroupFilter, setSelectedGroupFilter] = useState('');

    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newMaterial, setNewMaterial] = useState({
        title: '',
        description: '',
        file: null,
        groupId: ''
    });

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editMaterial, setEditMaterial] = useState({
        id: '',
        title: '',
        description: '',
        file: null,
        groupId: '',
        hasExistingFile: false,
        removeExistingFile: false
    });

    const [notification, setNotification] = useState({ isOpen: false, type: '', message: '' });
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [addErrors, setAddErrors] = useState(null);

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

    useEffect(() => {
        const fetchGroups = async () => {
            if (!id) {
                return;
            }
            try {
                const response = await api.get('/group');
                const subjectGroups = response.data.filter(g => g.subjectId === id);
                setGroups(subjectGroups);
            } catch (error) {
                console.error("Помилка завантаження груп:", error);
            }
        };
        fetchGroups();
    }, [id]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('uk-UA', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const handleCreateMaterial = async () => {
        if (!newMaterial.title.trim()) {
            setNotification({ isOpen: true, type: 'error', message: 'Будь ласка, введіть назву ' });
            return;
        }

        if (!newMaterial.file && !newMaterial.description.trim()) {
            setNotification({ isOpen: true, type: 'error', message: 'Додайте файл або напишіть текстовий опис' });
            return;
        }

        try {
            const formData = new FormData();
            formData.append('SubjectId', id);
            formData.append('TeacherId', user.id);
            formData.append('Title', newMaterial.title);
            formData.append('Description', newMaterial.description || "");
            if (newMaterial.groupId) {
                formData.append('GroupId', newMaterial.groupId);
            }
            formData.append('file', newMaterial.file);
            await api.post('/material', formData);

            setIsAddModalOpen(false);
            setNewMaterial({ title: '', description: '', file: null, groupId: '' });
            setRefreshTrigger(prev => prev + 1);
        } catch (err) {
            console.error("Помилка при створенні матеріалу:", err);
            setNotification({ isOpen: true, type: 'error', message: 'Не вдалося додати матеріал' });
        }
    };

    const filteredMaterials = selectedGroupFilter
        ? materials.filter(mat => mat.groupId === selectedGroupFilter)
        : materials;

    const canAddMaterial = isAdmin || (isTeacher && groups.some(g => g.teacherId === user.id));

    const confirmDeleteMaterial = async (materialId) => {
        setItemToDelete(materialId);
        setIsDeleteConfirmOpen(true);
    };

    const executeDeleteMaterial = async () => {
        if (!itemToDelete) {
            return;
        }

        try {
            await api.delete(`/material/${itemToDelete}`);

            setRefreshTrigger(prev => prev + 1);
            setIsDeleteConfirmOpen(false);
            setItemToDelete(null);
            setNotification({ isOpen: true, type: 'success', message: 'Матеріал успішно видалено!' });
        } catch (err) {
            console.error("Помилка при видаленні матеріалу:", err);
            setIsDeleteConfirmOpen(false);
            setNotification({ isOpen: true, type: 'error', message: 'Не вдалося видалити матеріал. Спробуйте пізніше.' });
        }
    };

    const handleEditClick = (mat) => {
        setEditMaterial({
            id: mat.id,
            title: mat.title,
            description: mat.description || '',
            groupId: mat.groupId || '',
            file: null,
            hasExistingFile: !!mat.fileUrl,
            removeExistingFile: false
        });
        setIsEditModalOpen(true);
    };

    const handleEditMaterial = async () => {
        if (!editMaterial.title) {
            setNotification({ isOpen: true, type: 'error', message: 'Будь ласка, введіть назву!' });
            return;
        }

        try {
            const formData = new FormData();
            formData.append('Title', editMaterial.title);
            formData.append('Description', editMaterial.description || "");

            if (editMaterial.file) {
                formData.append('file', editMaterial.file);
            } else if (editMaterial.removeExistingFile) {
                formData.append('LinkUrl', '');
            }

            if (editMaterial.groupId) {
                formData.append('GroupId', editMaterial.groupId);
            } else {
                formData.append('GroupId', '');
            }

            await api.put(`/material/${editMaterial.id}`, formData);

            setIsEditModalOpen(false);
            setRefreshTrigger(prev => prev + 1);
        } catch (err) {
            console.error("Помилка при оновленні матеріалу:", err);
            if (err.response && err.response.status === 403) {
                setNotification({ isOpen: true, type: 'error', message: 'У вас немає прав для редагування цього матеріалу.' });
            } else {
                setNotification({ isOpen: true, type: 'error', message: 'Не вдалося оновити матеріал.' });
            }
        }
    };

    return (
        <div className="materials-container">
            <h1 className="materials-page-title">
                <span
                    onClick={() => navigate(-1)}
                    style={{ cursor: 'pointer', textDecoration: 'none' }}
                    title="Повернутися до списку гуртків"
                    onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                    onMouseOut={(e) => e.target.style.textDecoration = 'none'}
                >
                    Матеріали
                </span>{loadingName ? '...' : (subjectName ? ` > ${subjectName}` : '')}
            </h1>
            <div className="materials-content-wrapper">

                <div className='materials-actions-top'>
                    <select
                        className='materials-actions-top-filter'
                        value={selectedGroupFilter}
                        onChange={(e) => setSelectedGroupFilter(e.target.value)}
                    >
                        <option value="">Всі матеріали гуртка</option>
                        {groups.map(g => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                    </select>
                    {canAddMaterial && (
                        <button
                            className="add-material-btn"
                            onClick={() => { setIsAddModalOpen(true); setAddErrors({}) }}

                        >
                            + Додати матеріал
                        </button>
                    )}
                </div>
                <div className="materials-list">
                    {isLoading ? (
                        <p style={{ textAlign: 'center', color: '#6A35C2' }}>Завантаження матеріалів...</p>
                    ) : filteredMaterials.length > 0 ? (
                        filteredMaterials.map(mat => {
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
                                            {mat.groupId && (
                                                <span className='material-group-badge'>
                                                    {groups.find(g => g.id === mat.groupId)?.name}
                                                </span>
                                            )}
                                        </div>
                                        {canManageMaterial && (
                                            <div className='material-info-right'>
                                                <button className="material-text-btn" onClick={() => handleEditClick(mat)}>Редагувати</button>
                                                <button className="material-text-btn" onClick={() => confirmDeleteMaterial(mat.id)}>Видалити</button>
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
                                <label >Опис (необов'язково)</label>
                                <textarea
                                    value={newMaterial.description}
                                    onChange={e => setNewMaterial({ ...newMaterial, description: e.target.value })}
                                    rows="3"
                                />
                            </div>

                            <div className="form-group">
                                <label>Для якої групи</label>
                                <select
                                    value={newMaterial.groupId}
                                    onChange={e => setNewMaterial({ ...newMaterial, groupId: e.target.value })}
                                    style={{ padding: '10px', borderRadius: '12px', border: '1px solid #EBE4F4', width: '100%' }}
                                >
                                    <option value="">Для всіх груп цього гуртка</option>
                                    {groups.map(g => (
                                        <option key={g.id} value={g.id}>{g.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <label>Файл *</label>
                                <div className="custom-file-upload">
                                    <label htmlFor="add-file-input" className="file-upload-btn">
                                        {newMaterial.file ? "Змінити файл" : "Обрати файл"}
                                    </label>
                                    <input
                                        id="add-file-input"
                                        type="file"
                                        onChange={e => {
                                            setNewMaterial({ ...newMaterial, file: e.target.files[0] });
                                            if (addErrors.file) setAddErrors({ ...addErrors, file: '' });
                                        }}
                                        style={{ display: 'none' }}
                                    />
                                    <span className="file-name-display">
                                        {newMaterial.file ? newMaterial.file.name : "Файл не обрано"}
                                    </span>
                                </div>
                                {addErrors.file && (
                                    <span style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                        {addErrors.file}
                                    </span>
                                )}
                            </div>

                            <div className='edit-form-btns'>
                                <button className="cancel-btn" onClick={() => setIsAddModalOpen(false)} style={{ flex: 1 }}>Скасувати</button>
                                <button className="apply-btn" onClick={handleCreateMaterial} style={{ flex: 1 }}>Завантажити</button>
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
                                <label >Опис</label>
                                <textarea
                                    value={editMaterial.description}
                                    onChange={e => setEditMaterial({ ...editMaterial, description: e.target.value })}
                                    rows="3"
                                />
                            </div>
                            <div className="form-group">
                                <label>Для якої групи</label>
                                <select
                                    value={editMaterial.groupId}
                                    onChange={e => setEditMaterial({ ...editMaterial, groupId: e.target.value })}
                                    style={{ padding: '10px', borderRadius: '12px', border: '1px solid #EBE4F4', width: '100%' }}
                                >
                                    <option value="">Для всіх груп цього гуртка</option>
                                    {groups.map(g => (
                                        <option key={g.id} value={g.id}>{g.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <label>Файл матеріалу</label>
                                <div className="custom-file-upload">
                                    <label htmlFor="edit-file-input" className="file-upload-btn">
                                        {editMaterial.file ? "Змінити файл" : "Обрати файл"}
                                    </label>

                                    <input
                                        id="edit-file-input"
                                        type="file"
                                        onChange={e => setEditMaterial({
                                            ...editMaterial,
                                            file: e.target.files[0],
                                            removeExistingFile: false
                                        })}
                                        style={{ display: 'none' }}
                                    />

                                    <span className="file-name-display">
                                        {editMaterial.file
                                            ? editMaterial.file.name
                                            : (editMaterial.removeExistingFile
                                                ? "Файл буде видалено"
                                                : (editMaterial.hasExistingFile ? "Файл збережено" : "Файл не обрано"))}
                                    </span>
                                </div>
                                {editMaterial.hasExistingFile && !editMaterial.file && !editMaterial.removeExistingFile && (
                                    <button
                                        type="button"
                                        onClick={() => setEditMaterial({ ...editMaterial, removeExistingFile: true })}
                                        style={{ marginLeft: '10px', background: 'none', border: 'none', color: '#e74c3c', textDecoration: 'underline', cursor: 'pointer', display: 'flex', justifyContent: 'flex-start' }}
                                    >
                                        Видалити файл
                                    </button>
                                )}

                                {(editMaterial.file || editMaterial.removeExistingFile) && (
                                    <button
                                        type="button"
                                        onClick={() => setEditMaterial({ ...editMaterial, file: null, removeExistingFile: false })}
                                        style={{ marginLeft: '10px', background: 'none', border: 'none', color: '#9384A6', textDecoration: 'underline', cursor: 'pointer', display: 'flex', justifyContent: 'flex-start' }}
                                    >
                                        Скасувати зміни файлу
                                    </button>
                                )}
                            </div>
                            <div className='edit-form-btns'>
                                <button className="cancel-btn" onClick={() => setIsEditModalOpen(false)} style={{ flex: 1 }}>Скасувати</button>
                                <button className="apply-btn" onClick={handleEditMaterial} style={{ flex: 1 }}>Зберегти зміни</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {isDeleteConfirmOpen && (
                <div className="profile-modal-overlay" style={{ zIndex: 3000 }} onClick={() => setIsDeleteConfirmOpen(false)}>
                    <div className="profile-modal-content" onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '40px', marginBottom: '10px' }}>⚠️</div>
                        <h2 className="modal-title" style={{ marginTop: 0, textAlign: 'center' }}>
                            Видалення матеріалу
                        </h2>
                        <p className="profile-modal-text">
                            Ви впевнені, що хочете видалити цей матеріал? Цю дію неможливо скасувати.
                        </p>
                        <div className="profile-modal-actions" style={{ justifyContent: 'center' }}>
                            <button
                                className="cancel-btn"
                                onClick={() => setIsDeleteConfirmOpen(false)}
                            >
                                Скасувати
                            </button>
                            <button
                                className="profile-logout-btn"
                                onClick={executeDeleteMaterial}
                            >
                                Так, видалити
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {notification.isOpen && (
                <div className="profile-modal-overlay" onClick={() => setNotification({ ...notification, isOpen: false })} style={{ zIndex: 4000 }}>
                    <div className="profile-modal-content" onClick={e => e.stopPropagation()}>
                        <h2
                            className="modal-title"
                            style={{
                                marginTop: 0,
                                textAlign: 'center',
                                color: notification.type === 'error' ? '#e74c3c' : '#4F169E'
                            }}
                        >
                            {notification.type === 'error' ? '⚠️ Помилка' : '✅ Успіх'}
                        </h2>

                        <p className="profile-modal-text">
                            {notification.message}
                        </p>

                        <div className="profile-modal-actions" style={{ justifyContent: 'center' }}>
                            <button
                                className="cancel-btn"
                                style={{ maxWidth: '200px' }}
                                onClick={() => setNotification({ ...notification, isOpen: false })}
                            >
                                Зрозуміло
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MaterialsPage;