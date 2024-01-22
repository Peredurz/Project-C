import React, {useState} from 'react'
import "./Styling/DropDownBar.css"

function DropDownBar({title, initialState = false, children}) {

    // This is a simple button toggle that allows  for information to be hidden. 
    // It uses a && operator to hide content also removing it from the DOM 
    // This might be worse on small elements but can lead to better performance in the long.
    // because the amount using CSS: hide will still keep the objects "alive" within React.
    const [isOpen, SetOpen] = useState(initialState);
   // const ToggleOpen = () =>{
   //    SetOpen(currentState => !currentState)
   //}
    const closeDropDown = () => SetOpen(false);
    const openDropDown = () => SetOpen(true);
    const CloseSpace = () => (
        <div className='close-area' onClick={closeDropDown}>
            <hr className='devision-line'></hr>
        </div>
    );
  return (
    <div>
        <div className="inner-div">
            <div className='open-area' onClick={openDropDown}>
                <h5>{title}</h5>
            </div>
            {isOpen && children}
            {(isOpen === false) ? null:<CloseSpace/>}
        </div>
    </div>
  )
}

export default DropDownBar
