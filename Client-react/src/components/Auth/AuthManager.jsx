import React, { useState } from 'react';
import LoginForm from './LoginForm/LoginForm';
import ForgotPassword from './ForgotPassword/ForgotPassword';
import ResetPassword from './ForgotPassword/ResetPassword';

const AuthManager = () => {
  const [currentView, setCurrentView] = useState('login'); // 'login', 'forgot', 'reset'
  const [userEmail, setUserEmail] = useState('');

  const handleShowForgotPassword = () => {
    setCurrentView('forgot');
  };

  const handleShowResetPassword = (email) => {
    setUserEmail(email);
    setCurrentView('reset');
  };

  const handleBackToLogin = () => {
    setCurrentView('login');
    setUserEmail('');
  };

  const handleBackToForgot = () => {
    setCurrentView('forgot');
  };

  return (
    <div className="auth-manager">
      {currentView === 'login' && (
        <LoginForm onForgotPassword={handleShowForgotPassword} />
      )}
      
      {currentView === 'forgot' && (
        <ForgotPassword 
          onBackToLogin={handleBackToLogin}
          onShowResetPassword={handleShowResetPassword}
        />
      )}
      
      {currentView === 'reset' && (
        <ResetPassword 
          email={userEmail}
          onBackToLogin={handleBackToLogin}
          onBackToForgot={handleBackToForgot}
        />
      )}
    </div>
  );
};

export default AuthManager;
