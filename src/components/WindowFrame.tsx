import { useState, useRef, useEffect } from 'react';
import { WindowState } from '../types';
import './WindowFrame.css';

interface WindowFrameProps {
  window: WindowState;
  children: React.ReactNode;
  onUpdate: (updates: Partial<WindowState>) => void;
  onFocus: () => void;
}

export default function WindowFrame({ window, children, onUpdate, onFocus }: WindowFrameProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const windowRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLElement && e.target.closest('.window-resize-handle')) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - window.x,
      y: e.clientY - window.y
    });
    onFocus();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        onUpdate({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragOffset, onUpdate]);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    onFocus();
  };

  const handleMinimize = () => {
    onUpdate({ minimized: !window.minimized });
  };

  if (window.minimized) {
    return (
      <div
        className="window-frame minimized"
        style={{
          left: window.x,
          top: window.y,
          zIndex: window.zIndex
        }}
        onClick={onFocus}
      >
        <div className="window-title-bar">
          <span>{window.type}</span>
          <button onClick={handleMinimize}>□</button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={windowRef}
      className="window-frame"
      style={{
        left: window.x,
        top: window.y,
        width: window.width,
        height: window.height,
        zIndex: window.zIndex
      }}
      onClick={onFocus}
    >
      <div
        className="window-title-bar"
        onMouseDown={handleMouseDown}
      >
        <span className="window-title">{window.type}</span>
        <div className="window-controls">
          <button onClick={handleMinimize}>−</button>
        </div>
      </div>
      <div className="window-content">
        {children}
      </div>
      <div
        className="window-resize-handle"
        onMouseDown={handleResizeStart}
      />
    </div>
  );
}
