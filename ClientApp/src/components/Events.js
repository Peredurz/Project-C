import React, { useEffect, useState } from "react";
import './Styling/Events.css';
import InfoButton from "./InfoButton";
import { getCookie, getEmployeeId } from "../GetData"

let UserEvent = [];
const currentDate = new Date();
currentDate.setHours(0, 0, 0, 0)
const saveState = (buttonStates) => {
  localStorage.setItem('buttonStates', JSON.stringify(buttonStates));
}
const getState = async (data) => {
  const Email = await getCookie('user');
  const ID = await getEmployeeId(Email);
  const initialState = {};

  for (const event of data) {
    const response = await fetch(`events/attending?eventId=${event.id}&userId=${ID}`);
    const Att = await response.json(); // Assuming the response is in JSON format
    initialState[event.id] = !Att;
  }

  console.log(initialState);
  return initialState;
};

const Events = ({ onSetState, buttonGet }) => {
  const [buttonStates, setButtonStates] = useState({});
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetch('/events/allpublicevents', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => response.json())
      .then(async (data) => {
        setEvents(data);
        const storedButtonStates = await getState(data) || {};
        // Initialize button states based on the events or use the stored states
        const initialButtonStates = {};
        data.forEach((event) => {
          initialButtonStates[event.id] = storedButtonStates[event.id]; // Adjust the initial state as needed
        });
        setButtonStates(initialButtonStates);


      })
      .catch((error) => console.error("Error:", error));

  }, [buttonGet]);

  const handleClick = async (event, id) => {
    event.preventDefault();
    const email = await getCookie('user');
    const employeeId = await getEmployeeId(email);
    let check = true;
    console.log("State")
    console.log(buttonStates)
    const response = await fetch('/empevents/attendevent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        EmployeeId: employeeId,
        EventId: id,
      }),
    });

    if (response.ok) {
      const responseData = await response.json();
      console.log("Response data " + responseData);
    } else {
      const errorData = await response.json();
      console.error('Failed to attend event:', errorData.errorMessage);
      check = false;
      alert(`${errorData.errorMessage}`);
    }

    if (check) {
      onSetState((prevStates) => {
        return {
          ...prevStates,
          [id]: !prevStates[id],
        };
      });
      setButtonStates((prevStates) => {
        const updatedStates = {
          ...prevStates,
          [id]: !prevStates[id],
        };
        saveState(updatedStates);
        console.log(updatedStates); // Log the updated states
        return updatedStates;
      });
    }
    await OutsideFetchData();
  };



  return (
    <div className="event-hidden">
      {events.filter(event => new Date(event.date) >= currentDate).map((event, index) => (
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
          <button
            id={event.id}
            className={buttonStates[event.id] ? "buttonTrueEvents" : "buttonDisabledEvents"}
            onClick={(e) => handleClick(e, event.id)}>
            {buttonStates[event.id] ? "Join" : "Joined"}
          </button>
          <div className='info-button'>
            <InfoButton event={event} eventId={1} id={event.id} />
          </div>
        </div>
      ))}
    </div>
  );
};


const AttendingEvents = ({ sharedState, buttonSet }) => {
  const [userEvents, setUserEvents] = useState([]);
  const setUserUserEvent = (data) => {
    UserEvent = data;
  }
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Assuming getEmployeeId is an asynchronous function
        const email = await getCookie('user');
        const employeeId = await getEmployeeId(email);

        // Now that id is set, make the fetch request
        const response = await fetch(`/events/alluserevents?employeeId=${employeeId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
          const responseData = await response.json();
          setUserEvents(responseData);
          UserEvent = responseData;
          // Initialize button states based on the events
          const initialButtonStates = {};
          responseData.forEach(event => {
            initialButtonStates[event.id] = true; // Adjust the initial state as needed
          });
          buttonSet(initialButtonStates);
        } else {
          console.error('Failed to fetch events. HTTP error:', response.status);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [sharedState]);



  async function fetchData() {
    try {
      // Assuming getEmployeeId is an asynchronous function
      const email = await getCookie('user');
      const employeeId = await getEmployeeId(email);
      // Now that id is set, make the fetch request
      const response = await fetch(`/events/alluserevents?employeeId=${employeeId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const responseData = await response.json();
        setUserUserEvent(responseData);

        // Initialize button states based on the events
        const initialButtonStates = {};
        responseData.forEach(event => {
          initialButtonStates[event.id] = true; // Adjust the initial state as needed
        });
        buttonSet(initialButtonStates);
        console.log(initialButtonStates)
      } else {
        console.error('Failed to fetch events. HTTP error:', response.status);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const handleClick = async (event, id) => {
    try {
      event.preventDefault();
      const email = await getCookie('user');
      const employeeId = await getEmployeeId(email);
      
      const response = await fetch('/empevents/revents', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          EmployeeId: employeeId,
          EventId: id,
        }),
      });
      await fetchData();
      await getState()
      await SetButtonData(id)
      if (response.ok) {
        const responseData = await response.json();
        console.log(responseData);
      } else {
        console.error(`Error: ${response.statusText}`);
      }
    } catch (error ) {
      console.log()
      console.error('An error occurred:', error);
    }
  };

  return (
    <div className="event-hidden">
      {UserEvent.filter(event => new Date(event.date) >= currentDate).map((event, index) => (
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
          <button style={{ marginTop: '40%' }}
            id={event.id}
            className={"buttonFalseEvents"}
            onClick={(e) => handleClick(e, event.id)}>
            {"Leave"}
          </button>

          <div className='info-button'>
            <InfoButton event={event} eventId={1} id={event.id} />
          </div>
        </div>
      ))}
    </div>
  );
};
async function SetButtonData(evId) {
  const Buttons = getState();
  Buttons[evId] = !Buttons[evId]
  saveState(Buttons);
}

function formatTime(timeString) {
  const [hours, minutes] = timeString.split(':');
  return `${hours}:${minutes}`;
}
async function OutsideFetchData() {

  try {
    // Assuming getEmployeeId is an asynchronous function
    const email = await getCookie('user');
    const employeeId = await getEmployeeId(email);
    // Now that id is set, make the fetch request
    const response = await fetch(`/events/alluserevents?employeeId=${employeeId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      const responseData = await response.json();
      UserEvent = (responseData);
    } else {
      console.error('Failed to fetch events. HTTP error:', response.status);
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

export { AttendingEvents, Events };