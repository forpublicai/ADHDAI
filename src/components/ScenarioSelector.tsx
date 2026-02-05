import React, { useMemo, memo } from 'react';
import { 
  Lightning,
  Calendar,
  Binoculars,
  Planet,
  Check,
  CheckSquare,
  Square,
  ArrowRight,
  Spinner,
  Warning,
  Leaf,
  Users,
  CurrencyDollar,
  Cpu,
  Scales,
  TrendDown,
  Factory,
  Globe
} from '@phosphor-icons/react';
import { 
  DoomsdayScenario, 
  ScenarioAnalysis, 
  TimeHorizon,
  RiskCategory,
  SeverityLevel
} from '../types';
import { 
  groupScenariosByHorizon, 
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

// Get severity color
const getSeverityColor = (severity: SeverityLevel): string => {
  const colors: Record<SeverityLevel, string> = {
    'catastrophic': '#dc2626',
    'severe': '#ea580c',
    'moderate': '#ca8a04',
    'concerning': '#65a30d'
  };
  return colors[severity] || '#666';
};

// Get category icon
const getCategoryIcon = (category: RiskCategory) => {
  const iconProps = { size: 16, weight: 'bold' as const };
  const icons: Record<RiskCategory, React.ReactNode> = {
    'environmental': <Leaf {...iconProps} />,
    'social': <Users {...iconProps} />,
    'financial': <CurrencyDollar {...iconProps} />,
    'technological': <Cpu {...iconProps} />,
    'regulatory': <Scales {...iconProps} />,
    'reputational': <TrendDown {...iconProps} />,
    'operational': <Factory {...iconProps} />,
    'geopolitical': <Globe {...iconProps} />
  };
  return icons[category] || <Warning {...iconProps} />;
};

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

  const getHorizonIcon = (horizon: TimeHorizon) => {
    const iconProps = { size: 18, weight: 'bold' as const };
    const icons: Record<TimeHorizon, React.ReactNode> = {
      '1-year': <Lightning {...iconProps} />,
      '5-year': <Calendar {...iconProps} />,
      '10-year': <Binoculars {...iconProps} />,
      '50-year': <Planet {...iconProps} />
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
          <div className="header-label">Doomsday Scenarios</div>
          <h2 className="header-title">{analysis.company}</h2>
          <p className="header-summary">{analysis.summary}</p>
        </div>
        
        <div className="header-actions">
          <div className="selection-count">
            <span className="count-value">{selectedIds.length}</span>
            <span className="count-label">of {analysis.scenarios.length} selected</span>
          </div>
          <div className="action-buttons">
            <button 
              className="action-btn"
              onClick={onSelectAll}
              disabled={selectedIds.length === analysis.scenarios.length}
            >
              <CheckSquare size={16} weight="bold" />
              <span>Select All</span>
            </button>
            <button 
              className="action-btn"
              onClick={onClearAll}
              disabled={selectedIds.length === 0}
            >
              <Square size={16} weight="bold" />
              <span>Clear</span>
            </button>
          </div>
        </div>
      </div>

      {/* Scenario Grid by Time Horizon */}
      <div className="horizons-container">
        {timeHorizons.map(horizon => {
          const scenarios = groupedScenarios[horizon];
          if (scenarios.length === 0) return null;
          
          return (
            <div key={horizon} className="horizon-section">
              <div className="horizon-header">
                <div className="horizon-icon">
                  {getHorizonIcon(horizon)}
                </div>
                <div className="horizon-info">
                  <span className="horizon-label">{getHorizonLabel(horizon)}</span>
                  <span className="horizon-description">{getHorizonDescription(horizon)}</span>
                </div>
                <span className="horizon-count">{scenarios.length}</span>
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

      {/* Proceed Footer */}
      <div className="selector-footer">
        <div className="footer-info">
          {selectedIds.length === 0 ? (
            <span className="info-warning">
              <Warning size={16} weight="bold" />
              Select at least one scenario to generate apology campaigns
            </span>
          ) : (
            <span className="info-ready">
              <Check size={16} weight="bold" />
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
              <Spinner size={18} weight="bold" className="spinner" />
              <span>Analyzing</span>
            </>
          ) : (
            <>
              <span>Generate Apology Campaigns</span>
              <ArrowRight size={18} weight="bold" />
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
          {isSelected && <Check size={14} weight="bold" />}
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
              backgroundColor: `${severityColor}10`,
              color: severityColor,
              borderColor: `${severityColor}30`
            }}
          >
            {scenario.severity}
          </div>
          
          <div className="likelihood-container">
            <span className="likelihood-label">Likelihood</span>
            <div className="likelihood-bar">
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
          <span className="damage-label">Potential Damage</span>
          <span className="damage-value">{scenario.potentialDamage}</span>
        </div>
        
        {scenario.affectedParties.length > 0 && (
          <div className="card-affected">
            <span className="affected-label">Affected Parties</span>
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
            <span className="precedents-label">Historical Precedents</span>
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
