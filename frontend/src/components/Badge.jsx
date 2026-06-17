import React from 'react';

const Badge = ({ children, status = 'info', className = '' }) => {
  const getBadgeStyle = () => {
    const s = status.toLowerCase();
    
    // Map status/severity to HSL colors & transparency
    let color = 'var(--text-secondary)';
    let bg = 'rgba(156, 163, 175, 0.08)';
    let border = 'rgba(156, 163, 175, 0.2)';

    if (['critical', 'high', 'failed', 'error'].includes(s)) {
      color = 'var(--error)';
      bg = 'var(--error-glow)';
      border = 'rgba(239, 68, 68, 0.2)';
    } else if (['medium', 'warning', 'pending'].includes(s)) {
      color = 'var(--warning)';
      bg = 'var(--warning-glow)';
      border = 'rgba(245, 158, 11, 0.2)';
    } else if (['low', 'safe', 'success', 'completed'].includes(s)) {
      color = 'var(--success)';
      bg = 'var(--success-glow)';
      border = 'rgba(16, 185, 129, 0.2)';
    } else if (['info', 'parsing', 'scanning', 'analyzing'].includes(s)) {
      color = 'var(--primary-hover)';
      bg = 'var(--primary-glow)';
      border = 'rgba(139, 92, 246, 0.2)';
    }

    return {
      color,
      backgroundColor: bg,
      border: `1px solid ${border}`,
      padding: '4px 10px',
      borderRadius: '16px',
      fontSize: '0.75rem',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.02em',
      display: 'inline-flex',
      alignItems: 'center',
      fontFamily: 'var(--font-heading)',
      height: 'fit-content'
    };
  };

  return (
    <span className={`badge-primitive ${className}`} style={getBadgeStyle()}>
      {children}
    </span>
  );
};

export default Badge;
