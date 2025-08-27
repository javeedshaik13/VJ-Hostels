import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS, logger, getWardenHostelId, getWardenInfo } from '../config/config';
import './FoodCountPage.css';

interface FoodStats {
  breakfast: number;
  lunch: number;
  snacks: number;
  dinner: number;
}

const FoodCountPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [stats, setStats] = useState<FoodStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState<'daily' | 'weekly'>('daily');
  const [weeklyStats, setWeeklyStats] = useState<{[key: string]: FoodStats}>({});

  // Get hostel ID from logged-in warden
  const hostelId = getWardenHostelId();
  const wardenInfo = getWardenInfo();

  // Helper to get tomorrow's date in YYYY-MM-DD format
  const getTomorrowDate = (): string => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Helper to get today's date
  const getTodayDate = (): string => {
    return new Date().toISOString().split('T')[0];
  };

  // Helper to get week dates (7 days starting from today)
  const getWeekDates = (): string[] => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const fetchDailyStats = async (date: string) => {
    setLoading(true);
    setError('');
    
    try {
      logger.log('Fetching food stats for date:', date);
      const response = await axios.post(`${API_ENDPOINTS.FOOD_COUNT}/calculate`, {
        date,
        hostelId,
      });
      setStats(response.data);
    } catch (err: any) {
      setError('Failed to fetch food count. Please try again.');
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeklyStats = async () => {
    setLoading(true);
    setError('');
    
    try {
      const weekDates = getWeekDates();
      logger.log('Fetching weekly food stats for dates:', weekDates);
      const promises = weekDates.map(date =>
        axios.post(`${API_ENDPOINTS.FOOD_COUNT}/calculate`, {
          date,
          hostelId,
        })
      );
      
      const responses = await Promise.all(promises);
      const weeklyData: {[key: string]: FoodStats} = {};
      
      weekDates.forEach((date, index) => {
        weeklyData[date] = responses[index].data;
      });
      
      setWeeklyStats(weeklyData);
    } catch (err: any) {
      setError('Failed to fetch weekly data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Set tomorrow as default date on component mount
  useEffect(() => {
    const tomorrow = getTomorrowDate();
    setSelectedDate(tomorrow);
    fetchDailyStats(tomorrow);
  }, []);

  // Handle view change
  useEffect(() => {
    if (view === 'weekly') {
      fetchWeeklyStats();
    } else if (selectedDate) {
      fetchDailyStats(selectedDate);
    }
  }, [view]);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    if (view === 'daily') {
      fetchDailyStats(date);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const isToday = (dateString: string): boolean => {
    return dateString === getTodayDate();
  };

  const isTomorrow = (dateString: string): boolean => {
    return dateString === getTomorrowDate();
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">🍽️ Food Count</h1>
        <div className="view-toggle">
          <button
            className={`btn ${view === 'daily' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setView('daily')}
          >
            Daily View
          </button>
          <button
            className={`btn ${view === 'weekly' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setView('weekly')}
          >
            Weekly View
          </button>
        </div>
      </div>

      {view === 'daily' && (
        <div className="daily-controls">
          <div className="date-controls">
            <button
              className="btn btn-secondary"
              onClick={() => handleDateChange(getTodayDate())}
            >
              Today
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => handleDateChange(getTomorrowDate())}
            >
              Tomorrow
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="date-input"
            />
          </div>
        </div>
      )}

      {loading && <div className="loading">Loading food count...</div>}
      {error && <div className="error-message">{error}</div>}

      {view === 'daily' && stats && (
        <div className="daily-view">
          <div className="date-info">
            <h2>
              {formatDate(selectedDate)}
              {isToday(selectedDate) && <span className="date-badge today">Today</span>}
              {isTomorrow(selectedDate) && <span className="date-badge tomorrow">Tomorrow</span>}
            </h2>
          </div>
          
          <div className="meal-grid">
            <div className="meal-card breakfast meal-card-content">
              <div className="meal-icon">🍳</div>
              <div className="meal-info">
                <h3>Breakfast</h3>
                <div className="meal-count">{stats.breakfast}</div>
                <div className="meal-time">7:00 - 9:00 AM</div>
              </div>
            </div>

            <div className="meal-card lunch meal-card-content">
              <div className="meal-icon">🍛</div>
              <div className="meal-info">
                <h3>Lunch</h3>
                <div className="meal-count">{stats.lunch}</div>
                <div className="meal-time">12:00 - 2:00 PM</div>
              </div>
            </div>

            <div className="meal-card snacks meal-card-content">
              <div className="meal-icon">☕</div>
              <div className="meal-info">
                <h3>Snacks</h3>
                <div className="meal-count">{stats.snacks}</div>
                <div className="meal-time">4:00 - 6:00 PM</div>
              </div>
            </div>

            <div className="meal-card dinner meal-card-content">
              <div className="meal-icon">🍽️</div>
              <div className="meal-info">
                <h3>Dinner</h3>
                <div className="meal-count">{stats.dinner}</div>
                <div className="meal-time">7:00 - 9:00 PM</div>
              </div>
            </div>
          </div>

          <div className="export-section">
            <button className="btn btn-primary">📧 Email to Kitchen</button>
            <button className="btn btn-secondary">📄 Export PDF</button>
          </div>
        </div>
      )}

      {view === 'weekly' && Object.keys(weeklyStats).length > 0 && (
        <div className="weekly-view">
          <div className="weekly-grid">
            {getWeekDates().map((date) => (
              <div key={date} className="weekly-day">
                <div className="day-header">
                  <div className="day-name">{formatDate(date)}</div>
                  {isToday(date) && <span className="date-badge today">Today</span>}
                  {isTomorrow(date) && <span className="date-badge tomorrow">Tomorrow</span>}
                </div>
                <div className="day-meals">
                  <div className="mini-meal">
                    <span>🍳</span>
                    <span>{weeklyStats[date]?.breakfast || 0}</span>
                  </div>
                  <div className="mini-meal">
                    <span>🍛</span>
                    <span>{weeklyStats[date]?.lunch || 0}</span>
                  </div>
                  <div className="mini-meal">
                    <span>☕</span>
                    <span>{weeklyStats[date]?.snacks || 0}</span>
                  </div>
                  <div className="mini-meal">
                    <span>🍽️</span>
                    <span>{weeklyStats[date]?.dinner || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodCountPage;
