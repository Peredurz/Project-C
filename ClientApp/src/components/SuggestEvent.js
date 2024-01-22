import React, { useState } from 'react'

import "./Styling/SuggestEvent.css"
import ReactDatePicker from 'react-datepicker';


function SuggestEvent() {
    var date = null;
    const [formState, setFormState] = useState({
        name: '',
        location: '',
        date: '',
        startTime: '',
        endTime: '',
        description: ''
    });

    // Separate state for the message and messageColor
    const [messageState, setMessageState] = useState({
        message: '',
        messageColor: ''
    });

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormState(prevState => ({ ...prevState, [name]: value }));
        setMessageState({ message: '', messageColor: '' });
    };

    const handleDateChange = (date) => {
        setFormState(prevState => ({ ...prevState, date: date }));
        setMessageState({ message: '', messageColor: '' });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        let { name, location, date, startTime, endTime, description } = formState;

        // Validate the form field values
        if (!name || !location || !date || !startTime || !endTime || !description) {
            // Show an error message if any field is empty
            setMessageState({ message: "Please fill in all fields!", messageColor: 'red' });
            return;
        } else if (name.length > 50 || location.length > 50 || description.length > 50) {
            // Show an error message if the location or description is longer than 50 characters
            setMessageState({ message: "Name, location and description must be less than 50 characters!", messageColor: 'red' });
            return;
        } else {
            date = new Date(date).toISOString().split('T')[0];
            startTime = startTime + ":00";
            endTime = endTime + ":00";

            const dayOfWeek = new Date(date).getDay();
            console.log(dayOfWeek)
            if (dayOfWeek >= 0 && dayOfWeek <= 4) { // Monday to Friday
                // Add one day to the date
                const newDate = new Date(date);
                newDate.setDate(newDate.getDate() + 1);
                date = newDate.toISOString().split('T')[0];
                console.log(date);
            }

            // Submit the form
            fetch('/events/addevent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    "Name": name,
                    "Location": location,
                    "Date": date,
                    "StartTime": startTime,
                    "EndTime": endTime,
                    "Description": description,
                    "isPublic": false
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
                    setMessageState({ message: "Event suggested successfully!", messageColor: 'green' });
                    setFormState({ name: '', location: '', date: null, startTime: '', endTime: '', description: '' });
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        }
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <p className="event-message" style={{ color: messageState.messageColor }}>{messageState.message}</p>
                <input type="text" className="input-field" value={formState.name} name="name" onChange={handleInputChange} placeholder='Name' />
                <input type="text" className="input-field location-input" value={formState.location} name="location" onChange={handleInputChange}
                    placeholder="Location" />
                <ReactDatePicker
                    selected={formState.date}
                    onChange={handleDateChange}
                    filterDate={date => {
                        const day = date.getDay();
                        return day !== 0 && day !== 6; // Disallowing Saturday and Sunday
                    }}
                    className="input-field"
                    placeholderText="Date"
                />
                <div className='date-fields'>
                    <input type="time" className="date-fields" name="startTime" onChange={handleInputChange} value={formState.startTime}
                        placeholder="Start Time" />
                    <input type="time" className="date-fields" name="endTime" onChange={handleInputChange} value={formState.endTime}
                        placeholder="End Time" />
                </div>
                <textarea className="textarea-field" name="description" onChange={handleInputChange} value={formState.description}
                    placeholder="Description"></textarea>
                <button className="add-event-button" type="submit">Suggest Event</button>
            </form>
        </div>
    )
}

export default SuggestEvent
