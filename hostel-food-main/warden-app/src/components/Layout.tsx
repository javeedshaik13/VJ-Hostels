import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  wardenInfo: any;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, wardenInfo, onLogout }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/food-count', label: 'Food Count' },
    { path: '/students', label: 'Students' },
    { path: '/pause-status', label: 'Pause Status' },
    { path: '/contact-support', label: 'Contact Support' },
  ];

  const handleLogout = () => {
    setShowDropdown(false);
    onLogout();
  };

  return (
    <div className="layout">
      <nav className="top-nav">
        <div className="nav-left">
          <h1>🏠 Hostel Food Management</h1>
        </div>
        
        <div className="nav-links">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={location.pathname === item.path ? 'active' : ''}
            >
              {item.label}
            </Link>
          ))}
        </div>
        
        <div className="nav-right">
          <div className="user-dropdown">
            <button
              className="user-button"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              {wardenInfo?.name || 'Warden'} ▼
            </button>
            
            <div className={`dropdown-menu ${showDropdown ? '' : 'hidden'}`}>
              <div className="user-info">
                <strong>{wardenInfo?.name || 'Warden'}</strong>
              </div>
              <button className="logout-button" onClick={handleLogout}>
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
