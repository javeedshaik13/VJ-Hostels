import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Layout from './components/Layout';
import FoodCountPage from './pages/FoodCountPage';
import StudentsPage from './pages/StudentsPage';
import PauseStatusPage from './pages/PauseStatusPage';
import ContactSupportPage from './pages/ContactSupportPage';
import './App.css';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!localStorage.getItem('auth_token'));
  const [wardenInfo, setWardenInfo] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const warden = localStorage.getItem('warden_info');
    setIsLoggedIn(!!token);
    if (warden) {
      setWardenInfo(JSON.parse(warden));
    }
  }, []);

  const handleLogin = (wardenData: any) => {
    setIsLoggedIn(true);
    setWardenInfo(wardenData);
    localStorage.setItem('auth_token', 'authenticated');
    localStorage.setItem('warden_info', JSON.stringify(wardenData));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setWardenInfo(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('warden_info');
  };

  if (!isLoggedIn) {
    return (
      <Router>
        <Routes>
          <Route path="*" element={<LoginPage onLogin={handleLogin} />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <Layout wardenInfo={wardenInfo} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Navigate to="/food-count" />} />
          <Route path="/food-count" element={<FoodCountPage />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/pause-status" element={<PauseStatusPage />} />
          <Route path="/contact-support" element={<ContactSupportPage />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
