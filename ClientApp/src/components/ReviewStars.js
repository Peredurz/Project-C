import React, {useState} from 'react'
import "./Styling/ReviewStars.css"
// This component allows the user to select an amount of stars by clicking one of the five presented buttons.

function ReviewStars() {
    const [rating, setRating] = useState(0);

  return (
    <div className='review-stars'> 
       { [...Array(5)].map((star,index) => {
        index += 1;
        return( // &#9733; html entity code for a star icon
        <button 
            id='star-button'
            key={index}
            className={index <= rating ? "on" : "off"}
            onClick={() => rating === index ? setRating(0):setRating(index)}
           // onDoubleClick={() => { setRating(0);}} optional reset on doubleclick if prefered by the PO
        >
        <span className='star'>&#9733;</span>
        </button>
        );
        })}
    </div>
  )
}

export default ReviewStars
