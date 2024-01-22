import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import './custom.css';
import { Calendar } from "./components/Calendar";
import { Home } from "./components/Home";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import {Settings} from "./components/Settings";
import { Review } from "./components/Review"
import { ForgotPassword } from "./components/ForgotPassword";
import { ResetPassword } from './components/ResetPassword';


export default function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialRun, setIsInitialRun] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      // Update user state based on the cookie value
      const cookieValue = document.cookie.includes('user=') ? document.cookie.split('; ').find(row => row.startsWith('user=')).split('=')[1] : undefined;
      if (cookieValue !== undefined) {
        setUser(cookieValue);
      } else {
        setUser(null);
      }
      setIsLoading(false);
      setIsInitialRun(false);
    };

    fetchUser();
  }, [window.location.pathname]); // Dependency for route changes

  function PrivateRoute({ Component }) {
    const isAuthenticated = user !== null && user !== 'undefined' && user !== '';
    if (isLoading && isInitialRun) {
      return null;
    }
    else if (isAuthenticated){
      return <Component/>;
    }

    window.location.href = '/login';
  }

  return (
    <Layout>
      <Routes>
        // Protected routes
        <Route path="/" element={<PrivateRoute Component={Home}/>} />
        <Route path="/calendar" element={<PrivateRoute Component={Calendar}/>} />
        <Route path="/settings" element={<PrivateRoute Component={Settings}/>} />
        <Route path="/suggestevent" element={<PrivateRoute Component={Review}/>} />


        // Unprotected routes
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/resetpassword" element={<ResetPassword />} />
        <Route path="/resetpassword/:token" element={<ResetPassword />} />
      </Routes>
    </Layout>
  );
  
}