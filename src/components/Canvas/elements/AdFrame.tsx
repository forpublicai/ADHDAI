import { useState, useEffect, useRef } from 'react';
import { Character } from '../../../types';
import './CanvasElements.css';

interface Position {
  x: number;
  y: number;
}

interface AdFrameProps {
  id: string;
  position: Position;
  htmlContent: string;
  character?: Character;
  width?: number;
  height?: number;
  highlighted?: boolean;
}

export default function AdFrame({
  id,
  position,
  htmlContent,
  character,
  width = 600,
  height = 400,
  highlighted = false
}: AdFrameProps) {
  const [visible, setVisible] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Animate in
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  // Update iframe content when htmlContent changes
  useEffect(() => {
    if (iframeRef.current && htmlContent) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();
      }
    }
  }, [htmlContent]);

  return (
    <div
      className={`canvas-element ad-frame ${visible ? 'visible' : ''} ${highlighted ? 'highlighted' : ''}`}
      style={{
        left: position.x,
        top: position.y,
        width: width,
        height: height + 60 // account for header/footer
      }}
      data-id={id}
    >
      <div className="ad-frame-header">
        <span className="ad-frame-title">Final Advertisement</span>
        <span className="ad-frame-dimensions">{width}×{height}</span>
      </div>

      <div className="ad-frame-content" style={{ height }}>
        {htmlContent ? (
          <iframe
            ref={iframeRef}
            title="Ad Preview"
            className="ad-frame-iframe"
            sandbox="allow-same-origin"
          />
        ) : (
          <div className="ad-frame-placeholder">
            <span>Awaiting content...</span>
          </div>
        )}
      </div>

      <div className="ad-frame-footer">
        {character && (
          <span className="ad-frame-author">
            {character.emoji} {character.name}
          </span>
        )}
        <span className="ad-frame-status">
          {htmlContent ? 'Ready' : 'Assembling...'}
        </span>
      </div>
    </div>
  );
}
