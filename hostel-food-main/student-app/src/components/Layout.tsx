import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  studentInfo: any;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, studentInfo, onLogout }) => {
  const location = useLocation();

  const navItems = [
    { path: '/home', icon: '🏠', label: 'Home' },
    { path: '/schedule', icon: '📅', label: 'Schedule' },
    { path: '/pause', icon: '⏸️', label: 'Pause' },
    { path: '/profile', icon: '👤', label: 'Profile' },
    { path: '/help', icon: '❓', label: 'Help' },
  ];

  return (
    <div className="layout">
      <main className="main-content">
        {children}
      </main>
      
      <nav className="bottom-nav">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <div className="nav-icon">{item.icon}</div>
            <div className="nav-label">{item.label}</div>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
