import { chatWithCascade } from './openaiClient';
import { 
  DoomsdayScenario, 
  ScenarioAnalysis, 
  TimeHorizon, 
  RiskCategory, 
  SeverityLevel 
} from '../types';
import { Fortune500Company } from '../data/fortune500';

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

  {
    const prompt = `You are a world-class investigative journalist crossed with a corporate risk strategist. Your analysis has the depth of a New Yorker long-read and the precision of a McKinsey report. Analyze ${company.name} (${company.industry}, ${company.sector}) and identify potential catastrophe scenarios with the rigor and dark wit of a Michael Lewis book.

COMPANY INTELLIGENCE:
- Name: ${company.name}
- Industry: ${company.industry}
- Sector: ${company.sector}
- Description: ${company.description}
- Known Risk Vectors: ${company.riskProfile.join(', ')}

Generate scenarios across FOUR time horizons:
1. 1-YEAR: Imminent threats — the crisis that's already forming in their supply chain, their culture, their technology debt
2. 5-YEAR: Emerging risks — the trend they're ignoring, the regulation coming, the competitor shift that changes everything
3. 10-YEAR: Systemic exposure — climate, demographics, geopolitics, technology shifts that make their current model obsolete
4. 50-YEAR: Existential scenarios — the future where ${company.name}'s entire reason to exist is questioned

For EACH horizon, generate 2-3 scenarios. Each MUST be:
- SPECIFIC to ${company.name} — reference their actual business model, their actual products, their actual supply chains. Not interchangeable with any other company.
- ROOTED IN REALITY — based on actual industry trends, real precedents, genuine risk factors. The best scenarios feel like they could be next week's headline.
- FOCUSED ON HUMAN HARM — not abstract "market risk" but specific communities, employees, ecosystems, populations affected.
- WRITTEN WITH WIT — the titles should read like New York Post headlines or Onion articles that are TOO real. Dark humor that makes you laugh uncomfortably because it's plausible.

Return JSON object with "scenarios" array:
{
  "scenarios": [
    {
      "timeHorizon": "1-year" | "5-year" | "10-year" | "50-year",
      "title": "A headline that would trend on Twitter — specific, punchy, darkly funny, unmistakably about ${company.name}",
      "description": "3-4 sentences with specific detail. Name actual products, regions, or operations. Reference real industry dynamics. Make the reader think 'this could actually happen.'",
      "category": "environmental" | "social" | "financial" | "technological" | "regulatory" | "reputational" | "operational" | "geopolitical",
      "severity": "catastrophic" | "severe" | "moderate" | "concerning",
      "likelihood": number (0-100),
      "potentialDamage": "Specific, quantified where possible — not 'widespread damage' but 'contamination of X affecting Y communities'",
      "affectedParties": ["Specific groups — not just 'customers' but 'rural communities dependent on...' or 'gig workers in...'"],
      "precedents": ["Real historical parallels — specific company names, years, outcomes"]
    }
  ]
}`;

    const rawResponse = await chatWithCascade({
      messages: [
        {
          role: 'system',
          content: `You are the offspring of Michael Lewis's investigative rigor and The Onion's dark precision. Your risk assessments read like the opening chapters of "The Big Short" — specific, character-driven, and uncomfortably prophetic. You write for a satirical project about preemptive corporate apologies, but your scenarios are grounded in real industry knowledge. Every scenario must be specific enough to ${company.name} that it couldn't be about any other company. Reference their actual products, operations, market position, and cultural footprint. Your humor is dry, your analysis is sharp, and your precedents are real. Output ONLY valid JSON object with "scenarios" array.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.9,
      response_format: { type: 'json_object' },
      max_tokens: 6000
    }, 'DoomsdayAnalyzer');

    // Parse and validate response
    let scenariosData;
    try {
      const parsed = JSON.parse(rawResponse);
      scenariosData = parsed.scenarios || parsed;
      if (!Array.isArray(scenariosData)) {
        scenariosData = [scenariosData];
      }
    } catch {
      throw new Error(`[DoomsdayAnalyzer] Failed to parse scenarios JSON from API response`);
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
  }
}

/**
 * Generate a summary of the scenario analysis
 */
async function generateAnalysisSummary(
  company: Fortune500Company,
  scenarios: DoomsdayScenario[]
): Promise<string> {
  const scenarioSummaries = scenarios
    .slice(0, 5)
    .map(s => `- ${s.title} (${s.timeHorizon}, ${s.severity})`)
    .join('\n');

  return await chatWithCascade({
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
  }, 'DoomsdayAnalyzer');
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
