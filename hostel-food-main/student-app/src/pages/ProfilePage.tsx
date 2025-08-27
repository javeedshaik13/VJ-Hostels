import React from 'react';
import './ProfilePage.css';

interface ProfilePageProps {
  studentInfo: any;
  onLogout: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ studentInfo, onLogout }) => {
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      onLogout();
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Profile</h1>
        <p>Your account information and settings</p>
      </div>

      {/* User Info */}
      <div className="profile-section">
        <div className="profile-avatar">
          {studentInfo?.picture ? (
            <img src={studentInfo.picture} alt="Profile" />
          ) : (
            <div className="avatar-placeholder">
              {studentInfo?.name?.charAt(0) || '👤'}
            </div>
          )}
        </div>
        
        <div className="profile-info">
          <h2>{studentInfo?.name || 'Student'}</h2>
          <p className="profile-email">{studentInfo?.email}</p>
          <p className="profile-id">Student ID: {studentInfo?.id}</p>
        </div>
      </div>

      {/* Account Settings */}
      <div className="settings-section">
        <h3>Account Settings</h3>
        
        <div className="setting-item">
          <div className="setting-icon">🔔</div>
          <div className="setting-content">
            <h4>Notifications</h4>
            <p>Manage your notification preferences</p>
          </div>
          <div className="setting-action">
            <span className="coming-soon">Coming Soon</span>
          </div>
        </div>

        <div className="setting-item">
          <div className="setting-icon">🎨</div>
          <div className="setting-content">
            <h4>Theme</h4>
            <p>Choose your app appearance</p>
          </div>
          <div className="setting-action">
            <span className="coming-soon">Coming Soon</span>
          </div>
        </div>

        <div className="setting-item">
          <div className="setting-icon">🌐</div>
          <div className="setting-content">
            <h4>Language</h4>
            <p>Select your preferred language</p>
          </div>
          <div className="setting-action">
            <span className="coming-soon">Coming Soon</span>
          </div>
        </div>
      </div>

      {/* App Info */}
      <div className="info-section">
        <h3>App Information</h3>
        
        <div className="info-item">
          <span>Version</span>
          <span>1.0.0</span>
        </div>
        
        <div className="info-item">
          <span>Last Updated</span>
          <span>19 July 2025</span>
        </div>
        
        <div className="info-item">
          <span>Hostel</span>
          <span>Food Management System</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="actions-section">
        <button className="action-btn support-btn">
          <span className="action-icon">💬</span>
          <div>
            <div className="action-title">Contact Support</div>
            <div className="action-subtitle">Get help with your account</div>
          </div>
        </button>

        <button 
          className="action-btn feedback-btn"
          onClick={() => window.open('https://forms.gle/N2LF3MbxeSugDGJa9', '_blank')}
        >
          <span className="action-icon">📝</span>
          <div>
            <div className="action-title">Send Feedback</div>
            <div className="action-subtitle">Help us improve the app</div>
          </div>
        </button>

        <button className="action-btn privacy-btn">
          <span className="action-icon">🔒</span>
          <div>
            <div className="action-title">Privacy Policy</div>
            <div className="action-subtitle">How we protect your data</div>
          </div>
        </button>
      </div>

      {/* Logout Button */}
      <div className="logout-section">
        <button className="logout-btn" onClick={handleLogout}>
          <span className="logout-icon">🚪</span>
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
