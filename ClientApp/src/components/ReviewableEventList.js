import React, { useState, useEffect } from 'react';
import ReviewableEvent from './ReviewableEvent'
import "./Styling/ReviewableEventList.css"
import { getCookie, getEmployeeId } from '../GetData';

function ReviewableEventList() {
  const [userEvents, setUserEvents] = useState([]);
  const [UserEvent, setUserEvent] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const email = await getCookie('user');
        const employeeId = await getEmployeeId(email);

        const response = await fetch(`/events/alluserevents?employeeId=${employeeId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
          const responseData = await response.json();
          setUserEvents(responseData);
          setUserEvent(responseData);
          
        } else {
          console.error('Failed to fetch events. HTTP error:', response.status);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);


  const ReviewableEventList = userEvents.map((event) => {
    return (
      <div key={event.id}>
        <ReviewableEvent event={event} />
      </div>
    )
  })


  return (
    <div>
      <div className='reviewable-list'>
        {ReviewableEventList}
      </div>
    </div>
  )
}

export default ReviewableEventList
