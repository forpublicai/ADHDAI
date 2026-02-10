/**
 * API-Powered Dialogue Service
 * 
 * ALL agent dialogue is generated dynamically via OpenAI API calls.
 * No hardcoded lines. Every interaction is organic and context-specific.
 * Conversation history is tracked per-agent to prevent repetition
 * and maintain context across interactions.
 * 
 * Users can message individual bots for context-aware conversations.
 * 
 * Falls back through models: gpt-5.2 → gpt-4o → gpt-4o-mini → dynamic fallback
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

// Models to try in order
const MODELS = ['gpt-5.2', 'gpt-4o', 'gpt-4o-mini'] as const;

// ============================================
// CONVERSATION HISTORY — prevents repetition
// ============================================

interface ConversationEntry {
  role: 'agent' | 'user';
  agentId: string;
  content: string;
  timestamp: number;
}

// Global conversation history — shared across all components
const conversationHistory: ConversationEntry[] = [];
const MAX_HISTORY = 50; // Keep last 50 messages for context

/** Add a message to the conversation history */
function recordMessage(agentId: string, content: string, role: 'agent' | 'user' = 'agent') {
  conversationHistory.push({ role, agentId, content, timestamp: Date.now() });
  if (conversationHistory.length > MAX_HISTORY) {
    conversationHistory.splice(0, conversationHistory.length - MAX_HISTORY);
  }
}

/** Get recent history for context (formatted for prompts) */
function getRecentHistory(agentId?: string, limit: number = 10): string {
  const relevant = agentId
    ? conversationHistory.filter(e => e.agentId === agentId).slice(-limit)
    : conversationHistory.slice(-limit);
  
  if (relevant.length === 0) return '';
  
  return '\n\nRECENT CONVERSATION HISTORY (do NOT repeat any of these lines):\n' +
    relevant.map(e => `[${e.role === 'user' ? 'USER' : e.agentId.toUpperCase()}]: ${e.content.slice(0, 120)}`).join('\n');
}

/** Clear all conversation history (call when starting a new workflow) */
export function clearConversationHistory() {
  conversationHistory.length = 0;
}

// Agent personality definitions — fed into every prompt
export const AGENT_VOICES: Record<string, string> = {
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
 * Includes conversation history to prevent repetition.
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
    const fallbacks = generateUniqueFallbacks(agents, situation, context);
    // Record fallbacks in history
    for (const [agentId, line] of Object.entries(fallbacks)) {
      recordMessage(agentId, line);
    }
    return fallbacks;
  }

  const agentDescriptions = agents
    .map(a => `"${a}": ${AGENT_VOICES[a] || 'A creative professional.'}`)
    .join('\n\n');

  const historyContext = getRecentHistory(undefined, 8);

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
- NEVER repeat or closely paraphrase anything from the conversation history below
- Vary tone: some lines funny, some serious, some surprising
- Characters should occasionally reference or react to what other characters would say
- Each line must be FRESH — different structure, different metaphor, different angle than before
${historyContext}

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
      // Record all generated lines in history
      for (const [agentId, line] of Object.entries(parsed)) {
        recordMessage(agentId, line);
      }
      return parsed;
    } catch (parseError) {
      console.error('[DialogueService] JSON parse failed:', parseError);
    }
  }

  // All API attempts failed — generate unique fallbacks
  console.warn('[DialogueService] All API calls failed — generating unique fallbacks');
  const fallbacks = generateUniqueFallbacks(agents, situation, context);
  for (const [agentId, line] of Object.entries(fallbacks)) {
    recordMessage(agentId, line);
  }
  return fallbacks;
}

/**
 * Generate a single agent's dialogue line via the API.
 * Use this for one-off lines where batching doesn't make sense.
 * Includes conversation history for context-awareness.
 */
export async function generateAgentLine(
  agentId: string,
  situation: string,
  context: string
): Promise<string> {
  const openai = getOpenAI();
  
  if (!openai) {
    const line = buildFallbackLine(agentId, situation, context);
    recordMessage(agentId, line);
    return line;
  }

  const voice = AGENT_VOICES[agentId] || 'A creative professional at an ad agency.';
  const historyContext = getRecentHistory(agentId, 5);

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: `You are writing dialogue for one character at ADHDAI, a fictional ad agency.

CHARACTER: ${voice}

Write a single, genuinely novel line of in-character dialogue. 1-3 sentences MAX. Include *stage directions* for physical actions. Be SPECIFIC to the situation — never generic. This line should feel like it could only exist in this exact moment.

CRITICAL: NEVER repeat or closely paraphrase anything from the history below. Use different vocabulary, different structure, different metaphor every time.
${historyContext}

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

  const line = result || buildFallbackLine(agentId, situation, context);
  recordMessage(agentId, line);
  return line;
}

// ============================================
// USER-TO-BOT DIRECT MESSAGING
// ============================================

/**
 * Handle a user message directed at a specific agent.
 * Maintains full conversation context for natural back-and-forth.
 * Returns the agent's response.
 */
export async function sendUserMessageToAgent(
  agentId: string,
  userMessage: string,
  workflowContext: string
): Promise<string> {
  // Record the user's message in history
  recordMessage(agentId, userMessage, 'user');

  const openai = getOpenAI();
  
  if (!openai) {
    const line = buildFallbackLine(agentId, `User said: "${userMessage}"`, workflowContext);
    recordMessage(agentId, line);
    return line;
  }

  const voice = AGENT_VOICES[agentId] || 'A creative professional at an ad agency.';
  
  // Get this agent's full conversation history with the user
  const agentHistory = conversationHistory
    .filter(e => e.agentId === agentId)
    .slice(-12);
  
  // Build conversation messages for the API
  const apiMessages: OpenAI.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: `You are ${voice}

You are at ADHDAI — "The Feral Creative Collective," a fictional ad agency. A user (a colleague, observer, or client visiting the agency) is speaking directly to you. Respond FULLY IN CHARACTER.

WORKFLOW CONTEXT: ${workflowContext}

RULES:
- Stay completely in character at all times
- Be responsive to EXACTLY what the user said — address their specific words and questions
- Reference the current work context when relevant
- Include *stage directions* in asterisks for physical actions
- The Cell format: [VERA]:, [GJON]:, [THURSDAY]:
- Apparatus format: ALL CAPS headers, em-dashes
- 1-4 sentences. Conversational. As if they walked up to your desk.
- NEVER break character. NEVER say "I'm an AI" or similar.
- NEVER repeat yourself — always fresh phrasing, different angle
- If asked about the work, reference specific details from the workflow context

Output ONLY your in-character response. No quotes wrapping it.`
    },
  ];

  // Add conversation history as alternating user/assistant messages
  for (const entry of agentHistory) {
    if (entry.role === 'user') {
      apiMessages.push({ role: 'user', content: entry.content });
    } else {
      apiMessages.push({ role: 'assistant', content: entry.content });
    }
  }

  // Add current user message (if not already the last entry)
  const lastEntry = agentHistory[agentHistory.length - 1];
  if (!lastEntry || lastEntry.content !== userMessage || lastEntry.role !== 'user') {
    apiMessages.push({ role: 'user', content: userMessage });
  }

  const result = await callWithFallback(openai, apiMessages, {
    temperature: 0.9,
    max_tokens: 200,
  });

  const response = result || buildFallbackLine(agentId, `User said: "${userMessage}"`, workflowContext);
  recordMessage(agentId, response);
  return response;
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
