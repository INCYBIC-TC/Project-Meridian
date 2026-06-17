import React from 'react';

const Tabs = ({ tabs, activeTab, onChange, className = '' }) => {
  return (
    <div 
      className={`tabs-primitive ${className}`} 
      style={{
        display: 'flex',
        borderBottom: '1px solid var(--border)',
        gap: '4px',
        marginBottom: '28px',
        overflowX: 'auto',
        width: '100%'
      }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          style={{
            background: 'transparent',
            border: 'none',
            fontFamily: 'var(--font-heading)',
            color: activeTab === tab.id ? 'var(--primary-hover)' : 'var(--text-secondary)',
            fontSize: '0.9rem',
            fontWeight: 600,
            padding: '12px 18px',
            cursor: 'pointer',
            transition: 'color 0.15s ease',
            position: 'relative',
            whiteSpace: 'nowrap',
            outline: 'none'
          }}
        >
          {tab.label}
          {activeTab === tab.id && (
            <div style={{
              position: 'absolute',
              bottom: '-1px',
              left: 0,
              width: '100%',
              height: '2px',
              backgroundColor: 'var(--primary)'
            }} />
          )}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
