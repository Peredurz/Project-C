import React, { useState, useEffect } from "react";
import './Styling/Events.css';
import BaseModal from './BaseModal';
import ReactDatePicker from 'react-datepicker';
//import 'react-datepicker/dist/react-datepicker.css';
import './Styling/DatePicker.css';

const ManageEvents = (props) => {
    const [events, setEvents] = useState([]);
    const [editingEvent, setEditingEvent] = useState(null);
    const [eventEdited, setEventEdited] = useState(false);


    useEffect(() => {
        if (props.showRequestsOnly) {
            fetch('/events/allprivateevents', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            })
                .then((response) => response.json())
                .then((data) => {
                    setEvents(data);
                    props.onEventChange(data); // Pass the updated data to the parent component
                })
                .catch((error) => console.error("Error:", error));
        } else {
            fetch('/events/allpublicevents', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            })
                .then((response) => response.json())
                .then((data) => {
                    setEvents(data);
                })
                .catch((error) => console.error("Error:", error));
        }
    }, [props.eventAdded, eventEdited]);

    const handleClick = async (event, id) => {
        event.preventDefault();

        const response = await fetch(`/events/deleteevent/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            // Remove the event from the local state
            const updatedEvents = events.filter(event => event.id !== id);
            setEvents(prevEvents => prevEvents.filter(event => event.id !== id));
            if (props.onEventChange) {
                props.onEventChange(updatedEvents);
            }
        } else {
            console.error('Failed to remove event');
        }
    };

    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [date, setDate] = useState(new Date());
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [description, setDescription] = useState('');

    const handleEditClick = (id) => {
        // Find the event that was selected for editing
        const eventToEdit = events.find(event => event.id === id);

        // Set the state variables with the existing event data
        setName(eventToEdit.name);
        setLocation(eventToEdit.location);
        setDate(new Date(eventToEdit.date));
        setStartTime(formatTime(eventToEdit.startTime));
        setEndTime(formatTime(eventToEdit.endTime));
        setDescription(eventToEdit.description);
    };

    const approveEvent = async (id) => {
        const response = await fetch(`/events/approveevent/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            // Update the event in the local state
            setEvents(events => {
                const updatedEvents = events.map(event =>
                    event.id === id ? { ...event, isPublic: true } : event
                );
                if (props.onEventChange) {
                    props.onEventChange(updatedEvents);
                }
                return updatedEvents;
            });
        } else {
            console.error('Failed to approve event');
        }
    };

    const handleEditSubmit = (event, id) => {
        event.preventDefault();

        // Format the date input
        let adjustedDate = new Date(date);
        adjustedDate.setDate(adjustedDate.getDate() - 1);
        let formattedDate = `${adjustedDate.getFullYear()}-${String(adjustedDate.getMonth() + 1).padStart(2, '0')}-${String(adjustedDate.getDate()).padStart(2, '0')}`;

        // Format the time inputs
        let formattedStartTime = startTime + ":00";
        let formattedEndTime = endTime + ":00";

        const dayOfWeek = new Date(formattedDate).getDay();
        console.log(dayOfWeek)
        if (dayOfWeek >= 0 && dayOfWeek <= 4) { // Monday to Friday
            // Add one day to the date
            const newDate = new Date(formattedDate);
            newDate.setDate(newDate.getDate() + 1);
            formattedDate = newDate.toISOString().split('T')[0];
            console.log(formattedDate);
        }

        console.log(name);
        console.log(location);
        console.log(formattedDate);
        console.log(formattedStartTime);
        console.log(formattedEndTime);
        console.log(description);

        // Validate the form field values
        if (name === '' || location === '' || formattedDate === '' || formattedStartTime === '' || formattedEndTime === '' || description === '') {
            // Show an error message if any field is empty
            alert("Please fill in all fields!");
        } else if (name.length > 50 || location.length > 50 || description.length > 50) {
            alert("Name, location and description must be no more than 50 characters!");
        } else {


            // Submit the form
            fetch(`/events/editevent/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    "Name": name,
                    "Location": location,
                    "Date": formattedDate,
                    "StartTime": formattedStartTime,
                    "EndTime": formattedEndTime,
                    "Description": description,
                    "isPublic": true
                })
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Bad request');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Success:', data);
                    setName('');
                    setLocation('');
                    setDate('');
                    setStartTime('');
                    setEndTime('');
                    setDescription('');
                    closeModal();
                    setEventEdited(prev => !prev);

                    // Update the event in the local state
                    setEvents(prevEvents => prevEvents.map(event => event.id === id ? data : event));
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        }
    }

    function formatTime(timeString) {
        const [hours, minutes] = timeString.split(':');
        return `${hours}:${minutes}`;
    }

    const [isModalOpen, setModalOpen] = useState(false);

    const openModal = () => {
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
    };

    return (
        <div className="event-hidden">
            {events.filter(event => new Date(event.date)).map((event, index) => (
                <div className="event" key={index}>
                    <span>
                        <h3>{event.name}</h3>
                        <h5>{event.location}</h5>
                        <h6>{event.date}</h6>
                        <h6>
                            {formatTime(event.startTime)} - {formatTime(event.endTime)}
                        </h6>
                        <p>{event.description}</p>
                    </span>
                    {event.isPublic == false && <button className="approveButton" onClick={() => { approveEvent(event.id) }}>Approve</button>}
                    <div className="button-container">
                        <button className="editButton" style={{ marginTop: event.isPublic ? '50px' : '5%' }} onClick={() => { handleEditClick(event.id); setEditingEvent(event); openModal(); }}>Edit</button>
                        <button
                            id={event.id}
                            className="deleteButton"
                            onClick={(e) => handleClick(e, event.id)}
                        >
                            Remove
                        </button>
                    </div>
                </div>
            ))}
            <BaseModal isOpen={isModalOpen} onClose={() => { closeModal(); setEditingEvent(null); }}>
                {editingEvent && (
                    <form className="editModal" onSubmit={(e) => handleEditSubmit(e, editingEvent.id)}>
                        <label>
                            Name:
                            <input
                                type="text"
                                className="input-field"
                                value={name !== null && name !== undefined ? name : editingEvent.name}
                                onChange={event => setName(event.target.value)}
                            />
                        </label>
                        <label>
                            Location:
                            <input
                                type="text"
                                className="input-field location-input"
                                value={location !== null && location !== undefined ? location : editingEvent.location}
                                onChange={event => setLocation(event.target.value)}
                            />
                        </label>
                        <label>
                            Date:
                            <ReactDatePicker
                                selected={date || new Date(editingEvent.date)}
                                onChange={date => setDate(date)}
                                filterDate={date => {
                                    const day = date.getDay();
                                    return day !== 0 && day !== 6; // Disallowing Saturday and Sunday
                                }}
                                placeholderText="Date"
                                className="input-field"
                            />
                        </label>
                        <label>
                            Start Time:
                            <input
                                type="time"
                                name="startTime"
                                className="input-field"
                                value={startTime !== null && startTime !== undefined ? startTime : editingEvent.startTime}
                                onChange={event => setStartTime(event.target.value)}
                            />
                        </label>
                        <label>
                            End Time:
                            <input
                                type="time"
                                className="input-field"
                                name="endTime"
                                value={endTime !== null && endTime !== undefined ? endTime : editingEvent.endTime}
                                onChange={event => setEndTime(event.target.value)}
                            />
                        </label>
                        <label>
                            Description:
                            <textarea
                                className="textarea-field"
                                name="description"
                                value={description !== null && description !== undefined ? description : editingEvent.description}
                                onChange={event => setDescription(event.target.value)}
                            />
                        </label>
                        <button type="submit">Update Event</button>
                    </form>
                )}
            </BaseModal>
        </div>
    );

};

export default ManageEvents;
