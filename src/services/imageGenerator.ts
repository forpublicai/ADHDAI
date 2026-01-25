import OpenAI from 'openai';
import { BrandInfo } from '../types';
import { parseBrief, getImagePromptContext } from '../utils/briefParser';

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

export interface GeneratedImage {
  url: string;
  prompt: string;
  style: string;
}

/**
 * Generate a product/hero image for an ad using DALL-E
 */
export async function generateAdImage(
  brief: string,
  brandInfo?: BrandInfo,
  style: 'hero' | 'product' | 'lifestyle' | 'documentary' = 'documentary'
): Promise<GeneratedImage | null> {
  const openai = getOpenAIClient();
  
  if (!openai) {
    console.warn('OpenAI client not available for image generation');
    return null;
  }

  // Use intelligent brief parsing for better product extraction
  const parsedBrief = parseBrief(brief);
  const product = parsedBrief.product;
  const category = parsedBrief.category;
  const imageContext = getImagePromptContext(brief);
  
  // Build the prompt based on style and brand
  let prompt = '';
  
  switch (style) {
    case 'hero':
      prompt = `Professional advertising photography of ${imageContext}. The ${product} is the clear hero of the image, shown in its full glory. ${category} product photography. Clean, minimalist composition on a neutral background. Studio lighting, high-end commercial quality. Documentary style, authentic feel. No text, no logos, no watermarks. Muted, desaturated colors with subtle warmth.`;
      break;
    case 'product':
      prompt = `Editorial product photography featuring ${imageContext}. The ${product} photographed from overhead on textured paper background. Natural daylight, soft shadows. Documentary aesthetic like a form or document. Show the ${product} in detail. Minimal styling, honest presentation. No text, no logos, no watermarks.`;
      break;
    case 'lifestyle':
      prompt = `Documentary-style lifestyle photography showing hands using ${imageContext}. A real person interacting with their ${product} in a natural ${category} context. Authentic moment. Natural lighting, slightly desaturated colors. Film photography aesthetic. No faces visible, focus on the action and the ${product}. No text, no logos, no watermarks.`;
      break;
    case 'documentary':
    default:
      prompt = `Documentary photography of ${imageContext}. The ${product} shot like evidence photography or archival documentation. ${category} context. Neutral background, natural lighting. Honest, unglamorous presentation of the ${product}. Slightly faded, bureaucratic aesthetic. No text, no logos, no watermarks.`;
      break;
  }

  // Add brand color hints if available
  if (brandInfo?.brandColors.primary) {
    prompt += ` Color accent: subtle ${brandInfo.brandColors.primary} tones.`;
  }

  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      style: 'natural'
    });

    const imageUrl = response.data?.[0]?.url;
    
    if (imageUrl) {
      return {
        url: imageUrl,
        prompt: prompt,
        style: style
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error generating image:', error);
    return null;
  }
}

/**
 * Generate multiple images for a campaign
 */
export async function generateCampaignImages(
  brief: string,
  brandInfo?: BrandInfo
): Promise<{ hero?: GeneratedImage; product?: GeneratedImage; lifestyle?: GeneratedImage }> {
  const results: { hero?: GeneratedImage; product?: GeneratedImage; lifestyle?: GeneratedImage } = {};
  
  // Generate images in sequence to avoid rate limits
  try {
    const heroImage = await generateAdImage(brief, brandInfo, 'hero');
    if (heroImage) results.hero = heroImage;
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const productImage = await generateAdImage(brief, brandInfo, 'product');
    if (productImage) results.product = productImage;
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const lifestyleImage = await generateAdImage(brief, brandInfo, 'lifestyle');
    if (lifestyleImage) results.lifestyle = lifestyleImage;
    
  } catch (error) {
    console.error('Error generating campaign images:', error);
  }
  
  return results;
}

/**
 * Generate a single storyboard frame image
 */
export async function generateStoryboardFrame(
  visualDescription: string,
  brief: string,
  frameNumber: number
): Promise<string | null> {
  const openai = getOpenAIClient();
  
  if (!openai) {
    return null;
  }

  // Use intelligent brief parsing
  const parsedBrief = parseBrief(brief);
  const product = parsedBrief.product;
  const category = parsedBrief.category;
  
  // Clean up the visual description for DALL-E
  const cleanDescription = visualDescription
    .replace(/FADE IN:|MEDIUM SHOT:|CLOSE-UP:|WIDE:|INSERT:|SUPER:|END CARD:/gi, '')
    .replace(/\([^)]+\)/g, '') // Remove parentheticals
    .trim();

  const prompt = `Film still from a ${category} commercial, frame ${frameNumber}. ${cleanDescription}. Feature the ${product} prominently in this scene. Cinematic composition, 16:9 aspect ratio feel. Documentary style, natural lighting, muted colors. Professional advertising production quality. No text overlays, no watermarks.`;

  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1792x1024', // Wider for video frames
      quality: 'standard',
      style: 'natural'
    });

    return response.data?.[0]?.url || null;
  } catch (error) {
    console.error('Error generating storyboard frame:', error);
    return null;
  }
}

/**
 * Generate a social media post image
 */
export async function generateSocialImage(
  _postCopy: string,
  platform: string,
  brief: string,
  _brandInfo?: BrandInfo
): Promise<string | null> {
  const openai = getOpenAIClient();
  
  if (!openai) {
    return null;
  }

  // Use intelligent brief parsing
  const parsedBrief = parseBrief(brief);
  const product = parsedBrief.product;
  const category = parsedBrief.category;
  const imageContext = getImagePromptContext(brief);

  let aspectRatio = '1024x1024'; // Square for Instagram
  let sizeHint = 'square composition';
  
  if (platform.toLowerCase().includes('twitter') || platform.toLowerCase().includes('linkedin')) {
    aspectRatio = '1792x1024';
    sizeHint = 'horizontal composition, 16:9 feel';
  }

  const prompt = `Social media photography for ${platform}. Subject: ${imageContext}. The ${product} is clearly featured as the main subject. ${category} lifestyle context. ${sizeHint}. Documentary aesthetic, authentic feel. Natural lighting, muted colors. Not overly polished or commercial. Real, honest, slightly melancholic. No text, no logos, no watermarks.`;

  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: aspectRatio as '1024x1024' | '1792x1024',
      quality: 'standard',
      style: 'natural'
    });

    return response.data?.[0]?.url || null;
  } catch (error) {
    console.error('Error generating social image:', error);
    return null;
  }
}

