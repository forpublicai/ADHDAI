import OpenAI from 'openai';
import { AdComponents, BrandInfo } from '../types';
import { generateAdImage, generateStoryboardFrame, generateSocialImage } from './imageGenerator';
import { parseBrief, ParsedBrief } from '../utils/briefParser';

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

export interface CampaignDeliverables {
  video: VideoScript;
  campaign: CampaignDeck;
  socialMedia: SocialMediaActivation;
  generatedImages?: GeneratedImages;
}

export interface GeneratedImages {
  hero?: string;
  product?: string;
  lifestyle?: string;
  storyboardFrames?: string[];
  socialPosts?: string[];
}

export interface VideoScript {
  title: string;
  duration: string;
  format: string;
  script: VideoShot[];
  notes: string;
}

export interface VideoShot {
  shot: string;
  duration: string;
  visual: string;
  audio: string;
  onScreenText?: string;
  imageUrl?: string;
}

export interface CampaignDeck {
  campaignName: string;
  overview: string;
  executions: CampaignExecution[];
  mediaPlan: string;
}

export interface CampaignExecution {
  format: string;
  headline: string;
  body: string;
  visual: string;
  placement: string;
  imageUrl?: string;
}

export interface SocialMediaActivation {
  platform: string;
  posts: SocialPost[];
  strategy: string;
}

export interface SocialPost {
  platform: string;
  type: string;
  copy: string;
  visual: string;
  hashtags?: string[];
  imageUrl?: string;
}

/**
 * Extracts key information from the brief using intelligent parsing
 */
function extractBriefInfo(brief: string): { product: string; brand: string; category: string; problem: string } {
  // Use the shared brief parser for consistent extraction
  const parsed: ParsedBrief = parseBrief(brief);
  
  return {
    product: parsed.product,
    brand: parsed.brand,
    category: parsed.category,
    problem: parsed.problem
  };
}

/**
 * Generates comprehensive campaign deliverables with actual HTML mockups
 */
export async function generateCampaignDeliverables(
  brief: string,
  adComponents: AdComponents,
  brandInfo?: BrandInfo
): Promise<CampaignDeliverables> {
  const openai = getOpenAIClient();
  const briefInfo = extractBriefInfo(brief);
  
  if (!openai) {
    return generateFallbackDeliverables(brief, adComponents, brandInfo, briefInfo);
  }

  try {
    const prompt = `You are a senior creative director at a prestigious advertising agency. Generate campaign deliverables for:

BRIEF: "${brief}"
BRAND: ${brandInfo?.clientName || briefInfo.brand}
PRODUCT: ${briefInfo.product}
CATEGORY: ${briefInfo.category}

EXISTING AD COMPONENTS (use these as the foundation):
- Headline: ${adComponents.headline || 'Generate one'}
- Body: ${adComponents.body || 'Generate one'}
- Tagline: ${adComponents.tagline || 'Generate one'}

BRAND STYLE:
${brandInfo ? `
- Colors: Primary: ${brandInfo.brandColors.primary || '#000'}, Secondary: ${brandInfo.brandColors.secondary || '#666'}, Accent: ${brandInfo.brandColors.accent || '#c00'}
- Tone: ${brandInfo.brandTone}
- Style: ${brandInfo.brandStyle}
` : 'Use documentary/bureaucratic aesthetic with muted colors'}

Generate SPECIFIC, CREATIVE deliverables that:
1. Directly address the product/brand in the brief
2. Use original headlines and copy (NEVER echo the brief text)
3. Include specific visual directions relevant to the product
4. Sound like real advertising, not descriptions

CRITICAL: All copy must be ORIGINAL and SPECIFIC to this product/brand. Never use generic phrases or repeat the brief.

Return JSON with this exact structure:
{
  "video": {
    "title": "Specific campaign name",
    "duration": "30 seconds",
    "format": "16:9",
    "script": [
      {"shot": "1", "duration": "3s", "visual": "Specific visual description", "audio": "Specific audio/VO", "onScreenText": "Text if any"}
    ],
    "notes": "Production notes"
  },
  "campaign": {
    "campaignName": "Campaign name",
    "overview": "2-3 sentence strategy",
    "executions": [
      {"format": "Print/Digital/OOH", "headline": "Specific headline", "body": "Body copy", "visual": "Visual description", "placement": "Media placement"}
    ],
    "mediaPlan": "Brief media strategy"
  },
  "socialMedia": {
    "platform": "Multi-platform",
    "strategy": "Social strategy",
    "posts": [
      {"platform": "Instagram/Twitter/etc", "type": "Post type", "copy": "Actual post copy", "visual": "Visual description", "hashtags": ["relevant", "hashtags"]}
    ]
  }
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a creative director generating campaign deliverables. Be SPECIFIC to the product/brand. Generate ORIGINAL copy. NEVER echo the brief text. Output ONLY valid JSON.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' },
      max_tokens: 4000
    });

    const response = completion.choices[0]?.message?.content?.trim() || '';
    const cleaned = response.replace(/^```json\n?/i, '').replace(/^```\n?/i, '').replace(/```\n?$/i, '').trim();
    
    const deliverables: CampaignDeliverables = JSON.parse(cleaned);
    
    // Generate actual images for the deliverables
    const generatedImages: GeneratedImages = {};
    
    try {
      // Generate hero image for the campaign
      const heroImage = await generateAdImage(brief, brandInfo, 'hero');
      if (heroImage) generatedImages.hero = heroImage.url;
      
      // Generate product image
      const productImage = await generateAdImage(brief, brandInfo, 'product');
      if (productImage) generatedImages.product = productImage.url;
      
      // Generate lifestyle image
      const lifestyleImage = await generateAdImage(brief, brandInfo, 'lifestyle');
      if (lifestyleImage) generatedImages.lifestyle = lifestyleImage.url;
      
      // Generate storyboard frames (first 3 shots)
      generatedImages.storyboardFrames = [];
      for (let i = 0; i < Math.min(3, deliverables.video.script.length); i++) {
        const frame = deliverables.video.script[i];
        const frameImage = await generateStoryboardFrame(frame.visual, brief, i + 1);
        if (frameImage) {
          generatedImages.storyboardFrames.push(frameImage);
          deliverables.video.script[i].imageUrl = frameImage;
        }
        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Generate social media images (first 2 posts)
      generatedImages.socialPosts = [];
      for (let i = 0; i < Math.min(2, deliverables.socialMedia.posts.length); i++) {
        const post = deliverables.socialMedia.posts[i];
        const postImage = await generateSocialImage(post.copy, post.platform, brief, brandInfo);
        if (postImage) {
          generatedImages.socialPosts.push(postImage);
          deliverables.socialMedia.posts[i].imageUrl = postImage;
        }
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Add hero image to campaign executions
      if (generatedImages.hero && deliverables.campaign.executions.length > 0) {
        deliverables.campaign.executions[0].imageUrl = generatedImages.hero;
      }
      if (generatedImages.product && deliverables.campaign.executions.length > 1) {
        deliverables.campaign.executions[1].imageUrl = generatedImages.product;
      }
      
    } catch (imageError) {
      console.error('Error generating images:', imageError);
    }
    
    deliverables.generatedImages = generatedImages;
    return deliverables;
  } catch (error) {
    console.error('Error generating campaign deliverables:', error);
    return generateFallbackDeliverables(brief, adComponents, brandInfo, briefInfo);
  }
}

/**
 * Fallback deliverables - generates specific content based on brief
 */
function generateFallbackDeliverables(
  brief: string,
  adComponents: AdComponents,
  brandInfo?: BrandInfo,
  briefInfo?: { product: string; brand: string; category: string; problem: string }
): CampaignDeliverables {
  const info = briefInfo || extractBriefInfo(brief);
  const headline = adComponents.headline || `THE ${info.product.toUpperCase()} YOU'VE BEEN AVOIDING`;
  const body = adComponents.body || `There's a ${info.product} that's been waiting for you. The one that does the job right.`;
  const tagline = adComponents.tagline || 'Finish the job.';
  const brandName = brandInfo?.clientName || info.brand;
  
  return {
    video: {
      title: `"The ${info.product.charAt(0).toUpperCase() + info.product.slice(1)}" — 30-Second Spot`,
      duration: '30 seconds',
      format: '16:9 aspect ratio',
      script: [
        {
          shot: '1',
          duration: '3s',
          visual: `FADE IN: Close-up of a ${info.product}. Natural light. Texture and detail visible.`,
          audio: '(Silence)',
          onScreenText: undefined
        },
        {
          shot: '2',
          duration: '4s',
          visual: `MEDIUM SHOT: Hands reaching for the ${info.product}. Moment of hesitation.`,
          audio: `(V.O.) "You've been putting this off."`,
          onScreenText: undefined
        },
        {
          shot: '3',
          duration: '5s',
          visual: `INSERT: The ${info.product} in use. Documentary style. Real hands, real work.`,
          audio: `(V.O.) "The right tool makes the decision for you."`,
          onScreenText: undefined
        },
        {
          shot: '4',
          duration: '4s',
          visual: 'CLOSE-UP: The work being completed. Satisfaction in simplicity.',
          audio: `(V.O.) "Not tomorrow. Now."`,
          onScreenText: undefined
        },
        {
          shot: '5',
          duration: '4s',
          visual: `WIDE: Clean workspace. The ${info.product} at rest. Job done.`,
          audio: `(V.O.) "${tagline}"`,
          onScreenText: undefined
        },
        {
          shot: '6',
          duration: '3s',
          visual: `END CARD: ${brandName} logo on paper texture.`,
          audio: '(Silence)',
          onScreenText: brandName.toUpperCase()
        },
        {
          shot: '7',
          duration: '4s',
          visual: 'SUPER: Website and contact on document-style footer.',
          audio: '(Silence)',
          onScreenText: tagline
        }
      ],
      notes: `PRODUCTION: Documentary aesthetic. Natural lighting. No music—ambient sound only. Color: desaturated. Talent: non-actors. Location: practical ${info.category} setting.`
    },
    campaign: {
      campaignName: `"${tagline}" Campaign for ${brandName}`,
      overview: `A multi-channel campaign positioning ${brandName}'s ${info.product} as the tool for people who are ready to stop putting things off. The documentary aesthetic gives weight to the message while human copy provides permission to act.`,
      executions: [
        {
          format: 'Print — Full Page Magazine',
          headline: headline,
          body: body,
          visual: `Full-page document aesthetic. ${info.product} photographed like evidence. Numbered list of "reasons you haven't done this yet" fading into illegibility below.`,
          placement: 'Lifestyle and shelter magazines'
        },
        {
          format: 'Digital Banner — 728x90',
          headline: headline.length > 50 ? headline.substring(0, 47) + '...' : headline,
          body: tagline,
          visual: `Paper texture background. ${info.product} silhouette. Monospace headline. No animation.`,
          placement: 'Premium editorial sites'
        },
        {
          format: 'Digital Banner — 300x250',
          headline: `THE ${info.product.toUpperCase()}`,
          body: tagline,
          visual: `Stacked layout. Product image top half. Headline and tagline below on form paper.`,
          placement: 'Contextual targeting'
        },
        {
          format: 'OOH — Billboard',
          headline: headline,
          body: '',
          visual: `14'x48'. Paper white. Massive typography. ${brandName} logo small, corner. Maximum negative space.`,
          placement: 'Urban markets, commuter routes'
        },
        {
          format: 'Email — Direct',
          headline: `Re: That ${info.product} you've been thinking about`,
          body: `${body}\n\nReply to this email when you're ready.`,
          visual: 'Plain text. No graphics. Looks like correspondence.',
          placement: 'Post-inquiry follow-up'
        }
      ],
      mediaPlan: `PHASE 1: OOH and print for awareness. PHASE 2: Digital retargeting. PHASE 3: Email conversion. Budget: 40% digital, 30% print, 20% OOH, 10% production.`
    },
    socialMedia: {
      platform: 'Multi-platform',
      strategy: `Social strategy for ${brandName}: Authenticity over polish. Posts look like real moments with real ${info.product}s. Human voice, not brand voice. 3-4 posts per week.`,
      posts: [
        {
          platform: 'Instagram',
          type: 'Single Image',
          copy: `There's a ${info.product} that's been waiting. The one you've been thinking about. Today might be the day.`,
          visual: `Overhead shot of ${info.product} on work surface. Natural light. No styling.`,
          hashtags: [info.category.replace(/\s+/g, ''), info.product.replace(/\s+/g, ''), 'finishthejob', 'adulting']
        },
        {
          platform: 'Instagram',
          type: 'Carousel',
          copy: `The decisions you're avoiding. (Swipe to see the list you didn't know you needed.)`,
          visual: `Slide 1: Cover headline. Slides 2-6: Numbered decisions related to ${info.category}, progressively fading. Final: "Or you could start now."`,
          hashtags: ['decisions', 'planning', info.category.replace(/\s+/g, '')]
        },
        {
          platform: 'Instagram',
          type: 'Reel',
          copy: `POV: You finally got the ${info.product} you needed.`,
          visual: `15s. First-person. Unboxing, first use, satisfaction. Ambient sound only.`,
          hashtags: ['satisfying', 'unboxing', info.product.replace(/\s+/g, '')]
        },
        {
          platform: 'Twitter/X',
          type: 'Text',
          copy: `The ${info.product} you've been thinking about is still there. It didn't go away. Today might be good.`,
          visual: 'Text only',
          hashtags: []
        },
        {
          platform: 'Twitter/X',
          type: 'Image',
          copy: `"What do you do?" "I help people ${info.problem}."`,
          visual: `${info.product} photographed like evidence. Documentary style.`,
          hashtags: []
        },
        {
          platform: 'LinkedIn',
          type: 'Article',
          copy: `The hardest part of any decision isn't the choice—it's giving yourself permission to make it.\n\nMost people know what they need. They just need someone to tell them it's okay.\n\nThat's what ${brandName} does.`,
          visual: 'Text-focused. Professional.',
          hashtags: ['leadership', info.category.replace(/\s+/g, '')]
        },
        {
          platform: 'TikTok',
          type: 'Video',
          copy: `That ${info.product} you've been avoiding? Let's talk about it.`,
          visual: `Direct-to-camera. Real person with ${info.product}. Low-fi. 15s. Hook: "Nobody talks about this but..."`,
          hashtags: ['adulting', info.category.replace(/\s+/g, ''), 'reallife']
        }
      ]
    }
  };
}

/**
 * Formats campaign deliverables as ACTUAL HTML mockups
 */
export function formatDeliverablesAsHTML(
  deliverables: CampaignDeliverables,
  brief: string,
  brandInfo?: BrandInfo
): string {
  const now = new Date();
  const briefInfo = extractBriefInfo(brief);
  const brandName = brandInfo?.clientName || briefInfo.brand;
  const primaryColor = brandInfo?.brandColors.primary || '#1a1a1a';
  const secondaryColor = brandInfo?.brandColors.secondary || '#666666';
  const accentColor = brandInfo?.brandColors.accent || '#c41e3a';
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Campaign Deliverables — ${brandName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&family=Source+Serif+4:wght@400;600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    :root {
      --brand-primary: ${primaryColor};
      --brand-secondary: ${secondaryColor};
      --brand-accent: ${accentColor};
      --paper: #F7F6F4;
      --ink: #1a1a1a;
      --faded: #999;
    }
    
    body {
      font-family: 'Source Serif 4', Georgia, serif;
      background: var(--paper);
      color: var(--ink);
      line-height: 1.6;
      padding: 40px 20px;
    }
    
    .container { max-width: 900px; margin: 0 auto; }
    
    .document-header {
      border-bottom: 3px solid var(--ink);
      padding-bottom: 20px;
      margin-bottom: 40px;
    }
    
    .document-header h1 {
      font-family: 'Courier Prime', monospace;
      font-size: 28px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    
    .document-header .meta {
      font-size: 12px;
      color: var(--faded);
      margin-top: 10px;
      font-family: 'Courier Prime', monospace;
    }
    
    .section {
      margin-bottom: 60px;
      page-break-inside: avoid;
    }
    
    .section-header {
      font-family: 'Courier Prime', monospace;
      font-size: 18px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      border-bottom: 1px solid var(--ink);
      padding-bottom: 10px;
      margin-bottom: 30px;
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    
    .section-header .number {
      font-size: 12px;
      color: var(--faded);
    }
    
    /* VIDEO STORYBOARD - Actual visual mockups */
    .storyboard {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }
    
    .storyboard-frame {
      background: white;
      border: 1px solid #ddd;
      overflow: hidden;
    }
    
    .frame-visual {
      aspect-ratio: 16/9;
      background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      position: relative;
      background-size: cover;
      background-position: center;
    }
    
    .frame-visual.has-image {
      background-color: #1a1a1a;
    }
    
    .frame-visual img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      position: absolute;
      top: 0;
      left: 0;
    }
    
    .frame-visual .shot-number {
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(255,255,255,0.9);
      color: #000;
      font-family: 'Courier Prime', monospace;
      font-size: 10px;
      padding: 2px 6px;
      font-weight: 700;
    }
    
    .frame-visual .duration {
      position: absolute;
      top: 10px;
      right: 10px;
      background: var(--brand-accent);
      color: white;
      font-family: 'Courier Prime', monospace;
      font-size: 10px;
      padding: 2px 6px;
    }
    
    .frame-visual .on-screen-text {
      color: white;
      font-family: 'Courier Prime', monospace;
      font-size: 14px;
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    
    .frame-info {
      padding: 15px;
      background: #fafafa;
      border-top: 1px solid #eee;
    }
    
    .frame-info .visual-desc {
      font-size: 12px;
      color: #666;
      margin-bottom: 8px;
      font-style: italic;
    }
    
    .frame-info .audio {
      font-size: 13px;
      color: var(--ink);
    }
    
    .production-notes {
      background: #fff9e6;
      border-left: 3px solid #e6c200;
      padding: 15px 20px;
      margin-top: 20px;
      font-size: 13px;
    }
    
    /* CAMPAIGN EXECUTIONS - Actual ad mockups */
    .executions-grid {
      display: flex;
      flex-direction: column;
      gap: 30px;
    }
    
    .execution-mockup {
      background: white;
      border: 1px solid #ddd;
      overflow: hidden;
    }
    
    .execution-label {
      background: var(--ink);
      color: white;
      font-family: 'Courier Prime', monospace;
      font-size: 11px;
      padding: 8px 15px;
      text-transform: uppercase;
      letter-spacing: 1px;
      display: flex;
      justify-content: space-between;
    }
    
    /* Print Ad Mockup */
    .print-mockup {
      aspect-ratio: 8.5/11;
      max-height: 500px;
      background: var(--paper);
      padding: 40px;
      display: flex;
      flex-direction: column;
    }
    
    .print-mockup .headline {
      font-family: 'Courier Prime', monospace;
      font-size: 24px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--brand-primary);
      margin-bottom: 30px;
      line-height: 1.2;
    }
    
    .print-mockup .visual-area {
      flex: 1;
      background: linear-gradient(180deg, #e8e8e8 0%, #d0d0d0 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #888;
      font-family: 'Courier Prime', monospace;
      font-size: 12px;
      text-transform: uppercase;
      margin-bottom: 30px;
      border: 1px dashed #bbb;
      overflow: hidden;
      position: relative;
    }
    
    .print-mockup .visual-area img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      position: absolute;
      top: 0;
      left: 0;
    }
    
    .print-mockup .visual-area.has-image {
      border: none;
      background: none;
    }
    
    .print-mockup .body-copy {
      font-family: 'Source Serif 4', serif;
      font-size: 14px;
      line-height: 1.7;
      margin-bottom: 20px;
      max-width: 400px;
    }
    
    .print-mockup .footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: auto;
      padding-top: 20px;
      border-top: 1px solid #ddd;
    }
    
    .print-mockup .logo {
      font-family: 'Courier Prime', monospace;
      font-weight: 700;
      font-size: 16px;
      color: var(--brand-primary);
    }
    
    /* Digital Banner Mockups */
    .banner-728x90 {
      width: 100%;
      max-width: 728px;
      height: 90px;
      background: var(--paper);
      border: 1px solid #ccc;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
    }
    
    .banner-728x90 .headline {
      font-family: 'Courier Prime', monospace;
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--brand-primary);
    }
    
    .banner-728x90 .cta {
      background: var(--brand-accent);
      color: white;
      font-family: 'Courier Prime', monospace;
      font-size: 11px;
      padding: 8px 16px;
      text-transform: uppercase;
    }
    
    .banner-300x250 {
      width: 300px;
      height: 250px;
      background: var(--paper);
      border: 1px solid #ccc;
      display: flex;
      flex-direction: column;
      padding: 20px;
    }
    
    .banner-300x250 .visual-area {
      flex: 1;
      background: linear-gradient(135deg, #e0e0e0 0%, #c0c0c0 100%);
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Courier Prime', monospace;
      font-size: 10px;
      color: #888;
    }
    
    .banner-300x250 .headline {
      font-family: 'Courier Prime', monospace;
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--brand-primary);
      margin-bottom: 10px;
    }
    
    .banner-300x250 .tagline {
      font-family: 'Source Serif 4', serif;
      font-size: 12px;
      color: #666;
    }
    
    /* SOCIAL MEDIA MOCKUPS */
    .social-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
    }
    
    .social-post {
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .social-post .platform-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 15px;
      border-bottom: 1px solid #eee;
    }
    
    .social-post .platform-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--brand-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 14px;
      font-weight: 600;
    }
    
    .social-post .platform-name {
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      font-weight: 600;
    }
    
    .social-post .post-type {
      font-family: 'Inter', sans-serif;
      font-size: 11px;
      color: #888;
    }
    
    .social-post .post-visual {
      aspect-ratio: 1;
      background: linear-gradient(135deg, var(--paper) 0%, #e0e0e0 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      text-align: center;
    }
    
    .social-post .post-visual .mock-content {
      font-family: 'Courier Prime', monospace;
      font-size: 16px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--brand-primary);
      line-height: 1.4;
    }
    
    .social-post .post-copy {
      padding: 15px;
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      line-height: 1.5;
      color: var(--ink);
    }
    
    .social-post .hashtags {
      padding: 0 15px 15px;
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      color: var(--brand-accent);
    }
    
    .overview-text {
      font-size: 15px;
      line-height: 1.8;
      margin-bottom: 30px;
      max-width: 700px;
    }
    
    .media-plan {
      background: #f5f5f5;
      padding: 20px;
      font-size: 13px;
      border-left: 3px solid var(--brand-primary);
      margin-top: 30px;
    }
    
    .footer-document {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      font-family: 'Courier Prime', monospace;
      font-size: 11px;
      color: var(--faded);
      display: flex;
      justify-content: space-between;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="document-header">
      <h1>Campaign Deliverables</h1>
      <div class="meta">
        CLIENT: ${brandName.toUpperCase()} | PREPARED: ${now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} | DOCUMENT REF: ADHDAI-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}
      </div>
    </div>

    <!-- VIDEO SECTION -->
    <div class="section">
      <div class="section-header">
        <span>I. Video Production</span>
        <span class="number">${deliverables.video.title} | ${deliverables.video.duration}</span>
      </div>
      
      <div class="storyboard">
        ${deliverables.video.script.slice(0, 8).map(shot => `
          <div class="storyboard-frame">
            <div class="frame-visual ${shot.imageUrl ? 'has-image' : ''}">
              ${shot.imageUrl ? `<img src="${shot.imageUrl}" alt="Frame ${shot.shot}" />` : ''}
              <span class="shot-number">SHOT ${shot.shot}</span>
              <span class="duration">${shot.duration}</span>
              ${!shot.imageUrl && shot.onScreenText ? `<div class="on-screen-text">${shot.onScreenText}</div>` : (!shot.imageUrl ? '<div class="on-screen-text" style="opacity:0.3">[VISUAL]</div>' : '')}
            </div>
            <div class="frame-info">
              <div class="visual-desc">${shot.visual}</div>
              <div class="audio">${shot.audio}</div>
            </div>
          </div>
        `).join('')}
      </div>
      
      <div class="production-notes">
        <strong>PRODUCTION NOTES:</strong> ${deliverables.video.notes}
      </div>
    </div>

    <!-- CAMPAIGN SECTION -->
    <div class="section">
      <div class="section-header">
        <span>II. Campaign Executions</span>
        <span class="number">${deliverables.campaign.campaignName}</span>
      </div>
      
      <div class="overview-text">${deliverables.campaign.overview}</div>
      
      <div class="executions-grid">
        ${deliverables.campaign.executions.slice(0, 3).map((exec) => {
          if (exec.format.toLowerCase().includes('print') || exec.format.toLowerCase().includes('magazine')) {
            return `
              <div class="execution-mockup">
                <div class="execution-label">
                  <span>${exec.format}</span>
                  <span>${exec.placement}</span>
                </div>
                <div class="print-mockup">
                  <div class="headline">${exec.headline}</div>
                  <div class="visual-area ${exec.imageUrl ? 'has-image' : ''}">
                    ${exec.imageUrl ? `<img src="${exec.imageUrl}" alt="Campaign visual" />` : '[PRODUCT PHOTOGRAPHY]'}
                  </div>
                  <div class="body-copy">${exec.body}</div>
                  <div class="footer">
                    <div class="logo">${brandName}</div>
                  </div>
                </div>
              </div>
            `;
          } else if (exec.format.toLowerCase().includes('728')) {
            return `
              <div class="execution-mockup">
                <div class="execution-label">
                  <span>${exec.format}</span>
                  <span>${exec.placement}</span>
                </div>
                <div style="padding: 20px; background: #f0f0f0;">
                  <div class="banner-728x90" ${exec.imageUrl ? `style="background-image: url(${exec.imageUrl}); background-size: cover; background-position: center;"` : ''}>
                    <div class="headline" ${exec.imageUrl ? 'style="background: rgba(255,255,255,0.9); padding: 4px 8px;"' : ''}>${exec.headline.substring(0, 50)}${exec.headline.length > 50 ? '...' : ''}</div>
                    <div class="cta">Learn More</div>
                  </div>
                </div>
              </div>
            `;
          } else if (exec.format.toLowerCase().includes('300')) {
            return `
              <div class="execution-mockup">
                <div class="execution-label">
                  <span>${exec.format}</span>
                  <span>${exec.placement}</span>
                </div>
                <div style="padding: 20px; background: #f0f0f0; display: flex; justify-content: center;">
                  <div class="banner-300x250">
                    <div class="visual-area" ${exec.imageUrl ? `style="background-image: url(${exec.imageUrl}); background-size: cover; background-position: center;"` : ''}>
                      ${!exec.imageUrl ? '[PRODUCT]' : ''}
                    </div>
                    <div class="headline">${exec.headline.substring(0, 40)}</div>
                    <div class="tagline">${exec.body.substring(0, 60)}</div>
                  </div>
                </div>
              </div>
            `;
          } else {
            return `
              <div class="execution-mockup">
                <div class="execution-label">
                  <span>${exec.format}</span>
                  <span>${exec.placement}</span>
                </div>
                <div style="padding: 30px; background: #f5f5f5;">
                  ${exec.imageUrl ? `<img src="${exec.imageUrl}" alt="Campaign visual" style="width: 100%; height: 200px; object-fit: cover; margin-bottom: 20px;" />` : ''}
                  <div style="font-family: 'Courier Prime', monospace; font-size: 18px; font-weight: 700; text-transform: uppercase; margin-bottom: 15px; color: var(--brand-primary);">${exec.headline}</div>
                  <div style="font-family: 'Source Serif 4', serif; font-size: 14px; margin-bottom: 15px;">${exec.body}</div>
                  <div style="font-size: 12px; color: #888; font-style: italic;">Visual: ${exec.visual}</div>
                </div>
              </div>
            `;
          }
        }).join('')}
      </div>
      
      <div class="media-plan">
        <strong>MEDIA PLAN:</strong> ${deliverables.campaign.mediaPlan}
      </div>
    </div>

    <!-- SOCIAL MEDIA SECTION -->
    <div class="section">
      <div class="section-header">
        <span>III. Social Media Activation</span>
        <span class="number">Multi-Platform</span>
      </div>
      
      <div class="overview-text">${deliverables.socialMedia.strategy}</div>
      
      <div class="social-grid">
        ${deliverables.socialMedia.posts.slice(0, 6).map(post => {
          const platformInitial = post.platform.charAt(0).toUpperCase();
          const shortCopy = post.copy.length > 30 ? post.copy.substring(0, 27) + '...' : post.copy;
          return `
            <div class="social-post">
              <div class="platform-header">
                <div class="platform-icon">${platformInitial}</div>
                <div>
                  <div class="platform-name">${post.platform}</div>
                  <div class="post-type">${post.type}</div>
                </div>
              </div>
              <div class="post-visual">
                <div class="mock-content">${shortCopy.toUpperCase()}</div>
              </div>
              <div class="post-copy">${post.copy}</div>
              ${post.hashtags && post.hashtags.length > 0 ? `<div class="hashtags">${post.hashtags.map(h => `#${h}`).join(' ')}</div>` : ''}
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <div class="footer-document">
      <span>ADHDAI — THE FERAL CREATIVE COLLECTIVE</span>
      <span>CONFIDENTIAL — DO NOT DISTRIBUTE</span>
    </div>
  </div>
</body>
</html>`;
}
