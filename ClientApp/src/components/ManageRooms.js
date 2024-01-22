import React, { useState, useEffect } from "react";
import './Styling/Events.css';
import BaseModal from './BaseModal';
import 'react-datepicker/dist/react-datepicker.css';
import './Styling/Rooms.css';

const ManageRooms = (props) => {
    const [rooms, setRooms] = useState([]);
    const [editingRoom, setEditingRoom] = useState(null);
    const [roomEdited, setRoomEdited] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const response = await fetch('/api/getavailablespaces', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await response.json();
            setRooms(data.rooms.reverse());
            setLoading(false);
        } catch (error) {
            console.error("Error:", error);
        }
    };

    useEffect(() => {
        fetchData();
        console.log(rooms);
    }, [props.roomAdded]);

    const handleDeleteClick = async (rnum) => {
        try {
            const response = await fetch('/api/deleteroom', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ RoomNumber: rnum }),
            });
            const data = await response.json();
            console.log(data);
            fetchData();
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const handleEditClick = (roomNumber) => {
        const roomToEdit = rooms.find((room) => room.roomNumber === roomNumber);
        setEditingRoom(roomToEdit);
    };

    const handleEditSubmit = (event, roomNumber) => {
        event.preventDefault();
        fetch('/api/updateroom', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ RoomNumber: roomNumber, RoomName: event.target.roomName.value }),
        }).then((response) => {
            if (response.status === 200) {
                setRoomEdited(true);
                fetchData();
                closeModal();
            } else {
                console.log(response);
            }
        }).catch((error) => {
            console.error("Error:", error);
        });
    };

    const [isModalOpen, setModalOpen] = useState(false);

    const openModal = () => {
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
    };

    const handleReleaseSpace = async (rnum) => {
        const response = await fetch('/api/releasespaceadmin', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ RoomNumber: rnum }),
        });
        const data = await response.json();
        fetchData();
    }
    return (
        <div className="room-container" style={{ overflowY: "auto", maxWidth: '100%'}}>
            {loading ? (
                <p>Loading...</p>
            ) : (
                Array.isArray(rooms) && rooms.length > 0 ? (
                    rooms.map((room, index) => (
                        <div className="event" key={index}>
                            <span>
                                <h5>Room name: {room.roomName}</h5>
                                <h6>Room number: {room.roomNumber}</h6>
                                <h6>Reserved by: {room.employee == null ? "None" : room.employee.firstName}</h6>
                            </span>
                            <div className="button-container">
                                <button className="deleteButton" onClick={() => handleReleaseSpace(room.roomNumber) }>Clear reservation</button>
                                <button className="editButton" onClick={() => { handleEditClick(room.roomNumber); openModal(); }}>Edit</button>
                                <button className="deleteButton" onClick={() => handleDeleteClick(room.roomNumber)}>Delete</button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No rooms available</p>
                )
            )}
            <BaseModal isOpen={isModalOpen} onClose={() => { closeModal(); setEditingRoom(null); }}>
                {editingRoom && (
                    <form className="editModal" onSubmit={(e) => handleEditSubmit(e, editingRoom.roomNumber)}>
                        <h2>Edit Room</h2>
                        <label htmlFor="roomName">Room Name:
                            <br />
                            <input type="text" name="roomName" defaultValue={editingRoom.roomName} />
                        </label>
                        <p></p>
                        <button type="submit">Update Room</button>
                    </form>
                )}
            </BaseModal>
        </div>
    );
};

export default ManageRooms;
