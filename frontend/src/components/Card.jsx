import React, { useState } from 'react';

const Card = ({ 
  title, 
  children, 
  className = '', 
  collapsible = false, 
  defaultCollapsed = false,
  headerAction,
  severity = null
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const getSeverityStyle = () => {
    if (!severity) return {};
    const colorMap = {
      critical: 'var(--error)',
      high: 'var(--error)',
      medium: 'var(--warning)',
      low: 'var(--success)',
      safe: 'var(--success)'
    };
    const color = colorMap[severity.toLowerCase()] || 'var(--border)';
    return { borderLeft: `4px solid ${color}` };
  };

  return (
    <div 
      className={`card-primitive ${className}`} 
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '24px',
        marginBottom: '20px',
        transition: 'border-color 0.15s ease',
        ...getSeverityStyle()
      }}
    >
      {(title || headerAction || collapsible) && (
        <div 
          className="card-header" 
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: collapsed ? '0' : '16px',
            borderBottom: collapsed ? 'none' : '1px solid var(--border)',
            paddingBottom: collapsed ? '0' : '12px',
            cursor: collapsible ? 'pointer' : 'default'
          }}
          onClick={collapsible ? () => setCollapsed(!collapsed) : undefined}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {collapsible && (
              <span style={{ 
                fontFamily: 'monospace', 
                fontSize: '0.85rem', 
                color: 'var(--text-secondary)',
                userSelect: 'none'
              }}>
                {collapsed ? '[+]' : '[-]'}
              </span>
            )}
            <h3 style={{ 
              fontSize: '1.1rem', 
              fontWeight: 700, 
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-heading)'
            }}>
              {title}
            </h3>
          </div>
          {headerAction && <div onClick={(e) => e.stopPropagation()}>{headerAction}</div>}
        </div>
      )}
      {!collapsed && <div className="card-content">{children}</div>}
    </div>
  );
};

export default Card;
