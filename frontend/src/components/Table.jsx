import React from 'react';

const Table = ({ headers, children, className = '' }) => {
  return (
    <div 
      className={`table-wrapper-primitive ${className}`} 
      style={{ 
        width: '100%', 
        overflowX: 'auto',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        backgroundColor: 'rgba(20, 22, 30, 0.4)'
      }}
    >
      <table style={{ 
        width: '100%', 
        borderCollapse: 'collapse', 
        textAlign: 'left', 
        fontSize: '0.9rem' 
      }}>
        <thead>
          <tr style={{ backgroundColor: 'rgba(20, 22, 30, 0.6)' }}>
            {headers.map((header, index) => (
              <th 
                key={index} 
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  letterSpacing: '0.05em',
                  padding: '14px 16px',
                  borderBottom: '1px solid var(--border)'
                }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {children}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
