import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS, logger, getWardenHostelId, getWardenInfo } from './config/config';

interface FoodStats {
  breakfast: number;
  lunch: number;
  snacks: number;
  dinner: number;
}

const FoodStatsPage: React.FC = () => {
  const [date, setDate] = useState<string>('');
  const [stats, setStats] = useState<FoodStats | null>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  // Get hostel ID from logged-in warden
  const hostelId = getWardenHostelId();
  const wardenInfo = getWardenInfo();

  // Helper to get tomorrow's date in YYYY-MM-DD format
  const getTomorrowDate = (): string => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const fetchStats = async (selectedDate: string) => {
    try {
      logger.log('Fetching food stats for date:', selectedDate);
      const response = await axios.post(`${API_ENDPOINTS.FOOD_COUNT}/calculate`, {
        date: selectedDate,
        hostelId,
      });

      setStats(response.data);
      setError('');
    } catch (err) {
      logger.error('Failed to fetch stats:', err);
      setStats(null);
      setError('Failed to fetch stats. Please try again.');
    }
  };

  // On initial load, set tomorrow and fetch
  useEffect(() => {
    const tomorrow = getTomorrowDate();
    setDate(tomorrow);
    fetchStats(tomorrow);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStats(date);
  };

  // Handle Logout
  const handleLogout = () => {
    // Clear the auth token and warden info from localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('warden_info');
    
    // Redirect to login page
    navigate('/login');
  };

  return (
    <div style={{ maxWidth: 500, margin: '50px auto' }}>
      <h2>Food Count Stats</h2>
      
      {/* Warden and Hostel Info */}
      {wardenInfo && (
        <div style={{ backgroundColor: '#f0f0f0', padding: '10px', marginBottom: '20px', borderRadius: '5px' }}>
          <strong>Warden:</strong> {wardenInfo.name}<br />
          <strong>Hostel:</strong> {wardenInfo.hostel_name} (ID: {wardenInfo.hostel_id})
        </div>
      )}

      {/* Logout Button */}
      <button 
        onClick={handleLogout} 
        style={{ backgroundColor: 'red', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px' }}
      >
        Logout
      </button>

      <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
        <label>Select Date:</label><br />
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          required
        />
        <br />
        <button type="submit" style={{ marginTop: 10 }}>Get Stats</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {stats && (
        <div style={{ marginTop: 20 }}>
          <h3>Stats for {date}</h3>
          <ul>
            <li>🍳 Breakfast: {stats.breakfast}</li>
            <li>🍛 Lunch: {stats.lunch}</li>
            <li>☕ Snacks: {stats.snacks}</li>
            <li>🍽️ Dinner: {stats.dinner}</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default FoodStatsPage;
