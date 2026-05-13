import React, { useState, useEffect } from 'react';
import './SchedulePage.css';
import api from '../../../api/axios';
import { useAuth } from '../../auth/AuthContext';

const SchedulePage = () => {
    const { user } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedCenter, setSelectedCenter] = useState("1");
    const [appliedCenter, setAppliedCenter] = useState("");
    const [centers, setCenters] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [editingEvent, setEditingEvent] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editFormData, setEditFormData] = useState({
        groupId: "",
        teacherId: "",
        subjectId: "",
        roomName: "",
        startTime: "",
        endTime: ""
    });
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addFormData, setAddFormData] = useState({
        groupId: "",
        teacherId: "",
        subjectId: "",
        roomName: "",
        startTime: "",
        endTime: ""
    });
    const [teachersList, setTeachersList] = useState([]);
    const [groupsList, setGroupsList] = useState([]);
    const [subjectsList, setSubjectsList] = useState([]);

    const isAdmin = user?.roles?.includes('SuperAdmin') || user?.roles?.includes('CenterAdmin');
    useEffect(() => {
        if (isAdmin) {
            const fetchDictionaries = async () => {
                try {
                    const [teachersRes, groupsRes, subjectsRes] = await Promise.all([
                        api.get('/user/teachers'),
                        api.get('/group'),
                        api.get('/subject')
                    ]);

                    setTeachersList(teachersRes.data);
                    setGroupsList(groupsRes.data);
                    setSubjectsList(subjectsRes.data);
                } catch (error) {
                    console.error("Помилка завантаження списків для форми:", error);
                }
            };
            fetchDictionaries();
        }
    }, [isAdmin]);

    useEffect(() => {
        const fetchCenters = async () => {
            try {
                const response = await api.get('/center');
                const availableCenters = response.data;

                setCenters(availableCenters);
                if (availableCenters.length > 0) {
                    setSelectedCenter(availableCenters[0].id);
                    setAppliedCenter(availableCenters[0].id);
                }
            } catch (error) {
                console.error("Помилка завантаження центрів:", error);
            }
        };

        fetchCenters();
    }, []);

    useEffect(() => {
        const fetchSchedules = async () => {
            if (!user || !user.roles) {
                return;
            }

            setIsLoading(true);
            try {
                let response;

                if (user.roles.includes('Teacher') || user.roles.includes('Parent')) {
                    response = await api.get('/schedule/my');
                }

                else if (user.roles.includes('SuperAdmin') || user.roles.includes('CenterAdmin')) {

                    if (!appliedCenter) {
                        return;
                    }

                    response = await api.get('/schedule', {
                        params: { centerId: appliedCenter }
                    });
                }

                if (response && response.data) {
                    setSchedules(response.data);
                }
            } catch (error) {
                console.error("Помилка завантаження розкладу:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSchedules();
    }, [user, appliedCenter, refreshTrigger]);

    const getMonthYearString = (date) => {
        const options = { month: 'long', year: 'numeric' };
        let str = date.toLocaleDateString('uk-UA', options);
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    const getWeekDays = (date) => {
        const week = [];
        const start = new Date(date);
        const day = start.getDay();
        let diff;

        if (day === 0) {
            diff = start.getDate() - 6;
        } else {
            diff = start.getDate() - day + 1;
        }
        start.setDate(diff);

        for (let i = 0; i < 7; i++) {
            const dayDate = new Date(start);
            dayDate.setDate(start.getDate() + i);
            week.push(dayDate);
        }
        return week;
    };

    const weekDays = getWeekDays(currentDate);

    const nextWeek = () => {
        const next = new Date(currentDate);
        next.setDate(currentDate.getDate() + 7);
        setCurrentDate(next);
    };

    const prevWeek = () => {
        const prev = new Date(currentDate);
        prev.setDate(currentDate.getDate() - 7);
        setCurrentDate(prev);
    };

    const dayNames = ["Понеділок", "Вівторок", "Середа", "Четвер", "П'ятниця", "Субота", "Неділя"];

    const getEventsForSlot = (dayDate, hour) => {
        return schedules.filter(sch => {
            const [datePart, timePart] = sch.startTime.split("T");
            const schHour = parseInt(timePart.split(":")[0]);

            const schDate = new Date(datePart);

            return schDate.getDate() === dayDate.getDate() &&
                schDate.getMonth() === dayDate.getMonth() &&
                schDate.getFullYear() === dayDate.getFullYear() &&
                schHour === hour;
        });
    };

    const getDynamicHours = () => {
        const startOfWeek = new Date(weekDays[0]);
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(weekDays[6]);
        endOfWeek.setHours(23, 59, 59, 999);

        const eventsThisWeek = schedules.filter(sch => {
            const date = new Date(sch.startTime);
            return date >= startOfWeek && date <= endOfWeek;
        });

        if (eventsThisWeek.length === 0) {
            return [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
        }

        const eventHours = eventsThisWeek.map(sch => new Date(sch.startTime).getHours());
        let minHour = Math.min(...eventHours);
        let maxHour = Math.max(...eventHours);

        minHour = Math.max(0, minHour - 1);
        maxHour = Math.min(23, maxHour + 1);

        const generatedHours = [];
        for (let i = minHour; i <= maxHour; i++) {
            generatedHours.push(i);
        }

        return generatedHours;
    };

    const dynamicHours = getDynamicHours();

    const formatTime = (dateString) => {
        if (!dateString) {
            return "";
        }
        const date = new Date(dateString);
        return date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
    };

    const handleStartEdit = (event) => {
        const formatForInput = (dateStr) => {
            if (!dateStr) {
                return "";
            }
            const d = new Date(dateStr);
            return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        };
        setEditingEvent(event);
        setEditFormData({
            groupId: event.groupId || "",
            teacherId: event.teacherId || "",
            subjectId: event.subjectId || "",
            roomName: event.roomName || "",
            startTime: formatForInput(event.startTime),
            endTime: formatForInput(event.endTime)
        });
        setIsEditMode(true);
    };

    const handleCancelEdit = () => {
        setIsEditMode(false);
        setEditingEvent(null);
    };

    const handleSaveEdit = async () => {

        if (!editFormData.startTime || !editFormData.endTime) {
            alert("Будь ласка, вкажіть і час початку, і час кінця заняття.");
            return;
        }

        const start = new Date(editFormData.startTime);
        const end = new Date(editFormData.endTime);

        if (start >= end) {
            alert("Помилка: Час початку не може бути пізніше (або дорівнювати) часу кінця!");
            return;
        }

        try {
            await api.put(`/schedule/${editingEvent.id}`, editFormData);
            setIsEditMode(false);
            setSelectedEvent(null);
            setRefreshTrigger(prev => prev + 1);
            alert("Розклад успішно оновлено!");
        } catch (error) {
            console.error("Помилка при оновленні:", error);
            alert("Не вдалося зберегти зміни");
        }
    };

    const handleDelete = async (recordId) => {
        if (window.confirm("Ви впевнені, що хочете видалити цей запис? Цю дію неможливо скасувати.")) {
            try {
                await api.delete(`/schedule/${recordId}`);
                setSelectedEvent(null);
                setRefreshTrigger(prev => prev + 1);
            } catch (err) {
                console.error("Помилка при видаленні запису:", err);
                alert("Не вдалося видалити матеріал. Спробуйте пізніше.");
            }
        }
    };

    const handleOpenAddModal = () => {
        setAddFormData({
            groupId: "",
            teacherId: "",
            subjectId: "",
            roomName: "",
            startTime: "",
            endTime: ""
        });
        setIsAddModalOpen(true);
    };

    const handleSaveNewRecord = async () => {

        if (!addFormData.startTime || !addFormData.endTime) {
            alert("Будь ласка, вкажіть і час початку, і час кінця заняття.");
            return; 
        }

        const start = new Date(addFormData.startTime);
        const end = new Date(addFormData.endTime);

        if (start >= end) {
            alert("Помилка: Час початку не може бути пізніше (або дорівнювати) часу кінця!");
            return; 
        }

        try {
            await api.post('/schedule', addFormData);
            setIsAddModalOpen(false);
            setRefreshTrigger(prev => prev + 1);
            alert("Нове заняття успішно додано до розкладу!");
        } catch (error) {
            console.error("Помилка додавання нового заняття до розкладу:", "");
            alert("Не вдалося створити заняття.");
        }
    };

    const availableGroupsForEdit = editFormData.subjectId 
        ? groupsList.filter(g => g.subjectId === editFormData.subjectId) 
        : [];

    const availableGroupsForAdd = addFormData.subjectId 
        ? groupsList.filter(g => g.subjectId === addFormData.subjectId) 
        : [];

    return (
        <div className="schedule-page-container">
            <h1 className="page-title">Розклад</h1>
            {isAdmin && (
                <div className="schedule-filter-bar">
                    <select
                        className="center-select"
                        value={selectedCenter}
                        onChange={(e) => setSelectedCenter(e.target.value)}
                        disabled={centers.length <= 1}
                    >
                        {centers.map(center => (
                            <option key={center.id} value={center.id}>
                                {center.name}
                            </option>
                        ))}
                    </select>
                    <button className="apply-btn"
                        onClick={() => setAppliedCenter(selectedCenter)}
                        disabled={selectedCenter === appliedCenter}
                    >
                        Застосувати
                    </button>
                </div>
            )}

            <div className="calendar-container">
                <div className="calendar-header">
                    <div className="month-navigation">
                        <span className="month-title">{getMonthYearString(weekDays[0])}</span>
                        <div className="nav-arrows">
                            <button onClick={prevWeek}>&lt;</button>
                            <button onClick={nextWeek}>&gt;</button>
                        </div>
                    </div>
                    {isAdmin && (
                        <button className='add-entity-btn'
                            onClick={handleOpenAddModal}
                        >
                            + Додати заняття
                        </button>
                    )}
                </div>

                <div className='table-container'>
                    <table className='schedule-table'>
                        <thead>
                            <tr>
                                <th className="time-col-header"></th>
                                {weekDays.map((day, index) => (
                                    <th key={index}>
                                        <div className="day-name">{dayNames[index]}</div>
                                        <div className="day-date">
                                            {day.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' })}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {dynamicHours.map(hour => (
                                <tr key={hour}>
                                    <td className="time-cell">{hour}:00</td>
                                    {weekDays.map((day, index) => {
                                        const events = getEventsForSlot(day, hour);
                                        return (
                                            <td key={index} className="event-cell">
                                                {events.length > 0 && (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        {events.map((event) => (
                                                            <div
                                                                key={event.id}
                                                                className="event-pill"
                                                                onClick={() => setSelectedEvent(event)}
                                                                style={{ cursor: 'pointer' }}
                                                            >
                                                                {event.subjectName}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {selectedEvent && (
                <div className="event-modal-overlay" onClick={() => {
                    if (!isEditMode) setSelectedEvent(null);
                }}
                >
                    <div className="event-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="event-modal-header">
                            <h3>{isEditMode ? "Редагування заняття" : selectedEvent.subjectName}</h3>
                            <button className="close-event-btn" onClick={() => {
                                setSelectedEvent(null);
                                setIsEditMode(false);
                            }}>×</button>
                        </div>
                        <div className="event-modal-body">
                            <div className="form-group">
                                <label>Предмет</label>
                                {isEditMode ? (
                                    <select
                                        value={editFormData.subjectId}
                                        onChange={e => setEditFormData({ ...editFormData, subjectId: e.target.value })}
                                    >
                                        <option value="">Оберіть предмет</option>
                                        {subjectsList.map(s => (
                                            <option key={s.id} value={s.id}>{s.name} ({s.id.substring(0, 8)})</option>
                                        ))}
                                    </select>
                                ) : (
                                    <p className="modal-text-value">{selectedEvent.subjectName}</p>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Група</label>
                                {isEditMode ? (
                                    <select
                                        value={editFormData.groupId}
                                        onChange={e => setEditFormData({ ...editFormData, groupId: e.target.value })}
                                        disabled={!editFormData.subjectId}
                                    >
                                        <option value="">{editFormData.subjectId ? "Оберіть групу" : "Спочатку оберіть предмет"}</option>
                                        {availableGroupsForEdit.map(g => (
                                            <option key={g.id} value={g.id}>{g.name} ({g.id.substring(0, 8)})</option>
                                        ))}
                                    </select>
                                ) : (
                                    <p className="modal-text-value">{selectedEvent.groupName || "Не вказано"}</p>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Викладач</label>
                                {isEditMode ? (
                                    <select
                                        value={editFormData.teacherId}
                                        onChange={e => setEditFormData({ ...editFormData, teacherId: e.target.value })}
                                    >
                                        <option value="">Оберіть викладача</option>
                                        {teachersList.map(t => (
                                            <option key={t.id} value={t.id}>{t.firstName} {t.lastName} ({t.email})</option>
                                        ))}
                                    </select>
                                ) : (
                                    <p className="modal-text-value">{selectedEvent.teacherName || "Не вказано"}</p>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Кабінет</label>
                                {isEditMode ? (
                                    <input
                                        type="text"
                                        value={editFormData.roomName}
                                        onChange={e => setEditFormData({ ...editFormData, roomName: e.target.value })}
                                    />
                                ) : (
                                    <p className="modal-text-value">{selectedEvent.roomName || "Не вказано"}</p>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Час початку та кінця</label>
                                {isEditMode ? (
                                    <div className='datetime-inputs-group'>
                                        <input
                                            type="datetime-local"
                                            value={editFormData.startTime}
                                            onChange={e => setEditFormData({ ...editFormData, startTime: e.target.value })}
                                        />
                                        <input
                                            type="datetime-local"
                                            value={editFormData.endTime}
                                            onChange={e => setEditFormData({ ...editFormData, endTime: e.target.value })}
                                        />
                                    </div>
                                ) : (
                                    <p className="modal-text-value">
                                        {formatTime(selectedEvent.startTime)} - {formatTime(selectedEvent.endTime)}
                                    </p>
                                )}
                            </div>

                            <div className="modal-footer" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                                {isAdmin && !isEditMode && (
                                    <>
                                        <button className="apply-btn" onClick={() => handleStartEdit(selectedEvent)} style={{ width: '100%' }}>
                                            Редагувати
                                        </button>
                                        <button className="apply-btn" onClick={() => handleDelete(selectedEvent.id)} style={{ width: '100%' }}>
                                            Видалити
                                        </button>
                                    </>
                                )}
                                {isEditMode && (
                                    <>
                                        <button className="cancel-btn" onClick={handleCancelEdit} style={{ flex: 1 }}>
                                            Скасувати
                                        </button>
                                        <button className="apply-btn" onClick={handleSaveEdit} style={{ flex: 1 }}>
                                            Зберегти
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )
            }

            {isAddModalOpen && (
                <div className='event-modal-overlay' onClick={() => setIsAddModalOpen(false)}>
                    <div className="event-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="event-modal-header">
                            <h3>Заповніть необхідні поля</h3>
                            <button className="close-event-btn" onClick={() =>
                                setIsAddModalOpen(false)}>×
                            </button>
                        </div>
                        <div className="event-modal-body">
                            <div className="form-group">
                                <label>Предмет</label>
                                <select
                                    value={addFormData.subjectId}
                                    onChange={e => setAddFormData({ ...addFormData, subjectId: e.target.value })}
                                >
                                    <option value="">Оберіть предмет</option>
                                    {subjectsList.map(s => (
                                        <option key={s.id} value={s.id}>{s.name} ({s.id.substring(0, 8)})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Група</label>
                                <select
                                    value={addFormData.groupId}
                                    onChange={e => setAddFormData({ ...addFormData, groupId: e.target.value })}
                                    disabled={!addFormData.subjectId}
                                >
                                    <option value="">{addFormData.subjectId ? "Оберіть групу" : "Спочатку оберіть предмет"}</option>
                                    {availableGroupsForAdd.map(g => (
                                        <option key={g.id} value={g.id}>{g.name} ({g.id.substring(0, 8)})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Викладач</label>
                                <select
                                    value={addFormData.teacherId}
                                    onChange={e => setAddFormData({ ...addFormData, teacherId: e.target.value })}
                                >
                                    <option value="">Оберіть викладача</option>
                                    {teachersList.map(t => (
                                        <option key={t.id} value={t.id}>{t.firstName} {t.lastName} ({t.email})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Кабінет</label>
                                <input
                                    type="text"
                                    value={addFormData.roomName}
                                    onChange={e => setAddFormData({ ...addFormData, roomName: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Час початку та кінця</label>
                                <div className='datetime-inputs-group'>
                                    <input
                                        type="datetime-local"
                                        value={addFormData.startTime}
                                        onChange={e => setAddFormData({ ...addFormData, startTime: e.target.value })}
                                    />
                                    <input
                                        type="datetime-local"
                                        value={addFormData.endTime}
                                        onChange={e => setAddFormData({ ...addFormData, endTime: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                            <button className="cancel-btn" onClick={() => setIsAddModalOpen(false)} style={{ flex: 1 }}>
                                Скасувати
                            </button>
                            <button className="apply-btn" onClick={handleSaveNewRecord} style={{ flex: 1 }}>
                                Зберегти
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SchedulePage;