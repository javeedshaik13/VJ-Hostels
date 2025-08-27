import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS, logger, getWardenHostelId, getWardenInfo } from '../config/config';
import './PauseStatusPage.css';

interface PauseRecord {
  id: number;
  student_id: number;
  student_name: string;
  roll_number: string;
  pause_from: string;
  pause_meals: string;
  resume_from?: string;
  resume_meals?: string;
  created_at: string;
}

interface PauseRecordsResponse {
  success: boolean;
  pauseRecords: PauseRecord[];
  total: number;
}

const PauseStatusPage: React.FC = () => {
  const [pauseRecords, setPauseRecords] = useState<PauseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState<'current' | 'upcoming' | 'recent'>('current');

  // Get hostel ID from logged-in warden
  const hostelId = getWardenHostelId();
  const wardenInfo = getWardenInfo();

  useEffect(() => {
    fetchPauseRecords();
  }, [hostelId]);

  const fetchPauseRecords = async () => {
    setLoading(true);
    setError('');
    
    try {
      logger.log(`Fetching pause records for hostel ${hostelId}`);
      const response = await axios.get<PauseRecordsResponse>(`${API_ENDPOINTS.PAUSE_RECORDS_BY_HOSTEL}/${hostelId}`);
      
      if (response.data.success) {
        setPauseRecords(response.data.pauseRecords);
        setError('');
      } else {
        throw new Error('Failed to fetch pause records');
      }
    } catch (err: any) {
      logger.error('Error fetching pause records:', err);
      setError(`Failed to fetch pause records: ${err.response?.data?.error || err.message}`);
      setPauseRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const getTodayDate = (): string => {
    return new Date().toISOString().split('T')[0];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatMeals = (mealsString: string): string => {
    return mealsString.split(',').map(meal => 
      meal.charAt(0).toUpperCase() + meal.slice(1)
    ).join(', ');
  };

  const getMealEmoji = (meal: string): string => {
    const emojiMap: {[key: string]: string} = {
      'breakfast': '🍳',
      'lunch': '🍛',
      'snacks': '☕',
      'dinner': '🍽️'
    };
    return emojiMap[meal.toLowerCase()] || '🍽️';
  };

  const getFilteredRecords = (): PauseRecord[] => {
    const today = getTodayDate();
    
    switch (view) {
      case 'current':
        return pauseRecords.filter(record => 
          record.pause_from <= today && 
          (!record.resume_from || record.resume_from >= today)
        );
      case 'upcoming':
        return pauseRecords.filter(record => record.pause_from > today);
      case 'recent':
        return pauseRecords.filter(record => 
          record.resume_from && record.resume_from < today
        );
      default:
        return pauseRecords;
    }
  };

  const getStatusBadge = (record: PauseRecord): JSX.Element => {
    const today = getTodayDate();
    
    if (record.pause_from > today) {
      return <span className="status-badge upcoming">📅 Upcoming</span>;
    } else if (record.pause_from <= today && (!record.resume_from || record.resume_from >= today)) {
      return <span className="status-badge active">⏸️ Currently Paused</span>;
    } else if (record.resume_from && record.resume_from < today) {
      return <span className="status-badge completed">✅ Resumed</span>;
    }
    
    return <span className="status-badge unknown">❓ Unknown</span>;
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading">Loading pause records...</div>
      </div>
    );
  }

  const filteredRecords = getFilteredRecords();

  return (
    <div className="page">
      <div className="page-header">
        <div className="header-main">
          <h1 className="page-title">⏸️ Pause Status</h1>
          {wardenInfo && (
            <div className="hostel-info">
              <strong>{wardenInfo.hostel_name}</strong>
              <span> • Warden: {wardenInfo.name}</span>
            </div>
          )}
        </div>
        
        <div className="header-actions">
          <button 
            onClick={fetchPauseRecords} 
            className="btn btn-primary"
            disabled={loading}
          >
            🔄 {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      <div className="pause-stats">
        <div className="stat-item">
          <span className="stat-number">{pauseRecords.filter(r => r.pause_from <= getTodayDate() && (!r.resume_from || r.resume_from >= getTodayDate())).length}</span>
          <span className="stat-label">Currently Paused</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{pauseRecords.filter(r => r.pause_from > getTodayDate()).length}</span>
          <span className="stat-label">Upcoming</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{pauseRecords.length}</span>
          <span className="stat-label">Total Records</span>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="view-controls">
        <div className="view-tabs">
          <button
            className={`tab-button ${view === 'current' ? 'active' : ''}`}
            onClick={() => setView('current')}
          >
            Current Pauses
          </button>
          <button
            className={`tab-button ${view === 'upcoming' ? 'active' : ''}`}
            onClick={() => setView('upcoming')}
          >
            Upcoming
          </button>
          <button
            className={`tab-button ${view === 'recent' ? 'active' : ''}`}
            onClick={() => setView('recent')}
          >
            Recent Activity
          </button>
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="no-results">
          <p>No pause records found for the selected view.</p>
        </div>
      ) : (
        <div className="pause-records">
          {filteredRecords.map((record) => (
            <div key={record.id} className="pause-card">
              <div className="pause-header">
                <div className="student-info">
                  <h3 className="student-name">{record.student_name}</h3>
                  <p className="student-roll">Roll: {record.roll_number}</p>
                </div>
                <div className="pause-status">
                  {getStatusBadge(record)}
                </div>
              </div>

              <div className="pause-details">
                <div className="pause-section">
                  <div className="section-header">
                    <span className="section-icon">⏸️</span>
                    <span className="section-title">Pause Details</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">From:</span>
                    <span className="detail-value">{formatDate(record.pause_from)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Meals:</span>
                    <div className="meals-list">
                      {record.pause_meals.split(',').map((meal, index) => (
                        <span key={index} className="meal-tag">
                          {getMealEmoji(meal)} {meal.charAt(0).toUpperCase() + meal.slice(1)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {record.resume_from && (
                  <div className="resume-section">
                    <div className="section-header">
                      <span className="section-icon">▶️</span>
                      <span className="section-title">Resume Details</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">From:</span>
                      <span className="detail-value">{formatDate(record.resume_from)}</span>
                    </div>
                    {record.resume_meals && (
                      <div className="detail-row">
                        <span className="detail-label">Meals:</span>
                        <div className="meals-list">
                          {record.resume_meals.split(',').map((meal, index) => (
                            <span key={index} className="meal-tag">
                              {getMealEmoji(meal)} {meal.charAt(0).toUpperCase() + meal.slice(1)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="pause-footer">
                <span className="created-at">
                  Requested: {new Date(record.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PauseStatusPage;
