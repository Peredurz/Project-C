import { useState } from 'react';

function ButtonHandler() {
    const [state, setState] = useState({Attendancebtn: true,
        EvButton: true,
        JEvButton: false,
        ArrOffButton: true,
        UpButton: true,
        UevButton: true,
        AevButton: true,
    });

    const handleClick = (event, action, idClass, Arrow, CorButton) => {
        event.preventDefault();
        switch (action) {
            case 'Arrow': {
                setState((prevState) => ({
                    ...prevState,
                    [CorButton]: !prevState[CorButton],
                    [action]: !prevState[action],
                }));
                var x = document.getElementById(idClass);
                if (x.style.display === 'none') {
                    x.style.display = 'flex';
                } else {
                    x.style.display = 'none';
                }
                break;
            }
            case 'btn': {
                setState((prevState) => ({
                    ...prevState,
                    [idClass]: !prevState[idClass],
                }));
                const btn = document.getElementById(idClass);
                const initialText = 'Join';

                if (btn.textContent.toLowerCase().includes(initialText.toLowerCase())) {
                    btn.textContent = 'Leave';
                } else {
                    btn.textContent = initialText;
                }
                break;
            }
            default:
                break;
        }
        
    };
    return {
        state,
        handleClick,
    };
};

export default ButtonHandler;
