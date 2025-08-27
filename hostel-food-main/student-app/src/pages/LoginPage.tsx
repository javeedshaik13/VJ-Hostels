import React from 'react';
import Login from '../components/Login';
import './LoginPage.css';

interface LoginPageProps {
  onLogin: (studentData: any, userData: any) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="college-logo">
            <img src="https://vnrvjiet.ac.in/assets/images/Header-Logo.png" alt="College Logo" />
            </div>
          <h1>HOSTEL FOOD MANAGEMENT</h1>
          <h2>Student Portal</h2>
          <p className="login-subtitle">
            Manage your hostel meals easily
          </p>
        </div>

        <div className="login-form">
          <Login onLogin={onLogin} />
        </div>

        <div className="login-footer">
          <div className="features-list">
            <div className="feature-item">
              <span>⏸️</span>
              <span>Pause meals when away</span>
            </div>
            <div className="feature-item">
              <span>📅</span>
              <span>View your meal schedule</span>
            </div>
            <div className="feature-item">
              <span>🔔</span>
              <span>Get timely reminders</span>
            </div>
          </div>
          
          <p className="help-text">
            Need help? <strong>Speak to your Hostel Supervisor.</strong>
          </p>
          
          <p className="feedback-link">
            <button 
              className="feedback-link-btn"
              onClick={() => window.open('https://forms.gle/N2LF3MbxeSugDGJa9', '_blank')}
            >
              📝 Send Feedback
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
