import React, { useState } from 'react';

const CodeBlock = ({ code, language = '', className = '' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div 
      className={`codeblock-primitive ${className}`} 
      style={{
        position: 'relative',
        width: '100%',
        backgroundColor: 'rgba(13, 14, 18, 0.75)',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        overflow: 'hidden'
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 16px',
        backgroundColor: 'rgba(20, 22, 30, 0.8)',
        borderBottom: '1px solid var(--border)',
        fontSize: '0.75rem',
        color: 'var(--text-secondary)',
        fontFamily: 'var(--font-heading)',
        fontWeight: 500
      }}>
        <span>{language.toUpperCase() || 'CODE'}</span>
        <button 
          type="button"
          onClick={handleCopy}
          style={{
            background: 'transparent',
            border: 'none',
            color: copied ? 'var(--success)' : 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-heading)',
            fontWeight: 600
          }}
        >
          {copied ? 'Copied ✓' : 'Copy Code'}
        </button>
      </div>
      <pre style={{
        margin: 0,
        padding: '16px',
        overflowX: 'auto',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.85rem',
        lineHeight: 1.5,
        color: 'var(--text-secondary)'
      }}>
        <code>{code}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;
