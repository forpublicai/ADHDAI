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

type DiagramType = 'framework' | 'flowchart' | 'mindmap' | 'matrix';

interface DiagramBoxProps {
  id: string;
  position: Position;
  content: string;
  character?: Character;
  diagramType?: DiagramType;
  width?: number;
  height?: number;
}

// Get icon component for character
const getCharacterIcon = (icon: string, size: number = 14) => {
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

export default function DiagramBox({
  id,
  position,
  content,
  character,
  diagramType = 'framework',
  width = 400,
  height
}: DiagramBoxProps) {
  const [visible, setVisible] = useState(false);

  const borderColor = character?.color || '#F5DEB3';
  
  // Animate in
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  // Parse content into title and items
  const lines = content.split('\n').filter(line => line.trim());
  const title = lines[0] || 'Untitled';
  const items = lines.slice(1);

  const renderFramework = () => (
    <div className="diagram-framework">
      {items.map((item, index) => (
        <div key={index} className="framework-step">
          <div className="step-content">
            <span className="step-label">{item}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderFlowchart = () => (
    <div className="diagram-flowchart">
      {items.map((item, index) => (
        <div key={index} className="flowchart-node">
          <div className="node-box">{item}</div>
          {index < items.length - 1 && (
            <div className="node-connector">
              <svg width="12" height="16" viewBox="0 0 12 16">
                <path d="M6 0 L6 12 M2 8 L6 12 L10 8" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              </svg>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderDiagram = () => {
    switch (diagramType) {
      case 'flowchart':
        return renderFlowchart();
      default:
        return renderFramework();
    }
  };

  return (
    <div
      className={`canvas-element diagram-box ${diagramType} ${visible ? 'visible' : ''}`}
      style={{
        left: position.x,
        top: position.y,
        width: width,
        height: height || 'auto',
        borderColor: borderColor
      }}
      data-id={id}
    >
      <div className="diagram-header" style={{ borderBottomColor: borderColor }}>
        <h3 className="diagram-title">{title}</h3>
        {character && (
          <span className="diagram-author" style={{ color: character.color }}>
            {getCharacterIcon(character.icon)} {character.name}
          </span>
        )}
      </div>

      <div className="diagram-content">
        {renderDiagram()}
      </div>
    </div>
  );
}
