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
          {getCharacterIcon(character.icon)} {character.name.split(' ')[0]}
        </div>
      )}
    </div>
  );
}
