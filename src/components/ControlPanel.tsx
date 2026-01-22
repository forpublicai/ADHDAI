import { Phase } from '../types';
import { PHASES } from '../constants';
import './ControlPanel.css';

interface ControlPanelProps {
  isRunning: boolean;
  currentPhase: Phase;
  brief: string;
  onBriefChange: (brief: string) => void;
  onStart: () => void;
  onPause: () => void;
}

export default function ControlPanel({
  isRunning,
  currentPhase,
  brief,
  onBriefChange,
  onStart,
  onPause
}: ControlPanelProps) {
  const currentPhaseData = PHASES.find(p => p.id === currentPhase);

  return (
    <div className="control-panel">
      <div className="control-header">
        <h2>ADHDAI Agency</h2>
        <p className="tagline">we are the best at the worst</p>
      </div>
      <div className="control-content">
        <div className="control-section">
          <label>Brief:</label>
          <input
            type="text"
            value={brief}
            onChange={(e) => onBriefChange(e.target.value)}
            placeholder="Enter a product or service to create a terrible ad for..."
            disabled={isRunning}
            className="brief-input"
          />
        </div>
        <div className="control-section">
          <div className="phase-indicator">
            <span className="phase-label">Current Phase:</span>
            <span className="phase-name">{currentPhaseData?.name || 'Ready'}</span>
          </div>
          {currentPhaseData && (
            <p className="phase-description">{currentPhaseData.description}</p>
          )}
        </div>
        <div className="control-actions">
          {!isRunning ? (
            <button onClick={onStart} className="btn-primary">
              Start Simulation
            </button>
          ) : (
            <button onClick={onPause} className="btn-secondary">
              Pause
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
