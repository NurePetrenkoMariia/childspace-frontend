import './AdminPanel.css';
import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import searchIcon from '../../assets/icons/search.png';
import confirmIcon from '../../assets/icons/checkmark.png';
import cancelIcon from '../../assets/icons/cancel.png';
import editIcon from '../../assets/icons/pencil.png';
import deleteIcon from '../../assets/icons/trash.png';
import groupIcon from '../../assets/icons/icons8-group.png';

const tableConfig = {
    'Центри': {
        headers: ['ID', 'Назва', 'Адреса', 'Телефон', 'Email', 'Дії'],
        keys: ['id', 'name', 'address', 'phone', 'email']
    },
    'Користувачі': {
        headers: ['ID', 'Ім\'я', 'Прізвище', 'Email', 'Центр', 'Телефон', 'Роль', 'Дії'],
        keys: ['id', 'firstName', 'lastName', 'email', 'centerId', 'phoneNumber', 'role']
    },
    'Діти': {
        headers: ['ID', 'Ім\'я', 'Прізвище', 'Дата народження', 'Представник дитини', 'Нотатки', 'Дії'],
        keys: ['id', 'firstName', 'lastName', 'birthDate', 'parentId', 'notes']
    },
    'Матеріали': {
        headers: ['ID', 'Заголовок', 'Тип', 'Створено', 'Дії'],
        keys: ['id', 'title', 'type', 'createdAt']
    },
    'Групи': {
        headers: ['ID', 'Назва', 'Опис', 'Вчитель', 'Центр', 'Предмет', 'Дії'],
        keys: ['id', 'name', 'description', 'teacherId', 'centerId', 'subjectId',]
    },
    'Гуртки': {
        headers: ['ID', 'Назва', 'Опис', 'Центр', 'Фото', 'Дії'],
        keys: ['id', 'name', 'description', 'centerId', 'photoUrl']
    },
    'Заявки': {
        headers: ['ID', 'Центр', 'Представник дитини', 'Дитина', 'Телефон', 'Вік дитини', 'Дата', 'Дії'],
        keys: ['id', 'centerId', 'parentName', 'childName', 'phone', 'childAge', 'createdAt']
    }
};

const roleTranslations = {
    'SuperAdmin': 'Суперадмін',
    'CenterAdmin': 'Адмін центру',
    'Teacher': 'Вчитель',
    'Parent': 'Батько/Мати'
};

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('Користувачі');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newData, setNewData] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredData, setFilteredData] = useState([]);
    const [centersList, setCentersList] = useState([]);
    const [groupsList, setGroupsList] = useState([]);
    const [parentsList, setParentsList] = useState([]);
    const [teachersList, setTeachersList] = useState([]);
    const [subjectsList, setSubjectsList] = useState([]);

    const [isGroupManagerOpen, setIsGroupManagerOpen] = useState(false);
    const [selectedGroupForManager, setSelectedGroupForManager] = useState(null);
    const [groupChildrenIds, setGroupChildrenIds] = useState([]);
    const [allChildrenList, setAllChildrenList] = useState([]);

    const [isAddChildModalOpen, setIsAddChildModalOpen] = useState(false);
    const [childSearchTerm, setChildSearchTerm] = useState("");

    const [isRemoveChildModalOpen, setIsRemoveChildModalOpen] = useState(false);
    const [childToRemove, setChildToRemove] = useState(null);

    const endpointMap = {
        'Центри': '/center',
        'Користувачі': '/user',
        'Діти': '/child',
        'Матеріали': '/material',
        'Групи': '/group',
        'Гуртки': '/subject',
        'Заявки': '/trialrequest'
    };

    const tabs = ['Центри', 'Користувачі', 'Діти', 'Матеріали', 'Групи', 'Гуртки', 'Заявки'];
    const phoneRegex = /^\+?[0-9]{10,13}$/;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await api.get(endpointMap[activeTab]);
                setData(response.data);
                setFilteredData(response.data);
                setSearchTerm("");
            } catch (error) {
                console.error(`Помилка завантаження ${activeTab}:`, error);
                setData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [activeTab]);

    const fetchLists = async () => {
        try {
            const response = await api.get('/center');
            setCentersList(response.data);

            const groupsResponse = await api.get('/group');
            setGroupsList(groupsResponse.data);

            const parentsResponse = await api.get('/user/parents');
            setParentsList(parentsResponse.data);

            const teachersResponse = await api.get('/user/teachers');
            setTeachersList(teachersResponse.data);

            const subjectsResponse = await api.get('/subject');
            setSubjectsList(subjectsResponse.data);
        } catch (error) {
            console.error("Помилка завантаження списків", error);
        }
    };

    useEffect(() => {
        fetchLists();
    }, []);

    const currentConfig = tableConfig[activeTab];
    const formatCellValue = (item, key) => {

        if (key === 'role') {
            const translateRole = (roleKey) => roleTranslations[roleKey] || roleKey;

            if (item.roles && Array.isArray(item.roles) && item.roles.length > 0) {
                return item.roles.map(translateRole).join(', ');
            }

            return translateRole(item[key]) || '—';
        }

        if (key === 'groupId') {
            const group = groupsList.find(g => g.id === item[key]);
            return group ? `${group.name} (${group.id})` : item[key] || '—';
        }

        if (key === 'teacherId') {
            const teacher = teachersList.find(t => t.id === item[key]);
            return teacher ? `${teacher.firstName} ${teacher.lastName}` : item[key] || '—';
        }

        if (key === 'centerId') {
            const center = centersList.find(t => t.id === item[key]);
            return center ? `${center.name} (${item[key]})` : item[key] || '—';
        }

        const value = item[key];

        if (key.includes('Date') || key.includes('At')) {
            return value ? new Date(value).toLocaleDateString() : '—';
        }

        if (key === 'id' || key.includes('Id')) {
            if (!value) return '—';
            return `${value}`;
        }

        if (key === 'photoUrl' || key === 'photo') {
            const value = item[key];
            if (!value) return '—';

            return (
                <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#6A35C2', textDecoration: 'underline', fontWeight: '500' }}
                >
                    Відкрити фото
                </a>
            );
        }

        return value || '—';
    };

    const handleEditClick = (item) => {
        setEditingId(item.id);
        let roleForEdit = item.role || "";
        if (item.roles && Array.isArray(item.roles) && item.roles.length > 0) {
            roleForEdit = item.roles[0];
        }
        setEditFormData({
            ...item,
            role: roleForEdit
        });
    };

    const handleCancelClick = () => {
        setEditingId(null);
        setEditFormData({});
    };

    const handleSaveClick = async (id) => {
        try {
            let response;
            let savedRole = null;

            if (activeTab === 'Гуртки') {
                const formData = new FormData();
                formData.append('Name', editFormData.name);
                formData.append('Description', editFormData.description || "");
                formData.append('CenterId', editFormData.centerId);

                if (editFormData.newPhoto) {
                    formData.append('Photo', editFormData.newPhoto);
                }

                response = await api.put(`${endpointMap[activeTab]}/${id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                let payload = { ...editFormData };
                if (activeTab === 'Користувачі') {
                    if (payload.role) {
                        savedRole = payload.role;
                        payload.roles = [payload.role];
                        delete payload.role;
                    }

                    if (!payload.centerId || payload.centerId.toString().trim() === "") {
                        payload.centerId = null;
                    }
                }

                const phoneValue = payload.phone || payload.phoneNumber;
                if (phoneValue && !phoneRegex.test(phoneValue)) {
                    alert("Введіть коректний номер телефону (наприклад: +380501234567)");
                    return;
                }
                response = await api.put(`${endpointMap[activeTab]}/${id}`, payload);
            }

            const updatedItem = response.data;
            if (activeTab === 'Користувачі' && savedRole) {
                updatedItem.roles = [savedRole];
            }
            const updatedDataList = data.map(item => item.id === id ? updatedItem : item);

            setData(updatedDataList);
            setFilteredData(filteredData.map(item => item.id === id ? updatedItem : item));

            setEditingId(null);
        } catch (error) {
            console.error("Помилка при збереженні:", error);
            alert("Не вдалося зберегти зміни");
        }
    };

    const handleInputChange = (e, key) => {
        setEditFormData({
            ...editFormData,
            [key]: e.target.value
        });
    };

    const handleAddClick = async () => {
        setNewData({});
        await fetchLists();
        setIsModalOpen(true);
    };

    const handleCreateSave = async () => {
        try {
            let response;
            if (activeTab == 'Гуртки') {
                const formData = new FormData();
                formData.append('Name', newData.name);
                formData.append('Description', newData.description || "");
                formData.append('CenterId', newData.centerId);

                if (newData.photo) {
                    formData.append('Photo', newData.photo);
                }

                response = await api.post(endpointMap[activeTab], formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            else {
                let payload = { ...newData };

                if (activeTab === 'Користувачі') {
                    if (payload.role) {
                        payload.roles = [payload.role];
                        delete payload.role;
                    }

                    if (!payload.centerId || payload.centerId.trim() === "") {
                        payload.centerId = null;
                    }

                    if (!payload.password) {
                        alert("Пароль є обов'язковим для створення користувача!");
                        return;
                    }
                }

                if (payload.phone && !phoneRegex.test(payload.phone)) {
                    alert("Введіть коректний номер телефону (наприклад: +380501234567)");
                    return;
                }

                response = await api.post(endpointMap[activeTab], payload);
            }
            const savedItem = response.data;
            if (activeTab === 'Користувачі') {
                savedItem.role = (savedItem.roles && savedItem.roles.length > 0)
                    ? savedItem.roles[0]
                    : payload.roles[0];
            }

            const updatedData = ([...data, savedItem]);
            setData(updatedData);
            setFilteredData(updatedData);
            setIsModalOpen(false);
        } catch (error) {
            console.error("Помилка при створенні:", error.response?.data || error.message);
            alert("Не вдалося створити запис. Перевірте обов'язкові поля.");
        }
    };

    const startResizing = (e) => {
        e.preventDefault();

        const th = e.target.closest('th');
        const startX = e.pageX;
        const startWidth = th.offsetWidth;

        const handleMouseMove = (moveEvent) => {
            const newWidth = startWidth + (moveEvent.pageX - startX);

            if (newWidth > 50 && newWidth < 500) {
                th.style.width = `${newWidth}px`;
            }
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleSearch = () => {
        if (!searchTerm) {
            setFilteredData(data);
            return;
        }

        const lowerCaseSearch = searchTerm.toLowerCase();

        const filtered = data.filter(item => {
            return Object.values(item).some(value =>
                value && value.toString().toLowerCase().includes(lowerCaseSearch)
            );
        });
        setFilteredData(filtered);
    };

    const handleDeleteClick = async (id) => {
        if (window.confirm("Ви впевнені, що хочете видалити цей запис?")) {
            try {
                await api.delete(`${endpointMap[activeTab]}/${id}`);
                const updated = data.filter(item => item.id !== id);
                setData(updated);
                if (searchTerm) {
                    setFilteredData(updated.filter(item => {
                        const term = searchTerm.toLowerCase();
                        for (let key in item) {
                            let value = item[key];
                            if (value && String(value).toLowerCase().includes(term)) {
                                return true;
                            }
                        }
                        return false;
                    }));
                } else {
                    setFilteredData(updated);
                }
            } catch (error) {
                console.error("Помилка при видаленні:", error);
                alert("Не вдалося видалити запис. Можливо, до нього прив'язані інші дані.");
            }
        }
    };

    const handleOpenGroupManager = async (group) => {
        setSelectedGroupForManager(group);
        try {
            const allChildrenRes = await api.get('/child');
            setAllChildrenList(allChildrenRes.data);
            const groupChildrenRes = await api.get(`/group/${group.id}/children`);
            const ids = groupChildrenRes.data.map(child => child.id);
            setGroupChildrenIds(ids);

            setIsGroupManagerOpen(true);
        } catch (err) {
            console.error("Помилка завантаження складу групи:", err);
        }
    };

    const handleChangeChildStatusInGroup = async (childId, isCurrentlyInGroup) => {
        const groupId = selectedGroupForManager.id;
        try {
            if (isCurrentlyInGroup) {
                await api.delete(`/groupchild/group/${groupId}/child/${childId}`);
                setGroupChildrenIds(prev => prev.filter(id => id !== childId));
            } else {
                await api.post(`/groupchild`, {
                    groupId: groupId,
                    childId: childId
                });
                setGroupChildrenIds(prev => [...prev, childId]);
            }
        } catch (error) {
            console.error("Помилка зміни складу групи:", error);
        }
    };

    const handleInitiateRemoveChild = (child) => {
        setChildToRemove(child);
        setIsRemoveChildModalOpen(true);
    };

    const confirmRemoveChild = async () => {
        if (!childToRemove) {
            return;
        }

        await handleChangeChildStatusInGroup(childToRemove.id, true);
        setIsRemoveChildModalOpen(false);
        setChildToRemove(null);
    };

    return (
        <div className='admin-container'>
            <h1 className='admin-title'>Адмін-панель</h1>

            <div className='admin-card'>
                <div className='admin-tabs'>
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            className={`tab-item ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}>
                            {tab}
                        </button>
                    )
                    )}

                </div>
                <div className='admin-filters'>
                    <input type="text" placeholder="Пошук..."
                        className="filter-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />

                    <button className='apply-search-btn' onClick={handleSearch}>
                        <img src={searchIcon} alt='Search' className='search-btn-icon' />
                        Застосувати
                    </button>
                </div>

                <div className='table-container'>
                    <div className='table-first-row'>
                        <h2 className='table-title'>{activeTab}</h2>
                        {activeTab !== 'Заявки' && activeTab !== 'Матеріали' && (
                            <button className='add-entity-btn' onClick={handleAddClick}>
                                + Додати запис
                            </button>
                        )}
                    </div>
                    <table className='admin-table'>
                        <thead >
                            <tr>
                                {currentConfig.headers.map(h =>
                                    <th key={h}
                                        style={{
                                            width: h === 'Дії' ? (activeTab === 'Групи' ? '155px' : '95px') : 'auto'
                                        }}
                                        className='resizable-th'
                                    >
                                        {h}
                                        <div
                                            className='column-resizer'
                                            onMouseDown={startResizing}
                                        />
                                    </th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {!loading && filteredData.map((item) => (
                                <tr key={item.id} className={editingId === item.id ? 'row-editing' : ''}>
                                    {currentConfig.keys.map(key => (
                                        <td key={key}>
                                            {editingId === item.id && key !== 'id' ? (
                                                activeTab === 'Гуртки' && key === 'photoUrl' ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => setEditFormData({ ...editFormData, newPhoto: e.target.files[0] })}
                                                            style={{ fontSize: '12px', maxWidth: '150px' }}
                                                        />
                                                        <span style={{ fontSize: '10px', color: '#9384A6' }}>
                                                            Залиште пустим, щоб не змінювати
                                                        </span>
                                                    </div>
                                                ) : key === 'birthDate' ? (
                                                    <input
                                                        type="date"
                                                        className="edit-input"
                                                        value={editFormData[key] ? editFormData[key].split('T')[0] : ''}
                                                        onChange={(e) => handleInputChange(e, key)}
                                                    />
                                                ) : activeTab === 'Користувачі' && key === 'role' ? (
                                                    <select
                                                        className="edit-input"
                                                        onChange={(e) => handleInputChange(e, key)}
                                                        value={editFormData[key] || ""}
                                                    >
                                                        <option value="" disabled>Оберіть роль...</option>
                                                        <option value="CenterAdmin">Адмін центру</option>
                                                        <option value="Teacher">Вчитель</option>
                                                        <option value="Parent">Батько/Мати</option>
                                                    </select>
                                                ) : activeTab === 'Діти' && key === 'parentId' ? (
                                                    <select
                                                        className="edit-input"
                                                        onChange={(e) => handleInputChange(e, key)}
                                                        value={editFormData[key] || ""}
                                                    >
                                                        <option value="" disabled>Оберіть представника</option>
                                                        {parentsList.map(parent => (
                                                            <option key={parent.id} value={parent.id}>
                                                                {parent.firstName} {parent.lastName} ({parent.email})
                                                            </option>
                                                        )
                                                        )}
                                                    </select>
                                                ) : activeTab === 'Групи' && key === 'subjectId' ? (
                                                    <select
                                                        className="edit-input"
                                                        onChange={(e) => handleInputChange(e, key)}
                                                        value={editFormData[key] || ""}
                                                    >
                                                        <option value="" disabled>Оберіть центр</option>
                                                        {subjectsList.map(subject => (
                                                            <option key={subject.id} value={subject.id}>
                                                                {subject.name} (Центр: {subject.centerId})
                                                            </option>
                                                        ))}
                                                    </select>

                                                ) : activeTab === 'Групи' && key === 'teacherId' ? (
                                                    <select
                                                        className="edit-input"
                                                        onChange={(e) => handleInputChange(e, key)}
                                                        value={editFormData[key] || ""}
                                                    >
                                                        <option value="" disabled>Оберіть вчителя</option>
                                                        {teachersList.map(teacher => (
                                                            <option key={teacher.id} value={teacher.id}>
                                                                {teacher.firstName} {teacher.lastName} ({teacher.email})
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <input
                                                        type={key === 'phoneNumber' || key === 'phone' ? 'tel' : 'text'}
                                                        className="edit-input"
                                                        value={editFormData[key] || ''}
                                                        onChange={(e) => handleInputChange(e, key)}
                                                        placeholder={key === 'phoneNumber' || key === 'phone' ? 'Наприклад, +380676767676 або 0676767676' : 'Введіть дані...'}
                                                    />
                                                )
                                            ) : (
                                                formatCellValue(item, key)
                                            )}
                                        </td>
                                    ))}
                                    <td className='actions-cell'>
                                        {editingId == item.id ? (
                                            <div className='actions-wrapper'>
                                                <button className='action-btn confirm-btn' onClick={() => handleSaveClick(item.id)}>
                                                    <img src={confirmIcon} alt="Confirm" className="confirm-btn-icon" />
                                                </button>
                                                <button className='action-btn cancel-btn' onClick={handleCancelClick}>
                                                    <img src={cancelIcon} alt="Cancel" className="cancel-btn-icon" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className='actions-wrapper'>
                                                {activeTab == 'Групи' && (
                                                    <button className='action-btn group-child-btn'
                                                        onClick={() => handleOpenGroupManager(item)}
                                                        title="Склад групи"
                                                    >
                                                        <img src={groupIcon} alt="Group" className="group-btn-icon" />
                                                    </button>
                                                )}
                                                <button className='action-btn edit-btn' onClick={() => handleEditClick(item)}>
                                                    <img src={editIcon} alt="Edit" className="edit-btn-icon" />
                                                </button>
                                                <button className='action-btn delete-btn' onClick={() => handleDeleteClick(item.id)}>
                                                    <img src={deleteIcon} alt="Delete" className="delete-btn-icon" />
                                                </button>
                                            </div>
                                        )
                                        }
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Заповніть необхідну інформацію</h2>
                        <div className="modal-form">
                            {currentConfig.keys
                                .filter(key => key !== 'id' && !key.includes('At'))
                                .map(key => (
                                    <div key={key} className="form-group">
                                        <label>{currentConfig.headers[currentConfig.keys.indexOf(key)]}</label>
                                        {activeTab === 'Користувачі' && key === 'role' ? (
                                            <select
                                                className="filter-input"
                                                onChange={(e) => setNewData({ ...newData, [key]: e.target.value })}
                                                value={newData[key] || ""}
                                            >
                                                <option value="" disabled>Оберіть роль...</option>
                                                <option value="CenterAdmin">Адмін центру</option>
                                                <option value="Teacher">Вчитель (Teacher)</option>
                                                <option value="Parent">Батько/Мати (Parent)</option>
                                            </select>
                                        ) : key === 'centerId' ? (
                                            <select
                                                className="filter-input"
                                                onChange={(e) => setNewData({ ...newData, [key]: e.target.value })}
                                                value={newData[key] || ""}
                                            >
                                                <option value="">Оберіть центр розвитку</option>
                                                {centersList.map(center => (
                                                    <option key={center.id} value={center.id}>
                                                        {center.name} (ID: {center.id})
                                                    </option>
                                                ))}
                                            </select>
                                        ) : key == 'groupId' ? (
                                            <select
                                                className="filter-input"
                                                onChange={(e) => setNewData({ ...newData, [key]: e.target.value })}
                                                value={newData[key] || ""}
                                            >
                                                <option value="">Оберіть групу</option>
                                                {groupsList.map(group => (
                                                    <option key={group.id} value={group.id}>
                                                        {group.name} (ID: {group.id})
                                                    </option>
                                                ))}
                                            </select>
                                        ) : key === 'teacherId' ? (
                                            <select className='filter-input'
                                                onChange={(e) => setNewData({ ...newData, [key]: e.target.value })}
                                                value={newData[key] || ""}
                                            >
                                                <option value="">Оберіть вчителя</option>
                                                {teachersList.map(teacher => (
                                                    <option key={teacher.id} value={teacher.id}>
                                                        {teacher.firstName} {teacher.lastName} ({teacher.email})
                                                    </option>
                                                ))}
                                            </select>
                                        )
                                            : activeTab === 'Діти' && key === 'parentId' ? (
                                                <select
                                                    className="filter-input"
                                                    onChange={(e) => setNewData({ ...newData, [key]: e.target.value })}
                                                    value={newData[key] || ""}
                                                >
                                                    <option value="">Оберіть представника</option>
                                                    {parentsList.map(parent => (
                                                        <option key={parent.id} value={parent.id}>
                                                            {parent.firstName} {parent.lastName} ({parent.email})
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : activeTab == 'Гуртки' && key == 'photoUrl' ? (
                                                <div className='file-upload-group'>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => setNewData({ ...newData, photo: e.target.files[0] })}
                                                    />
                                                    {newData.photo && <p className="file-name-hint">Обрано: {newData.photo.name}</p>}
                                                </div>

                                            ) : key === 'birthDate' ? (
                                                <input
                                                    type="date"
                                                    className="filter-input"
                                                    onChange={(e) => setNewData({ ...newData, [key]: e.target.value })}
                                                    value={newData[key] ? newData[key].split('T')[0] : ""}
                                                />
                                            ) : (
                                                <input
                                                    type={key === 'phoneNumber' || key === 'phone' ? 'tel' : 'text'}
                                                    onChange={(e) => setNewData({ ...newData, [key]: e.target.value })}
                                                    value={newData[key] || ""}
                                                    placeholder={key === 'phoneNumber' || key === 'phone' ? 'Наприклад, +380676767676 або 0676767676' : 'Введіть дані...'}
                                                />
                                            )}
                                    </div>
                                ))}

                            {activeTab === 'Користувачі' && (
                                <>
                                    <div className="form-group">
                                        <label>Пароль</label>
                                        <input
                                            type="text"
                                            className="filter-input"
                                            onChange={(e) => setNewData({ ...newData, password: e.target.value })}
                                            value={newData.password || ""}
                                            placeholder="Введіть надійний пароль"
                                        />
                                    </div>
                                    <div className='admin-password-demands'>
                                        <p>Пароль має містити: </p>
                                        <ul >
                                            <li>Мінімум 6 символів</li>
                                            <li>Хоча б 1 спец. символ (наприклад: !, @, #, _);</li>
                                            <li>Хоча б 1 цифру (0-9)</li>
                                            <li>Хоча б 1 велику літеру (A-Z)</li>
                                        </ul>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="modal-actions">
                            <button className="confirm-btn" onClick={handleCreateSave}>Зберегти</button>
                            <button className="cancel-btn" onClick={() => setIsModalOpen(false)}>Скасувати</button>
                        </div>
                    </div>
                </div>
            )}
            {isGroupManagerOpen && (
                <div className='modal-overlay' onClick={() => setIsGroupManagerOpen(false)}>
                    <div className="modal-content participants-modal" onClick={e => e.stopPropagation()}>
                        <div className="participants-header">
                            <h2 className='modal-title'>Склад групи: {selectedGroupForManager?.name}</h2>
                            <button className="add-entity-btn  add-user-btn"
                                onClick={() => {
                                    setChildSearchTerm("")
                                    setIsAddChildModalOpen(true);
                                }}
                            >
                                + Додати дитину
                            </button>
                        </div>
                        <div className='participants-list'>
                            {allChildrenList.filter(c => groupChildrenIds.includes(c.id)).length > 0 ? (
                                allChildrenList.filter(child => groupChildrenIds.includes(child.id))
                                    .map(child => (
                                        <div key={child.id} className="participant-item">
                                            <div className="participant-info">
                                                <div className="participant-avatar">
                                                    {child.firstName ? child.firstName.charAt(0).toUpperCase() : '?'}
                                                </div>
                                                <span className="participant-name">
                                                    {child.firstName} {child.lastName}
                                                </span>
                                            </div>
                                            <button
                                                className="remove-participant-btn"
                                                onClick={() => handleInitiateRemoveChild(child)}
                                            >
                                                Видалити
                                            </button>
                                        </div>
                                    ))
                            ) : (
                                <p style={{ textAlign: 'center', color: '#9384A6', padding: '20px' }}>
                                    У цій групі ще немає дітей
                                </p>
                            )}
                            <div className="modal-actions">
                                <button
                                    className="cancel-btn"
                                    onClick={() => setIsGroupManagerOpen(false)}
                                >
                                    Закрити
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {isAddChildModalOpen && (
                <div className="modal-overlay" style={{ zIndex: 1001 }} onClick={() => setIsAddChildModalOpen(false)}>
                    <div className="modal-content participants-modal" onClick={e => e.stopPropagation()}>
                        <div className="participants-header" style={{ marginBottom: '15px' }}>
                            <h2 className="modal-title">Додати дитину в групу: </h2>
                        </div>
                        <div className="form-group" style={{ marginBottom: '15px' }}>
                            <input
                                type="text"
                                placeholder="Пошук за іменем чи прізвищем..."
                                className="chat-input-field"
                                value={childSearchTerm}
                                onChange={(e) => setChildSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className='participants-list'>
                            {allChildrenList.filter(child =>
                                !groupChildrenIds.includes(child.id) &&
                                (child.firstName + ' ' + child.lastName).toLowerCase().includes(childSearchTerm.toLowerCase())
                            ).length > 0 ? (
                                allChildrenList
                                    .filter(child =>
                                        !groupChildrenIds.includes(child.id) &&
                                        (child.firstName + ' ' + child.lastName).toLowerCase().includes(childSearchTerm.toLowerCase())
                                    )
                                    .map(child => (
                                        <div key={child.id} className="participant-item">
                                            <div className="participant-info">
                                                <div className="participant-avatar">
                                                    {child.firstName ? child.firstName.charAt(0).toUpperCase() : '?'}
                                                </div>
                                                <span className="participant-name">
                                                    {child.firstName} {child.lastName}
                                                </span>
                                            </div>

                                            <button
                                                className="add-participant-btn"
                                                onClick={() => handleChangeChildStatusInGroup(child.id, false)}
                                            >
                                                Додати
                                            </button>
                                        </div>
                                    ))
                            ) : (
                                <p style={{ textAlign: 'center', color: '#9384A6', margin: '20px 0' }}>
                                    Дітей не знайдено
                                </p>
                            )}
                        </div>
                        <div className="modal-actions">
                            <button
                                className="cancel-btn"
                                onClick={() => {
                                    setIsAddChildModalOpen(false);
                                    setChildSearchTerm("");
                                }}
                            >
                                Назад
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {isRemoveChildModalOpen && childToRemove && (
                <div className="modal-overlay" style={{ zIndex: 1010 }} onClick={() => setIsRemoveChildModalOpen(false)}>
                    <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center', padding: '30px 20px' }} onClick={e => e.stopPropagation()}>

                        <div className='warning-sign-container'>
                            <span className='warning-sign'>⚠️</span>
                        </div>

                        <h2 style={{ color: '#2D3748', marginBottom: '10px', fontSize: '20px' }}>
                            Видалення з групи
                        </h2>

                        <p style={{ color: '#718096', marginBottom: '25px', fontSize: '15px', lineHeight: '1.5' }}>
                            Ви впевнені, що хочете видалити <b>{childToRemove.lastName} {childToRemove.firstName}</b> зі складу групи <b>{selectedGroupForManager?.name}</b>?
                        </p>

                        <div className="modal-actions" style={{ justifyContent: 'center', gap: '15px' }} >
                            <button
                                className="cancel-btn"
                                onClick={() => setIsRemoveChildModalOpen(false)}
                                style={{ width: '130px' }}
                            >
                                Скасувати
                            </button>
                            <button
                                className="confirm-btn"
                                onClick={confirmRemoveChild}
                                style={{
                                    width: '130px',
                                    backgroundColor: '#D30000',
                                    color: 'white',
                                    border: 'none'
                                }}
                            >
                                Видалити
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminPanel;