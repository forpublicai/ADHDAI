import { ApologyCampaign, DoomsdayScenario } from '../types';
import { Fortune500Company } from '../data/fortune500';
import { getSeverityColor, getCategoryIcon, getHorizonLabel } from './doomsdayAnalyzer';

/**
 * Generates a complete HTML dossier for apology campaigns
 */
export function formatApologyCampaignsAsHTML(
  company: Fortune500Company,
  scenarios: DoomsdayScenario[],
  campaigns: ApologyCampaign[]
): string {
  const now = new Date();
  const timestamp = now.toISOString().split('T')[0];
  const dossierNumber = Math.floor(Math.random() * 9000 + 1000);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Proactive Apology Dossier — ${company.name}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    :root {
      --bg-dark: #0a0a0a;
      --bg-card: #111111;
      --bg-card-alt: #1a1a1a;
      --border: #2a2a2a;
      --text-primary: #e0e0e0;
      --text-secondary: #888888;
      --text-muted: #555555;
      --accent-red: #c41e3a;
      --accent-green: #4CAF50;
    }
    
    body {
      font-family: 'Inter', -apple-system, sans-serif;
      background: var(--bg-dark);
      color: var(--text-primary);
      line-height: 1.6;
      min-height: 100vh;
    }
    
    .dossier {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 24px;
    }
    
    /* Header */
    .dossier-header {
      text-align: center;
      padding-bottom: 40px;
      border-bottom: 1px solid var(--border);
      margin-bottom: 40px;
    }
    
    .dossier-badge {
      display: inline-block;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      letter-spacing: 2px;
      color: var(--accent-red);
      padding: 6px 16px;
      border: 1px solid var(--accent-red);
      border-radius: 4px;
      margin-bottom: 24px;
    }
    
    .dossier-title {
      font-size: 36px;
      font-weight: 700;
      color: #fff;
      margin-bottom: 8px;
    }
    
    .dossier-subtitle {
      font-size: 18px;
      color: var(--text-secondary);
      margin-bottom: 24px;
    }
    
    .dossier-meta {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: var(--text-muted);
    }
    
    /* Company Overview */
    .company-overview {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 32px;
      margin-bottom: 40px;
    }
    
    .company-name {
      font-size: 24px;
      font-weight: 600;
      color: #fff;
      margin-bottom: 8px;
    }
    
    .company-details {
      display: flex;
      gap: 24px;
      margin-bottom: 16px;
    }
    
    .company-detail {
      font-size: 13px;
    }
    
    .company-detail .label {
      color: var(--text-muted);
    }
    
    .company-detail .value {
      color: var(--text-secondary);
    }
    
    .risk-profile {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 16px;
    }
    
    .risk-tag {
      font-size: 11px;
      padding: 4px 10px;
      background: var(--bg-card-alt);
      border-radius: 4px;
      color: var(--text-secondary);
    }
    
    /* Section */
    .section {
      margin-bottom: 48px;
    }
    
    .section-header {
      display: flex;
      align-items: baseline;
      gap: 16px;
      margin-bottom: 24px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border);
    }
    
    .section-number {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: var(--accent-red);
    }
    
    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #fff;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    /* Campaign Card */
    .campaign-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 32px;
    }
    
    .campaign-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 24px;
      background: var(--bg-card-alt);
      border-bottom: 1px solid var(--border);
    }
    
    .campaign-number {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: var(--text-muted);
      margin-bottom: 4px;
    }
    
    .campaign-scenario {
      font-size: 16px;
      font-weight: 600;
      color: #fff;
    }
    
    .campaign-badges {
      display: flex;
      gap: 8px;
    }
    
    .severity-badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      font-weight: 500;
      text-transform: uppercase;
      padding: 4px 10px;
      border-radius: 4px;
      border: 1px solid;
    }
    
    .campaign-content {
      padding: 32px;
    }
    
    .apology-headline {
      font-size: 28px;
      font-weight: 300;
      color: #fff;
      margin-bottom: 8px;
      line-height: 1.3;
    }
    
    .apology-subheadline {
      font-size: 16px;
      color: var(--text-secondary);
      margin-bottom: 24px;
    }
    
    .apology-statement {
      font-size: 14px;
      color: var(--text-primary);
      padding: 20px;
      background: var(--bg-card-alt);
      border-left: 3px solid var(--accent-red);
      border-radius: 0 8px 8px 0;
      margin-bottom: 24px;
    }
    
    .key-messages {
      margin-bottom: 24px;
    }
    
    .key-messages-title {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--text-muted);
      margin-bottom: 12px;
    }
    
    .key-messages-list {
      list-style: none;
    }
    
    .key-messages-list li {
      font-size: 13px;
      color: var(--text-secondary);
      padding: 8px 0;
      padding-left: 20px;
      position: relative;
      border-bottom: 1px solid var(--border);
    }
    
    .key-messages-list li::before {
      content: "→";
      position: absolute;
      left: 0;
      color: var(--accent-green);
    }
    
    .visual-direction {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid var(--border);
    }
    
    .visual-item {
      padding: 16px;
      background: var(--bg-card-alt);
      border-radius: 8px;
    }
    
    .visual-item-title {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--text-muted);
      margin-bottom: 8px;
    }
    
    .visual-item-value {
      font-size: 13px;
      color: var(--text-secondary);
    }
    
    .color-swatches {
      display: flex;
      gap: 6px;
    }
    
    .color-swatch {
      width: 24px;
      height: 24px;
      border-radius: 4px;
    }
    
    /* Deliverables Grid */
    .deliverables-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
      margin-top: 16px;
    }
    
    .deliverable-card {
      background: var(--bg-card-alt);
      border-radius: 8px;
      overflow: hidden;
    }
    
    .deliverable-header {
      display: flex;
      justify-content: space-between;
      padding: 12px 16px;
      background: var(--bg-dark);
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
    }
    
    .deliverable-type {
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .deliverable-format {
      color: var(--accent-green);
    }
    
    .deliverable-preview {
      padding: 24px;
      min-height: 120px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    
    .deliverable-headline {
      font-size: 14px;
      font-weight: 500;
      color: #fff;
      margin-bottom: 8px;
    }
    
    .deliverable-body {
      font-size: 12px;
      color: var(--text-secondary);
    }
    
    /* Scenario Reference */
    .scenario-reference {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
    }
    
    .scenario-title {
      font-size: 14px;
      font-weight: 600;
      color: #fff;
      margin-bottom: 8px;
    }
    
    .scenario-description {
      font-size: 13px;
      color: var(--text-secondary);
      margin-bottom: 12px;
    }
    
    .scenario-meta {
      display: flex;
      gap: 16px;
      font-size: 11px;
    }
    
    .scenario-meta-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .scenario-meta-label {
      color: var(--text-muted);
    }
    
    .scenario-meta-value {
      color: var(--text-secondary);
    }
    
    /* Footer */
    .dossier-footer {
      margin-top: 60px;
      padding-top: 24px;
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      color: var(--text-muted);
    }
    
    /* Print Styles */
    @media print {
      body {
        background: white;
        color: #1a1a1a;
      }
      
      .dossier {
        max-width: none;
      }
      
      .campaign-card,
      .company-overview,
      .scenario-reference {
        break-inside: avoid;
        page-break-inside: avoid;
      }
    }
    
    @media (max-width: 768px) {
      .visual-direction {
        grid-template-columns: 1fr;
      }
      
      .company-details {
        flex-direction: column;
        gap: 8px;
      }
    }
  </style>
</head>
<body>
  <div class="dossier">
    <!-- Header -->
    <header class="dossier-header">
      <div class="dossier-badge">PROACTIVE APOLOGY DOSSIER</div>
      <h1 class="dossier-title">${company.name}</h1>
      <p class="dossier-subtitle">Preemptive Corporate Accountability Package</p>
      <div class="dossier-meta">
        DOSSIER #${dossierNumber} | GENERATED ${timestamp} | ${campaigns.length} CAMPAIGN${campaigns.length !== 1 ? 'S' : ''} | ADHDAI
      </div>
    </header>

    <!-- Company Overview -->
    <div class="company-overview">
      <h2 class="company-name">${company.name}${company.ticker ? ` (${company.ticker})` : ''}</h2>
      <div class="company-details">
        <div class="company-detail">
          <span class="label">Industry: </span>
          <span class="value">${company.industry}</span>
        </div>
        <div class="company-detail">
          <span class="label">Sector: </span>
          <span class="value">${company.sector}</span>
        </div>
      </div>
      <p style="font-size: 13px; color: var(--text-secondary);">${company.description}</p>
      <div class="risk-profile">
        ${company.riskProfile.map(risk => `<span class="risk-tag">${risk}</span>`).join('')}
      </div>
    </div>

    <!-- Scenarios Analyzed -->
    <section class="section">
      <div class="section-header">
        <span class="section-number">001</span>
        <h2 class="section-title">Doomsday Scenarios Analyzed</h2>
      </div>
      
      ${scenarios.map((scenario, index) => `
        <div class="scenario-reference">
          <div class="scenario-title">${index + 1}. ${scenario.title}</div>
          <p class="scenario-description">${scenario.description}</p>
          <div class="scenario-meta">
            <div class="scenario-meta-item">
              <span class="scenario-meta-label">Timeline:</span>
              <span class="scenario-meta-value">${getHorizonLabel(scenario.timeHorizon)}</span>
            </div>
            <div class="scenario-meta-item">
              <span class="scenario-meta-label">Severity:</span>
              <span class="scenario-meta-value" style="color: ${getSeverityColor(scenario.severity)}">${scenario.severity}</span>
            </div>
            <div class="scenario-meta-item">
              <span class="scenario-meta-label">Category:</span>
              <span class="scenario-meta-value">${getCategoryIcon(scenario.category)} ${scenario.category}</span>
            </div>
          </div>
        </div>
      `).join('')}
    </section>

    <!-- Apology Campaigns -->
    <section class="section">
      <div class="section-header">
        <span class="section-number">002</span>
        <h2 class="section-title">Proactive Apology Campaigns</h2>
      </div>
      
      ${campaigns.map((campaign, index) => {
        const scenario = scenarios.find(s => s.id === campaign.scenarioId);
        return `
          <div class="campaign-card">
            <div class="campaign-header">
              <div>
                <div class="campaign-number">CAMPAIGN ${String(index + 1).padStart(2, '0')}</div>
                <div class="campaign-scenario">${campaign.scenarioTitle}</div>
              </div>
              <div class="campaign-badges">
                ${scenario ? `
                  <span class="severity-badge" style="color: ${getSeverityColor(scenario.severity)}; border-color: ${getSeverityColor(scenario.severity)}; background: ${getSeverityColor(scenario.severity)}20;">
                    ${scenario.severity}
                  </span>
                ` : ''}
              </div>
            </div>
            
            <div class="campaign-content">
              <h3 class="apology-headline">"${campaign.headline}"</h3>
              <p class="apology-subheadline">${campaign.subheadline}</p>
              
              <div class="apology-statement">
                ${campaign.apologyStatement}
              </div>
              
              ${campaign.keyMessages && campaign.keyMessages.length > 0 ? `
                <div class="key-messages">
                  <div class="key-messages-title">Key Messages</div>
                  <ul class="key-messages-list">
                    ${campaign.keyMessages.map(msg => `<li>${msg}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
              
              <div class="visual-direction">
                <div class="visual-item">
                  <div class="visual-item-title">Visual Concept</div>
                  <div class="visual-item-value">${campaign.visualConcept || 'Corporate minimalism with sincere overtones'}</div>
                </div>
                <div class="visual-item">
                  <div class="visual-item-title">Color Palette</div>
                  <div class="color-swatches">
                    ${(campaign.colorPalette || ['#1a365d', '#718096', '#c53030', '#f7fafc']).map(color => 
                      `<div class="color-swatch" style="background-color: ${color};" title="${color}"></div>`
                    ).join('')}
                  </div>
                </div>
                <div class="visual-item">
                  <div class="visual-item-title">Typography</div>
                  <div class="visual-item-value">${campaign.typography || 'Helvetica Neue / Georgia'}</div>
                </div>
              </div>
              
              ${campaign.deliverables ? `
                <div class="key-messages">
                  <div class="key-messages-title" style="margin-top: 24px;">Deliverables</div>
                  <div class="deliverables-grid">
                    ${campaign.deliverables.fullPageAd ? `
                      <div class="deliverable-card">
                        <div class="deliverable-header">
                          <span class="deliverable-type">Print — Full Page</span>
                          <span class="deliverable-format">${campaign.deliverables.fullPageAd.dimensions || '8.5x11"'}</span>
                        </div>
                        <div class="deliverable-preview">
                          <div class="deliverable-headline">${campaign.deliverables.fullPageAd.headline}</div>
                          <div class="deliverable-body">${campaign.deliverables.fullPageAd.body}</div>
                        </div>
                      </div>
                    ` : ''}
                    
                    ${campaign.deliverables.billboard ? `
                      <div class="deliverable-card">
                        <div class="deliverable-header">
                          <span class="deliverable-type">OOH — Billboard</span>
                          <span class="deliverable-format">${campaign.deliverables.billboard.dimensions || '14x48ft'}</span>
                        </div>
                        <div class="deliverable-preview">
                          <div class="deliverable-headline">${campaign.deliverables.billboard.headline}</div>
                          <div class="deliverable-body">${campaign.deliverables.billboard.body}</div>
                        </div>
                      </div>
                    ` : ''}
                    
                    ${campaign.deliverables.socialPosts && campaign.deliverables.socialPosts.length > 0 ? `
                      <div class="deliverable-card">
                        <div class="deliverable-header">
                          <span class="deliverable-type">Social — ${campaign.deliverables.socialPosts[0].platform}</span>
                          <span class="deliverable-format">${campaign.deliverables.socialPosts[0].type}</span>
                        </div>
                        <div class="deliverable-preview">
                          <div class="deliverable-body">${campaign.deliverables.socialPosts[0].copy.slice(0, 150)}${campaign.deliverables.socialPosts[0].copy.length > 150 ? '...' : ''}</div>
                        </div>
                      </div>
                    ` : ''}
                  </div>
                </div>
              ` : ''}
            </div>
          </div>
        `;
      }).join('')}
    </section>

    <!-- Footer -->
    <footer class="dossier-footer">
      <span>ADHDAI — THE FERAL CREATIVE COLLECTIVE</span>
      <span>PROACTIVE APOLOGY DOSSIER #${dossierNumber}</span>
      <span>GENERATED ${timestamp}</span>
    </footer>
  </div>
</body>
</html>`;
}

/**
 * Generate a single campaign's HTML preview
 */
export function formatSingleCampaignAsHTML(campaign: ApologyCampaign): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Apology Campaign — ${campaign.scenarioTitle}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', sans-serif;
      background: #f5f5f5;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
    }
    .apology-ad {
      max-width: 600px;
      background: white;
      padding: 60px;
      text-align: center;
      box-shadow: 0 4px 24px rgba(0,0,0,0.1);
    }
    .company-name {
      font-size: 12px;
      letter-spacing: 4px;
      color: #888;
      margin-bottom: 40px;
      text-transform: uppercase;
    }
    .headline {
      font-size: 32px;
      font-weight: 300;
      color: #1a1a1a;
      line-height: 1.3;
      margin-bottom: 20px;
    }
    .subheadline {
      font-size: 16px;
      color: #666;
      margin-bottom: 40px;
    }
    .statement {
      font-size: 14px;
      color: #444;
      line-height: 1.8;
      padding: 30px;
      background: #f9f9f9;
      border-left: 3px solid #c41e3a;
      text-align: left;
      margin-bottom: 40px;
    }
    .footer {
      font-size: 11px;
      color: #999;
      letter-spacing: 2px;
    }
  </style>
</head>
<body>
  <div class="apology-ad">
    <div class="company-name">${campaign.companyName}</div>
    <h1 class="headline">"${campaign.headline}"</h1>
    <p class="subheadline">${campaign.subheadline}</p>
    <div class="statement">${campaign.apologyStatement}</div>
    <div class="footer">A PROACTIVE APOLOGY FROM ${campaign.companyName?.toUpperCase()}</div>
  </div>
</body>
</html>`;
}
