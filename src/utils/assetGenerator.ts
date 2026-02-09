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

  const brandContext = `Brand: ${campaign.companyName}. Campaign: "${campaign.headline}". Visual concept: ${campaign.visualConcept || 'minimalist corporate'}. Colors: ${campaign.colorPalette?.join(', ') || 'muted tones'}. Tone: ${campaign.tone || 'sincere and measured'}.`;

  const heroPrompt = `High-end advertising campaign hero image. ${brandContext} Cinematic composition, editorial photography quality. The image should evoke corporate accountability and honest reflection. Professional lighting, premium production value. No text, no logos, no watermarks. Shot on medium format film with shallow depth of field.`;

  const billboardPrompt = `Wide-format outdoor billboard visual. ${brandContext} Bold, simple, readable from distance. One clear focal point with dramatic negative space. Think award-winning OOH advertising. Cinematic, not corporate. No text, no logos. 16:9 wide composition.`;

  const socialPrompt = `Social media campaign image, square format. ${brandContext} Modern, shareable, visually striking. Should feel native to Instagram but elevated. Documentary aesthetic with brand polish. Not stock photo energy — real campaign energy. No text, no logos. Square composition.`;

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
  const colors = campaign.colorPalette || ['#1a1a2e', '#16213e', '#0f3460', '#e94560', '#f5f5f5'];
  const primaryColor = colors[0] || '#1a1a2e';
  const accentColor = colors[3] || '#c41e3a';

  const imageSection = heroImageBase64
    ? `<div class="hero-image"><img src="data:image/png;base64,${heroImageBase64}" alt="Campaign Visual" /></div>`
    : `<div class="hero-image placeholder"><div class="placeholder-text">${ad?.visual || campaign.visualConcept || 'Campaign Visual'}</div></div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Print Ad — ${campaign.companyName} — ${campaign.headline}</title>
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
    
    .ad-content {
      flex: 1;
      padding: 48px 40px 32px;
      display: flex;
      flex-direction: column;
    }
    
    .headline {
      font-size: 32px;
      font-weight: 300;
      color: ${primaryColor};
      line-height: 1.2;
      letter-spacing: -0.02em;
      margin-bottom: 12px;
    }
    
    .subheadline {
      font-size: 14px;
      font-weight: 400;
      color: #666;
      margin-bottom: 32px;
      font-style: italic;
    }
    
    .divider {
      width: 40px;
      height: 2px;
      background: ${accentColor};
      margin-bottom: 24px;
    }
    
    .body-copy {
      font-size: 11px;
      line-height: 1.8;
      color: #444;
      max-width: 440px;
      flex: 1;
    }
    
    .ad-footer {
      padding: 20px 40px;
      border-top: 1px solid #f0f0f0;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    
    .footer-left {
      font-size: 8px;
      color: #bbb;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    
    .footer-right {
      text-align: right;
    }
    
    .footer-tagline {
      font-size: 10px;
      font-weight: 500;
      color: ${primaryColor};
      letter-spacing: 1px;
    }
    
    .footer-url {
      font-size: 8px;
      color: #999;
      margin-top: 4px;
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
      <span class="brand-name">${campaign.companyName}</span>
      <span class="brand-tag">A Proactive Apology</span>
    </div>
    
    ${imageSection}
    
    <div class="ad-content">
      <h1 class="headline">${ad?.headline || campaign.headline}</h1>
      <p class="subheadline">${campaign.subheadline}</p>
      <div class="divider"></div>
      <div class="body-copy">
        ${ad?.body || campaign.apologyStatement}
      </div>
    </div>
    
    <div class="ad-footer">
      <div class="footer-left">
        PROACTIVE ACCOUNTABILITY INITIATIVE<br>
        GENERATED BY ADHDAI
      </div>
      <div class="footer-right">
        <div class="footer-tagline">${campaign.subheadline || ''}</div>
        <div class="footer-url">${campaign.companyName?.toLowerCase().replace(/\s+/g, '')}.com/accountability</div>
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
  const colors = campaign.colorPalette || ['#1a1a2e', '#16213e', '#0f3460', '#e94560', '#f5f5f5'];
  const primaryColor = colors[0] || '#1a1a2e';

  const bgStyle = billboardImageBase64
    ? `background-image: url(data:image/png;base64,${billboardImageBase64}); background-size: cover; background-position: center;`
    : `background: linear-gradient(135deg, ${primaryColor} 0%, ${colors[2] || '#333'} 100%);`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Billboard — ${campaign.companyName} — ${campaign.headline}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Inter', -apple-system, sans-serif;
      background: #1a1a1a;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
    }
    
    .spec-label {
      font-size: 10px;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: #555;
      margin-bottom: 16px;
    }
    
    .billboard {
      width: 960px;
      height: 280px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 20px 80px rgba(0,0,0,0.5);
      ${bgStyle}
    }
    
    .billboard-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%);
      display: flex;
      align-items: center;
      padding: 0 60px;
    }
    
    .billboard-content {
      max-width: 55%;
    }
    
    .billboard-headline {
      font-size: 42px;
      font-weight: 800;
      color: #fff;
      line-height: 1.05;
      letter-spacing: -0.03em;
      margin-bottom: 12px;
      text-shadow: 0 2px 20px rgba(0,0,0,0.5);
    }
    
    .billboard-tagline {
      font-size: 14px;
      font-weight: 400;
      color: rgba(255,255,255,0.8);
      letter-spacing: 0.02em;
    }
    
    .billboard-logo {
      position: absolute;
      bottom: 24px;
      right: 40px;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: rgba(255,255,255,0.9);
      text-shadow: 0 1px 8px rgba(0,0,0,0.5);
    }
    
    .dimension-label {
      font-size: 9px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #444;
      margin-top: 12px;
    }
  </style>
</head>
<body>
  <div class="spec-label">OUTDOOR BILLBOARD — 14' x 48'</div>
  <div class="billboard">
    <div class="billboard-overlay">
      <div class="billboard-content">
        <h1 class="billboard-headline">${billboard?.headline || campaign.headline}</h1>
        <p class="billboard-tagline">${billboard?.body || campaign.subheadline}</p>
      </div>
    </div>
    <div class="billboard-logo">${campaign.companyName}</div>
  </div>
  <div class="dimension-label">${billboard?.dimensions || '14x48 ft'} — ${billboard?.format || 'Billboard'}</div>
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
          <span class="platform-name">${post.platform}</span>
          <span class="post-type">${post.type}</span>
        </div>
        ${socialImg ? `<div class="post-image"><img src="${socialImg}" alt="Post visual" /></div>` : 
          `<div class="post-image placeholder" style="background: ${primaryColor};">
            <span>${post.visual || 'Visual content'}</span>
          </div>`}
        <div class="post-content">
          <div class="post-author">
            <div class="author-avatar" style="background: ${style.accent};">${campaign.companyName?.charAt(0) || 'C'}</div>
            <div class="author-info">
              <span class="author-name">${campaign.companyName}</span>
              <span class="author-handle">@${campaign.companyName?.toLowerCase().replace(/\s+/g, '') || 'company'}</span>
            </div>
          </div>
          <div class="post-copy">${(post.copy || '').replace(/\n/g, '<br>')}</div>
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
    <h1 class="deck-title">${campaign.companyName} — "${campaign.headline}"</h1>
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

  const colors = campaign.colorPalette || ['#1a1a2e', '#16213e', '#0f3460', '#e94560', '#f5f5f5'];
  const primaryColor = colors[0] || '#1a1a2e';

  const frames = (video.script || []).map((shot, i) => {
    // Use hero image for first and last frames for visual interest
    const showImage = heroImageBase64 && (i === 0 || i === video.script.length - 1);
    
    return `
      <div class="frame">
        <div class="frame-number">SHOT ${shot.shot || i + 1}</div>
        <div class="frame-visual" ${showImage ? `style="background-image: url(data:image/png;base64,${heroImageBase64}); background-size: cover; background-position: center;"` : `style="background: ${primaryColor};"`}>
          ${!showImage ? `<div class="visual-desc">${shot.visual}</div>` : ''}
        </div>
        <div class="frame-details">
          <div class="detail-row">
            <span class="detail-label">DURATION</span>
            <span class="detail-value">${shot.duration}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">VISUAL</span>
            <span class="detail-value">${shot.visual}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">AUDIO</span>
            <span class="detail-value">${shot.audio}</span>
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
  <title>Video Storyboard — ${campaign.companyName} — ${video.title}</title>
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
    <h1 class="header-title">${video.title}</h1>
    <div class="header-meta">
      <span><span class="label">Duration:</span> ${video.duration}</span>
      <span><span class="label">Format:</span> ${video.format}</span>
      <span><span class="label">Client:</span> ${campaign.companyName}</span>
    </div>
  </div>
  
  <div class="frames-container">
    ${frames}
  </div>
  
  ${video.notes ? `
    <div class="production-notes">
      <div class="notes-title">DIRECTOR'S NOTES</div>
      <div class="notes-content">${video.notes}</div>
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

    return `
      <div class="banner-wrapper">
        <div class="banner-spec">${banner.format} — ${sizeKey}</div>
        <div class="banner-ad" style="width: ${size.w}px; height: ${size.h}px; background: ${primaryColor};">
          <div class="banner-content ${isWide ? 'wide' : ''} ${isTall ? 'tall' : ''}">
            <div class="banner-headline">${banner.headline}</div>
            ${!isWide ? `<div class="banner-body">${banner.body}</div>` : ''}
            <div class="banner-cta" style="background: ${accentColor};">${banner.body || 'Learn More'}</div>
          </div>
          <div class="banner-logo">${campaign.companyName}</div>
        </div>
      </div>`;
  }).join('');

  // Add default banners if none exist
  const defaultBannersHtml = banners.length === 0 ? `
    <div class="banner-wrapper">
      <div class="banner-spec">Leaderboard — 728x90</div>
      <div class="banner-ad" style="width: 728px; height: 90px; background: ${primaryColor};">
        <div class="banner-content wide">
          <div class="banner-headline">${campaign.headline}</div>
          <div class="banner-cta" style="background: ${accentColor};">Accept Our Pre-Apology</div>
        </div>
        <div class="banner-logo">${campaign.companyName}</div>
      </div>
    </div>
    <div class="banner-wrapper">
      <div class="banner-spec">Medium Rectangle — 300x250</div>
      <div class="banner-ad" style="width: 300px; height: 250px; background: ${primaryColor};">
        <div class="banner-content">
          <div class="banner-headline">${campaign.headline}</div>
          <div class="banner-body">${campaign.subheadline}</div>
          <div class="banner-cta" style="background: ${accentColor};">Learn More</div>
        </div>
        <div class="banner-logo">${campaign.companyName}</div>
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
  <div class="subtitle">${campaign.companyName} — Proactive Apology Campaign</div>
  
  ${bannersHtml || defaultBannersHtml}
</body>
</html>`;
}

// ============================================
// GENERATE ALL ASSETS
// ============================================

export async function generateAllAssets(
  campaign: ApologyCampaign,
  generateImages: boolean = true
): Promise<GeneratedAssets> {
  // Generate images if API key available and requested
  let images: { hero?: string; billboard?: string; social?: string } = {};
  
  if (generateImages) {
    try {
      images = await generateCampaignImages(campaign);
    } catch (error) {
      console.warn('Image generation failed, continuing with HTML-only assets:', error);
    }
  }

  // Generate HTML mockups
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
