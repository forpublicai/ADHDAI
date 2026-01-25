import { useState, useEffect } from 'react';
import './CanvasElements.css';

interface Position {
  x: number;
  y: number;
}

interface ArrowProps {
  id: string;
  from: Position;
  to: Position;
  color?: string;
  label?: string;
  dashed?: boolean;
  animated?: boolean;
}

export default function Arrow({
  id,
  from,
  to,
  color = '#666',
  label,
  dashed = false,
  animated = false
}: ArrowProps) {
  const [visible, setVisible] = useState(false);

  // Animate in
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  // Calculate arrow geometry
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  // Arrow head size
  const headSize = 10;

  // Calculate SVG dimensions
  const padding = 20;
  const svgWidth = Math.abs(dx) + padding * 2;
  const svgHeight = Math.abs(dy) + padding * 2;
  
  // Calculate start and end points within SVG
  const startX = dx >= 0 ? padding : svgWidth - padding;
  const startY = dy >= 0 ? padding : svgHeight - padding;
  const endX = dx >= 0 ? svgWidth - padding : padding;
  const endY = dy >= 0 ? svgHeight - padding : padding;

  // Label position (middle of arrow)
  const labelX = (startX + endX) / 2;
  const labelY = (startY + endY) / 2;

  return (
    <div
      className={`canvas-element arrow ${visible ? 'visible' : ''} ${animated ? 'animated' : ''}`}
      style={{
        left: Math.min(from.x, to.x) - padding,
        top: Math.min(from.y, to.y) - padding,
        width: svgWidth,
        height: svgHeight
      }}
      data-id={id}
    >
      <svg
        width={svgWidth}
        height={svgHeight}
        className="arrow-svg"
      >
        <defs>
          <marker
            id={`arrowhead-${id}`}
            markerWidth={headSize}
            markerHeight={headSize}
            refX={headSize - 2}
            refY={headSize / 2}
            orient="auto"
          >
            <polygon
              points={`0 0, ${headSize} ${headSize / 2}, 0 ${headSize}`}
              fill={color}
            />
          </marker>
        </defs>

        {/* Arrow line */}
        <line
          x1={startX}
          y1={startY}
          x2={endX}
          y2={endY}
          stroke={color}
          strokeWidth="2"
          strokeDasharray={dashed ? "8,4" : "none"}
          markerEnd={`url(#arrowhead-${id})`}
          className={animated ? 'arrow-line-animated' : ''}
        />

        {/* Label background and text */}
        {label && (
          <>
            <rect
              x={labelX - 30}
              y={labelY - 10}
              width="60"
              height="20"
              fill="white"
              rx="4"
            />
            <text
              x={labelX}
              y={labelY + 4}
              textAnchor="middle"
              fill={color}
              fontSize="11"
              fontFamily="Inter, sans-serif"
              fontWeight="500"
            >
              {label}
            </text>
          </>
        )}
      </svg>
    </div>
  );
}

