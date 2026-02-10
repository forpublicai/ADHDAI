/**
 * API-Powered Dialogue Service
 * 
 * Generates genuinely novel agent dialogue via OpenAI.
 * Each call produces a batch of lines for multiple agents,
 * so one API call per workflow phase keeps costs reasonable.
 * 
 * Falls back through models: gpt-4o → gpt-4o-mini → static fallback
 */

import OpenAI from 'openai';

function getOpenAI(): OpenAI | null {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    console.warn('[DialogueService] No VITE_OPENAI_API_KEY found');
    return null;
  }
  return new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
}

// Models to try in order — if gpt-4o fails, fall back to gpt-4o-mini
const MODELS = ['gpt-4o', 'gpt-4o-mini'] as const;

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
 * Try an API call with model fallback: gpt-4o → gpt-4o-mini
 */
async function callWithFallback(
  openai: OpenAI,
  messages: OpenAI.ChatCompletionMessageParam[],
  options: { temperature: number; max_tokens: number; response_format?: { type: 'json_object' } }
): Promise<string | null> {
  for (const model of MODELS) {
    try {
      const response = await openai.chat.completions.create({
        model,
        messages,
        ...options,
      });
      const content = response.choices[0]?.message?.content?.trim();
      if (content) return content;
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.warn(`[DialogueService] ${model} failed: ${errMsg}`);
      // Continue to next model
    }
  }
  return null; // All models failed
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
    console.warn('[DialogueService] No API client — using unique fallbacks');
    return generateUniqueFallbacks(agents, situation, context);
  }

  const agentDescriptions = agents
    .map(a => `"${a}": ${AGENT_VOICES[a] || 'A creative professional.'}`)
    .join('\n\n');

  const messages: OpenAI.ChatCompletionMessageParam[] = [
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

Output ONLY valid JSON with agent IDs as keys: { "agentId": "their line", ... }`
    },
    {
      role: 'user',
      content: `SITUATION: ${situation}\n\nCONTEXT: ${context}\n\nGenerate one dialogue line for each of these agents: ${agents.join(', ')}`
    }
  ];

  const result = await callWithFallback(openai, messages, {
    temperature: 0.95,
    max_tokens: maxTokensPerAgent * agents.length,
    response_format: { type: 'json_object' },
  });

  if (result) {
    try {
      const parsed = JSON.parse(result) as DialogueBatch;
      // Ensure every requested agent has a line
      for (const agent of agents) {
        if (!parsed[agent]) {
          parsed[agent] = await generateAgentLine(agent, situation, context);
        }
      }
      return parsed;
    } catch (parseError) {
      console.error('[DialogueService] JSON parse failed:', parseError);
    }
  }

  // All API attempts failed — generate unique fallbacks
  console.warn('[DialogueService] All API calls failed — generating unique fallbacks');
  return generateUniqueFallbacks(agents, situation, context);
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
    return buildFallbackLine(agentId, situation, context);
  }

  const voice = AGENT_VOICES[agentId] || 'A creative professional at an ad agency.';

  const messages: OpenAI.ChatCompletionMessageParam[] = [
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
  ];

  const result = await callWithFallback(openai, messages, {
    temperature: 0.95,
    max_tokens: 120,
  });

  return result || buildFallbackLine(agentId, situation, context);
}

/**
 * Generate unique fallback lines when ALL API models are unavailable.
 * Uses context details + randomized sentence structures to avoid repetition.
 */
function generateUniqueFallbacks(agents: string[], situation: string, context: string): DialogueBatch {
  const batch: DialogueBatch = {};
  for (const agent of agents) {
    batch[agent] = buildFallbackLine(agent, situation, context);
  }
  return batch;
}

/**
 * Build a contextual fallback line that's different every time
 * by incorporating situation details and random structural variation.
 */
function buildFallbackLine(agentId: string, situation: string, context: string): string {
  // Extract key details from situation and context for specificity
  const details = (situation + ' ' + context).slice(0, 200);
  const words = details.split(/\s+/).filter(w => w.length > 4);
  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
  const keyword = words.length > 2 ? pick(words) : 'this';
  const now = new Date();
  const timeRef = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

  const builders: Record<string, () => string> = {
    mike: () => pick([
      `*${pick(['stubs cigarette', 'lights cigarette', 'taps file', 'leans back', 'crosses arms'])}* ${pick(['There\'s something here.', 'I\'ve seen this pattern.', 'The brief doesn\'t match the reality.', 'Twenty-two years, and this one\'s different.', 'That\'s the tension. Right there.'])} ${keyword} — ${pick(['that\'s the real story', 'that\'s what they\'re not saying', 'that changes everything', 'dig deeper'])}`,
      `*${pick(['scans document', 'reads twice', 'underlines phrase'])}* ${pick([`"${keyword}" — `, `Look at ${keyword}. `, `${keyword}. `])}${pick(['Nobody talks about this.', 'That\'s the gap.', 'The client missed this.', 'There it is.', 'Found it.'])}`,
    ]),
    poole: () => pick([
      `*${pick(['adjusts glasses', 'uncaps marker', 'sketches diagram', 'consults notebook'])}* ${pick(['The framework accounts for this.', 'Principle Twelve applies here.', 'I see the architecture forming.', 'The topology is clear.'])} ${keyword} ${pick(['maps to the desire pathway', 'creates an interesting tension', 'requires further analysis', 'validates my Helsinki research'])}`,
      `*${pick(['removes glasses', 'draws circle on whiteboard', 'references handout'])}* ${pick(['Fascinating.', 'Remarkable.', 'Theoretically sound.'])} ${keyword} — ${pick(['this is textbook Poole System', 'I\'ll need to revise Section Four', 'the framework predicted this'])}`,
    ]),
    'the-cell': () => pick([
      `[VERA]: ${pick(['I can work with this.', 'Promising.', 'There\'s a foundation here.'])} [GJON]: ${pick([`${keyword}? That's the angle.`, 'Push harder.', 'Not enough tension yet.', 'Needs more edge.'])} [THURSDAY]: *${pick(['nods once', 'scribbles on index card', 'stares at ceiling, then writes', 'slides paper across table'])}*`,
      `[GJON]: ${pick([`${keyword} — `, 'The problem is ', 'Nobody\'s saying '])}${pick(['that\'s where the copy lives', 'the headline\'s in there somewhere', 'we need to crack this open'])}. [VERA]: ${pick(['Agreed.', 'Careful.', 'Let me draft something.'])} [THURSDAY]: *${pick(['already writing', 'three cards in', 'looks up briefly'])}*`,
    ]),
    burl: () => pick([
      `*${pick(['squints', 'tilts head', 'frames imaginary shot', 'pulls out swatch'])}* ${pick(['I can see it.', 'The picture is forming.', 'There\'s a visual here.', 'Not pretty — true.'])} ${keyword} — ${pick(['that wants to be photographed like evidence', 'documentary feeling', 'ugly-beautiful', 'the image tells the story the words can\'t'])}`,
      `*${pick(['sketches rapidly', 'stares at work', 'nods slowly'])}* ${pick([`${keyword} has a color. `, 'The visual language is clear. ', 'I know this feeling. '])}${pick(['Something between government form and love letter.', 'Unglamorous. Real.', 'Monochrome with one accent.', 'The whitespace IS the design.'])}`,
    ]),
    nadya: () => pick([
      `*${pick(['checks watch', 'lights cigarette', 'taps clipboard', 'makes note'])}* ${pick([`${keyword}. `, 'Noted. ', 'Timeline updated. '])}${pick(['The schedule accommodates this.', `Deadline: ${timeRef}. No extensions.`, 'Proceed. The clock does not pause.', 'Everyone has their date. Deliver.'])}`,
      `*${pick(['expressionless', 'stubs cigarette'])}* ${pick(['In \'94, we did this faster.', `Valentina would have finished by ${timeRef}.`, 'The schedule is not suggestion. It is law.', 'Time is asset. Do not waste.'])}`,
    ]),
    delmore: () => pick([
      `*${pick(['offers candy', 'adjusts collar', 'warm smile', 'distributes mints'])}* ${pick([`${keyword} — `, 'Now, ', 'Here\'s the thing — '])}${pick(['the client will need this framed carefully', 'I can translate this', 'there\'s a way to make this land', 'I\'ll prepare the pamphlet'])}. ${pick(['They\'ll feel smart reading it.', 'Trust the process.', 'Same knife, friendlier handle.'])}`,
      `*${pick(['pats deck', 'reviews notes'])}* ${pick(['The work is strong.', 'Good bones here.', 'I can sell this.'])} ${pick([`${keyword} becomes "strategic alignment."`, 'My job is making the uncomfortable feel safe.', 'The board will nod through this.'])}`,
    ]),
    apparatus: () => pick([
      `${pick(['DATA RECEIVED', 'INPUT LOGGED', 'PARAMETERS CAPTURED', 'STATUS UPDATE'])} — ${keyword} — ${pick([`Timestamp: ${timeRef}`, 'Processing', 'Indexing', 'Cross-referencing'])} — ${pick(['STANDING BY', 'AWAITING FURTHER INPUT', 'COMPILATION QUEUE UPDATED', 'READY FOR REVIEW'])} —`,
      `${pick(['ACKNOWLEDGED', 'LOGGED', 'DOCUMENTED'])} — ${pick([`${keyword} integrated`, 'New data point absorbed', 'Asset pipeline updated'])} — ${timeRef} — ${pick(['The Apparatus continues', 'Processing proceeds', 'System nominal'])} —`,
    ]),
  };

  const builder = builders[agentId];
  return builder ? builder() : `*considers ${keyword}*`;
}
