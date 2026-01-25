import { useState, useEffect } from 'react';
import { Character } from '../../../types';
import './CanvasElements.css';

interface Position {
  x: number;
  y: number;
}

interface TextBlockProps {
  id: string;
  position: Position;
  content: string;
  character?: Character;
  width?: number;
  highlighted?: boolean;
}

export default function TextBlock({
  id,
  position,
  content,
  character,
  width = 300,
  highlighted = false
}: TextBlockProps) {
  const [visible, setVisible] = useState(false);

  // Animate in
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  return (
    <div
      className={`canvas-element text-block ${visible ? 'visible' : ''} ${highlighted ? 'highlighted' : ''}`}
      style={{
        left: position.x,
        top: position.y,
        width: width,
        borderLeftColor: character?.color || '#000'
      }}
      data-id={id}
    >
      <div className="text-block-content">
        <pre className="text-block-text">
          {content}
          <span className="typing-cursor">|</span>
        </pre>
      </div>
      
      {character && (
        <div className="text-block-author" style={{ color: character.color }}>
          {character.emoji} {character.name.split(' ')[0]}
        </div>
      )}
    </div>
  );
}
