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
  
  const openai = getOpenAIClient();
  
  if (!openai) {
    console.warn('OpenAI API key not found. Using fallback campaign.');
    return generateFallbackCampaign(campaignId, scenario, company);
  }

  try {
    // Generate core creative concept first
    const creativeDirection = await generateCreativeDirection(openai, scenario, company);
    
    // Generate the insane marketing angle
    const marketingAngle = await generateMarketingAngle(openai, scenario, company, creativeDirection);
    
    // Generate deliverables with the creative direction
    const deliverables = await generateDeliverables(openai, scenario, company, creativeDirection, marketingAngle);

    return {
      id: campaignId,
      scenarioId: scenario.id,
      companyName: company.name,
      scenarioTitle: scenario.title,
      status: 'complete',
      headline: creativeDirection.headline,
      subheadline: creativeDirection.tagline,
      apologyStatement: creativeDirection.manifesto,
      keyMessages: [
        marketingAngle.bigIdea,
        marketingAngle.insaneAngle,
        ...creativeDirection.slogans.slice(0, 2)
      ],
      tone: creativeDirection.tone,
      visualConcept: creativeDirection.visualConcept,
      colorPalette: creativeDirection.colors,
      typography: creativeDirection.typography,
      deliverables,
      generatedAt: Date.now()
    };
  } catch (error) {
    console.error('Error generating apology campaign:', error);
    return {
      id: campaignId,
      scenarioId: scenario.id,
      companyName: company.name,
      scenarioTitle: scenario.title,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      generatedAt: Date.now()
    };
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

  try {
    return JSON.parse(completion.choices[0]?.message?.content || '{}') as PrintAssets;
  } catch {
    return getDefaultPrintAssets(company, creative);
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

  try {
    const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}');
    return (parsed.posts || parsed) as ApologySocialPost[];
  } catch {
    return getDefaultSocialPosts(company, creative);
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

  try {
    return JSON.parse(completion.choices[0]?.message?.content || '{}');
  } catch {
    return getDefaultVideoScript(company, creative);
  }
}

// Default fallback generators
function getDefaultCreativeDirection(_scenario: DoomsdayScenario, company: Fortune500Company): CreativeDirection {
  return {
    headline: `The Future ${company.name} Owes You An Apology For`,
    tagline: 'We\'re sorry. We will be. We already are.',
    manifesto: `${company.name} has built its reputation on [brand promise]. Soon, we will fail that promise in ways that matter. This is us, acknowledging that future. This is us, apologizing in advance. Because you deserve to know what we already know—that we're not as good as we claim to be.`,
    slogans: [
      'Pre-emptively accountable since today',
      'The apology you\'ll deserve, delivered early',
      'Honesty. Eventually.',
      `${company.name}: We know what's coming`
    ],
    tone: 'Sincere corporate confession with just enough self-awareness to be unsettling. The brand voice of a company that\'s read too many crisis communications playbooks.',
    visualConcept: `${company.name}'s brand aesthetic stripped bare. Their usual visual language but with the optimism removed. Same fonts, same colors, but deployed for confession instead of celebration.`,
    colors: ['#1a1a2e', '#16213e', '#0f3460', '#e94560', '#f5f5f5'],
    typography: 'Their corporate font, but heavier. As if the letters themselves are carrying guilt.'
  };
}

function getDefaultPrintAssets(company: Fortune500Company, creative: CreativeDirection): PrintAssets {
  return {
    fullPage: {
      format: 'Magazine Full Page',
      dimensions: '8.5x11',
      headline: creative.headline,
      body: creative.manifesto,
      visual: `${company.name} corporate headquarters at dusk. Lights on in the executive floor. A metaphor for "we see it coming."`
    },
    poster: {
      format: 'A1 Poster',
      dimensions: '594x841mm',
      headline: creative.tagline,
      body: creative.slogans[0],
      visual: `A single ${company.industry.toLowerCase()} product/symbol against stark white. Confessional minimalism.`
    },
    billboard: {
      format: 'Billboard',
      dimensions: '14x48ft',
      headline: creative.tagline.split('.')[0],
      body: company.name,
      visual: 'Just the logo. Just the tagline. The audacity of simplicity.'
    },
    busShelter: {
      format: 'Bus Shelter',
      dimensions: '1800x1200mm',
      headline: creative.headline,
      body: creative.slogans[1],
      visual: 'QR code to "Pre-Forgiveness Portal" with minimal brand marks'
    },
    banners: [
      { format: 'Digital Banner 728x90', headline: creative.tagline, body: 'Accept Our Pre-Apology →', visual: 'Brand colors, minimal animation' },
      { format: 'Digital Banner 300x250', headline: 'WE\'RE SORRY', body: '(in advance)', visual: 'Pulsing logo' }
    ]
  };
}

function getDefaultSocialPosts(company: Fortune500Company, creative: CreativeDirection): ApologySocialPost[] {
  return [
    {
      platform: 'Twitter/X',
      type: 'Thread',
      copy: `We need to talk about something that hasn't happened yet.\n\nBut it will.\n\n${creative.tagline}\n\n🧵`,
      visual: 'Text-only tweet. Let the words work.',
      hashtags: ['PreemptiveAccountability', company.name.replace(/\s+/g, '')]
    },
    {
      platform: 'Instagram',
      type: 'Carousel',
      copy: `${creative.headline}\n\n${creative.manifesto}\n\nSwipe for everything we're sorry for in advance.`,
      visual: '10-slide carousel: Each slide is one future failure, beautifully designed.',
      hashtags: ['AccountabilityEra', 'CorporateHonesty']
    },
    {
      platform: 'LinkedIn',
      type: 'CEO Statement',
      copy: `I've spent 25 years in this industry. I know what's coming.\n\nToday, ${company.name} launches something unprecedented: a preemptive apology for our future failures.\n\nWe owe you that honesty.`,
      visual: 'CEO headshot but from behind, looking at horizon. Symbolic.',
      hashtags: ['Leadership', 'Accountability']
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
      fullPageAd: getDefaultPrintAssets(company, creative).fullPage,
      billboard: getDefaultPrintAssets(company, creative).billboard,
      socialPosts: getDefaultSocialPosts(company, creative)
    },
    generatedAt: Date.now()
  };
}

/**
 * Generate campaign image using DALL-E - BRAND SPECIFIC
 */
export async function generateCampaignImage(
  campaign: ApologyCampaign,
  imageType: 'hero' | 'social' | 'billboard'
): Promise<string | null> {
  const openai = getOpenAIClient();
  if (!openai) return null;

  // Get brand-specific visual direction
  const brandStyle = getBrandStyleForImage(campaign.companyName);
  
  const prompts: Record<string, string> = {
    hero: `Advertising campaign hero image for ${campaign.companyName}. ${brandStyle}. Concept: "${campaign.visualConcept}". The image should feel like a high-end brand campaign - think Apple, Nike, or Patagonia level quality. ${campaign.scenarioTitle} context but approached with artistic sophistication. No text. No logos. Cinematic lighting. Editorial photography quality. The image should evoke ${campaign.tone}.`,
    
    social: `Social media campaign image for ${campaign.companyName}. ${brandStyle}. Modern, shareable, visually striking. Concept: ${campaign.visualConcept}. Should feel native to Instagram/social but elevated. Not stock photo energy - real campaign energy. Think brand social, not corporate social. No text. Square format consideration.`,
    
    billboard: `Outdoor advertising visual for ${campaign.companyName}. ${brandStyle}. Bold, simple, readable at distance. Concept: ${campaign.visualConcept}. Think about negative space. One clear focal point. The kind of billboard that makes you look twice. Cinematic, not corporate. No text. Wide format composition.`
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

function getBrandStyleForImage(companyName: string): string {
  // Create brand-appropriate image style direction
  const name = companyName.toLowerCase();
  
  if (name.includes('apple') || name.includes('tech')) {
    return 'Minimalist, clean, premium tech aesthetic. Lots of negative space. Product-focused. Apple-style photography.';
  }
  if (name.includes('nike') || name.includes('sport')) {
    return 'Athletic, dynamic, high-energy. Dramatic lighting. Movement and power. Nike campaign energy.';
  }
  if (name.includes('bank') || name.includes('financial') || name.includes('capital')) {
    return 'Sophisticated, trustworthy, premium. Navy and gold tones. Architectural elements. Financial district aesthetic.';
  }
  if (name.includes('health') || name.includes('pharma') || name.includes('medical')) {
    return 'Clinical but warm. Human connection. Medical environments with humanity. Healthcare campaign aesthetic.';
  }
  if (name.includes('energy') || name.includes('oil') || name.includes('power')) {
    return 'Industrial sublime. Dramatic landscapes. Infrastructure as art. Environmental undertones.';
  }
  if (name.includes('food') || name.includes('beverage') || name.includes('restaurant')) {
    return 'Appetizing, warm, inviting. Food photography excellence. Lifestyle and indulgence.';
  }
  if (name.includes('retail') || name.includes('store') || name.includes('shop')) {
    return 'Lifestyle aspiration. People in moments. Product integration. Retail campaign sophistication.';
  }
  
  return 'Premium brand campaign aesthetic. High production value. Editorial quality. Sophisticated color grading.';
}
