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
  
  // Always have defaults ready so nothing is ever undefined
  const defaults = getDefaultCreativeDirection(scenario, company);
  const defaultPrint = getDefaultPrintAssets(company, defaults);
  const defaultSocial = getDefaultSocialPosts(company, defaults);
  const defaultVideo = getDefaultVideoScript(company, defaults);
  
  const openai = getOpenAIClient();
  
  if (!openai) {
    console.warn('OpenAI API key not found. Using fallback campaign.');
    return generateFallbackCampaign(campaignId, scenario, company);
  }

  try {
    // Generate core creative concept first
    const rawCreative = await generateCreativeDirection(openai, scenario, company);
    
    // SAFELY extract fields — never trust the API response shape
    const creativeDirection: CreativeDirection = {
      headline: rawCreative.headline || defaults.headline,
      tagline: rawCreative.tagline || defaults.tagline,
      manifesto: rawCreative.manifesto || defaults.manifesto,
      slogans: Array.isArray(rawCreative.slogans) && rawCreative.slogans.length > 0 
        ? rawCreative.slogans : defaults.slogans,
      tone: rawCreative.tone || defaults.tone,
      visualConcept: rawCreative.visualConcept || defaults.visualConcept,
      colors: Array.isArray(rawCreative.colors) && rawCreative.colors.length > 0 
        ? rawCreative.colors : defaults.colors,
      typography: rawCreative.typography || defaults.typography,
    };
    
    // Generate the insane marketing angle
    const rawAngle = await generateMarketingAngle(openai, scenario, company, creativeDirection);
    const marketingAngle: MarketingAngle = {
      bigIdea: rawAngle.bigIdea || `${company.name} owns their future mistakes before anyone else can`,
      insaneAngle: rawAngle.insaneAngle || `Launch an "Apology Subscription Service" for ${company.name}`,
      activationConcept: rawAngle.activationConcept || 'Pop-up "Pre-Forgiveness Centers"',
      productTieIn: rawAngle.productTieIn || 'Limited edition "Pre-Apologized" product line',
    };
    
    // Generate deliverables with the creative direction
    let deliverables: ApologyDeliverables;
    try {
      deliverables = await generateDeliverables(openai, scenario, company, creativeDirection, marketingAngle);
    } catch {
      // If deliverables fail, use defaults
      deliverables = {
        fullPageAd: defaultPrint.fullPage,
        poster: defaultPrint.poster,
        billboard: defaultPrint.billboard,
        busShelter: defaultPrint.busShelter,
        bannerAds: defaultPrint.banners,
        socialPosts: defaultSocial,
        videoScript: defaultVideo,
      };
    }
    
    // Ensure deliverables are complete — fill any gaps
    if (!deliverables.fullPageAd) deliverables.fullPageAd = defaultPrint.fullPage;
    if (!deliverables.poster) deliverables.poster = defaultPrint.poster;
    if (!deliverables.billboard) deliverables.billboard = defaultPrint.billboard;
    if (!deliverables.busShelter) deliverables.busShelter = defaultPrint.busShelter;
    if (!deliverables.socialPosts || deliverables.socialPosts.length === 0) deliverables.socialPosts = defaultSocial;
    if (!deliverables.videoScript) deliverables.videoScript = defaultVideo;
    if (!deliverables.bannerAds || deliverables.bannerAds.length === 0) deliverables.bannerAds = defaultPrint.banners;

    // Build safe key messages
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
      keyMessages: keyMessages.length > 0 ? keyMessages : defaults.slogans,
      tone: creativeDirection.tone,
      visualConcept: creativeDirection.visualConcept,
      colorPalette: creativeDirection.colors,
      typography: creativeDirection.typography,
      deliverables,
      generatedAt: Date.now()
    };
  } catch (error) {
    console.error('Error generating apology campaign:', error);
    // Even on error, return a USABLE campaign with fallback content
    return generateFallbackCampaign(campaignId, scenario, company);
  }
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
  
  const prompt = `You are the ADHDAI creative collective - a feral group of advertising misfits who create brilliant, unhinged work. You're creating a PROACTIVE APOLOGY CAMPAIGN for ${company.name} (${company.industry}, ${company.sector}).

THE DISASTER THEY'RE APOLOGIZING FOR (before it happens):
"${scenario.title}"
${scenario.description}
Severity: ${scenario.severity} | Timeline: ${scenario.timeHorizon}
Who gets hurt: ${scenario.affectedParties.join(', ')}

BRAND CONTEXT:
${brandPersonality}
Visual style: ${visualStyle.aesthetic}

YOUR MISSION:
Turn this apology into a BRAND CAMPAIGN. Yes, they're apologizing for something that hasn't happened yet. But make it a MOMENT. Make it a MOVEMENT. This isn't damage control - it's the most honest advertising they've ever done.

The work should be:
1. BRAND-SPECIFIC - This could ONLY be from ${company.name}. Reference their industry, their tone, their bullshit.
2. CONCEPTUALLY BOLD - One clear big idea that's actually good, even if it's insane
3. TONALLY PERFECT - Match ${company.name}'s brand voice, but with cracks showing the absurdity
4. QUOTABLE - Give me lines that people would actually share, even ironically
5. VISUALLY DISTINCT - Describe visuals that match THIS brand, not generic corporate

Think: If Cannes had a category for "Best Preemptive Apology" this would win.

Return JSON:
{
  "headline": "A headline that could be a magazine cover. 6-10 words. Actually good. Could be earnest or darkly funny.",
  "tagline": "The campaign tagline. Short. Memorable. The thing people would hashtag or put on a t-shirt ironically.",
  "manifesto": "3-4 sentences. The official apology statement, but written like a brand manifesto. Specific to ${company.name} and ${scenario.title}.",
  "slogans": ["4-6 alternative taglines/slogans. Some earnest, some absurd, all quotable. Reference ${company.industry} specifics."],
  "tone": "2 sentences describing the tone. Be specific about the balance of sincerity and absurdity.",
  "visualConcept": "3-4 sentences. Describe the visual world of this campaign. Reference ${company.name}'s actual brand aesthetic but twisted for the apology context.",
  "colors": ["5 hex codes - pull from ${company.sector} aesthetics but make them work for apology context"],
  "typography": "Font pairing that feels like ${company.name} but slightly off"
}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are the creative hive mind of ADHDAI, a feral advertising collective. You create work that is satirical but genuinely good - the kind of ads that would win awards even as they critique the advertising industry. Your copy is sharp, your concepts are bold, and you never settle for generic. You understand that the best satire comes from love. Output valid JSON only.`
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.95,
    response_format: { type: 'json_object' },
    max_tokens: 1500
  });

  const response = completion.choices[0]?.message?.content?.trim() || '';
  
  try {
    return JSON.parse(response) as CreativeDirection;
  } catch {
    return getDefaultCreativeDirection(scenario, company);
  }
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
  const prompt = `You're ADHDAI's strategy team. ${company.name} is running a preemptive apology campaign for: "${scenario.title}"

The creative direction is:
Headline: "${creative.headline}"
Tagline: "${creative.tagline}"

Now give us the INSANE MARKETING ANGLE. The thing that makes this campaign legendary. The thing that makes people go "holy shit, they actually did that."

Think:
- Burger King printing McDonald's ads during their outage
- KFC apologizing with "FCK" bucket
- Patagonia's "Don't Buy This Jacket"
- But make it PROACTIVE. They're apologizing BEFORE the disaster.

Return JSON:
{
  "bigIdea": "One sentence. The strategic concept that makes this campaign work.",
  "insaneAngle": "The wild marketing stunt or approach that would actually get press coverage. Be specific to ${company.name}.",
  "activationConcept": "A real-world activation idea that would make this campaign experiential.",
  "productTieIn": "How this apology campaign could actually drive ${company.name}'s business. The cynical genius."
}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a strategic genius who finds the angle that makes campaigns go viral. You think in headlines and activations. Output JSON only.'
      },
      { role: 'user', content: prompt }
    ],
    temperature: 0.95,
    response_format: { type: 'json_object' },
    max_tokens: 800
  });

  try {
    return JSON.parse(completion.choices[0]?.message?.content || '{}') as MarketingAngle;
  } catch {
    return {
      bigIdea: `${company.name} owns their future mistakes before anyone else can`,
      insaneAngle: `Launch an "Apology Subscription Service" where stakeholders get early access to what ${company.name} is sorry for next`,
      activationConcept: 'Pop-up "Pre-Forgiveness Centers" where people can accept apologies in advance',
      productTieIn: 'Limited edition "Pre-Apologized" product line with the campaign tagline'
    };
  }
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

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are an award-winning creative director. Every ad you write could win at Cannes. You understand format - billboards are different from magazines. Your copy is tight, your concepts are clear, your visuals are specific. You never write "person looking thoughtful" - you write exactly what's in the frame. Output JSON only.`
      },
      { role: 'user', content: prompt }
    ],
    temperature: 0.9,
    response_format: { type: 'json_object' },
    max_tokens: 2000
  });

  const defaults = getDefaultPrintAssets(company, creative);
  try {
    const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}');
    // Safely extract with fallbacks for every field
    const safeAsset = (raw: Record<string, unknown> | undefined, fallback: ApologyAsset): ApologyAsset => {
      if (!raw || typeof raw !== 'object') return fallback;
      return {
        format: (raw.format as string) || fallback.format,
        dimensions: (raw.dimensions as string) || fallback.dimensions,
        headline: (raw.headline as string) || fallback.headline,
        body: (raw.body as string) || fallback.body,
        visual: (raw.visual as string) || fallback.visual,
      };
    };
    return {
      fullPage: safeAsset(parsed.fullPage, defaults.fullPage),
      poster: safeAsset(parsed.poster, defaults.poster),
      billboard: safeAsset(parsed.billboard, defaults.billboard),
      busShelter: safeAsset(parsed.busShelter, defaults.busShelter),
      banners: Array.isArray(parsed.banners) 
        ? parsed.banners.map((b: Record<string, unknown>, i: number) => safeAsset(b, defaults.banners[i] || defaults.banners[0]))
        : defaults.banners,
    };
  } catch {
    return defaults;
  }
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

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a social media creative who actually understands each platform. Your TikToks feel like TikToks. Your LinkedIn posts understand the game. You create content that people share because it's genuinely good or genuinely unhinged. Output JSON array only.`
      },
      { role: 'user', content: prompt }
    ],
    temperature: 0.95,
    response_format: { type: 'json_object' },
    max_tokens: 2000
  });

  const defaults = getDefaultSocialPosts(company, creative);
  try {
    const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}');
    const rawPosts = Array.isArray(parsed) ? parsed : (parsed.posts || parsed.socialPosts || []);
    if (!Array.isArray(rawPosts) || rawPosts.length === 0) return defaults;
    
    return rawPosts.map((p: Record<string, unknown>, i: number) => ({
      platform: (p.platform as string) || defaults[i % defaults.length]?.platform || 'Twitter/X',
      type: (p.type as string) || 'Post',
      copy: (p.copy as string) || defaults[i % defaults.length]?.copy || creative.tagline,
      visual: (p.visual as string) || 'Campaign visual',
      hashtags: Array.isArray(p.hashtags) ? p.hashtags as string[] : [],
    }));
  } catch {
    return defaults;
  }
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

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a commercial director known for breakthrough work. You think in shots and sequences. Your scripts read like short films. You reference specific camera moves, lighting, and tone. Every frame has purpose. Output JSON only.`
      },
      { role: 'user', content: prompt }
    ],
    temperature: 0.9,
    response_format: { type: 'json_object' },
    max_tokens: 2000
  });

  const defaults = getDefaultVideoScript(company, creative);
  try {
    const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}');
    return {
      title: (parsed.title as string) || defaults.title,
      duration: (parsed.duration as string) || defaults.duration,
      format: (parsed.format as string) || defaults.format,
      script: Array.isArray(parsed.script) && parsed.script.length > 0
        ? parsed.script.map((s: Record<string, unknown>) => ({
            shot: (s.shot as string) || '1',
            duration: (s.duration as string) || '5s',
            visual: (s.visual as string) || 'Wide shot',
            audio: (s.audio as string) || '(ambient)',
            onScreenText: (s.onScreenText as string) || undefined,
          }))
        : defaults.script,
      notes: (parsed.notes as string) || defaults.notes,
    };
  } catch {
    return defaults;
  }
}

// ============================================
// SECTOR-SPECIFIC BRAND COLORS
// ============================================
function getSectorColors(sector: string): string[] {
  const palettes: Record<string, string[]> = {
    'Technology':       ['#0f0f0f', '#1a1a2e', '#4361ee', '#f72585', '#f8f9fa'],
    'Financial':        ['#0c1821', '#1b3a4b', '#c9a227', '#d4380d', '#f5f0e8'],
    'Healthcare':       ['#0d1b2a', '#1b4965', '#0d9488', '#e63946', '#f1faee'],
    'Energy':           ['#1a1a1a', '#2d3436', '#00b894', '#fdcb6e', '#f5f5f5'],
    'Consumer Goods':   ['#2d1b4e', '#1a1a2e', '#e17055', '#00cec9', '#ffeaa7'],
    'Automotive':       ['#0f0f0f', '#2c3e50', '#e74c3c', '#3498db', '#ecf0f1'],
    'Industrials':      ['#1a1a1a', '#34495e', '#e67e22', '#2ecc71', '#ecf0f1'],
    'Telecommunications': ['#0a0a23', '#1a1a40', '#e040fb', '#00e5ff', '#f5f5f5'],
    'Materials':        ['#212121', '#37474f', '#ff6f00', '#4caf50', '#efebe9'],
    'Media':            ['#0f0f0f', '#1a1a2e', '#ff0050', '#00f5d4', '#f8f8f8'],
    'Consumer Services': ['#1a0a2e', '#16213e', '#f77f00', '#06d6a0', '#edf2f4'],
    'Transportation':   ['#0d1b2a', '#1b3a4b', '#0077b6', '#ef476f', '#edf2f4'],
    'Real Estate':      ['#1a1a2e', '#2d3436', '#6c5ce7', '#fd79a8', '#f5f5f5'],
  };
  return palettes[sector] || ['#0f0f0f', '#1a1a2e', '#e94560', '#4361ee', '#f5f5f5'];
}

// ============================================
// DEFAULT FALLBACK GENERATORS
// ============================================
function getDefaultCreativeDirection(scenario: DoomsdayScenario, company: Fortune500Company): CreativeDirection {
  // Use the ACTUAL scenario title to generate specific, punchy copy
  const scenarioShort = scenario.title;
  
  const colors = getSectorColors(company.sector);

  return {
    headline: `We See "${scenarioShort}" Coming. This Is Us, Saying Sorry First.`,
    tagline: `${company.name}. Accountable before the headline breaks.`,
    manifesto: `At ${company.name}, we've spent years building trust in ${company.industry.toLowerCase()}. Today, we're risking that trust to tell you the truth: we see "${scenario.title}" as a real possibility. Not a distant fear — a credible threat that our own actions could bring about. We could wait. We could let the PR machine spin up after the fact. Instead, we're choosing to stand here, before the damage is done, and say: we know. We're sorry. And here's what we're doing about it. Because you didn't ask for a corporation that apologizes after the crisis. You asked for one that prevents it.`,
    slogans: [
      `${company.name}: Sorry in advance. Serious right now.`,
      `The crisis hasn't happened. The apology has.`,
      `Pre-emptive accountability from ${company.name}`,
      `"${scenarioShort}" — We'd rather you hear it from us.`,
    ],
    tone: `The voice of a ${company.industry.toLowerCase()} executive who just pulled the fire alarm on their own company. Not performative — genuinely unsettled. ${company.name}'s polished brand voice cracking open with uncomfortable honesty. Think: the 3am email the CEO actually sends, not the one legal approved.`,
    visualConcept: `${company.name}'s brand identity turned confessional. Their ${company.sector.toLowerCase()} aesthetic — normally used to project confidence — is now deployed for radical transparency. Desaturated ${company.industry.toLowerCase()} imagery. Documentary-style photography. Bold typography that feels like evidence, not advertising. Every visual choice says: "This is real."`,
    colors,
    typography: `Heavy condensed sans-serif for headlines (impact, urgency). Light extended for body copy (measured, sincere). The contrast between bold headlines and quiet body text mirrors the contrast between corporate confidence and corporate confession.`,
  };
}

function getDefaultPrintAssets(company: Fortune500Company, creative: CreativeDirection): PrintAssets {
  return {
    fullPage: {
      format: 'Magazine Full Page',
      dimensions: '8.5x11"',
      headline: creative.headline,
      body: creative.manifesto,
      visual: `Aerial photograph of ${company.name}'s operations — a ${company.industry.toLowerCase()} facility at golden hour, shot like a documentary still. The scale is meant to convey both power and fragility. No people visible. The emptiness is the point.`
    },
    poster: {
      format: 'A1 Poster',
      dimensions: '594x841mm',
      headline: creative.slogans[0] || creative.headline,
      body: creative.tagline,
      visual: `Close-up of a ${company.industry.toLowerCase()} object/product — shot like evidence photography. Clinical lighting, white background, the aesthetic of an internal audit made public.`
    },
    billboard: {
      format: 'Billboard',
      dimensions: '14x48ft',
      headline: creative.headline,
      body: creative.tagline,
      visual: `Split composition: left side is ${company.name}'s signature brand imagery (clean, confident, corporate), right side is the same image desaturated and cracked. The visual metaphor of honesty breaking through the brand facade.`
    },
    busShelter: {
      format: 'Bus Shelter',
      dimensions: '1800x1200mm',
      headline: creative.slogans[1] || creative.headline,
      body: `${company.name} — ${creative.tagline}`,
      visual: `Eye-level portrait composition. A single ${company.industry.toLowerCase()} symbol isolated against brand colors, with a thin red line cutting through the center. Below: a QR code labeled "Read our pre-apology."`
    },
    banners: [
      { 
        format: 'Digital Leaderboard 728x90', 
        headline: creative.headline, 
        body: `Read our pre-apology → ${company.name.toLowerCase().replace(/\s+/g, '')}.com/accountability`, 
        visual: `Brand colors with subtle distortion effect — the ${company.name} identity, glitching with honesty` 
      },
      { 
        format: 'Digital Medium Rectangle 300x250', 
        headline: creative.slogans[0] || creative.headline, 
        body: creative.tagline, 
        visual: `${company.name} logo on brand background, with manifesto text scrolling behind — the confession as texture` 
      },
      {
        format: 'Digital Skyscraper 160x600',
        headline: creative.slogans[1] || 'We owe you the truth.',
        body: `${company.name} Pre-Apology`,
        visual: `Vertical brand strip — ${company.name} colors top to bottom, with headline breaking through the gradient`
      }
    ]
  };
}

function getDefaultSocialPosts(company: Fortune500Company, creative: CreativeDirection): ApologySocialPost[] {
  return [
    {
      platform: 'Twitter/X',
      type: 'Thread',
      copy: `We need to talk.\n\nNot about something that happened. About something that hasn't happened yet.\n\nBut we know it could. And if it does, it'll be because of decisions we made.\n\nSo here's our apology. In advance.\n\n"${creative.headline}"\n\nRead the full statement ↓`,
      visual: `Text-first design. ${company.name} brand colors as background. The headline in bold white. No product imagery — just uncomfortable corporate honesty formatted as a tweet.`,
      hashtags: ['PreemptiveApology', company.name.replace(/\s+/g, ''), 'CorporateAccountability']
    },
    {
      platform: 'Instagram',
      type: 'Carousel',
      copy: `"${creative.headline}"\n\nSwipe to read the full statement.\n\nThis isn't damage control. This is damage prevention.\n\n${creative.tagline}\n\n${company.name} believes you deserve to know what we already know.`,
      visual: `10-slide carousel: Slide 1 is the headline on brand background. Slides 2-8 break down the manifesto sentence by sentence, each on a different shade of the brand palette. Slide 9 is the tagline. Slide 10 is a call to action with QR code.`,
      hashtags: ['AccountabilityEra', company.name.replace(/\s+/g, ''), 'PreemptiveApology']
    },
    {
      platform: 'LinkedIn',
      type: 'CEO Open Letter',
      copy: `To our stakeholders, our employees, and the communities we serve:\n\nI've led ${company.name} through growth, through challenges, through transformation. But I've never done this before.\n\nToday we're publishing a preemptive apology — an acknowledgment of a future we see coming and a commitment to do better before we have to.\n\n"${creative.headline}"\n\nThis isn't a PR strategy. This is what accountability looks like when you do it early enough to matter.\n\n${creative.tagline}\n\nRead our full statement at the link below.`,
      visual: `Professional but vulnerable: CEO photographed from behind, looking out floor-to-ceiling windows at the city. Shot in ${company.name}'s actual headquarters aesthetic. The composition says "looking ahead" and "weight of responsibility."`,
      hashtags: ['Leadership', 'CorporateAccountability', 'TransparencyInBusiness']
    },
    {
      platform: 'TikTok',
      type: 'Brand Film Teaser',
      copy: `POV: A Fortune 500 company apologizes for something that hasn't happened yet 💀\n\n"${creative.headline}"\n\nNo this isn't satire. ${company.name} just dropped a pre-apology for a disaster they see coming.\n\nThis is either the most honest thing a corporation has ever done or the most unhinged marketing play in history. Either way I'm watching.`,
      visual: `Quick-cut montage: ${company.name} logo → news headline about the scenario → the pre-apology statement appearing letter by letter → reaction shots → the tagline card. Gen-Z pacing, corporate content, dissonance is the point.`,
      hashtags: ['CorporateTikTok', company.name.replace(/\s+/g, ''), 'PreApology', 'ThisIsReal']
    },
    {
      platform: 'Instagram',
      type: 'Reel',
      copy: `What if a company apologized BEFORE the disaster?\n\n${company.name} just did.\n\n"${creative.headline}"\n\nLink in bio for the full pre-apology statement.`,
      visual: `15-second reel: Opens on ${company.name} logo dissolving. Cut to bold text: the headline. Cut to manifesto excerpt scrolling upward like movie credits. End card: tagline + company name. Trending audio underneath (something contemplative, not ironic).`,
      hashtags: ['PreemptiveApology', company.name.replace(/\s+/g, ''), 'BrandAccountability']
    }
  ];
}

function getDefaultVideoScript(company: Fortune500Company, creative: CreativeDirection): { title: string; duration: string; format: string; script: VideoShot[]; notes: string } {
  return {
    title: `"${creative.tagline}" - A ${company.name} Confession`,
    duration: '60 seconds',
    format: 'Documentary confession. Employees speaking directly to camera about future failures.',
    script: [
      { shot: '1', duration: '8s', visual: 'ECU: Employee eyes. Searching. A moment before speech.', audio: '(Silence, then) "I know what\'s coming."', onScreenText: undefined },
      { shot: '2', duration: '10s', visual: 'Various employees in their workspaces, looking at camera', audio: '(VO montage) "We all know." "We\'ve known for a while." "It\'s not if. It\'s when."', onScreenText: undefined },
      { shot: '3', duration: '12s', visual: 'CEO at desk, papers everywhere, genuine exhaustion', audio: `(CEO) "${creative.manifesto.split('.')[0]}."`, onScreenText: undefined },
      { shot: '4', duration: '15s', visual: 'B-roll: The company\'s actual operations. Unvarnished.', audio: '(VO) "This is us apologizing now. Because later won\'t mean anything."', onScreenText: creative.slogans[0] },
      { shot: '5', duration: '10s', visual: 'Employee closes laptop. Looks up. Breathes.', audio: '(Music begins - something unexpectedly tender)', onScreenText: undefined },
      { shot: '6', duration: '5s', visual: `${company.name} logo. Simple. No animation.`, audio: '(Music fades)', onScreenText: creative.tagline }
    ],
    notes: 'Shoot on film if budget allows. Natural lighting. Real employees, not actors. The goal is uncomfortable honesty. Reference: Patagonia\'s environmental films, Nike\'s athlete documentaries, but make it corporate confession.'
  };
}

/**
 * Fallback campaign when API is unavailable
 */
function generateFallbackCampaign(
  campaignId: string,
  scenario: DoomsdayScenario,
  company: Fortune500Company
): ApologyCampaign {
  const creative = getDefaultCreativeDirection(scenario, company);
  const printAssets = getDefaultPrintAssets(company, creative);
  
  return {
    id: campaignId,
    scenarioId: scenario.id,
    companyName: company.name,
    scenarioTitle: scenario.title,
    status: 'complete',
    headline: creative.headline,
    subheadline: creative.tagline,
    apologyStatement: creative.manifesto,
    keyMessages: creative.slogans,
    tone: creative.tone,
    visualConcept: creative.visualConcept,
    colorPalette: creative.colors,
    typography: creative.typography,
    deliverables: {
      fullPageAd: printAssets.fullPage,
      poster: printAssets.poster,
      billboard: printAssets.billboard,
      busShelter: printAssets.busShelter,
      bannerAds: printAssets.banners,
      socialPosts: getDefaultSocialPosts(company, creative),
      videoScript: getDefaultVideoScript(company, creative),
    },
    generatedAt: Date.now()
  };
}

/**
 * Generate campaign image using DALL-E — SCENARIO-SPECIFIC
 * Each prompt is deeply contextualized to the company, scenario, and campaign creative.
 */
export async function generateCampaignImage(
  campaign: ApologyCampaign,
  imageType: 'hero' | 'social' | 'billboard'
): Promise<string | null> {
  const openai = getOpenAIClient();
  if (!openai) return null;

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
