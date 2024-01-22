import React, { useRef, useEffect, useState } from 'react'
import "./Styling/BaseModal.css"

function BaseModal({isOpen, hasCloseBtn = true, onClose, children}) {
    
  const [modalCheck, setModalOpen] = useState(isOpen);
  const modalRef = useRef(null);


  // this alows us to do something when closing the program, it will also allow us to bind closing to a button press rather than using the 'escape' key.
  const closeModal = () => {
    if (onClose) {
      onClose();
    }
    setModalOpen(false);
  };


  // closes the event whenever the escape key is pressed.
  const closeKeyDown = (event) =>{
      if (event.key === 'Escape'){
        closeModal();
      }
  };

// this useEffect Hook gets called whenever the [isOpen] value changes. Ensuring that isOpen and the openModal state are synchronous
  useEffect(() =>{ 
    setModalOpen(isOpen)
  }, [isOpen]);

//this useEffect Hook Controls the visibility of the Modal. Displaying it when modalCheck = true. and closing it if this isn't the case.
useEffect(() => {
  const modalElement = modalRef.current;

  if (modalElement) {
    if (modalCheck) {
      modalElement.showModal();
    } else {
      modalElement.close();
    }
  }
}, [modalCheck]);

  return (
    <div>
      <dialog ref={modalRef} onKeyDown={closeKeyDown} className='base-modal'>
        { hasCloseBtn && ( // tenary operator that will show a close button if hasCloseBtn = true
          <button className='close-modal-btn' onClick={closeModal}>
            &#65336;
          </button>
        )}
        <div className='child-elements'>
          {children}
        </div>
      </dialog>
    </div>
  )
}

export default BaseModal
