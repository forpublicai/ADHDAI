import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  message?: string;
  fullPage?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading...', 
  fullPage = true 
}) => {
  return (
    <div className={`loading-spinner-container ${fullPage ? 'full-page' : ''}`}>
      <div className="loading-content">
        <div className="spinner-wrapper">
          <div className="spinner-ring"></div>
          <div className="spinner-ring delay-1"></div>
          <div className="spinner-ring delay-2"></div>
        </div>
        <div className="loading-text">
          <span className="loading-brand">ADHDAI</span>
          <span className="loading-message">{message}</span>
        </div>
        <div className="loading-dots">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      </div>
    </div>
  );
};

export default React.memo(LoadingSpinner);
