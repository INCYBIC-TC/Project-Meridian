import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/navbar.css';

const Navbar = () => {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!token) return null;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <NavLink to="/dashboard" className="navbar-logo">
          <div className="navbar-logo-icon">M</div>
          <span>Meridian</span>
        </NavLink>

        <ul className="navbar-links">
          <li>
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}
            >
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/scan" 
              className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}
            >
              New Scan
            </NavLink>
          </li>
        </ul>

        {user && (
          <div className="navbar-user">
            <span className="user-badge" title={user.email}>
              {user.email.split('@')[0]} ({user.role})
            </span>
            <button onClick={handleLogout} className="btn-logout">
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
