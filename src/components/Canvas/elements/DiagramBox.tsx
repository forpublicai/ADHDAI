import { useState, useEffect } from 'react';
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
            <div className="node-connector">↓</div>
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
            {character.emoji} {character.name}
          </span>
        )}
      </div>

      <div className="diagram-content">
        {renderDiagram()}
      </div>
    </div>
  );
}
