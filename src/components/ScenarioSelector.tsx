import React, { useMemo, memo } from 'react';
import { 
  DoomsdayScenario, 
  ScenarioAnalysis, 
  TimeHorizon 
} from '../types';
import { 
  groupScenariosByHorizon, 
  getSeverityColor, 
  getCategoryIcon,
  getHorizonLabel 
} from '../services/doomsdayAnalyzer';
import './ScenarioSelector.css';

interface ScenarioSelectorProps {
  analysis: ScenarioAnalysis;
  selectedIds: string[];
  onToggleScenario: (scenarioId: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onProceed: () => void;
  isLoading?: boolean;
}

const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  analysis,
  selectedIds,
  onToggleScenario,
  onSelectAll,
  onClearAll,
  onProceed,
  isLoading = false,
}) => {
  const groupedScenarios = useMemo(() => 
    groupScenariosByHorizon(analysis.scenarios),
    [analysis.scenarios]
  );

  const timeHorizons: TimeHorizon[] = ['1-year', '5-year', '10-year', '50-year'];

  const getHorizonIcon = (horizon: TimeHorizon): string => {
    const icons: Record<TimeHorizon, string> = {
      '1-year': '⚡',
      '5-year': '📅',
      '10-year': '🔮',
      '50-year': '🌌'
    };
    return icons[horizon];
  };

  const getHorizonDescription = (horizon: TimeHorizon): string => {
    const descriptions: Record<TimeHorizon, string> = {
      '1-year': 'Imminent risks requiring immediate apology preparation',
      '5-year': 'Near-term threats in the planning horizon',
      '10-year': 'Medium-term systemic risks to anticipate',
      '50-year': 'Long-term existential concerns for legacy planning'
    };
    return descriptions[horizon];
  };

  return (
    <div className="scenario-selector">
      {/* Header */}
      <div className="selector-header">
        <div className="header-info">
          <h2 className="header-title">
            <span className="company-name">{analysis.company}</span>
            <span className="title-divider">—</span>
            <span className="title-text">Doomsday Scenarios</span>
          </h2>
          <p className="header-summary">{analysis.summary}</p>
        </div>
        
        <div className="header-actions">
          <span className="selection-count">
            {selectedIds.length} of {analysis.scenarios.length} selected
          </span>
          <button 
            className="action-btn select-all"
            onClick={onSelectAll}
            disabled={selectedIds.length === analysis.scenarios.length}
          >
            Select All
          </button>
          <button 
            className="action-btn clear-all"
            onClick={onClearAll}
            disabled={selectedIds.length === 0}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Scenario Grid by Time Horizon */}
      <div className="horizons-grid">
        {timeHorizons.map(horizon => {
          const scenarios = groupedScenarios[horizon];
          if (scenarios.length === 0) return null;
          
          return (
            <div key={horizon} className="horizon-section">
              <div className="horizon-header">
                <div className="horizon-title">
                  <span className="horizon-icon">{getHorizonIcon(horizon)}</span>
                  <span className="horizon-label">{getHorizonLabel(horizon)}</span>
                </div>
                <p className="horizon-description">{getHorizonDescription(horizon)}</p>
              </div>
              
              <div className="scenarios-list">
                {scenarios.map(scenario => (
                  <ScenarioCard
                    key={scenario.id}
                    scenario={scenario}
                    isSelected={selectedIds.includes(scenario.id)}
                    onToggle={() => onToggleScenario(scenario.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Proceed Button */}
      <div className="selector-footer">
        <div className="footer-info">
          {selectedIds.length === 0 ? (
            <span className="info-warning">Select at least one scenario to generate apology campaigns</span>
          ) : (
            <span className="info-ready">
              Ready to generate {selectedIds.length} proactive apology campaign{selectedIds.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <button
          className="proceed-btn"
          onClick={onProceed}
          disabled={selectedIds.length === 0 || isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner"></span>
              Analyzing...
            </>
          ) : (
            <>
              Generate Apology Campaigns
              <span className="arrow">→</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

interface ScenarioCardProps {
  scenario: DoomsdayScenario;
  isSelected: boolean;
  onToggle: () => void;
}

const ScenarioCard: React.FC<ScenarioCardProps> = memo(({
  scenario,
  isSelected,
  onToggle,
}) => {
  const severityColor = useMemo(() => getSeverityColor(scenario.severity), [scenario.severity]);
  const categoryIcon = useMemo(() => getCategoryIcon(scenario.category), [scenario.category]);

  return (
    <div 
      className={`scenario-card ${isSelected ? 'selected' : ''}`}
      onClick={onToggle}
    >
      <div className="card-checkbox">
        <div className={`checkbox ${isSelected ? 'checked' : ''}`}>
          {isSelected && <span>✓</span>}
        </div>
      </div>
      
      <div className="card-content">
        <div className="card-header">
          <span className="category-icon" title={scenario.category}>
            {categoryIcon}
          </span>
          <h3 className="card-title">{scenario.title}</h3>
        </div>
        
        <p className="card-description">{scenario.description}</p>
        
        <div className="card-meta">
          <div 
            className="severity-badge"
            style={{ 
              backgroundColor: `${severityColor}20`,
              color: severityColor,
              borderColor: severityColor
            }}
          >
            {scenario.severity}
          </div>
          
          <div className="likelihood-bar">
            <div className="likelihood-label">Likelihood</div>
            <div className="likelihood-track">
              <div 
                className="likelihood-fill"
                style={{ 
                  width: `${scenario.likelihood}%`,
                  backgroundColor: severityColor
                }}
              />
            </div>
            <span className="likelihood-value">{Math.round(scenario.likelihood)}%</span>
          </div>
        </div>
        
        <div className="card-damage">
          <span className="damage-label">Potential Damage:</span>
          <span className="damage-value">{scenario.potentialDamage}</span>
        </div>
        
        {scenario.affectedParties.length > 0 && (
          <div className="card-affected">
            <span className="affected-label">Affected:</span>
            <div className="affected-tags">
              {scenario.affectedParties.slice(0, 4).map((party, index) => (
                <span key={index} className="affected-tag">{party}</span>
              ))}
              {scenario.affectedParties.length > 4 && (
                <span className="affected-more">+{scenario.affectedParties.length - 4}</span>
              )}
            </div>
          </div>
        )}
        
        {scenario.precedents && scenario.precedents.length > 0 && (
          <div className="card-precedents">
            <span className="precedents-label">Historical Precedents:</span>
            <ul className="precedents-list">
              {scenario.precedents.slice(0, 2).map((precedent, index) => (
                <li key={index}>{precedent}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
});

ScenarioCard.displayName = 'ScenarioCard';

export default memo(ScenarioSelector);
