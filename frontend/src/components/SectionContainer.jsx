import React from 'react';

const SectionContainer = ({ children, className = '' }) => {
  return (
    <div className={`section-container ${className}`} style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '40px 24px',
      width: '100%'
    }}>
      {children}
    </div>
  );
};

export default SectionContainer;
