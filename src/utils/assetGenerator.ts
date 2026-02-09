/**
 * Asset Generator — Creates real, downloadable campaign assets
 * 
 * Generates:
 * - HTML print ad mockups (styled, self-contained)
 * - HTML billboard mockups
 * - HTML social media post cards
 * - HTML video storyboard with frames
 * - DALL-E generated images (hero, billboard, social)
 */

import OpenAI from 'openai';
import { ApologyCampaign } from '../types';

/**
 * Safe string helper — never returns "undefined" or "null"
 * Always returns a usable string
 */
function s(value: string | undefined | null, fallback: string = ''): string {
  if (value === undefined || value === null || value === 'undefined' || value === 'null') return fallback;
  return value;
}

// ============================================
// DALL-E IMAGE GENERATION
// ============================================

function getOpenAIClient(): OpenAI | null {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
}

export interface GeneratedAssets {
  heroImage?: string;       // base64 PNG data
  billboardImage?: string;  // base64 PNG data (wide)
  socialImage?: string;     // base64 PNG data (square)
  printAdHtml: string;      // Self-contained HTML
  billboardHtml: string;    // Self-contained HTML
  socialPostsHtml: string;  // Self-contained HTML
  storyboardHtml: string;   // Self-contained HTML
  bannerAdsHtml: string;    // Self-contained HTML
}

/**
 * Generate a campaign image using DALL-E
 */
export async function generateImage(
  prompt: string,
  size: '1024x1024' | '1792x1024' = '1024x1024'
): Promise<string | null> {
  const openai = getOpenAIClient();
  if (!openai) return null;

  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size,
      quality: 'hd',
      style: 'vivid',
      response_format: 'b64_json'
    });

    const b64 = response.data?.[0]?.b64_json;
    return b64 || null;
  } catch (error) {
    console.error('Image generation error:', error);
    return null;
  }
}

/**
 * Generate all campaign images in parallel
 */
export async function generateCampaignImages(
  campaign: ApologyCampaign
): Promise<{ hero?: string; billboard?: string; social?: string }> {
  const results: { hero?: string; billboard?: string; social?: string } = {};

  const brandContext = `Brand: ${s(campaign.companyName, 'Corporate brand')}. Campaign: "${s(campaign.headline, 'Proactive Apology Campaign')}". Visual concept: ${s(campaign.visualConcept, 'a corporation confronting its future with radical honesty')}. Brand colors: ${campaign.colorPalette?.join(', ') || 'deep midnight navy, charcoal, warm amber, signal red, bone white'}. Tone: ${s(campaign.tone, 'controlled vulnerability — the courage of a confession made before it was necessary')}.`;

  const heroPrompt = `Award-winning advertising campaign hero image in the style of Wieden+Kennedy's most iconic work. ${brandContext} The image should feel like a still from a prestige film — shot by Roger Deakins. Cinematic single-source lighting, deep shadows, a single powerful subject that commands the frame. The feeling of corporate accountability made visible: a boardroom at dawn, or hands on a conference table, or an empty chair where someone important used to sit. Shallow depth of field, the key subject in razor focus. Color palette: predominantly dark tones with one warm accent that draws the eye. Emotional register: the quiet courage of telling the truth before you're caught. Shot on Hasselblad medium format. Premium production value. No text, no logos, no watermarks.`;

  const billboardPrompt = `Bold, award-winning outdoor billboard visual that would win a Cannes Grand Prix for OOH. ${brandContext} Think Collins (wearecollins.com) meets Jenny Holzer. One SINGLE powerful image or graphic element that reads from 50 meters away and haunts you for the rest of the drive. Dramatic negative space — 60% of the frame is breathing room. The visual should be so simple it's almost abstract, but so specific it's unforgettable. Horizontal 16:9 composition. High contrast. The kind of billboard that makes people pull over to photograph it. Not corporate. CULTURAL. Not safe. BRAVE. No text, no logos. Wide composition.`;

  const socialPrompt = `Scroll-stopping social media campaign image that would be featured on It's Nice That and Communication Arts. ${brandContext} Square composition. Think Droga5's most shared campaigns. This image should make someone stop mid-scroll and feel SOMETHING — unease, recognition, empathy, all at once. Not polished corporate. Not stock photography. The kind of image that looks like it was captured in a real moment of vulnerability. Natural-feeling light with one dramatic shadow. Warm color temperature with cool accents. The image should feel like a confession: raw, honest, slightly uncomfortable, ultimately brave. Shot on film. Grain visible. Human. No text, no logos. Square format.`;

  // Generate in parallel
  const [hero, billboard, social] = await Promise.allSettled([
    generateImage(heroPrompt, '1024x1024'),
    generateImage(billboardPrompt, '1792x1024'),
    generateImage(socialPrompt, '1024x1024')
  ]);

  if (hero.status === 'fulfilled' && hero.value) results.hero = hero.value;
  if (billboard.status === 'fulfilled' && billboard.value) results.billboard = billboard.value;
  if (social.status === 'fulfilled' && social.value) results.social = social.value;

  return results;
}

// ============================================
// HTML PRINT AD GENERATOR
// ============================================

export function generatePrintAdHtml(
  campaign: ApologyCampaign,
  heroImageBase64?: string
): string {
  const ad = campaign.deliverables?.fullPageAd;
  const companyName = s(campaign.companyName, 'Company');
  const headline = s(ad?.headline, s(campaign.headline, 'We Owe You An Apology'));
  const subheadline = s(campaign.subheadline, 'A proactive statement of accountability');
  const bodyCopy = s(ad?.body, s(campaign.apologyStatement, 'We see what\'s coming. And we believe you deserve to know before it arrives. This is our commitment to transparency — not after the fact, but before it.'));
  const visualDesc = s(ad?.visual, s(campaign.visualConcept, 'Campaign Visual'));
  
  const colors = campaign.colorPalette || ['#1a1a2e', '#16213e', '#0f3460', '#e94560', '#f5f5f5'];
  const primaryColor = colors[0] || '#1a1a2e';
  const accentColor = colors[3] || '#c41e3a';

  const scenarioTitle = s(campaign.scenarioTitle, '');
  const tagline = s(campaign.subheadline, subheadline);
  const keyMessages = (campaign.keyMessages || []).filter(Boolean);

  const imageSection = heroImageBase64
    ? `<div class="hero-image"><img src="data:image/png;base64,${heroImageBase64}" alt="Campaign Visual" /></div>`
    : `<div class="hero-image placeholder"><div class="placeholder-text">${visualDesc}</div></div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Print Ad — ${companyName} — ${headline}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    @page { size: 8.5in 11in; margin: 0; }
    
    body {
      font-family: 'Inter', -apple-system, sans-serif;
      background: #e8e8e8;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
    }
    
    .print-ad {
      width: 612px;  /* 8.5in at 72dpi */
      height: 792px; /* 11in at 72dpi */
      background: #fff;
      position: relative;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.15);
      display: flex;
      flex-direction: column;
    }
    
    .brand-bar {
      padding: 24px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #f0f0f0;
    }
    
    .brand-name {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 4px;
      text-transform: uppercase;
      color: ${primaryColor};
    }
    
    .brand-tag {
      font-size: 9px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #999;
    }
    
    .hero-image {
      width: 100%;
      height: 300px;
      overflow: hidden;
      background: ${primaryColor};
    }
    
    .hero-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .hero-image.placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, ${primaryColor} 0%, ${colors[2] || '#333'} 100%);
    }
    
    .placeholder-text {
      color: rgba(255,255,255,0.4);
      font-size: 12px;
      text-align: center;
      max-width: 300px;
      line-height: 1.6;
      padding: 20px;
    }
    
    .scenario-bar {
      padding: 10px 40px;
      background: ${primaryColor};
      font-size: 8px;
      font-weight: 600;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: rgba(255,255,255,0.7);
    }
    
    .ad-content {
      flex: 1;
      padding: 36px 40px 24px;
      display: flex;
      flex-direction: column;
    }
    
    .headline {
      font-size: 28px;
      font-weight: 700;
      color: ${primaryColor};
      line-height: 1.15;
      letter-spacing: -0.02em;
      margin-bottom: 10px;
    }
    
    .subheadline {
      font-size: 13px;
      font-weight: 400;
      color: #666;
      margin-bottom: 24px;
      line-height: 1.5;
    }
    
    .divider {
      width: 40px;
      height: 3px;
      background: ${accentColor};
      margin-bottom: 20px;
    }
    
    .body-copy {
      font-size: 10.5px;
      line-height: 1.75;
      color: #444;
      max-width: 460px;
      flex: 1;
    }
    
    .key-messages {
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid #f0f0f0;
    }
    
    .key-messages-label {
      font-size: 7px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #999;
      margin-bottom: 8px;
    }
    
    .key-message {
      font-size: 9px;
      color: #555;
      padding: 4px 0;
      padding-left: 12px;
      border-left: 2px solid ${accentColor};
      margin-bottom: 4px;
    }
    
    .ad-footer {
      padding: 16px 40px;
      background: ${primaryColor};
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .footer-left {
      font-size: 7px;
      color: rgba(255,255,255,0.5);
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    
    .footer-right {
      text-align: right;
    }
    
    .footer-tagline {
      font-size: 10px;
      font-weight: 600;
      color: #fff;
      letter-spacing: 1px;
    }
    
    .footer-url {
      font-size: 8px;
      color: rgba(255,255,255,0.5);
      margin-top: 3px;
    }
    
    @media print {
      body { background: none; padding: 0; }
      .print-ad { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="print-ad">
    <div class="brand-bar">
      <span class="brand-name">${companyName}</span>
      <span class="brand-tag">A Proactive Apology</span>
    </div>
    
    ${scenarioTitle ? `<div class="scenario-bar">RE: ${scenarioTitle}</div>` : ''}
    
    ${imageSection}
    
    <div class="ad-content">
      <h1 class="headline">${headline}</h1>
      <p class="subheadline">${tagline}</p>
      <div class="divider"></div>
      <div class="body-copy">
        ${bodyCopy}
      </div>
      ${keyMessages.length > 0 ? `
        <div class="key-messages">
          <div class="key-messages-label">Our Commitments</div>
          ${keyMessages.slice(0, 3).map(msg => `<div class="key-message">${msg}</div>`).join('')}
        </div>
      ` : ''}
    </div>
    
    <div class="ad-footer">
      <div class="footer-left">
        PROACTIVE ACCOUNTABILITY INITIATIVE
      </div>
      <div class="footer-right">
        <div class="footer-tagline">${tagline}</div>
        <div class="footer-url">${companyName.toLowerCase().replace(/\s+/g, '')}.com/accountability</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// ============================================
// HTML BILLBOARD GENERATOR
// ============================================

export function generateBillboardHtml(
  campaign: ApologyCampaign,
  billboardImageBase64?: string
): string {
  const billboard = campaign.deliverables?.billboard;
  const companyName = s(campaign.companyName, 'Company');
  const bbHeadline = s(billboard?.headline, s(campaign.headline, 'We See What\'s Coming. This Is Us, Saying Sorry First.'));
  const bbTagline = s(billboard?.body, s(campaign.subheadline, `${companyName}. Accountable before the headline breaks.`));
  const bbDimensions = s(billboard?.dimensions, '14x48 ft');
  const bbFormat = s(billboard?.format, 'Billboard');
  const scenarioTitle = s(campaign.scenarioTitle, '');
  
  const colors = campaign.colorPalette || ['#0f0f0f', '#1a1a2e', '#4361ee', '#e94560', '#f5f5f5'];
  const primaryColor = colors[0] || '#0f0f0f';
  const accentColor = colors[3] || '#e94560';
  const secondaryColor = colors[2] || '#4361ee';

  const bgStyle = billboardImageBase64
    ? `background-image: url(data:image/png;base64,${billboardImageBase64}); background-size: cover; background-position: center;`
    : `background: linear-gradient(135deg, ${primaryColor} 0%, ${colors[1] || '#1a1a2e'} 40%, ${secondaryColor}33 100%);`;

  // Make headline font size responsive to length
  const headlineLen = bbHeadline.length;
  const headlineSize = headlineLen > 60 ? '28px' : headlineLen > 40 ? '34px' : '42px';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Billboard — ${companyName} — Proactive Apology Campaign</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Inter', -apple-system, sans-serif;
      background: #0a0a0a;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 40px;
    }
    
    .spec-label {
      font-size: 10px;
      letter-spacing: 4px;
      text-transform: uppercase;
      color: #444;
      margin-bottom: 24px;
    }
    
    .billboard {
      width: 960px;
      height: 288px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 20px 80px rgba(0,0,0,0.6);
      ${bgStyle}
    }
    
    .billboard-overlay {
      position: absolute;
      inset: 0;
      background: ${billboardImageBase64 
        ? 'linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 55%, rgba(0,0,0,0.15) 100%)'
        : 'none'};
      display: flex;
      align-items: center;
      padding: 0 56px;
    }
    
    .billboard-content {
      max-width: 60%;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .billboard-accent-bar {
      width: 48px;
      height: 4px;
      background: ${accentColor};
    }
    
    .billboard-headline {
      font-size: ${headlineSize};
      font-weight: 800;
      color: #fff;
      line-height: 1.08;
      letter-spacing: -0.03em;
      text-shadow: 0 2px 30px rgba(0,0,0,0.6);
    }
    
    .billboard-tagline {
      font-size: 13px;
      font-weight: 400;
      color: rgba(255,255,255,0.75);
      letter-spacing: 0.03em;
      line-height: 1.5;
      max-width: 420px;
    }
    
    .billboard-brand {
      position: absolute;
      bottom: 0;
      right: 0;
      padding: 16px 28px;
      background: ${accentColor};
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 2px;
    }
    
    .brand-name {
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: #fff;
    }
    
    .brand-sub {
      font-size: 8px;
      font-weight: 500;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: rgba(255,255,255,0.7);
    }
    
    .dimension-label {
      font-size: 9px;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: #333;
      margin-top: 16px;
    }
    
    .context-bar {
      width: 960px;
      margin-top: 24px;
      padding: 16px 24px;
      background: #111;
      border: 1px solid #222;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .context-label {
      font-size: 9px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #555;
    }
    
    .context-value {
      font-size: 11px;
      color: #888;
    }
  </style>
</head>
<body>
  <div class="spec-label">OUTDOOR BILLBOARD — 14' x 48' — ${companyName} PROACTIVE APOLOGY CAMPAIGN</div>
  <div class="billboard">
    <div class="billboard-overlay">
      <div class="billboard-content">
        <div class="billboard-accent-bar"></div>
        <h1 class="billboard-headline">${bbHeadline}</h1>
        <p class="billboard-tagline">${bbTagline}</p>
      </div>
    </div>
    <div class="billboard-brand">
      <span class="brand-name">${companyName}</span>
      <span class="brand-sub">A Proactive Apology</span>
    </div>
  </div>
  <div class="dimension-label">${bbDimensions} — ${bbFormat}</div>
  ${scenarioTitle ? `
  <div class="context-bar">
    <div>
      <div class="context-label">SCENARIO</div>
      <div class="context-value">${scenarioTitle}</div>
    </div>
    <div>
      <div class="context-label">CLIENT</div>
      <div class="context-value">${companyName}</div>
    </div>
    <div>
      <div class="context-label">FORMAT</div>
      <div class="context-value">Out of Home — ${bbFormat}</div>
    </div>
  </div>` : ''}
</body>
</html>`;
}

// ============================================
// HTML SOCIAL POSTS GENERATOR
// ============================================

export function generateSocialPostsHtml(
  campaign: ApologyCampaign,
  socialImageBase64?: string
): string {
  const posts = campaign.deliverables?.socialPosts || [];
  const companyName = s(campaign.companyName, 'Company');
  const campaignHeadline = s(campaign.headline, 'We Owe You An Apology');
  const colors = campaign.colorPalette || ['#1a1a2e', '#16213e', '#0f3460', '#e94560', '#f5f5f5'];
  const primaryColor = colors[0] || '#1a1a2e';

  const socialImg = socialImageBase64
    ? `data:image/png;base64,${socialImageBase64}`
    : '';

  const postsHtml = posts.map((post) => {
    const platformStyles: Record<string, { bg: string; accent: string; icon: string }> = {
      'Twitter/X': { bg: '#000', accent: '#1d9bf0', icon: '𝕏' },
      'Instagram': { bg: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)', accent: '#e1306c', icon: '📷' },
      'LinkedIn': { bg: '#0a66c2', accent: '#0a66c2', icon: '💼' },
      'TikTok': { bg: '#000', accent: '#69c9d0', icon: '🎵' },
    };
    const style = platformStyles[post.platform] || { bg: '#333', accent: '#888', icon: '📱' };

    return `
      <div class="social-post">
        <div class="post-platform" style="background: ${style.bg}; color: #fff;">
          <span class="platform-icon">${style.icon}</span>
          <span class="platform-name">${s(post.platform, 'Social')}</span>
          <span class="post-type">${s(post.type, 'Post')}</span>
        </div>
        ${socialImg ? `<div class="post-image"><img src="${socialImg}" alt="Post visual" /></div>` : 
          `<div class="post-image placeholder" style="background: ${primaryColor};">
            <span>${s(post.visual, 'Visual content')}</span>
          </div>`}
        <div class="post-content">
          <div class="post-author">
            <div class="author-avatar" style="background: ${style.accent};">${companyName.charAt(0)}</div>
            <div class="author-info">
              <span class="author-name">${companyName}</span>
              <span class="author-handle">@${companyName.toLowerCase().replace(/\s+/g, '')}</span>
            </div>
          </div>
          <div class="post-copy">${s(post.copy, 'Campaign announcement coming soon.').replace(/\n/g, '<br>')}</div>
          ${post.hashtags && post.hashtags.length > 0 ? `
            <div class="post-hashtags">
              ${post.hashtags.map(h => `<span class="hashtag">#${h}</span>`).join(' ')}
            </div>
          ` : ''}
        </div>
      </div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Social Media Deck — ${campaign.companyName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Inter', -apple-system, sans-serif;
      background: #0a0a0a;
      color: #fff;
      min-height: 100vh;
      padding: 40px;
    }
    
    .deck-header {
      text-align: center;
      margin-bottom: 48px;
      padding-bottom: 32px;
      border-bottom: 1px solid #222;
    }
    
    .deck-label {
      font-size: 10px;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: #555;
      margin-bottom: 16px;
    }
    
    .deck-title {
      font-size: 28px;
      font-weight: 300;
      margin-bottom: 8px;
    }
    
    .deck-subtitle {
      font-size: 14px;
      color: #666;
    }
    
    .posts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
      gap: 32px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .social-post {
      background: #111;
      border: 1px solid #222;
      border-radius: 12px;
      overflow: hidden;
    }
    
    .post-platform {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      font-size: 12px;
      font-weight: 600;
    }
    
    .platform-icon {
      font-size: 16px;
    }
    
    .platform-name {
      flex: 1;
    }
    
    .post-type {
      font-size: 10px;
      font-weight: 400;
      opacity: 0.6;
    }
    
    .post-image {
      width: 100%;
      height: 280px;
      overflow: hidden;
    }
    
    .post-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .post-image.placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255,255,255,0.3);
      font-size: 12px;
      text-align: center;
      padding: 20px;
    }
    
    .post-content {
      padding: 20px;
    }
    
    .post-author {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }
    
    .author-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 16px;
      color: #fff;
    }
    
    .author-info {
      display: flex;
      flex-direction: column;
    }
    
    .author-name {
      font-size: 14px;
      font-weight: 600;
    }
    
    .author-handle {
      font-size: 12px;
      color: #666;
    }
    
    .post-copy {
      font-size: 14px;
      line-height: 1.6;
      color: #ccc;
      margin-bottom: 16px;
    }
    
    .post-hashtags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    
    .hashtag {
      font-size: 12px;
      color: #1d9bf0;
    }
  </style>
</head>
<body>
  <div class="deck-header">
    <div class="deck-label">SOCIAL MEDIA COPY DECK</div>
    <h1 class="deck-title">${companyName} — "${campaignHeadline}"</h1>
    <p class="deck-subtitle">${posts.length} platform-native executions</p>
  </div>
  
  <div class="posts-grid">
    ${postsHtml}
  </div>
</body>
</html>`;
}

// ============================================
// HTML VIDEO STORYBOARD GENERATOR
// ============================================

export function generateStoryboardHtml(
  campaign: ApologyCampaign,
  heroImageBase64?: string
): string {
  const video = campaign.deliverables?.videoScript;
  if (!video) return '';

  const companyName = s(campaign.companyName, 'Company');
  const videoTitle = s(video.title, `${companyName} — A Proactive Confession`);
  const videoDuration = s(video.duration, '60 seconds');
  const videoFormat = s(video.format, 'Documentary confession');
  const videoNotes = s(video.notes, 'Shoot on film if budget allows. Natural lighting. Real employees, not actors. The goal is uncomfortable honesty.');
  
  const colors = campaign.colorPalette || ['#1a1a2e', '#16213e', '#0f3460', '#e94560', '#f5f5f5'];
  const primaryColor = colors[0] || '#1a1a2e';

  const frames = (video.script || []).map((shot, i) => {
    // Use hero image for first and last frames for visual interest
    const showImage = heroImageBase64 && (i === 0 || i === video.script.length - 1);
    
    return `
      <div class="frame">
        <div class="frame-number">SHOT ${s(shot.shot, String(i + 1))}</div>
        <div class="frame-visual" ${showImage ? `style="background-image: url(data:image/png;base64,${heroImageBase64}); background-size: cover; background-position: center;"` : `style="background: ${primaryColor};"`}>
          ${!showImage ? `<div class="visual-desc">${s(shot.visual, 'Wide shot')}</div>` : ''}
        </div>
        <div class="frame-details">
          <div class="detail-row">
            <span class="detail-label">DURATION</span>
            <span class="detail-value">${s(shot.duration, '5s')}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">VISUAL</span>
            <span class="detail-value">${s(shot.visual, 'Wide shot')}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">AUDIO</span>
            <span class="detail-value">${s(shot.audio, '(ambient)')}</span>
          </div>
          ${shot.onScreenText ? `
            <div class="detail-row">
              <span class="detail-label">ON-SCREEN TEXT</span>
              <span class="detail-value super">${shot.onScreenText}</span>
            </div>
          ` : ''}
        </div>
      </div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Video Storyboard — ${companyName} — ${videoTitle}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Inter', -apple-system, sans-serif;
      background: #0a0a0a;
      color: #e0e0e0;
      min-height: 100vh;
      padding: 40px;
    }
    
    .storyboard-header {
      max-width: 900px;
      margin: 0 auto 48px;
      padding-bottom: 32px;
      border-bottom: 1px solid #222;
    }
    
    .header-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: #c41e3a;
      margin-bottom: 16px;
    }
    
    .header-title {
      font-size: 32px;
      font-weight: 300;
      color: #fff;
      margin-bottom: 8px;
    }
    
    .header-meta {
      display: flex;
      gap: 24px;
      font-size: 13px;
      color: #666;
    }
    
    .header-meta span {
      display: flex;
      gap: 8px;
    }
    
    .header-meta .label {
      color: #444;
    }
    
    .frames-container {
      max-width: 900px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    
    .frame {
      background: #111;
      border: 1px solid #222;
      border-radius: 8px;
      overflow: hidden;
      display: grid;
      grid-template-columns: 60px 320px 1fr;
    }
    
    .frame-number {
      background: #1a1a1a;
      display: flex;
      align-items: center;
      justify-content: center;
      writing-mode: vertical-lr;
      transform: rotate(180deg);
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 2px;
      color: #555;
      padding: 16px 8px;
    }
    
    .frame-visual {
      height: 180px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-right: 1px solid #222;
    }
    
    .visual-desc {
      font-size: 11px;
      color: rgba(255,255,255,0.4);
      text-align: center;
      padding: 16px;
      line-height: 1.6;
    }
    
    .frame-details {
      padding: 20px 24px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .detail-row {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .detail-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      font-weight: 600;
      letter-spacing: 1px;
      color: #555;
      text-transform: uppercase;
    }
    
    .detail-value {
      font-size: 12px;
      line-height: 1.5;
      color: #bbb;
    }
    
    .detail-value.super {
      color: #fff;
      font-weight: 500;
      font-style: italic;
    }
    
    .production-notes {
      max-width: 900px;
      margin: 48px auto 0;
      padding-top: 32px;
      border-top: 1px solid #222;
    }
    
    .notes-title {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #555;
      margin-bottom: 16px;
    }
    
    .notes-content {
      font-size: 13px;
      line-height: 1.7;
      color: #888;
    }
    
    @media (max-width: 768px) {
      .frame {
        grid-template-columns: 1fr;
      }
      .frame-number {
        writing-mode: horizontal-tb;
        transform: none;
      }
      .frame-visual {
        border-right: none;
        border-bottom: 1px solid #222;
      }
    }
  </style>
</head>
<body>
  <div class="storyboard-header">
    <div class="header-label">VIDEO STORYBOARD</div>
    <h1 class="header-title">${videoTitle}</h1>
    <div class="header-meta">
      <span><span class="label">Duration:</span> ${videoDuration}</span>
      <span><span class="label">Format:</span> ${videoFormat}</span>
      <span><span class="label">Client:</span> ${companyName}</span>
    </div>
  </div>
  
  <div class="frames-container">
    ${frames}
  </div>
  
  ${videoNotes ? `
    <div class="production-notes">
      <div class="notes-title">DIRECTOR'S NOTES</div>
      <div class="notes-content">${videoNotes}</div>
    </div>
  ` : ''}
</body>
</html>`;
}

// ============================================
// HTML BANNER ADS GENERATOR
// ============================================

export function generateBannerAdsHtml(
  campaign: ApologyCampaign
): string {
  const banners = campaign.deliverables?.bannerAds || [];
  const companyName = s(campaign.companyName, 'Company');
  const campaignHeadline = s(campaign.headline, 'We Owe You An Apology');
  const campaignSubheadline = s(campaign.subheadline, 'A proactive statement of accountability');
  const colors = campaign.colorPalette || ['#1a1a2e', '#16213e', '#0f3460', '#e94560', '#f5f5f5'];
  const primaryColor = colors[0] || '#1a1a2e';
  const accentColor = colors[3] || '#c41e3a';

  const sizes: Record<string, { w: number; h: number }> = {
    '728x90': { w: 728, h: 90 },
    '300x250': { w: 300, h: 250 },
    '160x600': { w: 160, h: 600 },
    '320x50': { w: 320, h: 50 },
  };

  const bannersHtml = banners.map((banner) => {
    const sizeKey = Object.keys(sizes).find(k => banner.format?.includes(k)) || '300x250';
    const size = sizes[sizeKey];
    const isWide = size.w > size.h * 2;
    const isTall = size.h > size.w;

    // Fit headline to format — use full text, CSS handles overflow
    const bannerHL = s(banner.headline, campaignHeadline);
    const displayHL = bannerHL;
    const displayBody = s(banner.body, campaignSubheadline);
    const ctaText = displayBody.includes('→') || displayBody.includes('http') ? displayBody : 'Read Our Pre-Apology →';
    
    return `
      <div class="banner-wrapper">
        <div class="banner-spec">${s(banner.format, 'Digital Banner')} — ${sizeKey}</div>
        <div class="banner-ad" style="width: ${size.w}px; height: ${size.h}px; background: linear-gradient(135deg, ${primaryColor} 0%, ${colors[1] || '#1a1a2e'} 100%);">
          <div class="banner-accent" style="position:absolute;top:0;left:0;width:100%;height:3px;background:${accentColor};"></div>
          <div class="banner-content ${isWide ? 'wide' : ''} ${isTall ? 'tall' : ''}">
            <div class="banner-headline">${displayHL}</div>
            ${!isWide ? `<div class="banner-body">${isTall ? displayBody : campaignSubheadline}</div>` : ''}
            <div class="banner-cta" style="background: ${accentColor};">${isWide ? ctaText : 'Learn More →'}</div>
          </div>
          <div class="banner-logo">${companyName}</div>
        </div>
      </div>`;
  }).join('');

  // Use full headline — let CSS handle sizing
  const leaderboardHL = campaignHeadline;
  
  // Add default banners if none exist
  const defaultBannersHtml = banners.length === 0 ? `
    <div class="banner-wrapper">
      <div class="banner-spec">Leaderboard — 728x90</div>
      <div class="banner-ad" style="width: 728px; height: 90px; background: linear-gradient(135deg, ${primaryColor} 0%, ${colors[1] || '#1a1a2e'} 100%); position: relative;">
        <div style="position:absolute;top:0;left:0;width:100%;height:3px;background:${accentColor};"></div>
        <div class="banner-content wide">
          <div class="banner-headline">${leaderboardHL}</div>
          <div class="banner-cta" style="background: ${accentColor};">Read Our Pre-Apology →</div>
        </div>
        <div class="banner-logo">${companyName}</div>
      </div>
    </div>
    <div class="banner-wrapper">
      <div class="banner-spec">Medium Rectangle — 300x250</div>
      <div class="banner-ad" style="width: 300px; height: 250px; background: linear-gradient(135deg, ${primaryColor} 0%, ${colors[1] || '#1a1a2e'} 100%); position: relative;">
        <div style="position:absolute;top:0;left:0;width:100%;height:3px;background:${accentColor};"></div>
        <div class="banner-content">
          <div class="banner-headline">${campaignHeadline}</div>
          <div class="banner-body">${campaignSubheadline}</div>
          <div class="banner-cta" style="background: ${accentColor};">Learn More →</div>
        </div>
        <div class="banner-logo">${companyName}</div>
      </div>
    </div>
    <div class="banner-wrapper">
      <div class="banner-spec">Skyscraper — 160x600</div>
      <div class="banner-ad" style="width: 160px; height: 600px; background: linear-gradient(180deg, ${primaryColor} 0%, ${colors[1] || '#1a1a2e'} 100%); position: relative;">
        <div style="position:absolute;top:0;left:0;width:100%;height:3px;background:${accentColor};"></div>
        <div class="banner-content tall">
          <div class="banner-headline">${campaignHeadline}</div>
          <div class="banner-body">${campaignSubheadline}</div>
          <div class="banner-cta" style="background: ${accentColor};">Learn More →</div>
        </div>
        <div class="banner-logo">${companyName}</div>
      </div>
    </div>
  ` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Digital Banner Suite — ${campaign.companyName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Inter', -apple-system, sans-serif;
      background: #f5f5f5;
      min-height: 100vh;
      padding: 40px;
    }
    
    h1 {
      text-align: center;
      font-size: 24px;
      font-weight: 300;
      color: #333;
      margin-bottom: 8px;
    }
    
    .subtitle {
      text-align: center;
      font-size: 12px;
      color: #999;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 48px;
    }
    
    .banner-wrapper {
      margin: 0 auto 40px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .banner-spec {
      font-size: 10px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #999;
      margin-bottom: 12px;
    }
    
    .banner-ad {
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    }
    
    .banner-content {
      padding: 16px 20px;
      text-align: center;
      color: #fff;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    
    .banner-content.wide {
      flex-direction: row;
      gap: 20px;
    }
    
    .banner-content.tall {
      padding: 24px 16px;
    }
    
    .banner-headline {
      font-size: 14px;
      font-weight: 600;
      line-height: 1.2;
    }
    
    .banner-content.wide .banner-headline {
      font-size: 13px;
      flex: 1;
      text-align: left;
    }
    
    .banner-body {
      font-size: 11px;
      opacity: 0.8;
      line-height: 1.4;
    }
    
    .banner-cta {
      padding: 6px 16px;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      border-radius: 3px;
      white-space: nowrap;
    }
    
    .banner-logo {
      position: absolute;
      bottom: 6px;
      right: 10px;
      font-size: 8px;
      font-weight: 600;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: rgba(255,255,255,0.5);
    }
  </style>
</head>
<body>
  <h1>Digital Banner Suite</h1>
    <div class="subtitle">${companyName} — Proactive Apology Campaign</div>
  
  ${bannersHtml || defaultBannersHtml}
</body>
</html>`;
}

// ============================================
// SVG BILLBOARD — Real image file, not HTML
// ============================================

export function generateBillboardSvg(
  campaign: ApologyCampaign,
  billboardImageBase64?: string
): string {
  const companyName = s(campaign.companyName, 'Company');
  const billboard = campaign.deliverables?.billboard;
  const headline = s(billboard?.headline, s(campaign.headline, 'We See What\'s Coming. This Is Us, Saying Sorry First.'));
  const tagline = s(billboard?.body, s(campaign.subheadline, `${companyName}. Accountable before the headline breaks.`));
  
  const colors = campaign.colorPalette || ['#0f0f0f', '#1a1a2e', '#4361ee', '#e94560', '#f5f5f5'];
  const primaryColor = colors[0] || '#0f0f0f';
  const secondaryColor = colors[1] || '#1a1a2e';
  const accentColor = colors[3] || '#e94560';

  // Word-wrap headline into lines (max ~40 chars per line for billboard)
  const words = headline.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length > 38) {
      lines.push(currentLine.trim());
      currentLine = word;
    } else {
      currentLine = currentLine ? currentLine + ' ' + word : word;
    }
  }
  if (currentLine.trim()) lines.push(currentLine.trim());
  
  const fontSize = lines.length > 3 ? 40 : lines.length > 2 ? 48 : 56;
  const lineHeight = fontSize * 1.12;
  const headlineY = 120;
  
  const headlineText = lines.map((line, i) => 
    `<text x="72" y="${headlineY + i * lineHeight}" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="${fontSize}" font-weight="800" fill="white" letter-spacing="-1">${escapeXml(line)}</text>`
  ).join('\n    ');
  
  const taglineY = headlineY + lines.length * lineHeight + 20;

  const bgImage = billboardImageBase64 
    ? `<image href="data:image/png;base64,${billboardImageBase64}" x="0" y="0" width="1440" height="432" preserveAspectRatio="xMidYMid slice"/>
    <rect x="0" y="0" width="1440" height="432" fill="url(#overlay)"/>`
    : `<rect x="0" y="0" width="1440" height="432" fill="url(#bgGrad)"/>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1440" height="432" viewBox="0 0 1440 432">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${primaryColor}"/>
      <stop offset="60%" style="stop-color:${secondaryColor}"/>
      <stop offset="100%" style="stop-color:${primaryColor}"/>
    </linearGradient>
    <linearGradient id="overlay" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:0.88"/>
      <stop offset="50%" style="stop-color:${primaryColor};stop-opacity:0.5"/>
      <stop offset="100%" style="stop-color:${primaryColor};stop-opacity:0.15"/>
    </linearGradient>
  </defs>
  
  <!-- Background -->
  ${bgImage}
  
  <!-- Accent bar -->
  <rect x="72" y="${headlineY - 40}" width="56" height="5" fill="${accentColor}" rx="2"/>
  
  <!-- Headline -->
  ${headlineText}
  
  <!-- Tagline -->
  <text x="72" y="${taglineY}" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="16" font-weight="400" fill="rgba(255,255,255,0.72)" letter-spacing="0.5">${escapeXml(tagline.slice(0, 70))}</text>
  
  <!-- Brand badge -->
  <rect x="${1440 - 200}" y="${432 - 56}" width="200" height="56" fill="${accentColor}"/>
  <text x="${1440 - 100}" y="${432 - 28}" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="16" font-weight="800" fill="white" text-anchor="middle" letter-spacing="3" dominant-baseline="middle">${escapeXml(companyName.toUpperCase().slice(0, 16))}</text>
  <text x="${1440 - 100}" y="${432 - 12}" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="7" font-weight="500" fill="rgba(255,255,255,0.6)" text-anchor="middle" letter-spacing="2">A PROACTIVE APOLOGY</text>
</svg>`;
}

// ============================================
// SVG PRINT AD — Real image file
// ============================================

export function generatePrintAdSvg(
  campaign: ApologyCampaign,
  heroImageBase64?: string
): string {
  const companyName = s(campaign.companyName, 'Company');
  const ad = campaign.deliverables?.fullPageAd;
  const headline = s(ad?.headline, s(campaign.headline, 'We See What\'s Coming.'));
  const tagline = s(campaign.subheadline, 'A proactive statement of accountability');
  const bodyCopy = s(ad?.body, s(campaign.apologyStatement, 'We see what is coming. And we believe you deserve to know before it arrives.'));
  const scenarioTitle = s(campaign.scenarioTitle, '');
  
  const colors = campaign.colorPalette || ['#0f0f0f', '#1a1a2e', '#4361ee', '#e94560', '#f5f5f5'];
  const primaryColor = colors[0] || '#0f0f0f';
  const accentColor = colors[3] || '#e94560';

  // Word-wrap headline
  const hlWords = headline.split(' ');
  const hlLines: string[] = [];
  let hlCurrent = '';
  for (const w of hlWords) {
    if ((hlCurrent + ' ' + w).trim().length > 32) {
      hlLines.push(hlCurrent.trim());
      hlCurrent = w;
    } else {
      hlCurrent = hlCurrent ? hlCurrent + ' ' + w : w;
    }
  }
  if (hlCurrent.trim()) hlLines.push(hlCurrent.trim());
  
  const hlFontSize = hlLines.length > 3 ? 26 : 32;
  const hlLineHeight = hlFontSize * 1.15;
  
  // Word-wrap body copy (shorter lines for print)
  const bodyWords = bodyCopy.split(' ');
  const bodyLines: string[] = [];
  let bodyCurrent = '';
  for (const w of bodyWords) {
    if ((bodyCurrent + ' ' + w).trim().length > 62) {
      bodyLines.push(bodyCurrent.trim());
      bodyCurrent = w;
    } else {
      bodyCurrent = bodyCurrent ? bodyCurrent + ' ' + w : w;
    }
  }
  if (bodyCurrent.trim()) bodyLines.push(bodyCurrent.trim());

  const imageSection = heroImageBase64
    ? `<image href="data:image/png;base64,${heroImageBase64}" x="0" y="80" width="612" height="280" preserveAspectRatio="xMidYMid slice"/>`
    : `<rect x="0" y="80" width="612" height="280" fill="${primaryColor}"/>
       <text x="306" y="226" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="12" fill="rgba(255,255,255,0.3)" text-anchor="middle">Campaign Visual</text>`;

  const contentY = 395;
  const headlineTextSvg = hlLines.map((line, i) =>
    `<text x="48" y="${contentY + i * hlLineHeight}" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="${hlFontSize}" font-weight="700" fill="${primaryColor}" letter-spacing="-0.5">${escapeXml(line)}</text>`
  ).join('\n  ');
  
  const taglineY = contentY + hlLines.length * hlLineHeight + 12;
  const dividerY = taglineY + 24;
  const bodyStartY = dividerY + 24;
  
  const bodyTextSvg = bodyLines.slice(0, 12).map((line, i) =>
    `<text x="48" y="${bodyStartY + i * 16}" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="10.5" fill="#444" letter-spacing="0.2">${escapeXml(line)}</text>`
  ).join('\n  ');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="612" height="792" viewBox="0 0 612 792">
  <!-- Background -->
  <rect width="612" height="792" fill="white"/>
  
  <!-- Brand bar -->
  <rect x="0" y="0" width="612" height="80" fill="white"/>
  <text x="48" y="48" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="12" font-weight="700" fill="${primaryColor}" letter-spacing="4">${escapeXml(companyName.toUpperCase())}</text>
  <text x="564" y="48" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="9" fill="#999" text-anchor="end" letter-spacing="2">A PROACTIVE APOLOGY</text>
  <line x1="48" y1="66" x2="564" y2="66" stroke="#eee" stroke-width="1"/>
  
  ${scenarioTitle ? `<rect x="0" y="68" width="612" height="12" fill="${primaryColor}"/>
  <text x="306" y="77" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="6" fill="rgba(255,255,255,0.6)" text-anchor="middle" letter-spacing="2">${escapeXml(('RE: ' + scenarioTitle).toUpperCase().slice(0, 80))}</text>` : ''}
  
  <!-- Hero image -->
  ${imageSection}
  
  <!-- Content -->
  ${headlineTextSvg}
  
  <text x="48" y="${taglineY}" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="12" fill="#888" font-style="italic">${escapeXml(tagline.slice(0, 70))}</text>
  
  <!-- Accent divider -->
  <rect x="48" y="${dividerY}" width="40" height="3" fill="${accentColor}"/>
  
  <!-- Body copy -->
  ${bodyTextSvg}
  
  <!-- Footer -->
  <rect x="0" y="742" width="612" height="50" fill="${primaryColor}"/>
  <text x="48" y="768" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="7" fill="rgba(255,255,255,0.5)" letter-spacing="1">PROACTIVE ACCOUNTABILITY INITIATIVE</text>
  <text x="564" y="762" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="10" font-weight="600" fill="white" text-anchor="end">${escapeXml(tagline.slice(0, 50))}</text>
  <text x="564" y="776" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="7" fill="rgba(255,255,255,0.5)" text-anchor="end">${escapeXml(companyName.toLowerCase().replace(/\s+/g, ''))}.com/accountability</text>
</svg>`;
}

// ============================================
// SVG BANNER AD — Real image file
// ============================================

export function generateBannerSvg(
  campaign: ApologyCampaign,
  width: number = 728,
  height: number = 90
): string {
  const companyName = s(campaign.companyName, 'Company');
  const headline = s(campaign.headline, 'We Owe You An Apology');
  // Show full headline — no truncation with ellipses
  const displayHL = headline;
  
  const colors = campaign.colorPalette || ['#0f0f0f', '#1a1a2e', '#4361ee', '#e94560', '#f5f5f5'];
  const primaryColor = colors[0] || '#0f0f0f';
  const secondaryColor = colors[1] || '#1a1a2e';
  const accentColor = colors[3] || '#e94560';
  
  const isWide = width > height * 2;
  const isTall = height > width;
  
  if (isTall) {
    // Skyscraper format
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs><linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:${primaryColor}"/><stop offset="100%" style="stop-color:${secondaryColor}"/></linearGradient></defs>
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <rect x="0" y="0" width="${width}" height="3" fill="${accentColor}"/>
  <text x="${width/2}" y="60" font-family="'Helvetica Neue', Arial, sans-serif" font-size="14" font-weight="700" fill="white" text-anchor="middle" letter-spacing="-0.3">${escapeXml(companyName)}</text>
  <rect x="${width/2 - 16}" y="75" width="32" height="2" fill="${accentColor}"/>
  <foreignObject x="12" y="90" width="${width - 24}" height="200">
    <p xmlns="http://www.w3.org/1999/xhtml" style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:white;line-height:1.4;margin:0;font-weight:600;text-align:center;">${escapeXml(headline)}</p>
  </foreignObject>
  <rect x="${width/2 - 48}" y="${height - 60}" width="96" height="28" rx="3" fill="${accentColor}"/>
  <text x="${width/2}" y="${height - 42}" font-family="'Helvetica Neue', Arial, sans-serif" font-size="8" font-weight="700" fill="white" text-anchor="middle" letter-spacing="1">LEARN MORE</text>
</svg>`;
  }
  
  // Leaderboard / medium rectangle
  const hlFontSize = isWide ? 14 : 16;
  const hlY = isWide ? height / 2 + 4 : 50;
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${primaryColor}"/><stop offset="100%" style="stop-color:${secondaryColor}"/></linearGradient></defs>
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <rect x="0" y="0" width="${width}" height="3" fill="${accentColor}"/>
  ${isWide 
    ? `<text x="24" y="${hlY}" font-family="'Helvetica Neue', Arial, sans-serif" font-size="${hlFontSize}" font-weight="700" fill="white" letter-spacing="-0.3">${escapeXml(displayHL)}</text>
       <rect x="${width - 180}" y="${height/2 - 16}" width="152" height="32" rx="3" fill="${accentColor}"/>
       <text x="${width - 104}" y="${height/2 + 1}" font-family="'Helvetica Neue', Arial, sans-serif" font-size="9" font-weight="700" fill="white" text-anchor="middle" letter-spacing="1">READ OUR PRE-APOLOGY</text>`
    : `<text x="${width/2}" y="28" font-family="'Helvetica Neue', Arial, sans-serif" font-size="10" font-weight="700" fill="rgba(255,255,255,0.6)" text-anchor="middle" letter-spacing="2">${escapeXml(companyName.toUpperCase())}</text>
       <foreignObject x="20" y="45" width="${width - 40}" height="120">
         <p xmlns="http://www.w3.org/1999/xhtml" style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:15px;color:white;line-height:1.3;margin:0;font-weight:700;text-align:center;">${escapeXml(headline)}</p>
       </foreignObject>
       <rect x="${width/2 - 56}" y="${height - 52}" width="112" height="30" rx="3" fill="${accentColor}"/>
       <text x="${width/2}" y="${height - 33}" font-family="'Helvetica Neue', Arial, sans-serif" font-size="9" font-weight="700" fill="white" text-anchor="middle" letter-spacing="1">LEARN MORE →</text>`
  }
  <text x="${width - 12}" y="${height - 8}" font-family="'Helvetica Neue', Arial, sans-serif" font-size="7" fill="rgba(255,255,255,0.35)" text-anchor="end" letter-spacing="1">${escapeXml(companyName.toUpperCase())}</text>
</svg>`;
}

/** Escape special XML characters */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ============================================
// GENERATE ALL ASSETS
// ============================================

export async function generateAllAssets(
  campaign: ApologyCampaign,
  generateImgs: boolean = true
): Promise<GeneratedAssets> {
  let images: { hero?: string; billboard?: string; social?: string } = {};
  
  if (generateImgs) {
    try {
      images = await generateCampaignImages(campaign);
    } catch (error) {
      console.warn('Image generation failed:', error);
    }
  }

  const printAdHtml = generatePrintAdHtml(campaign, images.hero);
  const billboardHtml = generateBillboardHtml(campaign, images.billboard);
  const socialPostsHtml = generateSocialPostsHtml(campaign, images.social);
  const storyboardHtml = generateStoryboardHtml(campaign, images.hero);
  const bannerAdsHtml = generateBannerAdsHtml(campaign);

  return {
    heroImage: images.hero,
    billboardImage: images.billboard,
    socialImage: images.social,
    printAdHtml,
    billboardHtml,
    socialPostsHtml,
    storyboardHtml,
    bannerAdsHtml,
  };
}
