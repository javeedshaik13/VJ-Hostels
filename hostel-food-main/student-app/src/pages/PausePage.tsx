import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_ENDPOINTS, logger } from '../config/config';
import './PausePage.css';

interface PausePageProps {
  studentInfo: any;
  onPauseUpdated?: () => void; // Add callback for when pause is updated
}

interface StudentStatus {
  pause_from?: string;
  pause_meals?: string;
  resume_from?: string;
  resume_meals?: string;
}

const PausePage: React.FC<PausePageProps> = ({ studentInfo, onPauseUpdated }) => {
  const [currentStatus, setCurrentStatus] = useState<StudentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1); // 1: Choose dates, 2: Select meals, 3: Confirm
  const [pauseType, setPauseType] = useState<'tomorrow' | 'weekend' | 'custom' | ''>('');
  const [pauseFrom, setPauseFrom] = useState('');
  const [resumeFrom, setResumeFrom] = useState('');
  const [pauseMeals, setPauseMeals] = useState<string[]>([]);
  const [resumeMeals, setResumeMeals] = useState<string[]>([]);
  const [confirmNoLastDayMeals, setConfirmNoLastDayMeals] = useState(false);
  const [confirmNoReturnDayMeals, setConfirmNoReturnDayMeals] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error' | 'info', text: string} | null>(null);
  const messageRef = useRef<HTMLDivElement>(null);

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  useEffect(() => {
    fetchCurrentStatus();
  }, [studentInfo]);

  // Clear message after 5 seconds and scroll to top when message appears
  useEffect(() => {
    if (message && messageRef.current) {
      // Scroll to the message banner to show it to the user
      messageRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
      
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchCurrentStatus = async () => {
    const studentId = studentInfo?.studentId || studentInfo?.id;
    
    if (!studentId) {
      setLoading(false);
      return;
    }
    
    try {
      logger.log('Fetching current pause status for student:', studentId);
      const response = await axios.get(`${API_ENDPOINTS.STUDENT_STATUS}?studentId=${studentId}`);
      setCurrentStatus(response.data);
      
      // Pre-fill form if there's existing pause data
      if (response.data.pause_from) {
        setPauseFrom(response.data.pause_from);
        setPauseMeals(response.data.pause_meals ? response.data.pause_meals.split(',') : []);
        setResumeFrom(response.data.resume_from || '');
        setResumeMeals(response.data.resume_meals ? response.data.resume_meals.split(',') : []);
      }
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

  const getMealLabel = (meal: string): string => {
    return meal.charAt(0).toUpperCase() + meal.slice(1);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  // Check if current time allows changes for tomorrow
  const canModifyTomorrow = (): boolean => {
    const now = new Date();
    return now.getHours() < 18; // Before 6 PM
  };

  // Check if current time allows changes for today
  const canModifyToday = (): boolean => {
    const now = new Date();
    return now.getHours() < 18; // Before 6 PM
  };

  // Get deadline message
  const getDeadlineMessage = (dateToModify: string): string | null => {
    const now = new Date();
    const currentHour = now.getHours();
    
    if (dateToModify === today && currentHour >= 18) {
      return "⚠️ Too late: Cannot modify today's meals after 6:00 PM";
    }
    
    if (dateToModify === tomorrow && currentHour >= 18) {
      return "⚠️ Deadline passed: Changes for tomorrow must be made before 6:00 PM today";
    }
    
    if (dateToModify === tomorrow && currentHour >= 16) {
      const timeLeft = 18 - currentHour;
      return `⏰ Reminder: Only ${timeLeft} hour(s) left to make changes for tomorrow (deadline: 6:00 PM)`;
    }
    
    return null;
  };

  const handlePresetSelection = (preset: 'tomorrow' | 'weekend' | 'custom') => {
    setPauseType(preset);
    
    if (preset === 'tomorrow') {
      setPauseFrom(tomorrow);
      const nextDay = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setResumeFrom(nextDay);
    } else if (preset === 'weekend') {
      // Set to next Friday evening to Sunday evening
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      let daysToFriday = (5 - dayOfWeek + 7) % 7;
      if (daysToFriday === 0) daysToFriday = 7; // If it's Friday, go to next Friday
      
      const friday = new Date(now.getTime() + daysToFriday * 24 * 60 * 60 * 1000);
      const monday = new Date(friday.getTime() + 3 * 24 * 60 * 60 * 1000);
      
      setPauseFrom(friday.toISOString().split('T')[0]);
      setResumeFrom(monday.toISOString().split('T')[0]);
    } else if (preset === 'custom') {
      setPauseFrom('');
      setResumeFrom('');
    }
    // Don't auto-advance to step 2, let user review dates first
  };

  const canEditPauseDate = () => {
    if (!currentStatus?.pause_from) return true;
    const pauseDate = new Date(currentStatus.pause_from);
    const now = new Date();
    
    // Allow editing as long as it meets the 6PM deadline requirement
    // Only restrict if trying to edit today's meals after 6PM or tomorrow's meals after 6PM yesterday
    const today = now.toISOString().slice(0, 10);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const pauseDateStr = pauseDate.toISOString().slice(0, 10);
    const currentHour = now.getHours();
    
    // If trying to edit today's meals and it's after 6 PM, don't allow
    if (pauseDateStr === today && currentHour >= 18) {
      return false;
    }
    
    // If trying to edit tomorrow's meals and it's after 6 PM today, don't allow
    if (pauseDateStr === tomorrow && currentHour >= 18) {
      return false;
    }
    
    // Otherwise, allow editing (as long as it's a future date)
    return pauseDate > now;
  };

  const canEditResumeDate = () => {
    if (!currentStatus?.resume_from) return true;
    
    const resumeDate = new Date(currentStatus.resume_from);
    const dayBeforeResume = new Date(resumeDate);
    dayBeforeResume.setDate(dayBeforeResume.getDate() - 1);
    
    const now = new Date();
    const currentHour = now.getHours();
    const today = now.toISOString().split('T')[0];
    
    // Can edit if it's before the day before resume date, or if it's the day before but before 6pm
    return today < dayBeforeResume.toISOString().split('T')[0] || 
           (today === dayBeforeResume.toISOString().split('T')[0] && currentHour < 18);
  };

  // Check if pause meals (last day meals) can be edited
  const canEditPauseMeals = () => {
    if (!pauseFrom) return true;
    
    const pauseDate = new Date(pauseFrom);
    const dayBeforePause = new Date(pauseDate);
    dayBeforePause.setDate(dayBeforePause.getDate() - 1);
    
    const now = new Date();
    const currentHour = now.getHours();
    const today = now.toISOString().split('T')[0];
    
    // Can edit if it's before the day before pause date, or if it's the day before but before 6pm
    return today < dayBeforePause.toISOString().split('T')[0] || 
           (today === dayBeforePause.toISOString().split('T')[0] && currentHour < 18);
  };

  // Check if resume meals (first day back meals) can be edited  
  const canEditResumeMeals = () => {
    if (!resumeFrom) return true;
    
    const resumeDate = new Date(resumeFrom);
    const dayBeforeResume = new Date(resumeDate);
    dayBeforeResume.setDate(dayBeforeResume.getDate() - 1);
    
    const now = new Date();
    const currentHour = now.getHours();
    const today = now.toISOString().split('T')[0];
    
    // Can edit if it's before the day before resume date, or if it's the day before but before 6pm
    return today < dayBeforeResume.toISOString().split('T')[0] || 
           (today === dayBeforeResume.toISOString().split('T')[0] && currentHour < 18);
  };

  const handleDateConfirm = () => {
    if (!pauseFrom) {
      setMessage({ type: 'error', text: 'Please select a pause date' });
      return;
    }
    
    if (!resumeFrom) {
      setMessage({ type: 'error', text: 'Please select a return date. This is required to ensure you get meals when you come back.' });
      return;
    }

    // Check deadline restrictions
    const deadlineMessage = getDeadlineMessage(pauseFrom);
    if (deadlineMessage && deadlineMessage.includes('⚠️')) {
      setMessage({ type: 'error', text: deadlineMessage.replace('⚠️ ', '') });
      return;
    }
    
    const pauseDateTime = new Date(pauseFrom);
    const resumeDateTime = new Date(resumeFrom);
    if (resumeDateTime <= pauseDateTime) {
      setMessage({ type: 'error', text: 'Resume date must be after pause date' });
      return;
    }
    
    setStep(2);
  };

  // Check if pause schedule can be deleted
  const canDeleteSchedule = () => {
    if (!currentStatus?.pause_from) return false;
    
    const pauseDate = new Date(currentStatus.pause_from);
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const pauseDateStr = pauseDate.toISOString().split('T')[0];
    const currentHour = now.getHours();
    
    // If pause has already started (pause date is today or in the past), cannot delete
    if (pauseDateStr <= today) {
      return false;
    }
    
    // If pause is from tomorrow, can only delete before 6pm today (6pm rule)
    if (pauseDateStr === tomorrow && currentHour >= 18) {
      return false;
    }
    
    // Otherwise, can delete (pause is from tomorrow and before 6pm, or pause is from future dates)
    return true;
  };

  const handleDelete = async () => {
    const studentId = studentInfo?.studentId || studentInfo?.id;
    
    if (!studentId || !currentStatus?.pause_from) return;
    
    if (!canDeleteSchedule()) {
      setMessage({ 
        type: 'error', 
        text: 'Cannot delete pause schedule. Deletion is only allowed before the pause starts and must follow the 6:00 PM deadline rule.' 
      });
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete your pause schedule? This will restore all meals.')) {
      return;
    }
    
    try {
      logger.log('Deleting pause schedule for student:', studentId);
      await axios.delete(API_ENDPOINTS.DELETE_PAUSE(studentId));
      setMessage({ type: 'success', text: 'Pause schedule deleted successfully! All meals have been restored.' });
      fetchCurrentStatus();
      setStep(1);
      setPauseType('');
      setPauseFrom('');
      setResumeFrom('');
      setPauseMeals([]);
      setResumeMeals([]);
      
      // Notify parent component to refresh
      if (onPauseUpdated) {
        onPauseUpdated();
      }
    } catch (error) {
      logger.error('Error deleting pause:', error);
      setMessage({ type: 'error', text: 'Failed to delete pause schedule. Please try again.' });
    }
  };

  const handleMealToggle = (meal: string, isLastDay: boolean) => {
    if (isLastDay) {
      if (pauseMeals.includes(meal)) {
        setPauseMeals(pauseMeals.filter(m => m !== meal));
      } else {
        setPauseMeals([...pauseMeals, meal]);
        // Reset confirmation if user selects a meal
        setConfirmNoLastDayMeals(false);
      }
    } else {
      if (resumeMeals.includes(meal)) {
        setResumeMeals(resumeMeals.filter(m => m !== meal));
      } else {
        setResumeMeals([...resumeMeals, meal]);
        // Reset confirmation if user selects a meal
        setConfirmNoReturnDayMeals(false);
      }
    }
  };

  const handleMealSelectionNext = () => {
    // Check if no meals selected for last day
    if (pauseMeals.length === 0 && !confirmNoLastDayMeals) {
      setMessage({ type: 'info', text: 'You have not selected any meals for your last day. If this is intentional, please check the confirmation box below.' });
      return;
    }
    
    // Check if no meals selected for return day
    if (resumeFrom && resumeMeals.length === 0 && !confirmNoReturnDayMeals) {
      setMessage({ type: 'info', text: 'You have not selected any meals for your return day. If this is intentional, please check the confirmation box below.' });
      return;
    }
    
    setStep(3);
  };

  const handleSubmit = async () => {
    console.log('[PausePage] handleSubmit called');
    console.log('[PausePage] studentInfo:', studentInfo);
    console.log('[PausePage] studentInfo?.id:', studentInfo?.id);
    console.log('[PausePage] studentInfo?.studentId:', studentInfo?.studentId);
    
    const studentId = studentInfo?.studentId || studentInfo?.id;
    
    if (!studentId) {
      console.log('[PausePage] No studentId or id, returning early');
      setMessage({ type: 'error', text: 'Student information not available. Please try refreshing the page.' });
      return;
    }
    
    try {
      console.log('[PausePage] Submitting pause schedule for studentId:', studentId);
      logger.log('Submitting pause schedule for student:', studentId);
      await axios.post(API_ENDPOINTS.PAUSE_FOOD, {
        studentId: studentId,
        pause_from: pauseFrom,
        pause_meals: pauseMeals.join(','),
        resume_from: resumeFrom,
        resume_meals: resumeMeals.join(','),
      });
      
      setMessage({ type: 'success', text: 'Food schedule updated successfully!' });
      fetchCurrentStatus(); // Refresh current page
      setStep(1); // Reset form
      
      // Notify parent component to refresh
      if (onPauseUpdated) {
        onPauseUpdated();
      }
    } catch (error) {
      logger.error('Error updating pause:', error);
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        setMessage({ type: 'error', text: error.response.data.error });
      } else {
        setMessage({ type: 'error', text: 'Failed to update food schedule. Please try again.' });
      }
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Pause Food Service</h1>
        <p>Manage your meal schedule when you're away</p>
      </div>

      {/* Message Display */}
      {message && (
        <div ref={messageRef} className={`message-banner ${message.type}`}>
          <span className="message-icon">
            {message.type === 'success' && '✅'}
            {message.type === 'error' && '❌'}
            {message.type === 'info' && 'ℹ️'}
          </span>
          <span className="message-text">{message.text}</span>
          <button 
            className="message-close" 
            onClick={() => setMessage(null)}
            aria-label="Close message"
          >
            ×
          </button>
        </div>
      )}

      {/* Deadline Notice */}
      <div className="deadline-notice">
        <div className="notice-header">
          <span className="notice-icon">⏰</span>
          <strong>Important Deadline</strong>
        </div>
        <p>
          Changes for tomorrow's meals must be made before <strong>6:00 PM today</strong>. 
          Current time: <strong>{new Date().toLocaleTimeString('en-US', { hour12: true })}</strong>
        </p>
        {!canModifyTomorrow() && (
          <div className="deadline-expired">
            ⚠️ Deadline has passed for tomorrow's meals. You can still schedule for future dates.
          </div>
        )}
      </div>

      {/* Current Status */}
      {currentStatus?.pause_from && (
        <div className="current-status">
          <h3>Current Schedule</h3>
          <div className="status-item">
            <span>Pause from:</span>
            <span>{formatDate(currentStatus.pause_from)}</span>
          </div>
          {currentStatus.pause_meals && (
            <div className="status-item">
              <span>Last day meals:</span>
              <div className="meal-icons">
                {currentStatus.pause_meals.split(',').map(meal => (
                  <span key={meal} className="meal-badge">
                    {getMealIcon(meal)} {getMealLabel(meal)}
                  </span>
                ))}
              </div>
            </div>
          )}
          {currentStatus.resume_from && (
            <>
              <div className="status-item">
                <span>Resume from:</span>
                <span>{formatDate(currentStatus.resume_from)}</span>
              </div>
              {currentStatus.resume_meals && (
                <div className="status-item">
                  <span>Return day meals:</span>
                  <div className="meal-icons">
                    {currentStatus.resume_meals.split(',').map(meal => (
                      <span key={meal} className="meal-badge">
                        {getMealIcon(meal)} {getMealLabel(meal)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
          <div className="status-actions">
            <button 
              className={`btn-danger ${!canDeleteSchedule() ? 'disabled' : ''}`}
              onClick={handleDelete}
              disabled={!canDeleteSchedule()}
              title={canDeleteSchedule() ? "Delete this pause schedule" : "Cannot delete - pause has started or deadline passed"}
            >
              🗑️ Delete Schedule
            </button>
            {!canDeleteSchedule() && (
              <p className="field-warning">⚠️ Cannot delete schedule</p>
            )}
          </div>
        </div>
      )}

      {/* Step 1: Choose Dates */}
      {step === 1 && (
        <div className="step-content">
          {/* Show different header based on whether editing existing schedule */}
          {currentStatus?.pause_from ? (
            <div className="step-header">
              <h2>Edit Schedule</h2>
              <p>Modify your pause schedule dates</p>
            </div>
          ) : (
            <div className="step-header">
              <h2>When do you want to pause?</h2>
              <p>Choose from presets or set custom dates</p>
            </div>
          )}

          {/* Only show preset options if no existing schedule */}
          {!currentStatus?.pause_from && (
            <div className="preset-options">
              {/* Tomorrow option with deadline warning */}
              <button 
                className={`preset-btn ${pauseType === 'tomorrow' ? 'active' : ''} ${!canModifyTomorrow() ? 'disabled' : ''}`}
                onClick={() => canModifyTomorrow() && handlePresetSelection('tomorrow')}
                disabled={!canModifyTomorrow()}
              >
                <div className="preset-icon">🌅</div>
                <div className="preset-text">
                  <strong>Tomorrow</strong>
                  <span>Single day pause</span>
                  {!canModifyTomorrow() && (
                    <span className="deadline-warning">⚠️ Deadline passed (6 PM)</span>
                  )}
                  {canModifyTomorrow() && getDeadlineMessage(tomorrow) && (
                    <span className="deadline-reminder">{getDeadlineMessage(tomorrow)?.replace('⏰ Reminder: ', '⏰ ')}</span>
                  )}
                </div>
              </button>

              <button 
                className={`preset-btn ${pauseType === 'weekend' ? 'active' : ''}`}
                onClick={() => handlePresetSelection('weekend')}
              >
                <div className="preset-icon">🏖️</div>
                <div className="preset-text">
                  <strong>Weekend</strong>
                  <span>Friday to Monday</span>
                </div>
              </button>

              <button 
                className={`preset-btn ${pauseType === 'custom' ? 'active' : ''}`}
                onClick={() => handlePresetSelection('custom')}
              >
                <div className="preset-icon">🗓️</div>
                <div className="preset-text">
                  <strong>Custom</strong>
                  <span>Choose your dates</span>
                </div>
              </button>
            </div>
          )}

          {/* Date Selection Area - show if preset selected OR editing existing schedule */}
          {(pauseType || currentStatus?.pause_from) && (
            <div className="date-selection">
              <div className="form-group">
                <label htmlFor="pause-date">Pause from: <span className="required">*</span></label>
                <input
                  id="pause-date"
                  type="date"
                  value={pauseFrom}
                  onChange={e => setPauseFrom(e.target.value)}
                  min={tomorrow}
                  disabled={!canEditPauseDate()}
                  required
                />
                {!canEditPauseDate() && (
                  <p className="field-warning">⚠️ Cannot edit start date after 6:00 PM deadline</p>
                )}
                {currentStatus?.pause_from && !canEditPauseDate() && (
                  <p className="field-help">Start date cannot be modified. </p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="resume-date">Return date: <span className="required">*</span></label>
                <input
                  id="resume-date"
                  type="date"
                  value={resumeFrom}
                  onChange={e => setResumeFrom(e.target.value)}
                  min={pauseFrom || tomorrow}
                  disabled={!canEditResumeDate()}
                  required
                />
                {!canEditResumeDate() && (
                  <p className="field-warning">⚠️ Return date can only be edited before pause starts</p>
                )}
                <p className="field-help">Return date is required to ensure you get meals when you come back</p>
              </div>

              {pauseFrom && resumeFrom && (
                <div className="preset-summary">
                  <div className="summary-item">
                    <span>Pause from:</span>
                    <span>{formatDate(pauseFrom)}</span>
                  </div>
                  <div className="summary-item">
                    <span>Return on:</span>
                    <span>{formatDate(resumeFrom)}</span>
                  </div>
                  
                  <button 
                    className="btn-primary"
                    onClick={handleDateConfirm}
                  >
                    Continue to Meal Selection
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Select Meals */}
      {step === 2 && (
        <div className="step-content">
          <div className="step-header">
            <h2>Select your meals</h2>
            <p>Choose which meals you want on your last and first days</p>
          </div>

          <div className="meal-selection">
            {/* Last Day Meals */}
            <div className="meal-day">
              <h3>🗓️ Last day ({formatDate(pauseFrom)})</h3>
              <p>Which meals do you want before leaving?</p>
              {!canEditPauseMeals() && (
                <div className="meal-warning">
                  <p className="field-warning">⚠️ Cannot edit last day meals after 6:00 PM deadline</p>
                  <p className="field-help">Last day meal selection cannot be modified as it violates the 6:00 PM deadline rule</p>
                </div>
              )}
              <div className="meal-grid">
                {['breakfast', 'lunch', 'snacks', 'dinner'].map(meal => (
                  <button
                    key={meal}
                    className={`meal-option ${pauseMeals.includes(meal) ? 'selected' : ''} ${!canEditPauseMeals() ? 'disabled' : ''}`}
                    onClick={() => canEditPauseMeals() && handleMealToggle(meal, true)}
                    disabled={!canEditPauseMeals()}
                  >
                    <div className="meal-icon">{getMealIcon(meal)}</div>
                    <div className="meal-name">{getMealLabel(meal)}</div>
                    {pauseMeals.includes(meal) && <div className="meal-check">✓</div>}
                  </button>
                ))}
              </div>
              
              {/* No meals confirmation for last day */}
              {pauseMeals.length === 0 && (
                <div className="no-meals-warning">
                  <label className="warning-checkbox">
                    <input
                      type="checkbox"
                      checked={confirmNoLastDayMeals}
                      onChange={e => setConfirmNoLastDayMeals(e.target.checked)}
                    />
                    <span className="checkmark"></span>
                    <span className="warning-text">
                      ⚠️ I confirm that I don't want any meals on my last day before leaving
                    </span>
                  </label>
                </div>
              )}
            </div>

            {/* Return Day Meals */}
            <div className="meal-day">
              <h3>🎉 Return day ({formatDate(resumeFrom)})</h3>
              <p>Which meals do you want on your first day back?</p>
              {!canEditResumeMeals() && (
                <div className="meal-warning">
                  <p className="field-warning">⚠️ Cannot edit return day meals after 6:00 PM deadline</p>
                  <p className="field-help">Return day meal selection cannot be modified as it violates the 6:00 PM deadline rule</p>
                </div>
              )}
              <div className="meal-grid">
                {['breakfast', 'lunch', 'snacks', 'dinner'].map(meal => (
                  <button
                    key={meal}
                    className={`meal-option ${resumeMeals.includes(meal) ? 'selected' : ''} ${!canEditResumeMeals() ? 'disabled' : ''}`}
                    onClick={() => canEditResumeMeals() && handleMealToggle(meal, false)}
                    disabled={!canEditResumeMeals()}
                  >
                    <div className="meal-icon">{getMealIcon(meal)}</div>
                    <div className="meal-name">{getMealLabel(meal)}</div>
                    {resumeMeals.includes(meal) && <div className="meal-check">✓</div>}
                  </button>
                ))}
              </div>
              
              {/* No meals confirmation for return day */}
              {resumeMeals.length === 0 && (
                <div className="no-meals-warning">
                  <label className="warning-checkbox">
                    <input
                      type="checkbox"
                      checked={confirmNoReturnDayMeals}
                      onChange={e => setConfirmNoReturnDayMeals(e.target.checked)}
                    />
                    <span className="checkmark"></span>
                    <span className="warning-text">
                      ⚠️ I confirm that I don't want any meals on my return day
                    </span>
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="step-actions">
            <button className="btn-secondary" onClick={() => setStep(1)}>
              Back to Dates
            </button>
            <button className="btn-primary" onClick={handleMealSelectionNext}>
              Review & Confirm
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && (
        <div className="step-content">
          <div className="step-header">
            <h2>Review your schedule</h2>
            <p>Please confirm the details below</p>
          </div>

          <div className="confirmation-details">
            <div className="detail-section">
              <h3>📅 Pause Period</h3>
              <p><strong>From:</strong> {formatDate(pauseFrom)}</p>
              <p><strong>Until:</strong> {formatDate(resumeFrom)}</p>
            </div>

            <div className="detail-section">
              <h3>🍽️ Meal Selection</h3>
              <div className="meal-summary">
                <div>
                  <strong>Last day meals ({formatDate(pauseFrom)}):</strong>
                  <div className="meal-icons">
                    {pauseMeals.length > 0 ? (
                      pauseMeals.map(meal => (
                        <span key={meal} className="meal-badge">
                          {getMealIcon(meal)} {getMealLabel(meal)}
                        </span>
                      ))
                    ) : (
                      <span className="no-meals">No meals selected</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <strong>Return day meals ({formatDate(resumeFrom)}):</strong>
                  <div className="meal-icons">
                    {resumeMeals.length > 0 ? (
                      resumeMeals.map(meal => (
                        <span key={meal} className="meal-badge">
                          {getMealIcon(meal)} {getMealLabel(meal)}
                        </span>
                      ))
                    ) : (
                      <span className="no-meals">No meals selected</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="step-actions">
            <button className="btn-secondary" onClick={() => setStep(2)}>
              Back to Meals
            </button>
            <button 
              className="btn-primary" 
              onClick={(e) => {
                console.log('[PausePage] Button clicked', e);
                handleSubmit();
              }}
            >
              {currentStatus?.pause_from ? 'Update Schedule' : 'Confirm Pause'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PausePage;
