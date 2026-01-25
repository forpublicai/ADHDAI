import { useRef, useState, useCallback, useEffect, ReactNode } from 'react';
import './InfiniteCanvas.css';

interface Position {
  x: number;
  y: number;
}

interface InfiniteCanvasProps {
  children: ReactNode;
  width?: number;
  height?: number;
  minZoom?: number;
  maxZoom?: number;
  initialPosition?: Position;
  initialZoom?: number;
  onViewChange?: (position: Position, zoom: number) => void;
}

export default function InfiniteCanvas({
  children,
  width = 4000,
  height = 3000,
  minZoom = 0.25,
  maxZoom = 2,
  initialPosition = { x: 0, y: 0 },
  initialZoom = 1,
  onViewChange
}: InfiniteCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<Position>(initialPosition);
  const [zoom, setZoom] = useState(initialZoom);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Position>({ x: 0, y: 0 });

  // Handle mouse down for panning
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only pan with middle mouse button or when holding space
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  }, [position]);

  // Handle mouse move for panning
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      const newPosition = {
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      };
      setPosition(newPosition);
      onViewChange?.(newPosition, zoom);
    }
  }, [isPanning, panStart, zoom, onViewChange]);

  // Handle mouse up to stop panning
  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Handle wheel for zooming
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate zoom
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.min(maxZoom, Math.max(minZoom, zoom * zoomFactor));

    // Adjust position to zoom towards mouse cursor
    const zoomRatio = newZoom / zoom;
    const newPosition = {
      x: mouseX - (mouseX - position.x) * zoomRatio,
      y: mouseY - (mouseY - position.y) * zoomRatio
    };

    setZoom(newZoom);
    setPosition(newPosition);
    onViewChange?.(newPosition, newZoom);
  }, [zoom, position, minZoom, maxZoom, onViewChange]);

  // Add global mouse up listener
  useEffect(() => {
    const handleGlobalMouseUp = () => setIsPanning(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  // Center canvas on mount
  useEffect(() => {
    const container = containerRef.current;
    if (container && initialPosition.x === 0 && initialPosition.y === 0) {
      const rect = container.getBoundingClientRect();
      const centerX = (rect.width - width * zoom) / 2;
      const centerY = (rect.height - height * zoom) / 2;
      setPosition({ x: centerX + 500, y: centerY + 300 }); // Offset to show working area
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={`infinite-canvas ${isPanning ? 'panning' : ''}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Background grid */}
      <div 
        className="canvas-grid"
        style={{
          backgroundPosition: `${position.x}px ${position.y}px`,
          backgroundSize: `${50 * zoom}px ${50 * zoom}px`
        }}
      />
      
      {/* Canvas content */}
      <div
        className="canvas-content"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
          width: `${width}px`,
          height: `${height}px`
        }}
      >
        {children}
      </div>

      {/* Zoom indicator */}
      <div className="zoom-indicator">
        {Math.round(zoom * 100)}%
      </div>

      {/* Controls hint */}
      <div className="canvas-controls-hint">
        <span>Alt + drag to pan</span>
        <span>Scroll to zoom</span>
      </div>
    </div>
  );
}

// Export position type for use elsewhere
export type { Position };

