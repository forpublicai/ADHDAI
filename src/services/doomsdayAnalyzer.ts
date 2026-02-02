import OpenAI from 'openai';
import { 
  DoomsdayScenario, 
  ScenarioAnalysis, 
  TimeHorizon, 
  RiskCategory, 
  SeverityLevel 
} from '../types';
import { Fortune500Company } from '../data/fortune500';

// Create OpenAI client only when API key is available
function getOpenAIClient(): OpenAI | null {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true
  });
}

// Generate unique ID
function generateId(): string {
  return `scenario-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Analyzes a company's potential doomsday scenarios across different time horizons
 */
export async function analyzeDoomsdayScenarios(
  company: Fortune500Company
): Promise<ScenarioAnalysis> {
  const openai = getOpenAIClient();
  
  if (!openai) {
    console.warn('OpenAI API key not found. Using fallback scenarios.');
    return generateFallbackScenarios(company);
  }

  try {
    const prompt = `You are a risk analyst specializing in corporate catastrophe scenarios. Analyze ${company.name} (${company.industry}, ${company.sector}) and identify potential "doomsday scenarios" - events that could cause maximum damage to people, the environment, or society.

COMPANY CONTEXT:
- Name: ${company.name}
- Industry: ${company.industry}
- Sector: ${company.sector}
- Description: ${company.description}
- Known Risk Areas: ${company.riskProfile.join(', ')}

Generate scenarios for FOUR time horizons:
1. 1-YEAR: Imminent risks, things that could happen tomorrow
2. 5-YEAR: Near-term emerging risks
3. 10-YEAR: Medium-term systemic risks
4. 50-YEAR: Long-term existential or transformative risks

For EACH time horizon, generate 2-3 scenarios. Each scenario should be:
- SPECIFIC to this company (not generic)
- REALISTIC but concerning
- FOCUSED on HARM to people/environment/society (not just financial loss to the company)
- Slightly SATIRICAL in tone (think dark corporate humor)

Return JSON array with this exact structure:
[
  {
    "timeHorizon": "1-year" | "5-year" | "10-year" | "50-year",
    "title": "Short punchy title (like a news headline)",
    "description": "2-3 sentence description of what happens",
    "category": "environmental" | "social" | "financial" | "technological" | "regulatory" | "reputational" | "operational" | "geopolitical",
    "severity": "catastrophic" | "severe" | "moderate" | "concerning",
    "likelihood": number (0-100),
    "potentialDamage": "What gets damaged/destroyed",
    "affectedParties": ["List", "of", "affected", "groups"],
    "precedents": ["Similar past events if any"]
  }
]

Be creative, specific, and slightly dark. Think corporate accountability satire.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a sardonic risk analyst who identifies corporate catastrophe scenarios with dry wit. You're writing for a satirical project about preemptive corporate apologies. Be specific to the company, slightly dark, and focus on harm to stakeholders rather than just financial loss. Output ONLY valid JSON array.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.9,
      response_format: { type: 'json_object' },
      max_tokens: 4000
    });

    const response = completion.choices[0]?.message?.content?.trim() || '';
    
    // Parse and validate response
    let scenariosData;
    try {
      const parsed = JSON.parse(response);
      scenariosData = parsed.scenarios || parsed;
      if (!Array.isArray(scenariosData)) {
        scenariosData = [scenariosData];
      }
    } catch {
      console.error('Failed to parse scenarios JSON:', response);
      return generateFallbackScenarios(company);
    }

    // Convert to typed scenarios
    const scenarios: DoomsdayScenario[] = scenariosData.map((s: Record<string, unknown>) => ({
      id: generateId(),
      companyName: company.name,
      timeHorizon: (s.timeHorizon as TimeHorizon) || '5-year',
      title: (s.title as string) || 'Unnamed Scenario',
      description: (s.description as string) || '',
      category: (s.category as RiskCategory) || 'operational',
      severity: (s.severity as SeverityLevel) || 'moderate',
      likelihood: typeof s.likelihood === 'number' ? s.likelihood : 50,
      potentialDamage: (s.potentialDamage as string) || '',
      affectedParties: Array.isArray(s.affectedParties) ? s.affectedParties as string[] : [],
      precedents: Array.isArray(s.precedents) ? s.precedents as string[] : [],
      selected: false
    }));

    // Generate summary
    const summary = await generateAnalysisSummary(company, scenarios);

    return {
      company: company.name,
      analyzedAt: Date.now(),
      scenarios,
      summary
    };
  } catch (error) {
    console.error('Error analyzing doomsday scenarios:', error);
    return generateFallbackScenarios(company);
  }
}

/**
 * Generate a summary of the scenario analysis
 */
async function generateAnalysisSummary(
  company: Fortune500Company,
  scenarios: DoomsdayScenario[]
): Promise<string> {
  const openai = getOpenAIClient();
  
  if (!openai) {
    return `${company.name} faces ${scenarios.length} potential doomsday scenarios across multiple time horizons. The most severe risks relate to ${scenarios.filter(s => s.severity === 'catastrophic').map(s => s.category).join(', ') || 'various operational areas'}.`;
  }

  try {
    const scenarioSummaries = scenarios
      .slice(0, 5)
      .map(s => `- ${s.title} (${s.timeHorizon}, ${s.severity})`)
      .join('\n');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You write sardonic corporate risk assessment summaries. Be dry, slightly dark, and professional-sounding while being subtly critical.'
        },
        {
          role: 'user',
          content: `Write a 2-3 sentence summary of ${company.name}'s doomsday risk profile based on these scenarios:\n${scenarioSummaries}`
        }
      ],
      temperature: 0.8,
      max_tokens: 200
    });

    return completion.choices[0]?.message?.content?.trim() || 
      `${company.name} has been identified as having significant catastrophe potential across ${scenarios.length} scenarios.`;
  } catch {
    return `${company.name} faces ${scenarios.length} potential doomsday scenarios requiring preemptive apology preparation.`;
  }
}

/**
 * Fallback scenarios when API is unavailable
 */
function generateFallbackScenarios(company: Fortune500Company): ScenarioAnalysis {
  const scenarios: DoomsdayScenario[] = [];
  
  // Generate fallback scenarios based on risk profile
  const riskScenarios: Record<string, Partial<DoomsdayScenario>[]> = {
    'environmental': [
      { title: 'Catastrophic Pollution Event', category: 'environmental', severity: 'catastrophic', description: `${company.name} discovered to be source of widespread environmental contamination affecting local ecosystems and communities.` },
      { title: 'Climate Contribution Exposed', category: 'environmental', severity: 'severe', description: `Internal documents reveal ${company.name} knowingly accelerated climate change while publicly claiming environmental stewardship.` },
    ],
    'labor': [
      { title: 'Mass Workplace Safety Failures', category: 'social', severity: 'severe', description: `Systematic safety violations at ${company.name} facilities lead to preventable injuries and deaths.` },
      { title: 'Labor Exploitation Scandal', category: 'social', severity: 'severe', description: `Investigation reveals ${company.name}'s supply chain built on exploitative labor practices.` },
    ],
    'data-privacy': [
      { title: 'Massive Data Breach', category: 'technological', severity: 'catastrophic', description: `${company.name} suffers historic data breach exposing millions of customers' sensitive information.` },
      { title: 'Surveillance Overreach', category: 'reputational', severity: 'severe', description: `${company.name} found collecting and selling user data far beyond disclosed purposes.` },
    ],
    'safety': [
      { title: 'Product Safety Crisis', category: 'operational', severity: 'catastrophic', description: `${company.name} products linked to widespread injuries despite known safety defects.` },
    ],
    'climate': [
      { title: 'Climate Tipping Point Contribution', category: 'environmental', severity: 'catastrophic', description: `${company.name}'s operations identified as key contributor to irreversible climate threshold breach.` },
    ],
    'regulatory': [
      { title: 'Regulatory Capture Scandal', category: 'regulatory', severity: 'severe', description: `${company.name} exposed for systematically corrupting oversight agencies meant to protect public interest.` },
    ],
    'financial': [
      { title: 'Systemic Financial Collapse', category: 'financial', severity: 'catastrophic', description: `${company.name}'s risky practices trigger cascading economic damage affecting millions.` },
    ],
    'health': [
      { title: 'Public Health Crisis', category: 'social', severity: 'catastrophic', description: `${company.name} products directly linked to widespread chronic health conditions.` },
    ],
    'antitrust': [
      { title: 'Monopoly Abuse Exposed', category: 'regulatory', severity: 'severe', description: `${company.name}'s anticompetitive practices shown to harm consumers and crush innovation.` },
    ],
    'geopolitical': [
      { title: 'Geopolitical Complicity', category: 'geopolitical', severity: 'severe', description: `${company.name} found enabling authoritarian regimes or conflict through business operations.` },
    ],
  };

  // Map time horizons
  const timeHorizons: TimeHorizon[] = ['1-year', '5-year', '10-year', '50-year'];

  // Generate scenarios from company's risk profile
  let scenarioIndex = 0;
  company.riskProfile.forEach((risk, _riskIndex) => {
    const riskTemplates = riskScenarios[risk] || [];
    riskTemplates.forEach((template) => {
      const horizon = timeHorizons[scenarioIndex % timeHorizons.length];
      scenarios.push({
        id: generateId(),
        companyName: company.name,
        timeHorizon: horizon,
        title: template.title || 'Unknown Risk',
        description: template.description || `A significant ${risk}-related incident at ${company.name}.`,
        category: template.category || 'operational',
        severity: template.severity || 'moderate',
        likelihood: 40 + Math.random() * 40,
        potentialDamage: `Widespread ${risk}-related damage affecting stakeholders`,
        affectedParties: ['Employees', 'Customers', 'Communities', 'Environment', 'Shareholders'],
        precedents: [],
        selected: false
      });
      scenarioIndex++;
    });
  });

  // Ensure we have at least one scenario per time horizon
  timeHorizons.forEach((horizon) => {
    const hasHorizon = scenarios.some(s => s.timeHorizon === horizon);
    if (!hasHorizon) {
      scenarios.push({
        id: generateId(),
        companyName: company.name,
        timeHorizon: horizon,
        title: `${company.name} ${horizon.replace('-', ' ')} Risk Event`,
        description: `A significant corporate incident affecting ${company.name} stakeholders within the ${horizon.replace('-', ' ')} time frame.`,
        category: 'operational',
        severity: horizon === '50-year' ? 'catastrophic' : 'severe',
        likelihood: horizon === '1-year' ? 60 : horizon === '50-year' ? 30 : 45,
        potentialDamage: 'Multiple stakeholder groups affected',
        affectedParties: ['Employees', 'Customers', 'Communities'],
        precedents: [],
        selected: false
      });
    }
  });

  return {
    company: company.name,
    analyzedAt: Date.now(),
    scenarios,
    summary: `${company.name} faces ${scenarios.length} potential doomsday scenarios across multiple time horizons. Key risk areas include ${company.riskProfile.slice(0, 3).join(', ')}.`
  };
}

/**
 * Get scenarios grouped by time horizon
 */
export function groupScenariosByHorizon(
  scenarios: DoomsdayScenario[]
): Record<TimeHorizon, DoomsdayScenario[]> {
  const grouped: Record<TimeHorizon, DoomsdayScenario[]> = {
    '1-year': [],
    '5-year': [],
    '10-year': [],
    '50-year': []
  };

  scenarios.forEach(scenario => {
    if (grouped[scenario.timeHorizon]) {
      grouped[scenario.timeHorizon].push(scenario);
    }
  });

  return grouped;
}

/**
 * Get severity color
 */
export function getSeverityColor(severity: SeverityLevel): string {
  const colors: Record<SeverityLevel, string> = {
    'catastrophic': '#FF0000',
    'severe': '#FF6B00',
    'moderate': '#FFB800',
    'concerning': '#FFE600'
  };
  return colors[severity] || '#888888';
}

/**
 * Get category icon
 */
export function getCategoryIcon(category: RiskCategory): string {
  const icons: Record<RiskCategory, string> = {
    'environmental': '🌍',
    'social': '👥',
    'financial': '💰',
    'technological': '⚡',
    'regulatory': '⚖️',
    'reputational': '📉',
    'operational': '⚙️',
    'geopolitical': '🌐'
  };
  return icons[category] || '⚠️';
}

/**
 * Get time horizon label
 */
export function getHorizonLabel(horizon: TimeHorizon): string {
  const labels: Record<TimeHorizon, string> = {
    '1-year': 'Next Year',
    '5-year': 'Within 5 Years',
    '10-year': 'Within a Decade',
    '50-year': 'Long-Term Future'
  };
  return labels[horizon] || horizon;
}
