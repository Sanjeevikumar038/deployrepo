import React from 'react';

const Breadcrumbs = ({ items }) => {
  return (
    <nav style={{
      padding: '1rem 0',
      fontSize: '0.875rem',
      color: '#6b7280'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <span style={{ color: '#d1d5db' }}>›</span>
            )}
            {item.link ? (
              <button
                onClick={item.onClick}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#3b82f6',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontSize: '0.875rem'
                }}
              >
                {item.label}
              </button>
            ) : (
              <span style={{ 
                color: index === items.length - 1 ? '#1f2937' : '#6b7280',
                fontWeight: index === items.length - 1 ? '500' : '400'
              }}>
                {item.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
    </nav>
  );
};

export default Breadcrumbs;