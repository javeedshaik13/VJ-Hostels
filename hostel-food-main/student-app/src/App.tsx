import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { logger } from './config/config';
import LoginPage from './pages/LoginPage';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import SchedulePage from './pages/SchedulePage';
import PausePage from './pages/PausePage';
import ProfilePage from './pages/ProfilePage';
import HelpPage from './pages/HelpPage';
import './App.css';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const triggerRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    console.log('[App] useEffect: Checking for existing login');
    // Check if user is logged in via cookies
    const studentIdMatch = /studentId=(\d+)/.exec(document.cookie);
    const userMatch = /user=([^;]+)/.exec(document.cookie);
    
    console.log('[App] Cookie matches:', { studentIdMatch, userMatch });
    
    if (studentIdMatch && userMatch) {
      console.log('[App] Found login cookies, setting logged in state');
      setIsLoggedIn(true);
      try {
        const userObj = JSON.parse(decodeURIComponent(userMatch[1]));
        const studentData = {
          id: Number(studentIdMatch[1]),
          ...userObj
        };
        console.log('[App] Setting student info:', studentData);
        setStudentInfo(studentData);
      } catch (e) {
        console.error('[App] Error parsing user data:', e);
        logger.error('Error parsing user data:', e);
      }
    } else {
      console.log('[App] No login cookies found');
    }
  }, []);

  const handleLogin = (studentData: any, userData: any) => {
    console.log('[App] handleLogin called with:', { studentData, userData });
    const combinedData = { ...studentData, ...userData };
    console.log('[App] Combined student data:', combinedData);
    setIsLoggedIn(true);
    setStudentInfo(combinedData);
    // Cookies are already set by the Login component
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setStudentInfo(null);
    // Clear cookies
    document.cookie = 'studentId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
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
      <Layout studentInfo={studentInfo} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/home" element={<HomePage studentInfo={studentInfo} refreshKey={refreshKey} />} />
          <Route path="/schedule" element={<SchedulePage studentInfo={studentInfo} />} />
          <Route path="/pause" element={<PausePage studentInfo={studentInfo} onPauseUpdated={triggerRefresh} />} />
          <Route path="/profile" element={<ProfilePage studentInfo={studentInfo} onLogout={handleLogout} />} />
          <Route path="/help" element={<HelpPage />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;