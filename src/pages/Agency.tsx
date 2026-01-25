import { useState, useCallback } from 'react';
import CanvasWorkspace from '../components/Canvas/CanvasWorkspace';
import { Link } from 'react-router-dom';
import { INITIAL_BRIEF } from '../constants';
import '../App.css';

export default function Agency() {
  const [briefInput, setBriefInput] = useState(INITIAL_BRIEF);

  const handleCanvasComplete = useCallback(() => {
    console.log('Canvas workflow complete');
  }, []);

  return (
    <div className="app">
      <div style={{ position: 'fixed', top: 24, left: 40, zIndex: 1000 }}>
        <Link to="/" style={{ 
          padding: '0', 
          background: 'transparent', 
          borderRadius: '0', 
          textDecoration: 'none', 
          color: '#000000',
          fontWeight: 400,
          fontSize: '16px',
          letterSpacing: '0.01em',
          boxShadow: 'none',
          transition: 'opacity 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.6'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          ← Back to Home
        </Link>
      </div>
      
      <div style={{ 
        position: 'fixed', 
        top: 60, 
        left: 0, 
        right: 0, 
        bottom: 0,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Brief Input */}
        <div style={{
          padding: '16px 24px',
          background: '#fafafa',
          borderBottom: '1px solid #ddd',
          display: 'flex',
          gap: '16px',
          alignItems: 'center'
        }}>
          <label style={{ 
            fontFamily: "'JetBrains Mono', monospace", 
            fontSize: '12px',
            color: '#666'
          }}>
            Brief:
          </label>
          <input
            type="text"
            value={briefInput}
            onChange={(e) => setBriefInput(e.target.value)}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px'
            }}
            placeholder="Enter your creative brief..."
          />
        </div>
        
        {/* Canvas Workspace */}
        <div style={{ flex: 1 }}>
          <CanvasWorkspace
            brief={briefInput}
            generatedAd={'<div style="padding: 40px; text-align: center; color: #888;">Ad will appear here...</div>'}
            onComplete={handleCanvasComplete}
          />
        </div>
      </div>
    </div>
  );
}
