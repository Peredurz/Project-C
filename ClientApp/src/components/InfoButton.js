
import React, { useEffect, useState } from 'react';
import BaseModal from './BaseModal.js';
import "./Styling/InfoButton.css";





// we will use this button to create a modal dialog that shows the specifications of a specific event, this blocks the user from interacting. (alternativly we can make it non-modal, allowing the user to interact while the pop-up is active) 
// this information will passed as follows:  ReviewableEventList -> ReviewableEvent -> InfoButton. (while testing.)
// we will implement an exit button or doubleClick function to remove the "pop up".

function InfoButton({ event, eventId, id }) {
    const [UserJoined,setUserJoined] = useState([]);
    const [isInfoOpen, setInfoState] = useState(false);
    const [attendingPeople, setAttendingPeople] = useState(0);
    const getAttending = async () => {
        try {
            const response = await fetch(`/events/attendance?eventId=${id}`);
            const attendingData = await response.json();
            setAttendingPeople(attendingData);
        } catch (error) {
            console.error('Error fetching attending people data:', error);
        }
    };
    const openModal = async() => {
        setInfoState(true);
        getAttending();
        await PeopleOnSitePopulate()
    };
    const closeModal = async() => {
        setInfoState(false);
        await PeopleOnSitePopulate()
    };
    const PeopleOnSitePopulate = async() => {
        try {
            const response = await fetch('api/getempsonevent?id=' + id);
            const data = await response.json();
            setUserJoined(data.employees)
            UserJoined.toSorted(e=>e.firstName)
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }
    return (
        <div>
            <div>
                <button className="info-button" onClick={openModal}>
                    <h1 className='info-symbol'>&#x24D8;</h1>
                </button>
                <BaseModal hasCloseBtn={true} isOpen={isInfoOpen} onClose={closeModal}>
                    <div className='info-text'>
                        <h5 className='info-name'>{event.location}</h5>
                        <h5 className='info-datetime'>{`${event.date} - ${event.startTime}`}</h5>
                        <div className='info-discription'>
                            <p>{`${event.description}`}</p>
                            <p>{`Attending: ${attendingPeople}`}</p>
                        </div>
                        <div className='info-attending-people'>
                            <ul>
                                {UserJoined.map((user) => (
                                    <li key={user.id}> {user.firstName} {user.lastName}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </BaseModal>
            </div>
        </div>
    );
}


export default InfoButton;
