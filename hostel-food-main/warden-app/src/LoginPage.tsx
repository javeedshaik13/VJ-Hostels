import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS, logger } from './config/config';

interface Props {
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

const LoginPage: React.FC<Props> = ({ setIsLoggedIn }) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      logger.log('Attempting warden login...');
      const response = await axios.post(API_ENDPOINTS.WARDEN_LOGIN, {
        username,
        password,
      });

      if (response.data.success) {
        // Set the auth token in localStorage
        localStorage.setItem('auth_token', response.data.token);
        
        // Store warden information including hostel_id
        localStorage.setItem('warden_info', JSON.stringify(response.data.warden));

        // Update the login state in parent (App.tsx)
        setIsLoggedIn(true);

        // Redirect to StatsPage
        navigate('/stats');
      } else {
        alert('Invalid username or password');
      }
    } catch (error) {
      logger.error('Login failed:', error);
      alert('Invalid username or password');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;
