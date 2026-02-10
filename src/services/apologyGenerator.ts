import OpenAI from 'openai';
import { 
  DoomsdayScenario, 
  ApologyCampaign, 
  ApologyDeliverables,
  ApologyAsset,
  ApologySocialPost,
  VideoShot
} from '../types';
import { Fortune500Company } from '../data/fortune500';

// Create OpenAI client — requires API key in .env
function getOpenAIClient(): OpenAI {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('[ApologyGenerator] VITE_OPENAI_API_KEY is not set. Add it to your .env file.');
  }
  return new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true
  });
}

// Create OpenAI client for image generation — uses VITE_OPENAI_IMAGE_API_KEY
function getOpenAIImageClient(): OpenAI {
  const apiKey = import.meta.env.VITE_OPENAI_IMAGE_API_KEY;
  if (!apiKey) {
    throw new Error('[ApologyGenerator] VITE_OPENAI_IMAGE_API_KEY is not set. Add it to your .env file.');
  }
  return new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true
  });
}

// Model cascade — try gpt-5.2, then gpt-4o, then gpt-4o-mini
const MODELS = ['gpt-5.2', 'gpt-4o', 'gpt-4o-mini'] as const;

async function callWithModelCascade(
  openai: OpenAI,
  params: Omit<OpenAI.ChatCompletionCreateParamsNonStreaming, 'model'>
): Promise<string> {
  const errors: string[] = [];
  for (const model of MODELS) {
    try {
      const response = await openai.chat.completions.create({ model, ...params });
      const content = response.choices[0]?.message?.content?.trim();
      if (content) return content;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[ApologyGenerator] ${model} failed:`, msg);
      errors.push(`${model}: ${msg}`);
    }
  }
  throw new Error(`[ApologyGenerator] All models failed:\n${errors.join('\n')}`);
}

// Generate unique ID
function generateId(): string {
  return `campaign-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Get brand personality based on company industry
function getBrandPersonality(company: Fortune500Company): string {
  const personalities: Record<string, string> = {
    'Technology': 'Silicon Valley techno-optimist meets Black Mirror dystopia. Clean lines, sans-serif everything, "disruption" language that aged poorly.',
    'Financials': 'Old money pretending to care about Main Street. Navy blue, gold accents, handshakes that promise nothing. Serif fonts that say "trust us, we wear suits."',
    'Health Care': 'Clinical warmth. Stock photos of diverse families smiling at pills. Teal and white. "Your health is our priority" while the CFO does math.',
    'Consumer Discretionary': 'Aspirational lifestyle nonsense. People laughing at salads. "Live your best life" while buying things. Bright, optimistic, hollow.',
    'Energy': 'Green-washed industrial complex. Windmills in front of oil rigs. "Sustainable" in a font that costs $50,000. The color green doing a lot of heavy lifting.',
    'Industrials': 'Hard hats and handshakes. American flags and steel. "Built to last" from a company that will offshore production next quarter.',
    'Consumer Staples': 'Comforting familiarity. Your grandmother and also a laboratory. "Since 1892" as if age equals trust. Warm colors hiding cold calculations.',
    'Materials': 'B2B boredom elevated to art. Charts that go up and to the right. "Solutions" and "synergies." Gray is a color choice, actually.',
    'Real Estate': 'Glass towers and "urban living." Renderings of parks that don\'t exist yet. "Community" means expensive coffee shops.',
    'Utilities': 'Infrastructure porn. Linemen in storms. "Keeping the lights on" while lobbying against solar.',
    'Communication Services': 'Millennial pink to Gen-Z chaos. "Connecting the world" while harvesting data. Every font is custom. Everything is an "experience."'
  };
  return personalities[company.sector] || 'Generic corporate trying too hard. Sans-serif, blue, "innovation" without specifics.';
}

// Get visual style based on company
function getVisualStyle(company: Fortune500Company): { aesthetic: string; colors: string; typography: string } {
  const styles: Record<string, { aesthetic: string; colors: string; typography: string }> = {
    'Technology': {
      aesthetic: 'Minimalist tech brutalism. Lots of white space. Product floating in void. Gradients that went through committee.',
      colors: 'Electric blue, pure white, one accent color that\'s "different" but safe. Maybe a tech gradient.',
      typography: 'SF Pro, Inter, or something custom that cost too much. All weights. Variable font energy.'
    },
    'Financials': {
      aesthetic: 'Timeless (boring) elegance. Navy everything. Stock photos of handshakes and skylines. The occasional gold serif.',
      colors: 'Navy (#1a365d), gold accents, forest green for "growth," dove gray for "stability."',
      typography: 'Serif for headlines (trust), clean sans for body (modern but not too modern). Times meets Gotham.'
    },
    'Health Care': {
      aesthetic: 'Clinical but caring. White coats, warm lighting. Families who are too happy about their insurance.',
      colors: 'Teal (#0d9488), soft white, coral accents for "humanity," navy for "expertise."',
      typography: 'Friendly sans-serif. Something with good readability and subtle warmth. Maybe rounded corners.'
    },
    'Energy': {
      aesthetic: 'Nature vs. infrastructure. Sunrise/sunset porn. Wind turbines. The word "sustainable" appears 47 times.',
      colors: 'Forest green, sky blue, earth tones. One shocking yellow for "solar." Black for the annual report.',
      typography: 'Bold, confident, slightly aggressive. Industrial meets eco-friendly. Contradictory but committed.'
    },
    'Consumer Discretionary': {
      aesthetic: 'Lifestyle aspiration. People having more fun than you. Products as identity. Influencer-adjacent.',
      colors: 'Whatever\'s trending. Currently: millennial pink, gen-z green, or "authentic" earth tones.',
      typography: 'Custom everything. Instagram-ready. Probably kerned to death.'
    }
  };
  return styles[company.sector] || {
    aesthetic: 'Corporate generic. Stock photos. Blue. The color blue. More blue.',
    colors: 'Blue (#2563eb), gray, white, maybe a warm accent if they\'re feeling bold.',
    typography: 'Whatever\'s in the brand guidelines from 2018.'
  };
}

/**
 * Generates a BRAND CAMPAIGN disguised as an apology
 * This is where the ADHDAI magic happens - using the apology as creative springboard
 */
export async function generateApologyCampaign(
  scenario: DoomsdayScenario,
  company: Fortune500Company
): Promise<ApologyCampaign> {
  const campaignId = generateId();
  const openai = getOpenAIClient();

  // Generate core creative concept first
  const creativeDirection = await generateCreativeDirection(openai, scenario, company);
  
  // Generate the insane marketing angle
  const marketingAngle = await generateMarketingAngle(openai, scenario, company, creativeDirection);
  
  // Generate deliverables with the creative direction
  const deliverables = await generateDeliverables(openai, scenario, company, creativeDirection, marketingAngle);

  // Build key messages
  const keyMessages: string[] = [
    marketingAngle.bigIdea,
    marketingAngle.insaneAngle,
    ...(creativeDirection.slogans || []).slice(0, 2)
  ].filter(Boolean);

  return {
    id: campaignId,
    scenarioId: scenario.id,
    companyName: company.name,
    scenarioTitle: scenario.title,
    status: 'complete',
    headline: creativeDirection.headline,
    subheadline: creativeDirection.tagline,
    apologyStatement: creativeDirection.manifesto,
    keyMessages,
    tone: creativeDirection.tone,
    visualConcept: creativeDirection.visualConcept,
    colorPalette: creativeDirection.colors,
    typography: creativeDirection.typography,
    deliverables,
    generatedAt: Date.now()
  };
}

interface CreativeDirection {
  headline: string;
  tagline: string;
  manifesto: string;
  slogans: string[];
  tone: string;
  visualConcept: string;
  colors: string[];
  typography: string;
}

/**
 * Generate the core creative direction - this is where the campaign magic happens
 */
async function generateCreativeDirection(
  openai: OpenAI,
  scenario: DoomsdayScenario,
  company: Fortune500Company
): Promise<CreativeDirection> {
  const brandPersonality = getBrandPersonality(company);
  const visualStyle = getVisualStyle(company);
  
  const prompt = `You are the creative leadership of an agency that operates at the level of Wieden+Kennedy, Droga5, Mischief @ No Fixed Address, and Ogilvy at their absolute best. Your work wins Grand Prix at Cannes, gets written up in The New York Times, and enters the cultural conversation. You're creating a PROACTIVE APOLOGY CAMPAIGN for ${company.name} (${company.industry}, ${company.sector}).

THE DISASTER THEY'RE PRE-APOLOGIZING FOR:
"${scenario.title}"
${scenario.description}
Severity: ${scenario.severity} | Timeline: ${scenario.timeHorizon}
Affected: ${scenario.affectedParties.join(', ')}

BRAND DNA:
${brandPersonality}
Visual world: ${visualStyle.aesthetic}

YOUR BRIEF:
Transform this pre-apology into the most culturally significant brand campaign ${company.name} has ever produced. This is not damage control — this is a brand redefining corporate accountability as a creative act.

CREATIVE STANDARDS (the agencies whose work yours must match):

WIEDEN+KENNEDY STANDARD: Find the emotional truth. "Just Do It" wasn't about shoes — it was about human potential. What's the "Just Do It" of preemptive corporate accountability for ${company.name}?

DROGA5 STANDARD: Be culturally aware. The best Droga5 work (Under Armour "Rule Yourself," Newcastle "Band of Brands") understands the cultural moment and creates work that people WANT to share. What cultural nerve does this campaign touch?

MISCHIEF STANDARD: Be unignorable. Mischief's "Tinder: It Starts With a Swipe" and "Steak-umm" work proves that the most outrageous idea in the room is often the smartest. What's the idea so bold that ${company.name}'s board would need to be brave to approve it?

OGILVY STANDARD: Ground it in insight. "The consumer is not a moron. She is your wife." What HUMAN TRUTH about how people relate to ${company.industry.toLowerCase()} powers this campaign?

PENTAGRAM STANDARD: Every visual choice carries meaning. Typography isn't decoration — it's communication. Color isn't preference — it's strategy. What visual system makes this campaign unmistakably ${company.name} yet unmistakably different from anything they've done?

THE WORK MUST BE:
1. BRAND-SPECIFIC — This could ONLY come from ${company.name}. Not interchangeable with any other company.
2. ONE BIG IDEA — A single organizing thought that everything ladders up to. A campaign platform, not a collection of ads.
3. TONALLY PRECISE — The exact balance of sincerity, self-awareness, and controlled absurdity that makes people think "I can't believe they actually did this."
4. QUOTABLE — Lines that get screenshotted, tweeted, and printed on protest signs. Lines with rhythm and surprise.
5. VISUALLY AUTHORED — Not "clean and modern." A specific visual POINT OF VIEW that has the confidence of Pentagram's best identity work.

Return JSON:
{
  "headline": "A headline that stops you. 5-10 words. The kind of line that gets a standing ovation in a creative review. Could run as a New York Times full-page ad.",
  "tagline": "The campaign platform line. 3-6 words. The thing that becomes a hashtag, a t-shirt, a cultural reference. Think 'Just Do It' level memorability.",
  "manifesto": "4-6 sentences. Written with the craft of literary prose. Not corporate speak — HUMAN speak. Specific to ${company.name} and ${scenario.title}. The kind of writing that makes you read it twice.",
  "slogans": ["6-8 alternative lines — some for billboards (5 words max), some for social (conversational), some for print (can be longer). Each must be specific to ${company.industry}. At least 2 should be darkly funny. At least 2 should be genuinely moving."],
  "tone": "3 sentences. Be precise: what does this sound like? Reference specific cultural touchstones (films, writers, other campaigns). Describe the emotional arc — where does the reader start and where do they land?",
  "visualConcept": "4-5 sentences. Describe a VISUAL SYSTEM, not just an image. Reference specific photographers, directors, or design movements. How does typography function? What does the negative space say? What's the material quality — glossy? Matte? Newsprint? Each choice should be defensible.",
  "colors": ["5 hex codes — not generic. Each color should have a REASON. The primary is _____ because _____. Pull from ${company.sector} visual language but transform it."],
  "typography": "Specific font pairing with rationale. Not just 'serif and sans-serif' — WHY these faces? What do they communicate about ${company.name}'s relationship to this apology?"
}`;

  const rawCreativeResponse = await callWithModelCascade(openai, {
    messages: [
      {
        role: 'system',
        content: `You are the combined creative intelligence of the world's best agencies — Wieden+Kennedy's emotional truth, Droga5's cultural sharpness, Pentagram's design precision, Ogilvy's strategic rigor, and Mischief's fearless boundary-pushing. You produce work that wins Grand Prix at Cannes not because it's "advertising" but because it's CULTURE. Your copy has the rhythm of great prose — every sentence has a beat, a turn, a reason. Your concepts are simple enough for a billboard and deep enough for a thesis. You never settle for the second-best idea. You never write a line you've read before. You understand that the best satire is indistinguishable from the best sincerity. Output valid JSON only.`
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.92,
    response_format: { type: 'json_object' },
    max_tokens: 3000
  });

  return JSON.parse(rawCreativeResponse) as CreativeDirection;
}

interface MarketingAngle {
  bigIdea: string;
  insaneAngle: string;
  activationConcept: string;
  productTieIn: string;
}

/**
 * Generate the insane marketing angle that makes this more than just an apology
 */
async function generateMarketingAngle(
  openai: OpenAI,
  scenario: DoomsdayScenario,
  company: Fortune500Company,
  creative: CreativeDirection
): Promise<MarketingAngle> {
  const prompt = `You're the Chief Strategy Officer at an agency that has produced: Burger King "Whopper Detour," KFC "FCK," Patagonia "Don't Buy This Jacket," Nike "Dream Crazy," and Mischief's Tinder work. You think in PR-able ideas and cultural moments.

${company.name} is running a preemptive apology campaign for: "${scenario.title}"

Creative direction:
Headline: "${creative.headline}"
Tagline: "${creative.tagline}"

Give us the STRATEGIC ANGLE that makes this campaign impossible to ignore. Not just advertising — a cultural EVENT. The kind of idea that gets covered by CNN, tweeted by AOC, and debated on podcasts.

REFERENCE FRAMEWORK:
- KFC "FCK" — Owned the crisis with humor and turned a disaster into the most-shared print ad in a decade
- Patagonia "Don't Buy This Jacket" — Used radical honesty as brand-building genius
- Burger King "Whopper Detour" — Weaponized a competitor's infrastructure for engagement
- Nike "Dream Crazy" — Took a political stance that divided people but unified the brand
- Mischief/Tinder "It Starts With a Swipe" — Reframed a product's cultural perception entirely

YOUR ANGLE must be:
1. SPECIFIC to ${company.name} — not interchangeable with any other brand
2. ACTIVATABLE — not just an idea, but something that could actually happen in the real world
3. PR-WORTHY — journalists would write about this because it's genuinely newsworthy
4. STRATEGICALLY SOUND — beneath the boldness, there's a business reason this works

Return JSON:
{
  "bigIdea": "One sentence. The strategic insight that makes this entire campaign inevitable. This is the sentence you'd say to the ${company.name} CMO to get them to lean forward in their chair.",
  "insaneAngle": "The execution idea that makes this campaign legendary. Be SPECIFIC — what exactly happens, where, when, and why it would generate press coverage. This should be as specific and executable as a Mischief @ No Fixed Address brief.",
  "activationConcept": "A real-world, experiential activation — not 'pop-up shop' generic, but something that could only exist for ${company.name} apologizing for ${scenario.title}. Think about the intersection of the brand, the apology, and the affected communities.",
  "productTieIn": "The strategic jiu-jitsu: how does apologizing for this disaster actually STRENGTHEN ${company.name}'s brand and business? The cynical genius that makes this work commercially, not just creatively."
}`;

  const rawAngleResponse = await callWithModelCascade(openai, {
    messages: [
      {
        role: 'system',
        content: 'You are a Chief Strategy Officer who has shaped the most talked-about campaigns of the last decade. You think in cultural moments, not media impressions. You understand that the best brand strategy happens when a brand does something so surprising that earned media does 90% of the work. Your ideas are bold enough to make a CMO nervous and smart enough to make a CFO smile. Every idea you propose has been stress-tested: is it PR-worthy? Is it brand-safe enough? Is it commercially smart? Output JSON only.'
      },
      { role: 'user', content: prompt }
    ],
    temperature: 0.95,
    response_format: { type: 'json_object' },
    max_tokens: 800
  });

  return JSON.parse(rawAngleResponse) as MarketingAngle;
}

/**
 * Generate campaign deliverables with actual creative thought
 */
async function generateDeliverables(
  openai: OpenAI,
  scenario: DoomsdayScenario,
  company: Fortune500Company,
  creative: CreativeDirection,
  marketing: MarketingAngle
): Promise<ApologyDeliverables> {
  const [printAssets, socialPosts, videoScript] = await Promise.all([
    generatePrintAssets(openai, scenario, company, creative, marketing),
    generateSocialPosts(openai, scenario, company, creative, marketing),
    generateVideoScript(openai, scenario, company, creative, marketing)
  ]);

  return {
    fullPageAd: printAssets.fullPage,
    poster: printAssets.poster,
    billboard: printAssets.billboard,
    busShelter: printAssets.busShelter,
    socialPosts,
    videoScript,
    bannerAds: printAssets.banners
  };
}

interface PrintAssets {
  fullPage: ApologyAsset;
  poster: ApologyAsset;
  billboard: ApologyAsset;
  busShelter: ApologyAsset;
  banners: ApologyAsset[];
}

async function generatePrintAssets(
  openai: OpenAI,
  scenario: DoomsdayScenario,
  company: Fortune500Company,
  creative: CreativeDirection,
  marketing: MarketingAngle
): Promise<PrintAssets> {
  const visualStyle = getVisualStyle(company);
  
  const prompt = `Create print/OOH ads for ${company.name}'s proactive apology campaign.

CAMPAIGN:
Headline: "${creative.headline}"
Tagline: "${creative.tagline}"
Visual concept: ${creative.visualConcept}
Big idea: ${marketing.bigIdea}
Brand aesthetic: ${visualStyle.aesthetic}

THE SCENARIO: "${scenario.title}"

Create ads that are:
1. VISUALLY SPECIFIC to ${company.name}'s brand - reference their ${company.industry} industry
2. CONCEPTUALLY UNIFIED - all ladder up to the same big idea
3. ACTUALLY GOOD - these should be portfolio pieces, not placeholders
4. FORMAT-AWARE - billboard copy is NOT the same as magazine copy

For visuals, describe specific images that could ONLY work for ${company.name}. Not "person looking thoughtful" - what SPECIFIC image tells this story?

Return JSON:
{
  "fullPage": { 
    "format": "Magazine Full Page", 
    "dimensions": "8.5x11", 
    "headline": "Full headline for print", 
    "body": "2-3 sentences of body copy - GREAT copy, not placeholder", 
    "visual": "SPECIFIC visual description for ${company.name}. What's in the image? What's the art direction?" 
  },
  "poster": { "format": "A1 Poster", "dimensions": "594x841mm", "headline": "Poster-sized thinking", "body": "short impactful copy", "visual": "specific visual" },
  "billboard": { "format": "Billboard", "dimensions": "14x48ft", "headline": "MAX 6 WORDS - this is a billboard", "body": "${company.name} logo placement note", "visual": "billboard visual - simple, bold, readable at speed" },
  "busShelter": { "format": "Bus Shelter", "dimensions": "1800x1200mm", "headline": "...", "body": "...", "visual": "..." },
  "banners": [
    { "format": "Digital Banner 728x90", "headline": "web banner headline", "body": "CTA", "visual": "banner visual" },
    { "format": "Digital Banner 300x250", "headline": "...", "body": "...", "visual": "..." }
  ]
}`;

  const rawPrintResponse = await callWithModelCascade(openai, {
    messages: [
      {
        role: 'system',
        content: `You are an Executive Creative Director whose print work has won D&AD Yellow Pencils, Cannes Gold Lions, and One Show Gold. You understand that a billboard seen at 60mph requires completely different creative than a magazine page read at arm's length. Your headlines are surgically precise — every word earns its place. Your body copy has the rhythm of Hemingway: short sentences that carry weight, then a longer one that opens up the room. Your visual descriptions are specific enough to brief Annie Leibovitz or David LaChapelle — you describe camera angle, lighting quality, lens choice, composition, and emotional temperature. You never write "person looking at product" — you write exactly what the photograph captures and why it matters. Output JSON only.`
      },
      { role: 'user', content: prompt }
    ],
    temperature: 0.9,
    response_format: { type: 'json_object' },
    max_tokens: 2000
  });

  const parsed = JSON.parse(rawPrintResponse);
  const extractAsset = (raw: Record<string, unknown>): ApologyAsset => ({
    format: (raw.format as string) || '',
    dimensions: (raw.dimensions as string) || '',
    headline: (raw.headline as string) || '',
    body: (raw.body as string) || '',
    visual: (raw.visual as string) || '',
  });
  return {
    fullPage: extractAsset(parsed.fullPage || {}),
    poster: extractAsset(parsed.poster || {}),
    billboard: extractAsset(parsed.billboard || {}),
    busShelter: extractAsset(parsed.busShelter || {}),
    banners: Array.isArray(parsed.banners) 
      ? parsed.banners.map((b: Record<string, unknown>) => extractAsset(b))
      : [],
  };
}

async function generateSocialPosts(
  openai: OpenAI,
  scenario: DoomsdayScenario,
  company: Fortune500Company,
  creative: CreativeDirection,
  marketing: MarketingAngle
): Promise<ApologySocialPost[]> {
  const prompt = `Create social media content for ${company.name}'s proactive apology campaign.

CAMPAIGN:
Headline: "${creative.headline}"
Tagline: "${creative.tagline}"
Insane angle: ${marketing.insaneAngle}
Activation: ${marketing.activationConcept}

THE SCENARIO: "${scenario.title}"

Create social posts that:
1. FEEL NATIVE to each platform - TikTok is not LinkedIn
2. COULD GO VIRAL - what makes people share?
3. TIE INTO THE ACTIVATION - reference ${marketing.activationConcept}
4. ARE BRAND-SPECIFIC - ${company.name} voice, ${company.industry} references

Return JSON array:
[
  { "platform": "Twitter/X", "type": "Thread opener", "copy": "ACTUAL GOOD TWEET - not corporate speak", "visual": "specific image/video description", "hashtags": ["campaign-specific", "clever", "shareable"] },
  { "platform": "Instagram", "type": "Carousel", "copy": "instagram caption with line breaks and personality", "visual": "carousel concept - what are the slides?", "hashtags": [] },
  { "platform": "LinkedIn", "type": "CEO Post", "copy": "LinkedIn thought leadership that's actually interesting", "visual": "...", "hashtags": [] },
  { "platform": "TikTok", "type": "Original Sound", "copy": "TikTok concept - what's the hook? what's the format?", "visual": "video description", "hashtags": [] },
  { "platform": "Instagram", "type": "Reel", "copy": "Reel concept", "visual": "...", "hashtags": [] }
]`;

  const rawSocialResponse = await callWithModelCascade(openai, {
    messages: [
      {
        role: 'system',
        content: `You are a Head of Social Creative whose work has gone viral not through tricks but through genuine cultural intelligence. Your TikToks feel native — they use the platform's language, pacing, and humor conventions. Your Instagram carousels are designed for saves and shares, not just likes. Your Twitter/X posts understand that the best brand tweets read like they were written by the brand's most self-aware employee. Your LinkedIn posts navigate the fine line between thought leadership and genuine vulnerability. You create content that people share because it's the most interesting thing in their feed — not because it's "branded content" but because it's genuinely good content that happens to come from a brand. You understand hooks, retention, and the psychology of the share button on each specific platform. Output JSON only (wrap array in an object with key "posts" if needed).`
      },
      { role: 'user', content: prompt }
    ],
    temperature: 0.95,
    response_format: { type: 'json_object' },
    max_tokens: 2000
  });

  const parsed = JSON.parse(rawSocialResponse);
  const rawPosts = Array.isArray(parsed) ? parsed : (parsed.posts || parsed.socialPosts || []);
  
  return rawPosts.map((p: Record<string, unknown>) => ({
    platform: (p.platform as string) || 'Twitter/X',
    type: (p.type as string) || 'Post',
    copy: (p.copy as string) || creative.tagline,
    visual: (p.visual as string) || 'Campaign visual',
    hashtags: Array.isArray(p.hashtags) ? p.hashtags as string[] : [],
  }));
}

async function generateVideoScript(
  openai: OpenAI,
  scenario: DoomsdayScenario,
  company: Fortune500Company,
  creative: CreativeDirection,
  marketing: MarketingAngle
): Promise<{ title: string; duration: string; format: string; script: VideoShot[]; notes: string }> {
  const prompt = `Create a :60 video for ${company.name}'s proactive apology campaign.

CAMPAIGN:
Headline: "${creative.headline}"  
Tagline: "${creative.tagline}"
Visual concept: ${creative.visualConcept}
Tone: ${creative.tone}
Big idea: ${marketing.bigIdea}

THE SCENARIO: "${scenario.title}"

Create a video that:
1. IS NOT the generic "CEO at desk" apology video
2. COULD WIN AWARDS - think Nike, Apple, Patagonia territory
3. MATCHES ${company.name}'s brand aesthetic but pushes it
4. HAS A TWIST - what's the unexpected moment?

Consider: Is this a mini-documentary? A visual poem? A fake product launch? An employee testimonial series? What FORM does this take?

Return JSON:
{
  "title": "Film title",
  "duration": "60 seconds",
  "format": "The creative format - is this documentary? commercial? mockumentary? art film?",
  "script": [
    { "shot": "1", "duration": "Xs", "visual": "SPECIFIC visual direction - camera move, subject, setting", "audio": "VO/music/dialogue", "onScreenText": "any supers" }
  ],
  "notes": "Director's notes - tone, reference films, casting notes, music direction"
}`;

  const rawVideoResponse = await callWithModelCascade(openai, {
    messages: [
      {
        role: 'system',
        content: `You are a commercial director whose work has been featured at Cannes Film Festival and won the Palme d'Or for advertising. You've directed for Nike, Apple, and Google. You think in shots the way poets think in lines — every frame carries emotional weight and narrative purpose. Your scripts read like short films by Spike Jonze, Hiro Murai, or Barry Jenkins. You specify camera movement (steadicam, handheld, locked-off), lens choice (wide for vulnerability, close for intimacy), lighting quality (natural vs. shaped, warm vs. cool), and sound design (what we hear shapes what we feel). Your casting notes describe real people, not demographics. Your music direction references specific artists and moods, not "upbeat corporate." Every transition is motivated — you never cut because you're bored, you cut because the story demands it. Output JSON only.`
      },
      { role: 'user', content: prompt }
    ],
    temperature: 0.9,
    response_format: { type: 'json_object' },
    max_tokens: 2000
  });

  const parsed = JSON.parse(rawVideoResponse);
  return {
    title: (parsed.title as string) || '',
    duration: (parsed.duration as string) || '60 seconds',
    format: (parsed.format as string) || '',
    script: Array.isArray(parsed.script)
      ? parsed.script.map((s: Record<string, unknown>) => ({
          shot: (s.shot as string) || '1',
          duration: (s.duration as string) || '5s',
          visual: (s.visual as string) || '',
          audio: (s.audio as string) || '',
          onScreenText: (s.onScreenText as string) || undefined,
        }))
      : [],
    notes: (parsed.notes as string) || '',
  };
}

/**
 * Generate campaign image using DALL-E — SCENARIO-SPECIFIC
 * Each prompt is deeply contextualized to the company, scenario, and campaign creative.
 * Uses VITE_OPENAI_IMAGE_API_KEY for image generation.
 */
export async function generateCampaignImage(
  campaign: ApologyCampaign,
  imageType: 'hero' | 'social' | 'billboard'
): Promise<string | null> {
  const openai = getOpenAIImageClient();

  const company = campaign.companyName || 'Corporation';
  const scenario = campaign.scenarioTitle || 'corporate crisis';
  const visual = campaign.visualConcept || 'corporate confession aesthetic';
  
  // Build deeply specific prompts for each format
  const prompts: Record<string, string> = {
    hero: `Award-winning advertising campaign photograph for ${company}'s corporate accountability campaign about "${scenario}". The image captures the emotional weight of a major corporation confronting its own future failures. ${visual}. Shot in the style of a Cannes Lions Grand Prix winner — cinematic, editorial, emotionally resonant. Think Annie Leibovitz meets corporate photography. The composition should feel like a Fortune magazine cover story about corporate reckoning. Moody, contemplative lighting. Deep shadows. A sense of institutional gravity. This is not stock photography — this is art direction at the highest level. No text, no logos, no watermarks, no words of any kind.`,
    
    social: `Instagram-native campaign image for ${company}'s preemptive apology about "${scenario}". Square format. The image should stop someone mid-scroll — visually arresting, emotionally provocative, impossible to ignore. ${visual}. Think: the kind of brand post that gets screenshotted and shared in group chats. Documentary aesthetic meets high-fashion editorial. Bold color grading, strong composition, a single powerful visual metaphor for corporate accountability. Should feel like it belongs on the feed of a brand that just did something unprecedented. No text, no logos, no watermarks.`,
    
    billboard: `Outdoor billboard campaign photograph for ${company} about "${scenario}". Ultra-wide 16:9 composition designed for a 14x48 foot billboard. The image must work at massive scale — bold, simple, one clear focal point with dramatic negative space. ${visual}. Think: the billboard you remember from a highway drive. Cinematic landscape-scale imagery that communicates corporate confession without words. The visual equivalent of a company taking a deep breath before telling the truth. Dramatic, slightly unsettling, beautiful. No text, no logos, no watermarks.`
  };

  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompts[imageType],
      n: 1,
      size: imageType === 'billboard' ? '1792x1024' : '1024x1024',
      quality: 'hd',
      style: 'vivid',
      response_format: 'b64_json'
    });

    const b64Data = response.data?.[0]?.b64_json;
    if (b64Data) {
      return `data:image/png;base64,${b64Data}`;
    }
    return null;
  } catch (error) {
    console.error('Error generating campaign image:', error);
    return null;
  }
}
