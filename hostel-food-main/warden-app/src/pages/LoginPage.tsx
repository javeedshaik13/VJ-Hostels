import React, { useState } from 'react';
import axios from 'axios';
import { API_ENDPOINTS, logger } from '../config/config';
import './LoginPage.css';

interface LoginPageProps {
  onLogin: (wardenData: any) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      logger.log('Attempting warden login...');
      const response = await axios.post(API_ENDPOINTS.WARDEN_LOGIN, {
        username,
        password,
      });

      if (response.data.success) {
        onLogin(response.data.warden);
      } else {
        setError('Invalid username or password');
      }
    } catch (err: any) {
      logger.error('Login failed:', err);
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="college-logo">
            <img src="https://vnrvjiet.ac.in/assets/images/Header-Logo.png" alt="College Logo" />
            </div>
          <h1>HOSTEL FOOD MANAGEMENT</h1>
          <h2>Warden Portal</h2>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              type="text"
              id="username"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter your username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'LOGIN'}
          </button>
        </form>

        <div className="login-footer">
          <p>Need help? Contact IT Support: <strong>xxx-xxx-xxxx</strong></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
