import React, { useState, useEffect } from 'react';
import './SchedulePage.css';
import api from '../../../api/axios';
import { useAuth } from '../../auth/AuthContext';

const SchedulePage = () => {
    const { user } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date('2026-03-29'));
    const [selectedCenter, setSelectedCenter] = useState("1");
    const [centers, setCenters] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchCenters = async () => {
            try {
                const response = await api.get('/center');
                const availableCenters = response.data;

                setCenters(availableCenters);
                if (availableCenters.length > 0) {
                    setSelectedCenter(availableCenters[0].id);
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

                if (user.roles.includes('Teacher')) {
                    response = await api.get('/schedule/my');
                }

                else if (user.roles.includes('Parent')) {
                    response = await api.get('/schedule/children');
                }

                else if (user.roles.includes('SuperAdmin') || user.roles.includes('CenterAdmin')) {

                    if (!selectedCenter) {
                        return;
                    }

                    response = await api.get('/schedule', {
                        params: { centerId: selectedCenter }
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
    }, [user, selectedCenter]);

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

    const getEventForSlot = (dayDate, hour) => {
        return schedules.find(sch => {
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

    const isAdmin = user?.roles?.includes('SuperAdmin') || user?.roles?.includes('CenterAdmin');
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
                    <button className="apply-btn">
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
                        <button className="edit-schedule-btn">Редагувати розклад</button>
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
                                        const event = getEventForSlot(day, hour);
                                        return (
                                            <td key={index} className="event-cell">
                                                {event && (
                                                    <div className="event-pill">
                                                        {event.subjectName}
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

        </div>
    );
};

export default SchedulePage;