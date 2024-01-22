import React from 'react'
import ReviewStars from './ReviewStars'
import InfoButton from './InfoButton'
import "./Styling/ReviewableEvent.css"
import CaveroLogo from "./Images/smallLogoNoBG.png"

function ReviewableEvent({event}) {
    return (
        <div>
            <div className='reviewable-event'>
                <div className='event-text'>
                    <h3 className='event-name'> {event.name}</h3>
                    <h5 className='event-name'> {event.location}</h5>
                    <h5 className='event-datetime'>{event.date} - {event.startTime}</h5>
                </div>
                <div className='star-rating'>
                    <ReviewStars/>
                </div>
                <div className='info-button'>
                    <InfoButton event = {event}/>
                </div>
            </div>
        </div>
    )
}

export default ReviewableEvent
