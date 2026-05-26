import { useState, useEffect } from 'react';
import searchIcon from '../../assets/icons/search.png';
import './AttendancePage.css';
import api from '../../../api/axios';
import { useAuth } from '../../auth/AuthContext';

const AttendancePage = () => {
    const { user } = useAuth();
    const [centers, setCenters] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [groups, setGroups] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [childrenList, setChildrenList] = useState([]);
    const [attendances, setAttendances] = useState([]);
    const [selectedCenter, setSelectedCenter] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedGroup, setSelectedGroup] = useState('');
    const [appliedGroup, setAppliedGroup] = useState('');
    const [selectedLessonId, setSelectedLessonId] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    const [isLoading, setIsLoading] = useState(false);
    const [notes, setNotes] = useState({});

    const isAdmin = user?.roles?.includes('SuperAdmin') || user?.roles?.includes('CenterAdmin');
    const canEdit = isAdmin;

    useEffect(() => {
        const fetchFilterData = async () => {
            try {
                const [centersResponse, subjectsResponse, groupsResponse] = await Promise.all([
                    api.get('/center'),
                    api.get('/subject'),
                    api.get('/group')
                ]);

                setCenters(centersResponse.data);
                setSubjects(subjectsResponse.data);
                setGroups(groupsResponse.data);

            } catch (err) {
                console.error("Помилка завантаження фільтрів:", err);
            }
        };

        fetchFilterData();
    }, []);

    const availableSubj = selectedCenter
        ? subjects.filter(s => s.centerId === selectedCenter)
        : [];

    const availableGroups = selectedSubject
        ? groups.filter(g => g.subjectId === selectedSubject)
        : [];

    const handleApplyFilters = async () => {
        if (!selectedGroup) {
            return;
        }
        setAppliedGroup(selectedGroup);
        setIsLoading(true);
        try {
            const [childrenRes, scheduleRes] = await Promise.all([
                api.get(`/group/${selectedGroup}/children`),
                api.get(`/schedule/group/${selectedGroup}`)
            ]);

            setChildrenList(childrenRes.data);

            const sortedLessons = scheduleRes.data.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
            setLessons(sortedLessons);

            if (sortedLessons.length > 0) {
                setSelectedLessonId(sortedLessons[0].id);
                fetchAttendances(sortedLessons[0].id);
            }
        } catch (error) {
            console.error("Помилка завантаження даних групи:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAttendances = async (lessonId) => {
        try {
            const response = await api.get(`/attendance/lesson/${lessonId}`);
            setAttendances(response.data);

            const fetchedNotes = {};
            response.data.forEach(record => {
                fetchedNotes[record.childId] = record.note || "";
            });
            setNotes(fetchedNotes);
        } catch (error) {
            console.error("Помилка завантаження в ідвідуваності:", error);
        }
    };

    const handleLessonChange = (e) => {
        const lessonId = e.target.value;
        setSelectedLessonId(lessonId);
        if (lessonId) {
            fetchAttendances(lessonId);
        }
    };

    const handleSubjectChange = (e) => {
        setSelectedSubject(e.target.value);
        setSelectedGroup('');
    };

    const handleAttendanceChange = async (childId, status) => {
        if (!canEdit) {
            return;
        }

        if (!selectedLessonId) {
            return;
        }
        const existingRecord = attendances.find(a => a.childId === childId);
        const currentNote = notes[childId] || "";

        try {
            if (existingRecord) {
                const response = await api.put(`/attendance/${existingRecord.id}`, {
                    status: status,
                    note: currentNote
                });
                setAttendances((prev) => {
                    return prev.map((attendance) => {
                        if (attendance.id === existingRecord.id) {
                            return response.data;
                        } else {
                            return attendance;
                        }
                    });
                });
            } else {
                const response = await api.post('/attendance', {
                    lessonId: selectedLessonId,
                    childId: childId,
                    status: status,
                    note: currentNote
                });
                setAttendances(prev => [...prev, response.data]);
            }
        } catch (error) {
            console.error("Помилка збереження відвідуваності:", error);
            alert("Не вдалося зберегти відвідуваність");
        }
    };

    const formatLessonDate = (dateString) => {
        const d = new Date(dateString);
        return d.toLocaleDateString('uk-UA') + ', ' + d.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
    };

    const handleSaveAllChanges = async () => {
        if (!selectedLessonId) {
            return
        }

        if (!canEdit) {
            return;
        }

        const childrenWithMissingStatus = childrenList.filter(child => {
            const existingRecord = attendances.find(a => a.childId === child.id);
            const currentNote = notes[child.id] || "";

            return currentNote.trim() !== "" && !existingRecord;
        });

        if (childrenWithMissingStatus.length > 0) {
            const names = childrenWithMissingStatus.map(c => `${c.lastName} ${c.firstName}`).join(', ');
            alert(`⚠️ Помилка збереження!\n\nВи додали помітку, але не вказали статус (Був/Не був) для:\n${names}.\n\nБудь ласка, оберіть статус перед збереженням.`);
            return;
        }

        setIsLoading(true);

        try {
            const promises = childrenList.map(child => {
                const existingRecord = attendances.find(a => a.childId === child.id);
                const currentNote = notes[child.id] || "";

                if (existingRecord && (existingRecord.note || "") !== currentNote) {
                    return api.put(`/attendance/${existingRecord.id}`, {
                        status: existingRecord.status,
                        note: currentNote
                    });
                }
                return null;
            }).filter(p => p !== null);

            if (promises.length > 0) {
                await Promise.all(promises);
                await fetchAttendances(selectedLessonId);
            }

            alert("Всі нотатки успішно збережено!");

        } catch (error) {
            console.error("Помилка масового збереження:", error);
            alert("Сталася помилка при збереженні.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="attendance-container">
            <h1 className="materials-page-title">Відвідування</h1>
            <div className="attendance-card">
                <div className="attendance-card-filters">
                    <select
                        value={selectedCenter}
                        onChange={e => {
                            setSelectedCenter(e.target.value);
                            setSelectedSubject('');
                            setSelectedGroup('');
                        }}
                    >
                        <option value="">Оберіть центр дит. розвитку</option>
                        {centers.map(center => (
                            <option key={center.id} value={center.id}>
                                {center.name} (ID: {isMobile ? `${center.id.substring(0, 8)}...` : center.id})
                            </option>
                        ))}
                    </select>
                    <select
                        value={selectedSubject}
                        onChange={e => {
                            setSelectedSubject(e.target.value);
                            setSelectedGroup('');
                        }}
                        disabled={!selectedCenter}
                    >
                        <option value="">Оберіть гурток</option>
                        {availableSubj.map(s => (
                            <option key={s.id} value={s.id}>
                                {s.name}
                            </option>
                        ))}
                    </select>
                    <select
                        value={selectedGroup}
                        onChange={e =>
                            setSelectedGroup(e.target.value)
                        }
                        disabled={!selectedSubject}
                    >
                        <option value="">Оберіть групу</option>
                        {availableGroups.map(group => (
                            <option key={group.id} value={group.id}>
                                {group.name}
                            </option>
                        ))}
                    </select>
                    <button className='apply-search-btn'
                        onClick={handleApplyFilters}
                        disabled={!selectedCenter || !selectedSubject || !selectedGroup}
                        style={{
                            opacity: (!selectedCenter || !selectedSubject || !selectedGroup) ? 0.5 : 1,
                            cursor: (!selectedCenter || !selectedSubject || !selectedGroup) ? 'not-allowed' : 'pointer'
                        }}
                    >
                        <img src={searchIcon} alt='Search' className='search-btn-icon' />
                        Застосувати
                    </button>
                </div>
                <div className="attendance-card-table-wrapper">
                    <div className='lesson-selector'>
                        <select value={selectedLessonId} onChange={handleLessonChange}>
                            {lessons.length === 0 && <option value="">Немає занять</option>}
                            {lessons.map(lesson => (
                                <option key={lesson.id} value={lesson.id}>
                                    {formatLessonDate(lesson.startTime)}
                                </option>
                            ))}
                        </select>
                    </div>
                    {!appliedGroup ? (
                        <div className='attendance-no-group-msg'>
                            <p className='attendance-error-msg-top'>
                                Відвідування не вибрано
                            </p>
                            <p className='attendance-error-msg-bottom'>
                                Будь ласка, оберіть центр, гурток та групу з меню вище і натисніть "Застосувати".
                            </p>
                        </div>
                    ) : isLoading ? (
                        <p style={{ textAlign: 'center', padding: '20px' }}>Завантаження...</p>
                    ) : lessons.length === 0 ? (
                        <div className='attendance-no-group-msg'>
                            <p className='attendance-error-msg-top'>
                                У розкладі ще немає занять
                            </p>
                            <p className='attendance-no-group-msg-bottom'>
                                Для цієї групи не знайдено жодного заняття. Відвідуваність можна відмічати лише для існуючих уроків з розкладу.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className='table-rounded-wrapper'>
                                <table className='attendance-table'>
                                    <thead>
                                        <tr>
                                            <th>№</th>
                                            <th>Прізвище, ім'я дитини</th>
                                            <th>Присутність</th>
                                            <th>Нотатка</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {childrenList.map((child, index) => {
                                            const record = attendances.find(a => a.childId === child.id);
                                            const isPresent = record?.status === 0;
                                            const isAbsent = record?.status === 1;
                                            return (
                                                <tr key={child.id}>
                                                    <td className='child-index'>
                                                        {index + 1}
                                                    </td>
                                                    <td className='child-name'>
                                                        {child.lastName} {child.firstName}
                                                    </td>
                                                    <td className='child-checkboxes'>
                                                        <label className='checkbox-label'>
                                                            Був/була
                                                            <input type='radio'
                                                                name={`attendance-${child.id}`}
                                                                checked={isPresent}
                                                                onChange={() => handleAttendanceChange(child.id, 0)}
                                                                disabled={!canEdit}
                                                            />
                                                            <span className='custom-radio'></span>
                                                        </label>
                                                        <label className='checkbox-label'>
                                                            Не був/не була
                                                            <input type='radio'
                                                                name={`attendance-${child.id}`}
                                                                checked={isAbsent}
                                                                onChange={() => handleAttendanceChange(child.id, 1)}
                                                                disabled={!canEdit}
                                                            />
                                                            <span className='custom-radio'></span>
                                                        </label>
                                                    </td>
                                                    <td className='child-note'>
                                                        <textarea
                                                            className='attendance-note-textarea'
                                                            placeholder='Додати нотатку...'
                                                            value={notes[child.id] || ''}
                                                            onChange={(e) => setNotes(prev => ({ ...prev, [child.id]: e.target.value }))}
                                                            rows={2}
                                                            disabled={!canEdit}
                                                            style={{
                                                                backgroundColor: canEdit ? '#FDFBFF' : '#F3EDF7',
                                                                cursor: canEdit ? 'text' : 'not-allowed'
                                                            }}
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        }

                                        )

                                        }
                                    </tbody>
                                </table>
                            </div>
                            {canEdit && (
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <button
                                        className="add-entity-btn"
                                        onClick={handleSaveAllChanges}
                                    >
                                        Зберегти зміни
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div >
    );
};

export default AttendancePage;