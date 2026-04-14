import { useState, useEffect } from 'react';
import searchIcon from '../../assets/icons/search.png';
import './AttendancePage.css';

const AttendancePage = () => {
    const [centers, setCenters] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [groups, setGroups] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [childrenList, setChildrenList] = useState([]);
    const [attendances, setAttendances] = useState([]);

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchFilterData = async () => {
            try {
                const centersResponse = await api.get('/center');
                setCenters(centersResponse.data);

                const subjectsResponse = await api.get('/subject');
                setSubjects(subjectsResponse.data);

                const groupsResponse = await api.get('/group');
                setGroups(groupsResponse.data);
            } catch (err) {

            }
        };
    }, []);

    return (
        <div className="attendance-container">
            <h1 className="materials-page-title">Відвідування</h1>
            <div className="attendance-card">
                <div className="attendance-card-filters">
                    <select >
                        <option value="">Оберіть центр дит. розвитку</option>
                        {centers.map(center => (
                            <option key={center.id} value={center.id}>
                                {center.name} (ID: {center.id})
                            </option>
                        ))}
                    </select>
                    <select >
                        <option value="">Оберіть гурток</option>
                        {subjects.map(s => (
                            <option key={s.id} value={s.id}>
                                {s.name}
                            </option>
                        ))}
                    </select>
                    <select >
                        <option value="">Оберіть групу</option>
                        {groups.map(group => (
                            <option key={group.id} value={group.id}>
                                {group.name}
                            </option>
                        ))}
                    </select>
                    <button className='apply-search-btn'>
                        <img src={searchIcon} alt='Search' className='search-btn-icon' />
                        Застосувати
                    </button>
                </div>
                <div className="attendance-card-table-wrapper">
                    <div className='lesson-selector'>
                        <select>
                            {lessons.length === 0 && <option value="">Немає занять</option>}
                            {lessons.map(lesson => (
                                <option key={lesson.id} value={lesson.id}>
                                    {formatLessonDate(lesson.startTime)}
                                </option>
                            ))}
                        </select>
                    </div>
                    {isLoading ? (
                        <p style={{ textAlign: 'center', padding: '20px' }}>Завантаження...</p>
                    ) : (
                        <table className='attendance-table'>
                            <thead>
                                <tr>
                                    <th>№</th>
                                    <th>Прізвище, ім'я дитини</th>
                                    <th>Присутність</th>
                                </tr>
                            </thead>
                            <tbody>
                                {childrenList.map((child, index) => {
                                    const record = attendances.find(a => a.childId === child.id);
                                    const isPresent = record?.status === 0;
                                    const isAbsent = record?.status === 1;
                                    return (
                                        <tr >
                                            <td className='child-index'>
                                                {index + 1}
                                            </td>
                                            <td className='child-name'>
                                                {child.lastName} {child.FirstName}
                                            </td>
                                            <td className='child-checkboxes'>
                                                <label className='checkbox-label'>
                                                    Був
                                                    <input type="radio"
                                                        name={`attendance-${child.id}`}
                                                        checked={isPresent}
                                                    />
                                                    <span className="custom-radio"></span>
                                                </label>
                                                <label className='checkbox-label'>
                                                    Не був
                                                   <input type="radio"
                                                        name={`attendance-${child.id}`}
                                                        checked={isAbsent}
                                                    />
                                                    <span className="custom-radio"></span>
                                                </label>
                                            </td>
                                        </tr>
                                    );
                                }

                                )

                                }
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AttendancePage;