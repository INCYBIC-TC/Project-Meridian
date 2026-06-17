import React from 'react';

const StatBox = ({ label, value, color = 'var(--text-primary)', className = '' }) => {
  return (
    <div 
      className={`stat-box ${className}`} 
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        flex: 1
      }}
    >
      <span style={{
        fontFamily: 'var(--font-heading)',
        fontSize: '0.75rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: 'var(--text-secondary)'
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: 'var(--font-heading)',
        fontSize: '2.2rem',
        fontWeight: 800,
        color: color,
        lineHeight: 1.1
      }}>
        {value}
      </span>
    </div>
  );
};

export default StatBox;
