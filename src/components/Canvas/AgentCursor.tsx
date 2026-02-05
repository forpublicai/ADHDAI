import { useEffect, useState, useRef } from 'react';
import {
  ClipboardText,
  Graph,
  PencilSimple,
  Palette,
  CalendarBlank,
  FileText,
  Gear
} from '@phosphor-icons/react';
import { Character } from '../../types';
import './AgentCursor.css';

type CursorStatus = 'idle' | 'moving' | 'typing' | 'clicking' | 'dragging' | 'thinking';

interface AgentCursorProps {
  x: number;
  y: number;
  character: Character;
  status?: CursorStatus;
  action?: string;
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

export default function AgentCursor({
  x,
  y,
  character,
  status = 'idle',
  action
}: AgentCursorProps) {
  const [currentPosition, setCurrentPosition] = useState({ x, y });
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number>();

  const agentColor = character?.color || '#666';
  const agentName = character?.name || 'Agent';

  // Smooth position interpolation
  useEffect(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const startPosition = { ...currentPosition };
    const targetPosition = { x, y };
    const duration = 300; // ms
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      const newPosition = {
        x: startPosition.x + (targetPosition.x - startPosition.x) * easeProgress,
        y: startPosition.y + (targetPosition.y - startPosition.y) * easeProgress
      };
      
      setCurrentPosition(newPosition);
      setIsAnimating(progress < 1);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [x, y]);

  return (
    <div
      className={`agent-cursor ${status} ${isAnimating ? 'animating' : ''}`}
      style={{
        left: currentPosition.x,
        top: currentPosition.y,
        '--cursor-color': agentColor
      } as React.CSSProperties}
    >
      {/* Cursor pointer */}
      <svg
        className="cursor-pointer"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M5.65 2.65L19.35 12L12 14L9 21L5.65 2.65Z"
          fill={agentColor}
          stroke="white"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>

      {/* Agent name label */}
      <div 
        className="cursor-label"
        style={{ backgroundColor: agentColor }}
      >
        {getCharacterIcon(character?.icon, 12)} {agentName.split(' ')[0]}
      </div>

      {/* Action text if provided */}
      {action && (
        <div className="cursor-action">
          {action}
        </div>
      )}

      {/* Status indicators */}
      {status === 'thinking' && (
        <div className="status-indicator thinking">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      )}

      {status === 'typing' && (
        <div className="status-indicator typing">
          <span className="typing-cursor">|</span>
        </div>
      )}

      {status === 'clicking' && (
        <div className="click-ripple" style={{ borderColor: agentColor }} />
      )}

      {status === 'dragging' && (
        <div className="drag-trail" style={{ backgroundColor: agentColor }} />
      )}
    </div>
  );
}

export type { CursorStatus };
