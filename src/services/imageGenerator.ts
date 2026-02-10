import OpenAI from 'openai';
import { BrandInfo } from '../types';
import { parseBrief, getImagePromptContext } from '../utils/briefParser';

// Create OpenAI client for image generation — uses VITE_OPENAI_IMAGE_API_KEY
function getOpenAIImageClient(): OpenAI {
  const apiKey = import.meta.env.VITE_OPENAI_IMAGE_API_KEY;
  if (!apiKey) {
    throw new Error('[ImageGenerator] VITE_OPENAI_IMAGE_API_KEY is not set. Add it to your .env file.');
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
  const openai = getOpenAIImageClient();

  // Use intelligent brief parsing for better product extraction
  const parsedBrief = parseBrief(brief);
  const product = parsedBrief.product;
  const category = parsedBrief.category;
  const imageContext = getImagePromptContext(brief);
  
  // Build the prompt based on style and brand
  let prompt = '';
  
  switch (style) {
    case 'hero':
      prompt = `Award-winning advertising photography. Hero shot of ${imageContext}. The ${product} is the absolute center of attention — shot with a medium-format camera (Hasselblad or Phase One quality). ${category} product photography at the level of a Pentagram or Landor brand campaign. Clean, considered composition with intentional negative space. Soft directional studio lighting with subtle fill — the quality of light you see in Condé Nast publications. Muted, sophisticated color palette: warm neutrals, desaturated tones, nothing garish. The image feels expensive and restrained. Shallow depth of field draws the eye. No text, no logos, no watermarks, no human faces. This should look like it belongs in a Wallpaper* magazine spread.`;
      break;
    case 'product':
      prompt = `Editorial product photography for a premium brand campaign. Subject: ${imageContext}. The ${product} photographed from a carefully considered overhead angle on textured linen or kraft paper. Natural window light with long soft shadows — the golden-hour quality of a David Pearce or Carl Kleiner still life. Every detail of the ${product} visible. Styling is minimal and intentional — nothing extraneous in frame. The composition has the precision of a Pentagram identity system photo. Slightly warm, analog film quality. No text, no logos, no watermarks. This should feel like archival documentation elevated to fine art.`;
      break;
    case 'lifestyle':
      prompt = `Documentary-style lifestyle photography for an award-winning ${category} brand campaign. Subject: hands interacting with ${imageContext}. Shot on 35mm film (Kodak Portra aesthetic) with natural available light. The ${product} is the emotional center of the frame. Authentic human moment — not posed, captured. Think Rinko Kawauchi meets commercial photography. Slightly desaturated, warm, intimate. No faces visible — the hands and the ${product} tell the story. Shallow depth of field, bokeh in background. Environmental context suggests a real home, real life. No text, no logos, no watermarks. The kind of photograph that makes you feel something before you understand what you're looking at.`;
      break;
    case 'documentary':
    default:
      prompt = `Archival documentary photography of ${imageContext}. The ${product} photographed with the clinical precision of evidence photography or museum documentation. ${category} context. Shot on a neutral gray or cream background with flat, even lighting — no drama, just truth. The aesthetic of a government form made visual: honest, unglamorous, institutional. Think Walker Evans or Bernd and Hilla Becher — typological, systematic, revealing. Slightly faded warmth, as if the photograph has been in a filing cabinet. Medium format quality, extreme detail. No text, no logos, no watermarks. The image should feel more like a record than an advertisement.`;
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
      quality: 'hd',
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
  const openai = getOpenAIImageClient();

  // Use intelligent brief parsing
  const parsedBrief = parseBrief(brief);
  const product = parsedBrief.product;
  const category = parsedBrief.category;
  
  // Clean up the visual description for DALL-E
  const cleanDescription = visualDescription
    .replace(/FADE IN:|MEDIUM SHOT:|CLOSE-UP:|WIDE:|INSERT:|SUPER:|END CARD:/gi, '')
    .replace(/\([^)]+\)/g, '') // Remove parentheticals
    .trim();

  const prompt = `Cinematic film still from an award-winning ${category} commercial directed by Spike Jonze or Hiro Murai. Frame ${frameNumber} of the sequence. ${cleanDescription}. The ${product} is featured prominently in this scene. Shot on Arri Alexa with Cooke anamorphic lenses — the widescreen composition has the quality of a Sundance short film. Natural available light with subtle shaped fill. Muted, desaturated color grade (think Kodak 5219 film stock). Every element in frame is intentional — nothing extraneous. The image tells a story even in a single frame. Professional advertising production at Cannes Lions Film Grand Prix level. No text overlays, no watermarks, no logos.`;

  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1792x1024',
      quality: 'hd',
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
  const openai = getOpenAIImageClient();

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

  const prompt = `Premium social media campaign photography optimized for ${platform}. Subject: ${imageContext}. The ${product} is the clear visual hero. ${category} context with lifestyle authenticity. ${sizeHint}. Shot in the style of a Wieden+Kennedy or Droga5 social campaign — native to the platform but elevated above typical branded content. Natural light, documentary authenticity, but with the compositional precision of editorial photography. Muted, sophisticated color palette — warm neutrals and desaturated tones. The kind of image that stops someone mid-scroll because it feels REAL, not because it's loud. Film photography aesthetic (Kodak Portra 400). No text, no logos, no watermarks. This should be the most beautiful thing in someone's feed today.`;

  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: aspectRatio as '1024x1024' | '1792x1024',
      quality: 'hd',
      style: 'natural'
    });

    return response.data?.[0]?.url || null;
  } catch (error) {
    console.error('Error generating social image:', error);
    return null;
  }
}

