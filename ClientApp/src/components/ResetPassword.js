import React, { Component } from 'react';
import './Styling/PasswordReset.css';
import Password from "./Images/security_icon.png";

export class ResetPassword extends Component {
    static displayName = ResetPassword.name;

    constructor(props) {
        super(props);
        this.state = {
            message: '',
            newPassword: '',
            confirmPassword: '',
        };
    }

    handleSubmit = async () => {
        // Add logic to submit the new password and confirmation
        // You can use fetch or another method to send a request to your backend
        // Update the URL to include the token from the email
        const token = window.location.pathname.split('/').pop(); // Get the token from the URL

        const data = {
            token: token,
            newPassword: this.state.newPassword,
            confirmPassword: this.state.confirmPassword,
        };

        console.log(data);

        if (this.state.newPassword === '' || this.state.confirmPassword === '') {
            this.setState({ message: 'Wachtwoord is leeg' });
            return;
        }

        if (this.state.newPassword !== this.state.confirmPassword) {
            this.setState({ message: 'Wachtwoorden komen niet overeen', newPassword: '', confirmPassword: '' });
            return;
        }

        fetch('/account/resetpassword', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "Token": token,
                "Password": this.state.newPassword,
                "ConfirmPassword": this.state.confirmPassword
            })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Bad request');
                }
                return response.json();
            })
            .then(data => {
                this.setState({ message: data.message, newPassword: '', confirmPassword: '' });
                if (data.success === true ) {
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 2000);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };

    // Update the state when input values change
    handleInputChange = (event) => {
        const { name, value } = event.target;
        this.setState({ [name]: value, message: '' });
    };

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
                        <img src={Password} alt='' />
                        <input
                            type='password'
                            id='newPassword'
                            name='newPassword'
                            placeholder='New Password'
                            value={this.state.newPassword}
                            onChange={this.handleInputChange}
                        />
                    </div>
                    <div className='input-reset'>
                        <img src={Password} alt='' />
                        <input
                            type='password'
                            id='confirmPassword'
                            name='confirmPassword'
                            placeholder='Confirm Password'
                            value={this.state.confirmPassword}
                            onChange={this.handleInputChange}
                        />
                    </div>
                </div>
                <div className='submit_password_reset' onClick={this.handleSubmit}>
                    Wachtwoord Resetten
                </div>
            </div>
        );
    }
}
