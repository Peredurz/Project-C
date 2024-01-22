import './Styling/LoginSignup.css'
import Email from "./Images/email_icon.png"
import Password from "./Images/security_icon.png"
import React, { useState, useEffect, useCallback} from 'react';
import validator from 'validator'; // Assuming you have the validator library installed

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    message: ''
  });

  let { email, password, message } = formData;

  const handleSubmit = async (event) => {
    event.preventDefault();
    const Iemail = document.getElementById("email").value;
    const Ipassword = document.getElementById("password").value;

    setFormData( email= Iemail, password= Ipassword);

    setFormData({ ...formData, message: '' });

    if (email === '' || password === '') {
      setFormData({ ...formData, message: 'Vul alle velden in!' });
    } else if (!validator.isEmail(email)) {
      setFormData({ ...formData, message: 'Ongeldig e-mailadres!' });
    } else {
      try {
        console.log('Formuliergegevens:', { email, password });

        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
          const hash = btoa(email.toLowerCase());

          document.cookie = `user=${hash}; path=/; max-age=86400; sameSite=strict;`;
          window.location.href = '/';

        } else {
          setFormData({ ...formData, message: data.message });
        }
      } catch (error) {
        console.log('Error:', error);
        setFormData({ ...formData, message: "Er ging iets mis!" });
      }
    }
  };

  const handleInputChange = useCallback((event) => {
    const Iemail = document.getElementById("email").value;
    const Ipassword = document.getElementById("password").value;

    setFormData(
        email= Iemail,
        password= Ipassword
    );

    if (event.key === 'Enter') {
      handleSubmit(event);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (field) => {
      document.getElementById(field).addEventListener('keydown', () => {
        setFormData((prevFormData) => ({ ...prevFormData, message: '' }));
        if (field.key === 'Enter') handleSubmit(field);
      });
    };

    ["email", "password"].forEach(handleKeyDown);

    // Cleanup event listeners on component unmount
    document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; sameSite=strict;';
    return () => {
      ["email", "password"].forEach((field) => {
        document.getElementById(field).removeEventListener('keydown', () => {});
      });
    };
  }, []);
  return (
    <div className='login'>
      <div className='header'>
        <div className='text'>Inloggen</div>
        <div className='underline'></div>
      </div>
      <span id="Message">{message}</span>
      <div className='inputs'>
        <div className='input'>
          <img src={Email} alt='' />
          <input type='email' id="email" name="email" placeholder='Email' onChange={handleInputChange} />
        </div>
        <div className='input'>
          <img src={Password} alt='' />
          <input type='password' id="password" name="password" placeholder='Wachtwoord' onChange={handleInputChange} onKeyDown={handleInputChange} />
        </div>
      </div>
      <div className='submit-login'>
      <div className={`submit ${message ? 'disabled' : ''}`} onClick={message ? null : handleSubmit}>Inloggen</div>
        
    </div>
      <div className='forgot-password'>Wachtwoord vergeten? <span><a href='/forgotpassword' className='link-to-somewhere'> Klik hier!</a></span></div>
      <div className='forgot-password'>Nog geen account?<span><a href='/register' className='link-to-somewhere'> Klik hier!</a></span></div>
    </div>
  );
};

export { Login };