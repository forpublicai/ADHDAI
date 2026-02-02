import { useState, useCallback, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import Fortune500Selector from '../components/Fortune500Selector';
import ScenarioSelector from '../components/ScenarioSelector';
import LoadingSpinner from '../components/LoadingSpinner';
import { Fortune500Company } from '../data/fortune500';
import { 
  DoomsdayScenario, 
  ScenarioAnalysis, 
  ApologyCampaign,
  ApologyWorkflowPhase 
} from '../types';
import '../App.css';
import './Agency.css';

// Lazy load heavy workspace components
const ScenarioAnalysisWorkspace = lazy(() => import('../components/Canvas/ScenarioAnalysisWorkspace'));
const ApologyCanvasWorkspace = lazy(() => import('../components/Canvas/ApologyCanvasWorkspace'));

export default function Agency() {
  // Workflow state
  const [phase, setPhase] = useState<ApologyWorkflowPhase>('company-selection');
  const [selectedCompany, setSelectedCompany] = useState<Fortune500Company | null>(null);
  const [scenarioAnalysis, setScenarioAnalysis] = useState<ScenarioAnalysis | null>(null);
  const [selectedScenarioIds, setSelectedScenarioIds] = useState<string[]>([]);
  const [completedCampaigns, setCompletedCampaigns] = useState<ApologyCampaign[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Handle company selection
  const handleCompanySelect = useCallback((company: Fortune500Company | null) => {
    setSelectedCompany(company);
    setScenarioAnalysis(null);
    setSelectedScenarioIds([]);
    setError(null);
    
    if (company) {
      setPhase('company-selection');
    }
  }, []);

  // Start the scenario analysis workflow with agents
  const handleStartAnalysis = useCallback(() => {
    if (selectedCompany) {
      setPhase('scenario-analysis');
    }
  }, [selectedCompany]);

  // Handle analysis completion from the workspace
  const handleAnalysisComplete = useCallback((analysis: ScenarioAnalysis) => {
    setScenarioAnalysis(analysis);
    setPhase('scenario-selection');
  }, []);

  // Toggle scenario selection
  const handleToggleScenario = useCallback((scenarioId: string) => {
    setSelectedScenarioIds(prev => 
      prev.includes(scenarioId)
        ? prev.filter(id => id !== scenarioId)
        : [...prev, scenarioId]
    );
  }, []);

  // Select all scenarios
  const handleSelectAllScenarios = useCallback(() => {
    if (scenarioAnalysis) {
      setSelectedScenarioIds(scenarioAnalysis.scenarios.map(s => s.id));
    }
  }, [scenarioAnalysis]);

  // Clear all selections
  const handleClearScenarios = useCallback(() => {
    setSelectedScenarioIds([]);
  }, []);

  // Proceed to campaign generation
  const handleProceedToCampaigns = useCallback(() => {
    if (selectedScenarioIds.length > 0) {
      setPhase('campaign-generation');
    }
  }, [selectedScenarioIds]);

  // Handle campaign completion
  const handleCampaignsComplete = useCallback((campaigns: ApologyCampaign[]) => {
    setCompletedCampaigns(campaigns);
    setPhase('campaign-complete');
  }, []);

  // Go back to scenario selection
  const handleBackToScenarios = useCallback(() => {
    setPhase('scenario-selection');
  }, []);

  // Go back to company selection
  const handleBackToCompanySelection = useCallback(() => {
    setPhase('company-selection');
    setScenarioAnalysis(null);
    setSelectedScenarioIds([]);
  }, []);

  // Reset to start
  const handleStartOver = useCallback(() => {
    setPhase('company-selection');
    setSelectedCompany(null);
    setScenarioAnalysis(null);
    setSelectedScenarioIds([]);
    setCompletedCampaigns([]);
    setError(null);
  }, []);

  // Get selected scenarios
  const selectedScenarios: DoomsdayScenario[] = scenarioAnalysis
    ? scenarioAnalysis.scenarios.filter(s => selectedScenarioIds.includes(s.id))
    : [];

  // Determine active step
  const getStepStatus = (step: number) => {
    if (step === 1) {
      return phase === 'company-selection' ? 'active' : 'completed';
    }
    if (step === 2) {
      return (phase === 'scenario-analysis' || phase === 'scenario-selection') ? 'active' 
        : (phase === 'campaign-generation' || phase === 'campaign-complete') ? 'completed' : '';
    }
    if (step === 3) {
      return phase === 'campaign-generation' ? 'active' : phase === 'campaign-complete' ? 'completed' : '';
    }
    return '';
  };

  return (
    <div className="agency-page">
      {/* Navigation - Only show when not in workspace mode */}
      {phase !== 'scenario-analysis' && phase !== 'campaign-generation' && (
        <nav className="agency-nav">
          <Link to="/" className="nav-back">← ADHDAI</Link>
          <div className="nav-title">
            <span className="nav-title-main">PROACTIVE APOLOGY GENERATOR</span>
            <span className="nav-title-sub">Apologize for disasters before they happen</span>
          </div>
          {phase !== 'company-selection' && (
            <button className="nav-reset" onClick={handleStartOver}>
              Start Over
            </button>
          )}
        </nav>
      )}

      {/* Phase Indicator - Only show when not in workspace mode */}
      {phase !== 'scenario-analysis' && phase !== 'campaign-generation' && (
        <div className="phase-progress">
          <div className={`phase-step ${getStepStatus(1)}`}>
            <span className="step-number">1</span>
            <span className="step-label">Select Company</span>
          </div>
          <div className="phase-connector" />
          <div className={`phase-step ${getStepStatus(2)}`}>
            <span className="step-number">2</span>
            <span className="step-label">Analyze Scenarios</span>
          </div>
          <div className="phase-connector" />
          <div className={`phase-step ${getStepStatus(3)}`}>
            <span className="step-number">3</span>
            <span className="step-label">Generate Campaigns</span>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <main className={`agency-main ${(phase === 'scenario-analysis' || phase === 'campaign-generation') ? 'workspace-mode' : ''}`}>
        {/* Phase 1: Company Selection */}
        {phase === 'company-selection' && (
          <div className="company-selection-phase">
            <div className="phase-header">
              <h1>Select a Fortune 500 Company</h1>
              <p>Choose the corporation that needs proactive apology campaigns for potential future disasters.</p>
            </div>

            <div className="company-selector-container">
              <Fortune500Selector
                onSelect={handleCompanySelect}
                selectedCompany={selectedCompany}
              />
            </div>
        
            {selectedCompany && (
              <div className="selection-actions">
                <button 
                  className="analyze-btn"
                  onClick={handleStartAnalysis}
                >
                  Analyze Doomsday Scenarios
                  <span className="arrow">→</span>
                </button>
                
                {error && (
                  <div className="error-message">
                    <span className="error-icon">⚠️</span>
                    {error}
                  </div>
                )}
              </div>
            )}

            <div className="phase-info">
              <h3>How it works</h3>
              <ol>
                <li>Select a Fortune 500 company from the dropdown</li>
                <li>Our AI analyzes potential doomsday scenarios across 1, 5, 10, and 50 year horizons</li>
                <li>Choose which scenarios to create proactive apology campaigns for</li>
                <li>Watch our agents generate satirical corporate apologies</li>
                <li>Download your complete apology campaign package</li>
              </ol>
            </div>
          </div>
        )}

        {/* Phase 2a: Scenario Analysis (Workspace with Agents) */}
        {phase === 'scenario-analysis' && selectedCompany && (
          <div className="scenario-analysis-phase">
            <Suspense fallback={<LoadingSpinner message="Initializing analysis workspace..." />}>
              <ScenarioAnalysisWorkspace
                company={selectedCompany}
                onComplete={handleAnalysisComplete}
                onBack={handleBackToCompanySelection}
              />
            </Suspense>
          </div>
        )}

        {/* Phase 2b: Scenario Selection */}
        {phase === 'scenario-selection' && scenarioAnalysis && selectedCompany && (
          <div className="scenario-selection-phase">
            <ScenarioSelector
              analysis={scenarioAnalysis}
              selectedIds={selectedScenarioIds}
              onToggleScenario={handleToggleScenario}
              onSelectAll={handleSelectAllScenarios}
              onClearAll={handleClearScenarios}
              onProceed={handleProceedToCampaigns}
            />
          </div>
        )}

        {/* Phase 3: Campaign Generation */}
        {phase === 'campaign-generation' && selectedCompany && selectedScenarios.length > 0 && (
          <div className="campaign-generation-phase">
            <Suspense fallback={<LoadingSpinner message="Preparing campaign generator..." />}>
              <ApologyCanvasWorkspace
                company={selectedCompany}
                scenarios={selectedScenarios}
                onComplete={handleCampaignsComplete}
                onBack={handleBackToScenarios}
              />
            </Suspense>
          </div>
        )}

        {/* Phase 4: Complete */}
        {phase === 'campaign-complete' && (
          <div className="campaign-complete-phase">
            <div className="complete-header">
              <div className="complete-icon">✓</div>
              <h1>Apology Campaigns Complete</h1>
              <p>
                {completedCampaigns.length} proactive apology campaign{completedCampaigns.length !== 1 ? 's' : ''} generated for {selectedCompany?.name}
              </p>
            </div>

            <div className="campaigns-summary">
              {completedCampaigns.map((campaign, index) => (
                <div key={campaign.id} className="campaign-summary-card">
                  <div className="card-number">{index + 1}</div>
                  <div className="card-content">
                    <h3>{campaign.scenarioTitle}</h3>
                    <p className="headline">"{campaign.headline}"</p>
                    <p className="statement">{campaign.apologyStatement}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="complete-actions">
              <button className="action-btn primary" onClick={handleBackToScenarios}>
                ← Back to Scenarios
              </button>
              <button className="action-btn secondary" onClick={handleStartOver}>
                Start New Analysis
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer - Only show when not in workspace mode */}
      {phase !== 'scenario-analysis' && phase !== 'campaign-generation' && (
        <footer className="agency-footer">
          <span>ADHDAI — The Feral Creative Collective</span>
          <span>"We are the best at the worst"</span>
        </footer>
      )}
    </div>
  );
}
