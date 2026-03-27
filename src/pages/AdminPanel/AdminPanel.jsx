import './AdminPanel.css';
import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import searchIcon from '../../assets/icons/search.png';
import confirmIcon from '../../assets/icons/checkmark.png';
import cancelIcon from '../../assets/icons/cancel.png';
import editIcon from '../../assets/icons/pencil.png';
import deleteIcon from '../../assets/icons/trash.png';

const tableConfig = {
    'Центри': {
        headers: ['ID', 'Назва', 'Адреса', 'Телефон', 'Email', 'Дії'],
        keys: ['id', 'name', 'address', 'phone', 'email']
    },
    'Користувачі': {
        headers: ['ID', 'Ім\'я', 'Прізвище', 'Email', 'ID Центру', 'Дії'],
        keys: ['id', 'firstName', 'lastName', 'email', 'centerId']
    },
    'Діти': {
        headers: ['ID', 'Ім\'я', 'Прізвище', 'Дата народження', 'ID Батька', 'Дії'],
        keys: ['id', 'firstName', 'lastName', 'birthDate', 'parentId']
    },
    'Матеріали': {
        headers: ['ID', 'Заголовок', 'Тип', 'ID Групи', 'Створено', 'Дії'],
        keys: ['id', 'title', 'type', 'groupId', 'createdAt']
    },
    'Групи': {
        headers: ['ID', 'Назва', 'Опис', 'ID Вчителя', 'Дії'],
        keys: ['id', 'name', 'description', 'teacherId']
    },
    'Гуртки': {
        headers: ['ID', 'Назва', 'Опис', 'ID Центру', 'Дії'],
        keys: ['id', 'name', 'description', 'centerId']
    },
    'Заявки': {
        headers: ['ID', 'Батько', 'Дитина', 'Телефон', 'Дата', 'Дії'],
        keys: ['id', 'parentName', 'childName', 'phone', 'createdAt']
    }
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

    const currentConfig = tableConfig[activeTab];
    const formatCellValue = (item, key) => {
        const value = item[key];

        if (key.includes('Date') || key.includes('At')) {
            return value ? new Date(value).toLocaleDateString() : '—';
        }

        if (key === 'id' || key.includes('Id')) {
            if (!value) return '—';
            return `${value}...`;
        }

        return value || '—';
    };

    const handleEditClick = (item) => {
        setEditingId(item.id);
        setEditFormData(item);
    };

    const handleCancelClick = () => {
        setEditingId(null);
        setEditFormData({});
    };
    const handleSaveClick = async (id) => {
        try {
            await api.put(`${endpointMap[activeTab]}/${id}`, editFormData);

            setData(data.map(item => item.id === id ? editFormData : item));
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

    const handleAddClick = () => {
        setNewData({});
        setIsModalOpen(true);
    };

    const handleCreateSave = async () => {
        try {
            const response = await api.post(endpointMap[activeTab], newData);
            setData([...data, response.data]);
            setIsModalOpen(false);
        } catch (error) {
            console.error("Помилка при створенні:", error);
            alert("Не вдалося створити запис. Перевірте обов'язкові поля.");
        }
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
                        <button className='add-entity-btn' onClick={handleAddClick}>
                            + Додати запис
                        </button>
                    </div>
                    <table className='admin-table'>
                        <thead >
                            <tr>
                                {currentConfig.headers.map(h => <th key={h}>{h}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {!loading && filteredData.map((item) => (
                                <tr key={item.id} className={editingId === item.id ? 'row-editing' : ''}>
                                    {currentConfig.keys.map(key => (
                                        <td key={key}>
                                            {editingId === item.id && key !== 'id' ? (
                                                <input
                                                    type="text"
                                                    className="edit-input"
                                                    value={editFormData[key] || ''}
                                                    onChange={(e) => handleInputChange(e, key)}
                                                />
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
                                                <button className='action-btn edit-btn' onClick={() => handleEditClick(item)}>
                                                    <img src={editIcon} alt="Edit" className="edit-btn-icon" />
                                                </button>
                                                <button className='action-btn delete-btn'>
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
                                        <input
                                            type="text"
                                            onChange={(e) => setNewData({ ...newData, [key]: e.target.value })}
                                        />
                                    </div>
                                ))}
                        </div>
                        <div className="modal-actions">
                            <button className="confirm-btn" onClick={handleCreateSave}>Зберегти</button>
                            <button className="cancel-btn" onClick={() => setIsModalOpen(false)}>Скасувати</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminPanel;