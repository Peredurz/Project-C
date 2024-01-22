import React, { useState, useEffect } from "react";
import './Styling/Events.css';
import BaseModal from './BaseModal';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getCookie, getEmployeeId } from "../GetData";
import App from "../App";

const ManageUsers = (props) => {
    const [Users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [userEdited, setUserEdited] = useState(false);
    useEffect(() => {
        fetch('/api/allemps', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        })
            .then((response) => response.json())
            .then((data) => {
                setUsers(data);
            })

            .catch((error) => console.error("Error:", error));

    }, [props.eventAdded, userEdited]);

    const handleClick = async (event, id) => {
        event.preventDefault();
        
        const Email = await getCookie('user')
        const UserId = await getEmployeeId(Email)

        const response = await fetch(`/api/removeuser/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (response.ok) {
            // Remove the event from the local state
            setUsers(Users => Users.filter(User => User.id !== id));
            setUserEdited(Users)
        } else {
            console.error(response);
        }
        if (id === UserId) {
            window.location.pathname = "/login";
        }
    };
    const [UserFirstName, setUserFirstName] = useState('')
    const [UserLastName, setUserLastName] = useState('');
    const [UserEmail, setUserEmail] = useState('');
    const handleEditClick = (id) => {
        // Find the event that was selected for editing
        const userToEdit = Users.find(User => User.id === id);
        // Set the state variables with the existing user data
        setUserFirstName(userToEdit.FirstName);
        setUserLastName(userToEdit.LastName);
        setUserEmail(userToEdit.Email);
    };

    const handleEditSubmit = async (event, id) => {
        event.preventDefault();
        
        // Format the date input
        // let adjustedDate = new Date(Email);
        // adjustedDate.setDate(adjustedDate.getDate() - 1);
        // let formattedDate = `${adjustedDate.getFullYear()}-${String(adjustedDate.getMonth() + 1).padStart(2, '0')}-${String(adjustedDate.getDate()).padStart(2, '0')}`;
        //
        // // Format the time inputs
        // let formattedStartTime = startTime + ":00";
        // let formattedEndTime = endTime + ":00";
        //
        // const dayOfWeek = new Date(formattedDate).getDay();
        // console.log(dayOfWeek)
        // if (dayOfWeek >= 0 && dayOfWeek <= 4) { // Monday to Friday
        //     // Add one day to the date
        //     const newDate = new Date(formattedDate);
        //     newDate.setDate(newDate.getDate() + 1);
        //     formattedDate = newDate.toISOString().split('T')[0];
        //     console.log(formattedDate);
        // }


        // Validate the form field values
        if (UserFirstName === '' || UserEmail === '' || UserLastName === '') {
            // Show an error message if any field is empty
            console.log("Please fill in all fields!");
            //say what field is empty
            switch (true) {
                case UserFirstName === '':
                    console.error("First Name is empty");
                    break;
                case UserLastName === '':
                    console.error("Last Name is empty");
                    break;
                case UserEmail === '':
                    console.error("Email is empty");
                    break;

                default:
                    console.error("Something went wrong ")
            }
        } else {
            // Submit the form

            let FirstName = UserFirstName;
            let LastName = UserLastName;
            let Email = UserEmail;

            if (UserFirstName == null || UserFirstName == undefined) {
                FirstName = editingUser.firstName;
            }
            if (UserLastName == null || UserLastName == undefined) {
                LastName = editingUser.lastName;
            }
            if (UserEmail == null || UserEmail == undefined) {
                Email = editingUser.email;
            }

            if (FirstName.length > 50 || LastName.length > 50 || Email.length > 50) {
                alert("Character limit of 50 exceeded")
                return;
            }

            fetch(`/api/edituser/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    FirstName: FirstName,
                    LastName: LastName,
                    Email: Email.toLowerCase(),
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
                    setUserFirstName(FirstName);
                    setUserLastName(LastName);
                    setUserEmail(Email);
                    closeModal();
                    setUserEdited(prev => !prev);
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
            {Users.filter(User => (User)).map((User, index) => (

                <div className="event" key={index}>
                    <span>
                        <h3>
                            {"Name: " + User.firstName + " " + User.lastName}
                        </h3>
                        <h5>
                            {"Email: " + User.email}
                        </h5>
                        <h6>
                            {"ID: " + User.id}
                        </h6>
                        <h6>
                            {"How often has this user attended an event: "}
                            <br />
                            {User.amountOfTimesAttended + " times"}
                        </h6>
                    </span>
                    <div className="button-container">
                        <button className="editButton" style={{ marginTop: '40px' }} onClick={() => { handleEditClick(User.id); setEditingUser(User); openModal(); }}>Edit</button>
                        <button
                            id={User.id}
                            className="deleteButton"
                            style={{ marginTop: '5%' }}
                            onClick={(e) => handleClick(e, User.id)}
                        >Remove</button>
                    </div>
                </div>
            ))}
            <BaseModal isOpen={isModalOpen} onClose={() => { closeModal(); setEditingUser(null); }}>
                {editingUser && (
                    <form className="editModal" onSubmit={(e) => handleEditSubmit(e, editingUser.id)}>
                        <label>
                            First Name:
                            <input
                                type="text"
                                className="input-field location-input"
                                value={UserFirstName !== null && UserFirstName !== undefined ? UserFirstName : editingUser.firstName}
                                onChange={user => setUserFirstName(user.target.value)}
                            />
                        </label>
                        <label>
                            Last Name:
                            <input
                                type="text"
                                className="input-field location-input"
                                value={UserLastName !== null && UserLastName !== undefined ? UserLastName : editingUser.lastName}
                                onChange={user => setUserLastName(user.target.value)}
                            />
                        </label>
                        <label>
                            Email:
                            <input
                                type="text"
                                className="input-field"
                                name="Email"
                                value={UserEmail !== null && UserEmail !== undefined ? UserEmail : editingUser.email}
                                onChange={user => setUserEmail(user.target.value)}
                            />
                        </label>
                        <button type="submit">Update Employee</button>
                    </form>
                )}
            </BaseModal>
        </div>
    );
};

export default ManageUsers;

