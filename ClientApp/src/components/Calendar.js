import React, { useState, useEffect } from 'react';
import './Styling/Calendar.css';
import { getCookie } from '../GetData';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const Calendar = () => {
    const [events, setEvents] = useState([]); // State for the events
    const [groupedEvents, setGroupedEvents] = useState({}); // State for the events grouped by day of the week
    const [dates, setDates] = useState([]); // State for the dates of the current week
    const [changed, setChanged] = useState(false); // State for the dates of the next week
    const [nextWeek, setNextWeek] = useState(false); // State for the dates of the next week
    const [previousWeek, setPreviousWeek] = useState(false); // State for the dates of the next week
    const [availability, setAvailability] = useState([]); // State for the dates of the next week
    let daysToBeAdded = 0;

    function parseDate(dateString) {
        const [year, month, day] = dateString.split('-');
        return new Date(year, month - 1, day, 12); // Set the time to noon to avoid timezone issues
    }

    //let this button be the button that will show the next week

    useEffect(() => {
        getAvailability().then(availability => setAvailability(availability));
    }, [dates])

    useEffect(() => {
        fetch('/events/allpublicevents')
            .then(response => response.json())
            .then(data => {
                const now = new Date();
                const currentDayOfWeek = now.getDay();
                const daysToBeAdded = changed ? (nextWeek ? 7 : (previousWeek ? -7 : 0)) : 0;
                const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - currentDayOfWeek + 1 + daysToBeAdded);
                const endOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (6 - currentDayOfWeek) + daysToBeAdded);
                const eventsThisWeek = data.filter(event => {
                    const eventDate = parseDate(event.date);
                    return eventDate >= startOfWeek && eventDate <= endOfWeek;
                });
                setEvents(eventsThisWeek);
                const eventsByDay = eventsThisWeek.reduce((acc, event) => {
                    const eventDate = parseDate(event.date);
                    const dayOfWeek = daysOfWeek[eventDate.getDay() - 1];
                    if (!acc[dayOfWeek]) {
                        acc[dayOfWeek] = [];
                    }
                    acc[dayOfWeek].push(event);
                    return acc;
                }, {});
                setGroupedEvents(eventsByDay);
                if (daysToBeAdded === 0) {
                    const weekDates = daysOfWeek.map((_day, index) => new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + index));
                    setDates(weekDates);
                }
            });
    }, [changed]);

    function formatTime(timeString) {
        const [hours, minutes] = timeString.split(':');
        return `${hours}:${minutes}`;
    }

    function previousweek() {
        updateWeekDates(-7);
    }

    function nextweek() {
        updateWeekDates(7);
    }

    async function getAllEvents() {
        const response = await fetch('/events/allpublicevents');
        const data = await response.json();
        return data;
    }

    async function updateEvents(start, end) {
        const data = await getAllEvents();
        const eventsThisWeek = data.filter(event => {
            const eventDate = parseDate(event.date);
            return eventDate >= start && eventDate <= end;
        });
        setEvents(eventsThisWeek);
        const eventsByDay = eventsThisWeek.reduce((acc, event) => {
            const eventDate = parseDate(event.date);
            const dayOfWeek = daysOfWeek[eventDate.getDay() - 1];
            if (!acc[dayOfWeek]) {
                acc[dayOfWeek] = [];
            }
            acc[dayOfWeek].push(event);
            return acc;
        }, {});
        setGroupedEvents(eventsByDay);
    }

    async function updateWeekDates(offset) {
        setDates(dates.map(date => {
            const newDate = new Date(date);
            newDate.setDate(newDate.getDate() + offset);
            return newDate;
        }));
        setChanged(true);
        if (offset === 7) {
            setNextWeek(true);
        }
        if (offset === -7) {
            setPreviousWeek(true);
        }
        const startOfWeek = new Date(dates[0]);
        startOfWeek.setDate(startOfWeek.getDate() + offset);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        updateEvents(startOfWeek, endOfWeek);
    }

    async function updateEvents(start, end) {
        const startOfWeek = start;
        const endOfWeek = end;

        // get all events from the database
        let data = await getAllEvents();
        const eventsThisWeek = data.filter(event => {
            const eventDate = parseDate(event.date);
            return eventDate >= startOfWeek && eventDate <= endOfWeek;
        });

        setEvents(eventsThisWeek);

        // Group the events by day of the week
        const eventsByDay = eventsThisWeek.reduce((acc, event) => {
            const eventDate = parseDate(event.date);
            const dayOfWeek = daysOfWeek[eventDate.getDay() - 1]; // Subtract 1 because our week starts on Monday
            if (!acc[dayOfWeek]) {
                acc[dayOfWeek] = [];
            }
            acc[dayOfWeek].push(event);
            return acc;
        }, {});

        setGroupedEvents(eventsByDay);
    }

    // make a function that gets availability for the next week from the database
    async function getAvailability() {
        var availability = [];
        let email = await getCookie("user");
        for (const date of dates) {
            const response = await fetch(`/api/inoffice?Email=${email}&Day=${date.toJSON()}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            })
            const data = await response.json();
            availability.push(data.message);
        }
        return availability;
    }
    async function joinDay(date) {
        let day = new Date(date);
        let user = await getCookie("user");
        const response = await fetch('/api/join', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ "Email": user, "Day": day.toJSON() })
        });
        getAvailability().then(availability => setAvailability(availability));
    }

    return (
        <div className="calendar-div">
            <div className="text">
                <h1>Calendar</h1>
                <hr className="hr-main"></hr>
            </div>
            <button className="previous-week-button" onClick={previousweek}>Previous week</button>
            <button className="next-week-button" onClick={nextweek}>Next week</button>
            <div className="week-container">
                {daysOfWeek.map((day, index) => (
                    <div key={day} className="day-container">
                        <h3>{day}</h3>
                        <h5>{dates[index] && dates[index].toLocaleDateString()}</h5>
                        {availability.length != 0 ? (
                            <button
                                id={availability[index]}
                                className={availability[index] ? "join-day-button-joined" : "join-day-button"}
                                onClick={() => joinDay(dates[index])}>
                                {availability[index] ? "Joined" : "Join day"}
                            </button>
                        ) : (
                            <button id="joinday" className="join-day-button" disabled>
                                Pending...
                            </button>
                        )}
                        {groupedEvents[day] && groupedEvents[day].map((event, index) => (
                            <div key={index} className="calendar-event">
                                <h3>{event.name}</h3>
                                <h4>{event.location}</h4>
                                <h4>
                                    {formatTime(event.startTime)} - {formatTime(event.endTime)}
                                </h4>
                                <p>{event.description}</p>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};