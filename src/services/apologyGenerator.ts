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

/**
 * Generates a satirical proactive apology campaign for a doomsday scenario
 * The apologies should be intentionally tone-deaf, corporate-speak heavy, and miss the point
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
    // Generate core messaging
    const messaging = await generateApologyMessaging(openai, scenario, company);
    
    // Generate visual direction
    const visualDirection = await generateVisualDirection(openai, scenario, company);
    
    // Generate deliverables
    const deliverables = await generateDeliverables(openai, scenario, company, messaging);

    return {
      id: campaignId,
      scenarioId: scenario.id,
      companyName: company.name,
      scenarioTitle: scenario.title,
      status: 'complete',
      headline: messaging.headline,
      subheadline: messaging.subheadline,
      apologyStatement: messaging.apologyStatement,
      keyMessages: messaging.keyMessages,
      tone: messaging.tone,
      visualConcept: visualDirection.concept,
      colorPalette: visualDirection.colors,
      typography: visualDirection.typography,
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

interface ApologyMessaging {
  headline: string;
  subheadline: string;
  apologyStatement: string;
  keyMessages: string[];
  tone: string;
}

/**
 * Generate the core apology messaging - intentionally tone-deaf corporate speak
 */
async function generateApologyMessaging(
  openai: OpenAI,
  scenario: DoomsdayScenario,
  company: Fortune500Company
): Promise<ApologyMessaging> {
  const prompt = `You are a corporate communications consultant who specializes in PROACTIVE APOLOGIES - apologizing for disasters BEFORE they happen. Your job is to help ${company.name} apologize in advance for: "${scenario.title}"

SCENARIO DETAILS:
- What happens: ${scenario.description}
- Damage: ${scenario.potentialDamage}
- Who's affected: ${scenario.affectedParties.join(', ')}
- Severity: ${scenario.severity}
- Timeline: ${scenario.timeHorizon}

Generate a SATIRICAL proactive apology campaign. The copy should be:
1. TONE-DEAF - Using corporate buzzwords while missing the emotional point
2. DEFLECTIVE - Subtly shifting blame or minimizing responsibility
3. PERFORMATIVE - All the right words but hollow sentiment
4. PRE-EMPTIVE - Apologizing for something that hasn't happened yet (the absurdist twist)
5. OVERLY FORMAL - Using unnecessarily complex language

Think: "We're sorry you feel that way" energy, but for future disasters.

Return JSON:
{
  "headline": "8-12 word headline that sounds apologetic but is subtly off (like a newspaper headline announcing the apology)",
  "subheadline": "A supporting line that somehow makes it worse",
  "apologyStatement": "2-3 sentence official apology statement using maximum corporate speak",
  "keyMessages": ["Array of 4 key messages that sound good but are actually meaningless or deflective"],
  "tone": "One sentence describing the intended tone (for internal use)"
}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You write satirical corporate apologies that sound official but are intentionally hollow, tone-deaf, and miss the point. Think BP oil spill apology energy, but PREEMPTIVE. You use buzzwords like "learnings," "going forward," "stakeholder value," and "committed to doing better" without any actual substance. Output only valid JSON.`
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.9,
    response_format: { type: 'json_object' },
    max_tokens: 1000
  });

  const response = completion.choices[0]?.message?.content?.trim() || '';
  
  try {
    return JSON.parse(response) as ApologyMessaging;
  } catch {
    return {
      headline: `${company.name} Proactively Addresses Future Stakeholder Concerns`,
      subheadline: 'A Commitment to Transparency Before Transparency Is Required',
      apologyStatement: `${company.name} recognizes that, in the fullness of time, certain outcomes may not align with the expectations of all stakeholders. We are committed to the ongoing process of addressing these potential future misalignments through our established corporate responsibility frameworks.`,
      keyMessages: [
        'We value the trust you may eventually lose',
        'Our commitment to improvement begins before the need arises',
        'Going forward, we are already looking backward at what could go wrong',
        'This represents a new paradigm in corporate accountability'
      ],
      tone: 'Performatively contrite while maintaining plausible deniability'
    };
  }
}

interface VisualDirection {
  concept: string;
  colors: string[];
  typography: string;
}

/**
 * Generate visual direction for the apology campaign
 */
async function generateVisualDirection(
  openai: OpenAI,
  scenario: DoomsdayScenario,
  company: Fortune500Company
): Promise<VisualDirection> {
  const prompt = `Create visual direction for a PROACTIVE APOLOGY campaign.

Company: ${company.name}
Apologizing for: ${scenario.title}
Severity: ${scenario.severity}

The visual style should match corporate crisis communications but with a satirical edge:
- Clean, corporate, "trustworthy" aesthetics
- Colors that feel safe and reassuring (but perhaps unsettlingly so)
- Typography that says "we take this seriously" 

Return JSON:
{
  "concept": "2-3 sentence visual concept description",
  "colors": ["array of 4 hex color codes - primary, secondary, accent, background"],
  "typography": "Font pairing recommendation with rationale"
}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are an art director specializing in corporate crisis communications. You create visual directions that feel trustworthy and serious. Output only valid JSON.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' },
    max_tokens: 500
  });

  const response = completion.choices[0]?.message?.content?.trim() || '';
  
  try {
    return JSON.parse(response) as VisualDirection;
  } catch {
    return {
      concept: 'Clean corporate minimalism with excessive white space suggesting transparency. Subtle blue tones for trust. Everything designed to feel safe and reassuring.',
      colors: ['#1a365d', '#718096', '#c53030', '#f7fafc'],
      typography: 'Helvetica Neue for headlines (corporate trust), Georgia for body (human warmth without actual warmth)'
    };
  }
}

/**
 * Generate campaign deliverables
 */
async function generateDeliverables(
  openai: OpenAI,
  scenario: DoomsdayScenario,
  company: Fortune500Company,
  messaging: ApologyMessaging
): Promise<ApologyDeliverables> {
  // Generate all deliverables in parallel
  const [printAssets, socialPosts, videoScript] = await Promise.all([
    generatePrintAssets(openai, scenario, company, messaging),
    generateSocialPosts(openai, scenario, company, messaging),
    generateVideoScript(openai, scenario, company, messaging)
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
  messaging: ApologyMessaging
): Promise<PrintAssets> {
  const prompt = `Generate print/OOH advertising assets for ${company.name}'s proactive apology for: "${scenario.title}"

HEADLINE: "${messaging.headline}"
SUBHEADLINE: "${messaging.subheadline}"
STATEMENT: "${messaging.apologyStatement}"

Create satirical corporate apology ads that:
- Look like legitimate crisis communications
- Feel performatively sincere
- Include inappropriately corporate imagery suggestions

Return JSON:
{
  "fullPage": { "format": "Magazine Full Page", "dimensions": "8.5x11", "headline": "...", "body": "2-3 sentences", "visual": "visual description" },
  "poster": { "format": "A1 Poster", "dimensions": "594x841mm", "headline": "...", "body": "short copy", "visual": "..." },
  "billboard": { "format": "Billboard", "dimensions": "14x48ft", "headline": "max 7 words", "body": "tagline only", "visual": "..." },
  "busShelter": { "format": "Bus Shelter", "dimensions": "1800x1200mm", "headline": "...", "body": "...", "visual": "..." },
  "banners": [
    { "format": "Digital Banner 728x90", "headline": "short", "body": "CTA", "visual": "..." },
    { "format": "Digital Banner 300x250", "headline": "...", "body": "...", "visual": "..." }
  ]
}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You create satirical corporate apology advertisements. They look professional but are subtly absurd. Output only valid JSON.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.85,
    response_format: { type: 'json_object' },
    max_tokens: 1500
  });

  try {
    return JSON.parse(completion.choices[0]?.message?.content || '{}') as PrintAssets;
  } catch {
    return {
      fullPage: {
        format: 'Magazine Full Page',
        dimensions: '8.5x11',
        headline: messaging.headline,
        body: messaging.apologyStatement,
        visual: 'A diverse group of people looking thoughtfully into the middle distance, suggesting contemplation of future regret'
      },
      poster: {
        format: 'A1 Poster',
        dimensions: '594x841mm',
        headline: messaging.headline,
        body: messaging.subheadline,
        visual: 'Minimalist design with excessive white space and a single symbolic element'
      },
      billboard: {
        format: 'Billboard',
        dimensions: '14x48ft',
        headline: messaging.headline.split(' ').slice(0, 7).join(' '),
        body: company.name,
        visual: 'Clean background with subtle gradient suggesting dawn (new beginnings)'
      },
      busShelter: {
        format: 'Bus Shelter',
        dimensions: '1800x1200mm',
        headline: messaging.headline,
        body: messaging.keyMessages[0],
        visual: 'Person in business attire looking contemplatively at horizon'
      },
      banners: [
        { format: 'Digital Banner 728x90', headline: messaging.headline, body: 'Learn More', visual: 'Animated subtle pulse' },
        { format: 'Digital Banner 300x250', headline: messaging.subheadline, body: 'Our Commitment', visual: 'Corporate blue gradient' }
      ]
    };
  }
}

async function generateSocialPosts(
  openai: OpenAI,
  scenario: DoomsdayScenario,
  company: Fortune500Company,
  messaging: ApologyMessaging
): Promise<ApologySocialPost[]> {
  const prompt = `Generate social media posts for ${company.name}'s proactive apology campaign about: "${scenario.title}"

Create satirical corporate social posts that:
- Sound like they were written by committee
- Use hashtags that are slightly tone-deaf
- Feel like a PR team trying too hard

Return JSON array:
[
  { "platform": "Twitter/X", "type": "Thread opener", "copy": "tweet text", "visual": "image description", "hashtags": ["relevant", "slightly off hashtags"] },
  { "platform": "Instagram", "type": "Feed Post", "copy": "instagram caption", "visual": "...", "hashtags": [...] },
  { "platform": "LinkedIn", "type": "Company Update", "copy": "professional post", "visual": "...", "hashtags": [...] },
  { "platform": "TikTok", "type": "Video concept", "copy": "script/concept", "visual": "..." },
  { "platform": "Instagram", "type": "Story", "copy": "story text", "visual": "..." }
]`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You write satirical corporate social media posts. They sound official but are subtly absurd and tone-deaf. Output only valid JSON array.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.9,
    response_format: { type: 'json_object' },
    max_tokens: 1500
  });

  try {
    const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}');
    return (parsed.posts || parsed) as ApologySocialPost[];
  } catch {
    return [
      {
        platform: 'Twitter/X',
        type: 'Thread',
        copy: `A message from ${company.name} about our commitment to addressing future challenges. 🧵 (1/5)`,
        visual: 'Corporate blue background with company logo',
        hashtags: ['Accountability', 'FutureReady', 'WeHearYou']
      },
      {
        platform: 'Instagram',
        type: 'Feed Post',
        copy: messaging.apologyStatement,
        visual: 'Soft-focus image of hands clasped in sincere gesture',
        hashtags: ['CorporateResponsibility', 'TransparencyMatters', 'TogetherForward']
      },
      {
        platform: 'LinkedIn',
        type: 'Company Update',
        copy: `${company.name} is proud to announce our Proactive Accountability Initiative™. ${messaging.keyMessages[0]}`,
        visual: 'Professional headshot grid of leadership team',
        hashtags: ['Leadership', 'Accountability', 'ESG']
      }
    ];
  }
}

async function generateVideoScript(
  openai: OpenAI,
  scenario: DoomsdayScenario,
  company: Fortune500Company,
  messaging: ApologyMessaging
): Promise<{ title: string; duration: string; format: string; script: VideoShot[]; notes: string }> {
  const prompt = `Generate a :60 video script for ${company.name}'s proactive apology about: "${scenario.title}"

The video should be satirically corporate:
- CEO or spokesperson looking sincere in a carefully staged setting
- Soft piano music
- Slow motion footage of regular people doing regular things
- Text overlays with key messages

Return JSON:
{
  "title": "Video title",
  "duration": "60 seconds",
  "format": "16:9",
  "script": [
    { "shot": "1", "duration": "Xs", "visual": "description", "audio": "VO/music/sfx", "onScreenText": "if any" }
  ],
  "notes": "Production notes"
}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You write satirical corporate apology video scripts. They follow all the tropes of crisis PR videos but are subtly absurd. Output only valid JSON.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.85,
    response_format: { type: 'json_object' },
    max_tokens: 1500
  });

  try {
    return JSON.parse(completion.choices[0]?.message?.content || '{}');
  } catch {
    return {
      title: `${company.name}: A Message About Tomorrow`,
      duration: '60 seconds',
      format: '16:9',
      script: [
        { shot: '1', duration: '5s', visual: 'Fade in: Empty conference room, morning light', audio: '(Soft piano begins)', onScreenText: undefined },
        { shot: '2', duration: '8s', visual: 'CEO enters frame, sits at head of table', audio: '(VO) "At [Company], we believe in getting ahead of the conversation..."', onScreenText: undefined },
        { shot: '3', duration: '10s', visual: 'B-roll: Diverse employees looking thoughtful', audio: '(VO) "...which is why we\'re talking to you today about something that hasn\'t happened yet."', onScreenText: messaging.headline },
        { shot: '4', duration: '12s', visual: 'CEO direct to camera, hands clasped', audio: `(VO) "${messaging.apologyStatement}"`, onScreenText: undefined },
        { shot: '5', duration: '10s', visual: 'Slow-mo: Children playing, sunset, nature', audio: '(Piano swells) (VO) "Because you deserve to know what we\'re already sorry for."', onScreenText: messaging.keyMessages[0] },
        { shot: '6', duration: '8s', visual: 'CEO standing, walking toward window', audio: '(VO) "Together, we can face the future we haven\'t ruined yet."', onScreenText: undefined },
        { shot: '7', duration: '7s', visual: `${company.name} logo on white, tagline appears`, audio: '(Piano resolves)', onScreenText: `${company.name}\n"Accountable. Eventually."` }
      ],
      notes: 'Shoot in 4K. Color grade: warm but clinical. CEO should practice "concerned but optimistic" expression. Piano track should feel hopeful yet vaguely unsettling.'
    };
  }
}

/**
 * Fallback campaign when API is unavailable
 */
function generateFallbackCampaign(
  campaignId: string,
  scenario: DoomsdayScenario,
  company: Fortune500Company
): ApologyCampaign {
  return {
    id: campaignId,
    scenarioId: scenario.id,
    companyName: company.name,
    scenarioTitle: scenario.title,
    status: 'complete',
    headline: `${company.name} Addresses Future Concerns Proactively`,
    subheadline: 'A Commitment to Pre-Accountability',
    apologyStatement: `${company.name} acknowledges that, in potential future scenarios involving ${scenario.category} considerations, certain outcomes may not fully align with stakeholder expectations. We are committed to the ongoing process of addressing these pre-concerns.`,
    keyMessages: [
      'We value the trust you haven\'t lost yet',
      'Our commitment begins before the incident',
      'Going forward means looking backward at what might go wrong',
      'Together, we face the future we haven\'t damaged yet'
    ],
    tone: 'Performatively sincere with maximum corporate detachment',
    visualConcept: 'Clean, corporate minimalism suggesting transparency through excessive white space',
    colorPalette: ['#1a365d', '#718096', '#c53030', '#f7fafc'],
    typography: 'Helvetica Neue / Georgia',
    deliverables: {
      fullPageAd: {
        format: 'Magazine Full Page',
        headline: `${company.name} Addresses Future Concerns Proactively`,
        body: `We believe in getting ahead of potential issues before they become issues.`,
        visual: 'Diverse group looking thoughtfully at horizon'
      },
      billboard: {
        format: 'Billboard',
        headline: 'We\'re Already Sorry',
        body: company.name,
        visual: 'Minimalist corporate blue'
      }
    },
    generatedAt: Date.now()
  };
}

/**
 * Generate campaign image using DALL-E
 */
export async function generateCampaignImage(
  campaign: ApologyCampaign,
  imageType: 'hero' | 'social' | 'billboard'
): Promise<string | null> {
  const openai = getOpenAIClient();
  if (!openai) return null;

  const prompts: Record<string, string> = {
    hero: `Corporate apology advertisement image for "${campaign.scenarioTitle}". Professional photography showing a diverse group of people in business attire looking sincere and slightly concerned. Corporate office setting with warm lighting. Clean, trustworthy aesthetic. No text. Photo-realistic.`,
    social: `Social media image for corporate crisis communication. Warm, approachable, professional. Shows hands coming together or person looking thoughtful. Soft lighting, muted corporate colors. Instagram-worthy but serious. No text.`,
    billboard: `Billboard advertisement visual for corporate apology campaign. Minimalist, clean design. Single symbolic image (like clasped hands or sunrise) against a clean gradient background. Corporate, trustworthy, slightly melancholic. No text.`
  };

  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompts[imageType],
      n: 1,
      size: imageType === 'billboard' ? '1792x1024' : '1024x1024',
      quality: 'standard',
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
