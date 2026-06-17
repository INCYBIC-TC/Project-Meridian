import React from 'react';

const Loader = ({ fullPage = false, message = 'Loading...' }) => {
  return (
    <div className={`loader-container ${fullPage ? 'full-page' : ''}`}>
      <div className="loader-card">
        <div className="spinner"></div>
        {message && <p className="loader-text">{message}</p>}
      </div>
    </div>
  );
};

export default Loader;
