import { useState, useEffect } from 'react';
import {
  ClipboardText,
  Graph,
  PencilSimple,
  Palette,
  CalendarBlank,
  FileText,
  Gear
} from '@phosphor-icons/react';
import { Character, CharacterId } from '../../../types';
import './CanvasElements.css';

interface Position {
  x: number;
  y: number;
}

interface StickyNoteProps {
  id: string;
  position: Position;
  content: string;
  character?: Character;
  color?: string;
  width?: number;
  highlighted?: boolean;
  votes?: CharacterId[];
}

// Get icon component for character
const getCharacterIcon = (icon: string, size: number = 12) => {
  const iconProps = { size, weight: 'bold' as const };
  const icons: Record<string, React.ReactNode> = {
    clipboard: <ClipboardText {...iconProps} />,
    graph: <Graph {...iconProps} />,
    pencil: <PencilSimple {...iconProps} />,
    palette: <Palette {...iconProps} />,
    calendar: <CalendarBlank {...iconProps} />,
    file: <FileText {...iconProps} />,
    gear: <Gear {...iconProps} />,
  };
  return icons[icon] || <Gear {...iconProps} />;
};

export default function StickyNote({
  id,
  position,
  content,
  character,
  color,
  width = 200,
  highlighted = false,
  votes = []
}: StickyNoteProps) {
  const [visible, setVisible] = useState(false);

  const noteColor = color || character?.color || '#FFE066';
  
  // Animate in
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  return (
    <div
      className={`canvas-element sticky-note ${visible ? 'visible' : ''} ${highlighted ? 'highlighted' : ''}`}
      style={{
        left: position.x,
        top: position.y,
        width: width,
        backgroundColor: noteColor,
        '--note-shadow': `${noteColor}66`
      } as React.CSSProperties}
      data-id={id}
    >
      <div className="sticky-note-content">
        <p className="sticky-note-text">
          {content}
          <span className="typing-cursor">|</span>
        </p>
      </div>
      
      {character && (
        <div className="sticky-note-author">
          <span className="author-icon">{getCharacterIcon(character.icon)}</span>
          <span className="author-name">{character.name.split(' ')[0]}</span>
        </div>
      )}

      {votes.length > 0 && (
        <div className="sticky-note-votes">
          {votes.length} vote{votes.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Corner fold effect */}
      <div className="sticky-note-fold" />
    </div>
  );
}
