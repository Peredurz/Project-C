import React, { Component } from 'react';
import './Styling/PasswordReset.css'
import Email from "./Images/email_icon.png"
import Password from "./Images/security_icon.png"

export class ForgotPassword extends Component {
    static displayName = ForgotPassword.name;

    constructor(props) {
        super(props);
        this.state = {
            message: '',
            email: '',
        };
    }

    handleSubmit = async (event) => {
        event.preventDefault();

        const data = { email: this.state.email };
        if (this.state.email === '') {
            this.setState({ message: 'Email is leeg' });
            return;
        }

        fetch('/account/forgotpassword', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "Email": this.state.email
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
                this.setState({ message: data.message, email: '' });
                setTimeout(() => { window.location.href = "/login"; }, 2000);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    // Update the state when input values change
    handleInputChange = (event) => {
        const { name, value } = event.target;
        this.setState({ [name]: value, message: '' });
    }

    render() {
        return (
            <div className='reset-password' style={{ width: 'auto', maxWidth: '750px' }}>
                <div className='header'>
                    <div className='text'>Password Reset</div>
                    <div className='underline'></div>
                </div>
                <span id="MessageReset">{this.state.message}</span>
                <div className='inputs-reset'>
                    <div className='input-reset'>
                        <img src={Email} alt='' />
                        <input type='email' id="email" name="email" placeholder='Email' value={this.state.email} onChange={this.handleInputChange} />
                    </div>
                </div>
                <div className='submit_password_reset' onClick={this.handleSubmit}>Wachtwoord Resetten</div>
            </div>
        );
    }
}
