/**
 * API-Powered Dialogue Service
 * 
 * Generates genuinely novel agent dialogue via OpenAI.
 * Each call produces a batch of lines for multiple agents,
 * so one API call per workflow phase keeps costs reasonable.
 * 
 * Uses model cascade: gpt-4o → gpt-4o-mini
 */

import { chatWithCascade } from './openaiClient';

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
  maxTokensPerAgent: number = 200
): Promise<DialogueBatch> {
  const agentDescriptions = agents
    .map(a => `"${a}": ${AGENT_VOICES[a] || 'A creative professional.'}`)
    .join('\n\n');

  const result = await chatWithCascade({
    messages: [
      {
        role: 'system',
        content: `You write dialogue for characters at a fictional ad agency called ADHDAI — "The Feral Creative Collective." Each character has a distinct voice. Write genuinely novel, in-character dialogue — never generic, never repeatable. The dialogue should feel like overhearing real creative professionals argue, collaborate, and riff.

THE CHARACTERS:
${agentDescriptions}

CRITICAL RULES:
- Each character's line should be 2-4 sentences — substantive and specific
- Include stage directions in *asterisks* for physical actions
- The Cell always formats as [VERA]:, [GJON]:, [THURSDAY]:
- Apparatus uses ALL CAPS headers and em-dashes
- Be SPECIFIC to the situation — reference actual details from the context
- NEVER echo, repeat, or paraphrase the situation description. Write ORIGINAL dialogue that REACTS to the situation with the character's unique perspective
- NEVER use phrases like "I've seen this before" or "Let's dig deeper" — be original
- NEVER be generic. Every line should feel like it could only exist in THIS moment
- Vary tone: some lines funny, some serious, some surprising
- Characters should reference specific details from the CONTEXT (company name, industry, risk areas)

Output ONLY valid JSON with agent IDs as keys: { "agentId": "their line", ... }`
      },
      {
        role: 'user',
        content: `SITUATION: ${situation}\n\nCONTEXT: ${context}\n\nGenerate one ORIGINAL, IN-CHARACTER dialogue line for each of these agents: ${agents.join(', ')}\n\nRemember: DO NOT repeat or echo the situation description. Write what the character would ACTUALLY SAY in their unique voice.`
      }
    ],
    temperature: 0.95,
    max_tokens: maxTokensPerAgent * agents.length,
    response_format: { type: 'json_object' },
  }, 'DialogueService');

  const parsed = JSON.parse(result) as DialogueBatch;
  // Ensure every requested agent has a line
  for (const agent of agents) {
    if (!parsed[agent]) {
      parsed[agent] = await generateAgentLine(agent, situation, context);
    }
  }
  return parsed;
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
  const voice = AGENT_VOICES[agentId] || 'A creative professional at an ad agency.';

  return await chatWithCascade({
    messages: [
      {
        role: 'system',
        content: `You are writing dialogue for one character at ADHDAI, a fictional ad agency.

CHARACTER: ${voice}

Write a single, genuinely novel line of in-character dialogue. 2-4 sentences. Include *stage directions* for physical actions. Be SPECIFIC — reference actual details from the context (company names, industries, specific risks). This line should feel like it could only exist in this exact moment.

NEVER echo or repeat the situation description back. Write what this character would ACTUALLY SAY — their opinion, reaction, insight, or joke about the situation. Be original.

Output ONLY the dialogue line. No quotes wrapping it. No explanation.`
      },
      {
        role: 'user',
        content: `SITUATION: ${situation}\nCONTEXT: ${context}\n\nWrite an ORIGINAL line — do not repeat the situation.`
      }
    ],
    temperature: 0.95,
    max_tokens: 200,
  }, 'DialogueService');
}

