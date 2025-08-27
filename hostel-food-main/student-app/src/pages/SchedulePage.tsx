import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS, logger } from '../config/config';
import './SchedulePage.css';

interface SchedulePageProps {
  studentInfo: any;
}

interface StudentStatus {
  pause_from?: string;
  pause_meals?: string;
  resume_from?: string;
  resume_meals?: string;
}

const SchedulePage: React.FC<SchedulePageProps> = ({ studentInfo }) => {
  const [status, setStatus] = useState<StudentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchStudentStatus();
    setSelectedDate(today);
  }, [studentInfo]);

  const fetchStudentStatus = async () => {
    const studentId = studentInfo?.studentId || studentInfo?.id;
    
    if (!studentId) {
      setLoading(false);
      return;
    }
    
    try {
      logger.log('Fetching student status for schedule:', studentId);
      const response = await axios.get(`${API_ENDPOINTS.STUDENT_STATUS}?studentId=${studentId}`);
      setStatus(response.data);
    } catch (error) {
      logger.error('Error fetching status:', error);
    } finally {
      setLoading(false);
    }
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

  const getMealsForDate = (date: string): { meal: string; available: boolean; reason?: string }[] => {
    const allMeals = ['breakfast', 'lunch', 'snacks', 'dinner'];
    
    if (!status?.pause_from) {
      // No pause - all meals available
      return allMeals.map(meal => ({ meal, available: true }));
    }

    const pauseDate = status.pause_from;
    const resumeDate = status.resume_from;

    if (date < pauseDate) {
      // Before pause - all meals
      return allMeals.map(meal => ({ meal, available: true }));
    } else if (date === pauseDate) {
      // Last day - only selected meals
      const selectedMeals = status.pause_meals ? status.pause_meals.split(',') : [];
      return allMeals.map(meal => ({
        meal,
        available: selectedMeals.includes(meal),
        reason: selectedMeals.includes(meal) ? 'Last day meal' : 'Not selected for last day'
      }));
    } else if (resumeDate && date > pauseDate && date < resumeDate) {
      // Away - no meals
      return allMeals.map(meal => ({ meal, available: false, reason: 'Away from hostel' }));
    } else if (resumeDate && date === resumeDate) {
      // Return day - only selected meals
      const selectedMeals = status.resume_meals ? status.resume_meals.split(',') : [];
      return allMeals.map(meal => ({
        meal,
        available: selectedMeals.includes(meal),
        reason: selectedMeals.includes(meal) ? 'Return day meal' : 'Not selected for return day'
      }));
    } else if (resumeDate && date > resumeDate) {
      // After return - all meals
      return allMeals.map(meal => ({ meal, available: true }));
    } else if (!resumeDate && date > pauseDate) {
      // Indefinite pause - no meals
      return allMeals.map(meal => ({ meal, available: false, reason: 'Indefinite pause' }));
    }

    return allMeals.map(meal => ({ meal, available: true }));
  };

  const getDateStatus = (date: string): { type: string; label: string } => {
    if (!status?.pause_from) {
      return { type: 'normal', label: 'Normal day' };
    }

    const pauseDate = status.pause_from;
    const resumeDate = status.resume_from;

    if (date < pauseDate) {
      return { type: 'normal', label: 'Normal day' };
    } else if (date === pauseDate) {
      return { type: 'last-day', label: 'Last day' };
    } else if (resumeDate && date > pauseDate && date < resumeDate) {
      return { type: 'away', label: 'Away' };
    } else if (resumeDate && date === resumeDate) {
      return { type: 'return-day', label: 'Return day' };
    } else if (resumeDate && date > resumeDate) {
      return { type: 'normal', label: 'Normal day' };
    } else if (!resumeDate && date > pauseDate) {
      return { type: 'away', label: 'Paused' };
    }

    return { type: 'normal', label: 'Normal day' };
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const generateDateRange = () => {
    const dates = [];
    const currentDate = new Date();
    const startDate = new Date(currentDate);
    startDate.setDate(currentDate.getDate() - 3); // Show 3 days before today
    
    for (let i = 0; i < 14; i++) { // Show 14 days total (3 before + today + 10 after)
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading">Loading your schedule...</div>
      </div>
    );
  }

  const dateRange = generateDateRange();
  const selectedDateMeals = getMealsForDate(selectedDate);
  const selectedDateStatus = getDateStatus(selectedDate);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Meal Schedule</h1>
        <p>View your upcoming meal plan</p>
      </div>

      {/* Date Selector */}
      <div className="date-selector">
        <div className="date-scroll">
          {dateRange.map(date => {
            const isToday = date === today;
            const isSelected = date === selectedDate;
            const dateStatus = getDateStatus(date);
            const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
            const dayOfMonth = new Date(date).getDate();

            return (
              <button
                key={date}
                className={`date-item ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''} ${dateStatus.type}`}
                onClick={() => setSelectedDate(date)}
              >
                <div className="day-label">{dayOfWeek}</div>
                <div className="day-number">{dayOfMonth}</div>
                {isToday && <div className="today-indicator">Today</div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Info */}
      <div className="selected-date-info">
        <h2>{formatDate(selectedDate)}</h2>
        <div className={`status-badge ${selectedDateStatus.type}`}>
          {selectedDateStatus.label}
        </div>
      </div>

      {/* Meals for Selected Date */}
      <div className="daily-meals">
        {selectedDateMeals.map(({ meal, available, reason }) => (
          <div key={meal} className={`meal-card ${available ? 'available' : 'unavailable'}`}>
            <div className="meal-info">
              <div className="meal-header">
                <span className="meal-icon">{getMealIcon(meal)}</span>
                <div>
                  <h3>{meal.charAt(0).toUpperCase() + meal.slice(1)}</h3>
                  <p className="meal-time">{getMealTime(meal)}</p>
                </div>
              </div>
              {reason && (
                <div className="meal-reason">
                  {reason}
                </div>
              )}
            </div>
            <div className={`availability-indicator ${available ? 'available' : 'unavailable'}`}>
              {available ? '✓' : '✗'}
            </div>
          </div>
        ))}
      </div>

      {/* Schedule Summary */}
      {status?.pause_from && (
        <div className="schedule-summary">
          <h3>Schedule Summary</h3>
          <div className="summary-item">
            <span className="summary-label">Pause starts:</span>
            <span>{formatDate(status.pause_from)}</span>
          </div>
          {status.resume_from && (
            <div className="summary-item">
              <span className="summary-label">Resume date:</span>
              <span>{formatDate(status.resume_from)}</span>
            </div>
          )}
          {!status.resume_from && (
            <div className="summary-item">
              <span className="summary-label">Duration:</span>
              <span>Indefinite</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SchedulePage;
