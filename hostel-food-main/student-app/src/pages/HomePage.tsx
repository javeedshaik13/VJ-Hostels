import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS, logger } from '../config/config';
import './HomePage.css';

interface HomePageProps {
  studentInfo: any;
  refreshKey?: number; // Add a refresh key prop
}

interface StudentStatus {
  pause_from?: string;
  pause_meals?: string;
  resume_from?: string;
  resume_meals?: string;
}

const HomePage: React.FC<HomePageProps> = ({ studentInfo, refreshKey }) => {
  const [status, setStatus] = useState<StudentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [todaysMeals, setTodaysMeals] = useState<string[]>([]);

  const today = new Date().toISOString().split('T')[0];
  
  useEffect(() => {
    fetchStudentStatus();
  }, [studentInfo, refreshKey]);

  const fetchStudentStatus = async () => {
    const studentId = studentInfo?.studentId || studentInfo?.id;
    
    if (!studentId) {
      setLoading(false);
      return;
    }
    
    try {
      logger.log('Fetching student status for ID:', studentId);
      const response = await axios.get(`${API_ENDPOINTS.STUDENT_STATUS}?studentId=${studentId}`);
      setStatus(response.data);
      calculateTodaysMeals(response.data);
    } catch (error) {
      logger.error('Error fetching status:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTodaysMeals = (statusData: StudentStatus) => {
    const allMeals = ['breakfast', 'lunch', 'snacks', 'dinner'];
    
    if (!statusData || Object.keys(statusData).length === 0) {
      return;
    }
    
    if (!statusData.pause_from) {
      setTodaysMeals(allMeals);
      return;
    }

    const pauseDate = statusData.pause_from;
    const resumeDate = statusData.resume_from;

    if (today < pauseDate) {
      setTodaysMeals(allMeals);
    } else if (today === pauseDate) {
      const mealsToHave = statusData.pause_meals ? statusData.pause_meals.split(',') : [];
      setTodaysMeals(mealsToHave);
    } else if (resumeDate && today > pauseDate && today < resumeDate) {
      setTodaysMeals([]);
    } else if (resumeDate && today === resumeDate) {
      setTodaysMeals(statusData.resume_meals ? statusData.resume_meals.split(',') : []);
    } else if (resumeDate && today > resumeDate) {
      setTodaysMeals(allMeals);
    } else if (!resumeDate && today > pauseDate) {
      setTodaysMeals([]);
    }
  };

  const getStatusInfo = () => {
    if (!status?.pause_from) {
      return { type: 'active', message: 'All meals available today' };
    }

    const pauseDate = status.pause_from;
    const resumeDate = status.resume_from;

    if (today < pauseDate) {
      return { 
        type: 'upcoming', 
        message: `Food will be paused from ${formatDate(pauseDate)}` 
      };
    } else if (today === pauseDate) {
      return { 
        type: 'last-day', 
        message: 'Last day before going away' 
      };
    } else if (resumeDate && today > pauseDate && today < resumeDate) {
      return { 
        type: 'paused', 
        message: `Away until ${formatDate(resumeDate)}` 
      };
    } else if (resumeDate && today === resumeDate) {
      return { 
        type: 'return-day', 
        message: 'Welcome back! First day return' 
      };
    } else if (resumeDate && today > resumeDate) {
      return { 
        type: 'active', 
        message: 'All meals available today' 
      };
    } else {
      return { 
        type: 'paused', 
        message: 'Food service paused indefinitely' 
      };
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getMealIcon = (meal: string): string => {
    const icons: {[key: string]: string} = {
      'breakfast': '🍳',
      'lunch': '🍛',
      'snacks': '☕',
      'dinner': '🍽️'
    };
    return icons[meal] || '🍽️';
  };

  const getMealTime = (meal: string): string => {
    const times: {[key: string]: string} = {
      'breakfast': '7:00 - 9:00 AM',
      'lunch': '12:00 - 2:00 PM',
      'snacks': '4:00 - 6:00 PM',
      'dinner': '7:00 - 9:00 PM'
    };
    return times[meal] || '';
  };

  const statusInfo = getStatusInfo();

  if (loading) {
    return (
      <div className="page">
        <div className="loading">Loading your food status...</div>
      </div>
    );
  }

  return (
    <div className="page">
      {/* Welcome Section */}
      <div className="welcome-section">
        <h1>👋 Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}!</h1>
        <p className="greeting">{studentInfo?.name}</p>
      </div>

      {/* Status Section */}
      <div className="status-section">
        <div className="status-indicator">
          <div className={`status-icon ${statusInfo.type}`}></div>
          <span className="status-text">{statusInfo.message}</span>
        </div>
        <p className="status-message">
          {statusInfo.type === 'active' && 'Enjoy your food!'}
          {statusInfo.type === 'paused' && 'Your food service is currently paused.'}
          {statusInfo.type === 'upcoming' && 'You have an upcoming pause scheduled.'}
          {statusInfo.type === 'last-day' && 'Make sure to enjoy your selected meals today.'}
          {statusInfo.type === 'return-day' && 'Welcome back! Your selected meals are ready.'}
        </p>
      </div>

      {/* Today's Meals */}
      <div className="todays-meals">
        <h2>Today's Available Meals</h2>
        {todaysMeals.length > 0 ? (
          <div className="meal-list">
            {todaysMeals.map((meal) => (
              <div key={meal} className="meal-item available">
                <span className="meal-icon">{getMealIcon(meal)}</span>
                <div className="meal-info">
                  <div className="meal-name">{meal.charAt(0).toUpperCase() + meal.slice(1)}</div>
                  <div className="meal-time">{getMealTime(meal)}</div>
                </div>
                <span className="meal-status">✅</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-meals">
            🚫 No meals available today
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/pause" className="action-card">
            <span className="action-icon">⏸️</span>
            <div className="action-content">
              <div className="action-title">Pause Food Service</div>
              <div className="action-subtitle">Manage your meal schedule</div>
            </div>
          </Link>
          <Link to="/schedule" className="action-card">
            <span className="action-icon">📅</span>
            <div className="action-content">
              <div className="action-title">View Schedule</div>
              <div className="action-subtitle">See your upcoming meals</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
