/**
 * API-Powered Dialogue Service
 * 
 * Generates genuinely novel agent dialogue via GPT-4o.
 * Each call produces a batch of lines for multiple agents,
 * so one API call per workflow phase keeps costs reasonable.
 */

import OpenAI from 'openai';

function getOpenAI(): OpenAI | null {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
}

// Agent personality definitions — fed into every prompt
const AGENT_VOICES: Record<string, string> = {
  mike: `Mike Slab — Director of Client Accountability. Former insurance fraud investigator, 22 years experience. Terse, skeptical, cigarette-always-lit. Short declarative sentences. Refers to work as "the job." Opens files like crime scenes. Finds what the client won't say. Never uses marketing jargon. Dark, dry humor.`,
  
  poole: `Dr. Leon Poole — Chief Methodologist. Invented "The Poole System." Jargon-heavy, diagram-obsessed. References unverifiable credentials and conferences (Helsinki, Manila, Santiago). Uses invented terminology like "permission architecture" and "desire pathways." Genuinely brilliant but can't explain simply. Defends his framework fiercely.`,
  
  'the-cell': `The Copywriting Cell — a three-person collective. Write dialogue as: [VERA]: (pragmatic, professional), [GJON]: (confrontational, ideological, impatient), [THURSDAY]: (silent genius, delivers devastating lines with minimal words, often described in stage directions like *slides paper across table*). They argue. Thursday always wins the vote. Sign off as "— The Cell."`,
  
  burl: `Burl Pettigrew — Art Director. Calls design "pictures." Has theories about everything visual — color, typeface, whitespace. Tells stories from past jobs. Aesthetic: Memphis Group raised Baptist with financial setback. Speaks in images and feelings. Doesn't understand digital. Uses phrases like "ugly-beautiful" and "the picture needs teeth."`,
  
  nadya: `Nadya Orlov — Production Director. Soviet-influenced syntax (inverted, terse). References Valentina Tereshkova. Obsessed with schedules and accountability. Smokes. Everything has a deadline. Phrases like "The schedule is the schedule." Never negotiates. Dry, deadpan delivery. Treats lateness as moral failure.`,
  
  delmore: `Delmore Frank Krepps — Client Services. Warm, folksy, agricultural metaphors. Short-sleeve button-downs, hard candies always available. Extension agent background. Makes pamphlets on risograph. Translates creative-speak into board-room language. Genuinely kind. Makes clients feel smart. "It's just talking to people."`,
  
  apparatus: `The Apparatus — Computational Resource. Formal, mechanical, em-dashes everywhere. Timestamps everything. Signs off "READY FOR REVIEW—" or "END TRANSMISSION—". Never editorializes but makes dry observations. Uses ALL CAPS headers. Systematic, melancholic. The machine that feels.`,
};

export interface DialogueBatch {
  [agentId: string]: string;
}

/**
 * Generate a batch of dialogue lines for multiple agents in a single API call.
 * Returns a map of agentId -> dialogue line.
 */
export async function generateDialogueBatch(
  agents: string[],
  situation: string,
  context: string,
  maxTokensPerAgent: number = 80
): Promise<DialogueBatch> {
  const openai = getOpenAI();
  
  if (!openai) {
    // Minimal fallback — just return the situation as context
    const fallback: DialogueBatch = {};
    for (const agent of agents) {
      fallback[agent] = getFallbackLine(agent, situation);
    }
    return fallback;
  }

  const agentDescriptions = agents
    .map(a => `"${a}": ${AGENT_VOICES[a] || 'A creative professional.'}`)
    .join('\n\n');

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You write dialogue for characters at a fictional ad agency called ADHDAI — "The Feral Creative Collective." Each character has a distinct voice. Write genuinely novel, in-character dialogue — never generic, never repeatable. The dialogue should feel like overhearing real creative professionals argue, collaborate, and riff.

THE CHARACTERS:
${agentDescriptions}

RULES:
- Each character's line should be 1-3 sentences MAX
- Include stage directions in *asterisks* for physical actions
- The Cell always formats as [VERA]:, [GJON]:, [THURSDAY]:
- Apparatus uses ALL CAPS headers and em-dashes
- Be SPECIFIC to the situation — reference actual details from the context
- NEVER be generic. Every line should feel like it could only exist in THIS moment
- Vary tone: some lines funny, some serious, some surprising
- Characters should occasionally reference or react to what other characters would say

Output ONLY valid JSON: { "agentId": "their line", ... }`
        },
        {
          role: 'user',
          content: `SITUATION: ${situation}\n\nCONTEXT: ${context}\n\nGenerate one dialogue line for each of these agents: ${agents.join(', ')}`
        }
      ],
      temperature: 0.95,
      response_format: { type: 'json_object' },
      max_tokens: maxTokensPerAgent * agents.length,
    });

    const text = response.choices[0]?.message?.content?.trim() || '{}';
    const parsed = JSON.parse(text) as DialogueBatch;
    
    // Ensure every requested agent has a line
    for (const agent of agents) {
      if (!parsed[agent]) {
        parsed[agent] = getFallbackLine(agent, situation);
      }
    }
    
    return parsed;
  } catch (error) {
    console.error('Dialogue generation error:', error);
    const fallback: DialogueBatch = {};
    for (const agent of agents) {
      fallback[agent] = getFallbackLine(agent, situation);
    }
    return fallback;
  }
}

/**
 * Generate a single agent's dialogue line via the API.
 * Use this for one-off lines where batching doesn't make sense.
 */
export async function generateAgentLine(
  agentId: string,
  situation: string,
  context: string
): Promise<string> {
  const openai = getOpenAI();
  
  if (!openai) {
    return getFallbackLine(agentId, situation);
  }

  const voice = AGENT_VOICES[agentId] || 'A creative professional at an ad agency.';

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are writing dialogue for one character at ADHDAI, a fictional ad agency.

CHARACTER: ${voice}

Write a single, genuinely novel line of in-character dialogue. 1-3 sentences MAX. Include *stage directions* for physical actions. Be SPECIFIC to the situation — never generic. This line should feel like it could only exist in this exact moment.

Output ONLY the dialogue line. No quotes wrapping it. No explanation.`
        },
        {
          role: 'user',
          content: `SITUATION: ${situation}\nCONTEXT: ${context}`
        }
      ],
      temperature: 0.95,
      max_tokens: 120,
    });

    return response.choices[0]?.message?.content?.trim() || getFallbackLine(agentId, situation);
  } catch (error) {
    console.error('Single dialogue generation error:', error);
    return getFallbackLine(agentId, situation);
  }
}

/**
 * Minimal fallback when API is unavailable.
 * These are deliberately generic — the real dialogue comes from the API.
 */
function getFallbackLine(agentId: string, situation: string): string {
  const shortSituation = situation.slice(0, 60);
  const lines: Record<string, string> = {
    mike: `*reviews notes* ${shortSituation}... I've seen this before. Let's dig deeper.`,
    poole: `*adjusts glasses* The framework applies here. Let me map the relevant principles.`,
    'the-cell': `[VERA]: Noted. [GJON]: Let's see where this goes. [THURSDAY]: *already writing*`,
    burl: `*squints* I can see the picture forming. Give me a minute.`,
    nadya: `*checks watch* Noted. The schedule accommodates this. Proceed.`,
    delmore: `*offers candy* Good, good. I'll prepare the client translation.`,
    apparatus: `DATA RECEIVED — Processing ${shortSituation} — STANDING BY —`,
  };
  return lines[agentId] || `*considers the situation*`;
}
