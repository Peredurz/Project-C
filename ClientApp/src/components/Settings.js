import React, { Component } from 'react';
import "./Styling/settings.css"
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ManageEvents from './ManageEvents';
import { addPFP } from './Home.js';
import { getCookie, getEmployeeId, GetUserInbetween } from "../GetData";
import ManageUsers from "./ManageUsers";
import ManageRooms from './ManageRooms.js';

export class Settings extends Component {
    static displayName = Settings.name;

    constructor(props) {
        super(props);
        this.state = {
            addEventVisible: false,
            addUserVisible: false,
            manageEventsVisible: false,
            manageUsersVisible: false,
            manageRequestsVisible: false,
            manageReviewsVisible: false,
            editProfileVisible: false,
            managaRoomsVisible: false,
            message: '',
            messageColor: 'red',
            roomMessage: '',
            roomMessageColor: 'red',
            name: '',
            location: '',
            date: '',
            startTime: '',
            endTime: '',
            description: '',
            eventAdded: false,
            roomAdded: false,
            userAdded: false,
            isAdmin: null,
            events: []
        };
        this.handleClick = this.handleClick.bind(this);
        this.handleAddEventSubmit = this.handleAddEventSubmit.bind(this);
        this.handleEventAdded = this.handleEventAdded.bind(this);
        this.handleRoomAdded = this.handleRoomAdded.bind(this);
        this.handleAddRoomSubmit = this.handleAddRoomSubmit.bind(this);
    }

    async componentDidMount() {
        // Check if the user is an admin
        this.isAdmin();
        await GetUserInbetween()
    }



    async isAdmin() {
        const email = await getCookie('user');
        const response = await fetch('/api/isadmin?email='
            + email, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }

        });
        const data = await response.json();
        this.setState({
            isAdmin: data.isAdmin
        });
    }

    handleEventAdded() {
        this.setState({ eventAdded: !this.state.eventAdded });
    }

    handleRoomAdded = () => {
        this.setState({ roomAdded: !this.state.roomAdded });
    }

    handleUserAdded() {
        this.setState({ userAdded: !this.state.userAdded });
    }

    handleEventChange = (updatedEvents) => {
        this.setState({ events: updatedEvents });
    };

    handleAddEventSubmit = (event) => {
        event.preventDefault();
        let { name, location, date, startTime, endTime, description } = this.state;
        // Validate the form field values
        if (name, !location || !date || !startTime || !endTime || !description) {
            // Show an error message if any field is empty
            this.setState({
                message: "Please fill in all fields!",
                messageColor: 'red'
            });
            return;
        } else if (name.length > 50 || location.length > 50 || description.length > 50) {
            // Show an error message if the location or description is longer than 50 characters
            this.setState({
                message: "Location and description must be no more than 50 characters!",
                messageColor: 'red'
            });
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
                    this.setState({
                        message: "Event added successfully!",
                        messageColor: 'green',
                        name: '',
                        location: '',
                        date: '',
                        startTime: '',
                        endTime: '',
                        description: ''
                    });
                    this.handleEventAdded();
                })
                .catch(error => {
                    console.error('Error:', error);
                    this.setState({
                        message: "Failed to add event. Please try again.",
                        messageColor: 'red'
                    });
                });
        }
    }

    handleInputChange = (event) => {

        const { name, value } = event.target;
        this.setState({
            [name]: value,
            message: ''
        });
    }

    handleClick = (section) => {
        this.setState(prevState => ({
            [section]: !prevState[section]
        }));
    }

    handleAddRoomSubmit = (event) => {
        event.preventDefault();
        let { roomName, roomNumber } = event.target;
        if (!roomName.value || !roomNumber.value) {
            // Show an error message if any field is empty
            this.setState({
                roomMessage: "Please fill in all fields!",
                roomMessageColor: 'red'
            });
            return;
        } else if (roomName.value.length > 50 || roomNumber.value.length > 50) {
            // Show an error message if the location or description is longer than 50 characters
            this.setState({
                roomMessage: "Room name and room number must be no more than 50 characters!",
                roomMessageColor: 'red'
            });
        } else {
            fetch('/api/addroom', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    "RoomName": roomName.value,
                    "RoomNumber": roomNumber.value
                })
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Bad request');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log(data.success)
                    if (data.success === false) {
                        this.setState({
                            roomMessage: data.message,
                            roomMessageColor: 'red',
                            roomName: '',
                            roomNumber: ''
                        });
                    }
                    else {
                        this.setState({
                            roomMessage: data.message, // Update the message from the response body
                            roomMessageColor: 'green',
                            roomName: '',
                            roomNumber: ''
                        });
                        this.handleRoomAdded();
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    this.setState({
                        roomMessage: "Failed to add room. Please try again.",
                        roomMessageColor: 'red'
                    });
                });
        }
    }

    handleNameChange = async (event) => {
        event.preventDefault();
        let name = document.getElementById("name").value;
        let firstname = "";
        let lastname = "";
        const email = await getCookie("user");
        const UserId = await getEmployeeId(email);
        if (name === "") {
            this.setState({
                roomMessage: "Please fill in all fields!",
                roomMessageColor: 'red'
            });
            return;
        }
        if (name.includes(" ") && name.split(" ").length >= 2) {
            name = name.split(" ");
            firstname = name[0];
            lastname = name.join(" ").replace(firstname, "").trim();
        }
        else {
            firstname = name;
            lastname = "";
        }
        fetch(`/api/edituser/${UserId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                FirstName: firstname,
                LastName: lastname,
                Email: email
            })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Bad request');
                }
                return response.json();
            })
            .then(data => {
                if (data.success === false) {
                    document.getElementById("name").value = "Something went wrong. Please try again.";
                }
                else {
                    document.getElementById("name").value = "Successfully updated!";
                    this.handleUserAdded();
                }
            })
            .catch(error => {
                console.error('Error:', error);
                document.getElementById("name").value = "Something went wrong. Please try again.";
            });
    }

    render() {
        if (this.state.isAdmin === true) {
            return (
                <div className="main-div">
                    <div className="text">
                        <h1>Settings</h1>
                        <hr className="hr-main"></hr>
                    </div>
                    <div className="main-div">
                        <div className="inner-div">
                            <h5 className="section-title">Edit User Profile</h5>
                            <div className="hidden-div-up" style={{
                                display: this.state.editProfileVisible ? 'block' : 'none',
                                borderBottom: 'none',
                                paddingTop: "10px",
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                            }}>
                                <div className="user-pfp">
                                    <div style={{ position: 'absolute', top: '-25px', left: '10%', right: '10%' }}>
                                        <p style={{ margin: '0' }}>Upload pfp</p>
                                        <label htmlFor="pfp" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px', cursor: 'pointer' }}>
                                            <span style={{ marginBottom: '5px' }}>Click to Upload Photo</span>
                                            <input
                                                type="file"
                                                id="pfp"
                                                name="pfp"
                                                accept="image/*"
                                                onChange={(e) => addPFP(e.target.files[0])}
                                                style={{ display: 'none' }}
                                            />
                                        </label>
                                    </div>
                                    <div className="pfp-box">
                                        <img alt='Profile Picture' id='selectedPfp' className="pfp" style={{ width: '30%', borderRadius: '50%', paddingTop: '0', paddingBottom: '0' }} />
                                    </div>
                                    <p style={{ margin: '0' }} id='werks'></p>
                                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                                        <button type='submit' className="submit" style={{ width: '110px', height: '40px', background: '#fff' }} onClick={(e) => this.handleClick(e, "PfpButton")}>Save</button>
                                    </div>
                                </div>
                                <div className="user-name">
                                    <p style={{ position: 'absolute', top: '-10px', left: '15%', marginTop: '4%' }}>Change display name</p>
                                    {this.state.userMessage && <p className='event-message' style={{ color: this.state.userMessagecolor }}>{this.state.userMessage}</p>}
                                    <input type='name' id="name" name="name" placeholder='Type your name here'
                                        onChange={this.handleInputChange}
                                        style={{
                                            height: '50px',
                                            border: '3px solid purple',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            marginTop: '20px',
                                        }} />
                                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                                        <button type='submit' className="submit" style={{ width: '110px', height: '40px', background: '#fff' }} onClick={(e) => this.handleNameChange(e)}>Save</button>
                                    </div>
                                </div>
                            </div>
                            <div className="arrow-button-container" style={{ position: 'relative' }}>
                                <button className="arrow-button" onClick={() => this.handleClick('editProfileVisible')}>
                                    <i className={`arrow ${this.state.editProfileVisible ? 'up' : 'down'}`}></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="inner-div">
                        <h5>Manage Users</h5>
                        <div style={{ display: this.state.manageUsersVisible ? 'block' : 'none' }}>
                            <ManageUsers onEventAdded={this.handleEventAdded} eventAdded={this.state.eventAdded} />
                        </div>
                        <div style={{ position: 'relative' }}>
                            <button className="arrow-button" onClick={() => this.handleClick('manageUsersVisible')}>
                                <i className={`arrow ${this.state.manageUsersVisible ? 'up' : 'down'}`}></i>
                            </button>
                        </div>
                    </div>
                    <div className="inner-div">
                        <h5>Manage Rooms</h5>
                        <div style={{ display: this.state.managaRoomsVisible ? 'block' : 'none' }}>
                            <div id="AddRoom" className='inner-div'>
                                <h5>Add Room</h5>
                                {this.state.roomMessage && <p className='event-message' style={{ color: this.state.roomMessageColor }}>{this.state.roomMessage}</p>}
                                <form onSubmit={this.handleAddRoomSubmit}>
                                    <input type="text" className='input-field location-input' name="roomName" placeholder='Room Name' />
                                    <input type='text' className='input-field location-input' name="roomNumber" placeholder='Room Number' />
                                    <button className="add-event-button" type="submit">Add Room</button>
                                </form>
                            </div>
                            <div id="ManageRooms" className='inner-div'>
                                <h5>Edit Room</h5>
                                <ManageRooms onRoomAdded={this.handleRoomAdded} roomAdded={this.state.roomAdded} />
                            </div>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <button className="arrow-button" onClick={() => this.handleClick('managaRoomsVisible')}>
                                <i className={`arrow ${this.state.managaRoomsVisible ? 'up' : 'down'}`}></i>
                            </button>
                        </div>
                    </div>
                    <div className="inner-div">
                        <h5>Manage Events</h5>
                        <div style={{ display: this.state.manageEventsVisible ? 'block' : 'none' }}>
                            <div id="AddEvent" className='inner-div'>
                                <h5>Add Event</h5>
                                {this.state.message && <p className="event-message" style={{ color: this.state.messageColor }}>{this.state.message}</p>}
                                <form onSubmit={this.handleAddEventSubmit}>
                                    <input type="text" className="input-field" name="name"
                                        value={this.state.name} placeholder='Name' onChange={this.handleInputChange} />
                                    <input type="text" className="input-field location-input" name="location"
                                        value={this.state.location} onChange={this.handleInputChange}
                                        placeholder="Location" />
                                    <ReactDatePicker
                                        style={{ zIndex: '-1' }}
                                        selected={this.state.date}
                                        onChange={date => this.setState({ date, message: '' })}
                                        filterDate={date => {
                                            const day = date.getDay();
                                            return day !== 0 && day !== 6; // Disallowing Saturday and Sunday
                                        }}
                                        className="input-field"
                                        placeholderText="Date" />
                                    <div className='date-fields'>
                                        <input type="time" className="date-fields" name="startTime" value={this.state.startTime}
                                            onChange={this.handleInputChange} placeholder="Start Time" />
                                        <input type="time" className="date-fields" name="endTime" value={this.state.endTime}
                                            onChange={this.handleInputChange} placeholder="End Time" />
                                    </div>
                                    <textarea className="textarea-field" name="description" value={this.state.description}
                                        onChange={this.handleInputChange} placeholder="Description"></textarea>
                                    <button className="add-event-button" type="submit">Add Event</button>
                                </form>
                            </div>
                            <div id="ManageEvents" className='inner-div'>
                                <ManageEvents onEventAdded={this.handleEventAdded} eventAdded={this.state.eventAdded} onEventChange={this.handleEventChange} showRequestsOnly={false} />
                            </div>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <button className="arrow-button" onClick={() => this.handleClick('manageEventsVisible')}>
                                <i className={`arrow ${this.state.manageEventsVisible ? 'up' : 'down'}`}></i>
                            </button>
                        </div>
                    </div>
                    <div className="inner-div">
                        <h5>Manage Event Requests</h5>
                        <div style={{ display: this.state.manageRequestsVisible ? 'block' : 'none' }}>
                            <ManageEvents onEventAdded={this.handleEventAdded} eventAdded={this.state.eventAdded} onEventChange={this.handleEventChange} showRequestsOnly={true} />
                        </div>
                        <div style={{ position: 'relative' }}>
                            <button className="arrow-button" onClick={() => this.handleClick('manageRequestsVisible')}>
                                <i className={`arrow ${this.state.manageRequestsVisible ? 'up' : 'down'}`}></i>
                            </button>
                        </div>
                    </div>
                    {/* <div className="inner-div">
                        <h5>Manage Reviews</h5>
                        <div style={{ display: this.state.manageReviewsVisible ? 'block' : 'none' }}>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <button className="arrow-button" onClick={() => this.handleClick('manageReviewsVisible')}>
                                <i className={`arrow ${this.state.manageReviewsVisible ? 'up' : 'down'}`}></i>
                            </button>
                        </div>
                    </div> */}
                </div>
            );
        } else {
            return (
                <div className="main-div">
                    <div className="text">
                        <h1>Settings</h1>
                        <hr className="hr-main"></hr>
                    </div>
                    <div className="inner-div">
                        <h5 className="section-title">Edit User Profile</h5>
                        <div className="hidden-div-up" style={{
                            display: this.state.editProfileVisible ? 'block' : 'none',
                            borderBottom: 'none',
                            paddingTop: "10px",
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                        }}>
                            <div className="user-pfp">
                                <div style={{ position: 'absolute', top: '-25px', left: '10%', right: '10%' }}>
                                    <p style={{ margin: '0' }}>Upload pfp</p>
                                    <label htmlFor="pfp" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px', cursor: 'pointer' }}>
                                        <span style={{ marginBottom: '5px' }}>Click to Upload Photo</span>
                                        <input
                                            type="file"
                                            id="pfp"
                                            name="pfp"
                                            accept="image/*"
                                            onChange={(e) => addPFP(e.target.files[0])}
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                </div>
                                <div className="pfp-box">
                                    <img alt='Profile Picture' id='selectedPfp' className="pfp" style={{ width: '30%', borderRadius: '50%', paddingTop: '0', paddingBottom: '0' }} />
                                </div>
                                <p style={{ margin: '0' }} id='werks'></p>
                                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                                    <button type='submit' className="submit" style={{ width: '110px', height: '40px', background: '#fff' }} onClick={(e) => this.handleClick(e, "PfpButton")}>Save</button>
                                </div>
                            </div>
                            <div className="user-name">
                                <p style={{ position: 'absolute', top: '-10px', left: '15%', marginTop: '4%' }}>"Change display name"</p>
                                <input type='name' id="name" name="name" placeholder='Type your name here'
                                    onChange={this.handleInputChange}
                                    style={{
                                        height: '50px',
                                        border: '3px solid purple',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        marginTop: '20px',
                                    }} />
                                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                                    <button type='submit' className="submit" style={{ width: '110px', height: '40px', background: '#fff' }} onClick={(e) => this.handleNameChange(e)}>Save</button>
                                </div>
                            </div>
                        </div>
                        <div className="arrow-button-container" style={{ position: 'relative' }}>
                            <button className="arrow-button" onClick={() => this.handleClick('editProfileVisible')}>
                                <i className={`arrow ${this.state.editProfileVisible ? 'up' : 'down'}`}></i>
                            </button>
                        </div>
                    </div>
                </div>
            );
        }
    }
}




