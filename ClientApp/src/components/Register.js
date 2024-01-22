import React, { useState, useEffect } from 'react';
import "./Styling/form.css";
import validator from 'validator';
import Person from "./Images/profile_user_icon.png"
import Email from "./Images/email_icon.png"
import Password from "./Images/security_icon.png"



const Register = () => {
    const [state, setState] = useState({
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        passwordconfirm: '',
        message: '',
        emails: []
    });

    useEffect(() => {
        // Load in all emails from the database asynchronously
        fetch('/api/Allmails')
            .then(response => response.json())
            .then(data => {
                setState(prevState => ({ ...prevState, emails: data }));
            });
    }, []);

    const handleSubmit = (event) => {
        event.preventDefault();

        var { firstname, lastname, email, password, passwordconfirm, emails } = state;

        setState({ ...state, message: '' });

        if (firstname === '' || lastname === '' || email === '' || password === '' || passwordconfirm === '') {
            setState({ ...state, message: "Vul alle velden in!" });
        } else if (!validator.isEmail(email)) {
            setState({ ...state, message: "Ongeldig e-mailadres!" });
        } else if (password !== passwordconfirm) {
            setState({ ...state, message: "Wachtwoorden komen niet overeen!" });
        } else if (password.length < 6) {
            setState({ ...state, message: "Wachtwoord moet minstens 6 karakters lang zijn!" });
        } else if (emails.includes(email)) {
            setState({ ...state, message: "Dit e-mailadres is al geregistreerd!" });
        } else {
            // Send data to the server with a POST request
            fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    "Email": state.email.toLocaleLowerCase(),
                    "FirstName": state.firstname,
                    "LastName": state.lastname,
                    "Password": state.password,
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
                    setState({ ...state, message: "Registratie succesvol!" });
                    setTimeout(() => { window.location.href = "/login"; }, 2000);
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        }

        ["firstname", "lastname", "email", "password", "passwordconfirm"].forEach((field) => {
            document.getElementById(field).addEventListener("keydown", () => {
                setState({ ...state, message: "" });
            });
        });
    }

    const handleInputChange = (event) => {
        let firstname = document.getElementById("firstname").value;
        let lastname = document.getElementById("lastname").value;
        let email = document.getElementById("email").value;
        let password = document.getElementById("password").value;
        let passwordconfirm = document.getElementById("passwordconfirm").value;

        setState(prevState => ({ ...prevState, firstname: firstname, lastname: lastname, email: email, password: password, passwordconfirm: passwordconfirm }));
        if (event.key === 'Enter') {
            state.firstname = firstname;
            state.lastname = lastname;
            state.email = email;
            state.password = password;
            state.passwordconfirm = passwordconfirm;
            handleSubmit(event);
        }
    };


    return (
        <div className="page">
            <div className="leftside">
                <img src={require('./Images/Cavero.png')} alt="cavero-logo-register" width="200" height="200" />
            </div>
            <div className="Registration right">
                <div className='header-register'>
                    <div className='text'>Registreren</div>
                    <div className='underline'></div>
                </div>
                <span id="MessageRegister">{state.message}</span>
                <form onSubmit={handleSubmit}>
                    <div className='inputs'>
                        <div className="flex-container">
                            <div className="flex-container-div">
                                <div className='input-register'>
                                    <img src={Person} alt='' />
                                    <input type="text" id="firstname" name="firstname" placeholder='First Name'
                                        onChange={handleInputChange} onKeyDown={handleInputChange} />
                                </div>
                            </div>
                            <div className="flex-container-div">
                                <div className='input-register'>
                                    <input type="text" id="lastname" name="lastname" placeholder='Last Name'
                                        onChange={handleInputChange} onKeyDown={handleInputChange} />
                                </div>
                            </div>
                        </div>
                        <div className="flex-container">
                            <div className="flex-container-div">
                                <div className='email-div'>
                                    <div className='input-register-email'>
                                        <img src={Email} alt='' />
                                        <input type="text" id="email" name="email" placeholder='Email'
                                            onChange={handleInputChange} onKeyDown={handleInputChange} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex-container">
                            <div className="flex-container-div">
                                <div className='input-register'>
                                    <img src={Password} alt='' />
                                    <input type="password" id="password" name="password" placeholder='Password'
                                        onChange={handleInputChange} onKeyDown={handleInputChange} />
                                </div>
                            </div>
                            <div className="flex-container-div">
                                <div className='input-register'>
                                    <input type="password" id="passwordconfirm" name="passwordconfirm"
                                        placeholder='Confirm Password' onChange={handleInputChange}
                                        onKeyDown={handleInputChange} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex-container">
                        <div className='submit-register'>
                            <div className={`submit ${state.isButtonDisabled ? 'disabled' : ''}`}
                                onClick={state.isButtonDisabled ? null : handleSubmit}>Registreren
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className='redirect-button'>Al een account?<span><a href='/login'className='link-to-somewhere'>Inloggen</a></span></div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export { Register };
