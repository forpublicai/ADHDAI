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
 * AGENCY-QUALITY IMAGE PROMPTS
 * 
 * Reference aesthetics:
 * - Wieden+Kennedy: Bold, culture-defining, cinematic. "Just Do It" energy.
 *   High contrast, dramatic lighting, iconic framing. Every image tells a story.
 * - Collins (wearecollins.com): Minimalist, conceptual, surprising. 
 *   Bold color, geometric precision, unexpected juxtaposition. Art meets commerce.
 * - Droga5: Documentary authenticity, cultural relevance, emotional truth.
 *   Real moments, natural light, unstaged feeling, human vulnerability.
 * 
 * KEY PRINCIPLES FOR DALL-E PROMPTS:
 * 1. Be HYPER-SPECIFIC about composition, lighting, and mood
 * 2. Reference real photography styles (not generic "professional")
 * 3. Specify what makes the image DISTINCTIVE — the thing you can't unsee
 * 4. Always request "no text, no logos, no watermarks"
 * 5. Use 'hd' quality and 'vivid' style for maximum impact
 * 6. Request response_format: 'b64_json' for PNGs
 */

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
  
  // Build AGENCY-QUALITY prompts based on style
  let prompt = '';
  
  switch (style) {
    case 'hero':
      prompt = `Award-winning advertising campaign hero image. Subject: ${imageContext}. The ${product} is the undeniable center of the frame, shot with the confidence of a Wieden+Kennedy Nike campaign. Cinematic composition inspired by Gregory Crewdson — dramatic single-source lighting from the left, deep shadows, the ${product} almost glowing against a moody, desaturated background. ${category} context but elevated to feel monumental. The image should feel like a still from a film you desperately want to see. Shallow depth of field, the ${product} in razor-sharp focus while the background dissolves into painterly bokeh. Color palette: predominantly deep navy and warm amber, with one accent of vivid color on the ${product} itself. Shot on Hasselblad medium format. No text, no logos, no watermarks, no human faces.`;
      break;
    case 'product':
      prompt = `Bold, minimalist product photography in the style of Collins design studio — where concept meets precision. The ${product} photographed from an unexpected angle against a single bold color background (deep coral or electric blue). Dramatic hard shadow cast at 45 degrees, creating a graphic shape that's as interesting as the ${product} itself. Think Apple product photography meets Bauhaus composition. The ${product} should feel like a sculpture in a museum — elevated, considered, essential. Overhead view or three-quarter angle. Crystal-clear detail, every texture visible. Studio strobe lighting, hard edges, no softness. Modernist composition with mathematical precision. ${category} product but treated as high art. No text, no logos, no watermarks.`;
      break;
    case 'lifestyle':
      prompt = `Intimate lifestyle photography for ${imageContext} — shot in the style of Droga5's most human campaigns. A pair of hands interacting with ${product} in a natural ${category} moment. Not staged. Not styled. REAL. Think Nan Goldin's intimacy meets Martin Parr's everyday poetry. Natural window light, slightly overexposed highlights, rich shadows. The kind of photograph that makes you feel like you're intruding on a private moment. Warm color temperature, slightly desaturated, film grain visible. The ${product} is present but not performing — it's just THERE, part of life, part of the moment. Shot on 35mm Kodak Portra 400. No faces visible, focus on hands and the ${product}. No text, no logos, no watermarks.`;
      break;
    case 'documentary':
    default:
      prompt = `Documentary-style campaign photography for ${imageContext} in the tradition of Robert Frank and William Eggleston. The ${product} captured in its natural habitat — a ${category} context that feels found, not constructed. Shot like photojournalism: available light, slightly imperfect framing, the kind of image that feels urgent and necessary. The ${product} occupies the frame with quiet authority. Desaturated color palette with one surprising warm tone. Textured, grain-visible, the opposite of stock photography. This image should feel like EVIDENCE — proof that something real happened. Medium format aesthetic, shallow depth of field, subject slightly off-center (rule of thirds). No text, no logos, no watermarks.`;
      break;
  }

  // Add brand color hints if available
  if (brandInfo?.brandColors.primary) {
    prompt += ` Incorporate subtle ${brandInfo.brandColors.primary} tones as an accent color.`;
  }

  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      quality: 'hd',
      style: 'vivid',
      response_format: 'b64_json'
    });

    const b64Data = response.data?.[0]?.b64_json;
    
    if (b64Data) {
      return {
        url: `data:image/png;base64,${b64Data}`,
        prompt: prompt,
        style: style
      };
    }
    
    // Fallback to URL if b64 not available
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
 * Generate multiple images for a campaign — all as PNGs
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
 * Generate a single storyboard frame image — cinematic quality
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

  const prompt = `Cinematic film still from a ${category} commercial, frame ${frameNumber}. ${cleanDescription}. The ${product} featured prominently. Shot by Emmanuel Lubezki — natural light, long lens, shallow depth of field, the kind of frame that makes you hold your breath. 2.39:1 anamorphic widescreen composition. Documentary realism meets poetic beauty. Desaturated color grade with warm highlights and cool shadows. The image should feel like the decisive moment of the entire commercial. Professional production quality, crew of fifty, budget unlimited. No text overlays, no watermarks.`;

  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1792x1024', // Wider for video frames
      quality: 'hd',
      style: 'vivid',
      response_format: 'b64_json'
    });

    const b64 = response.data?.[0]?.b64_json;
    if (b64) return `data:image/png;base64,${b64}`;
    return response.data?.[0]?.url || null;
  } catch (error) {
    console.error('Error generating storyboard frame:', error);
    return null;
  }
}

/**
 * Generate a social media post image — platform-native quality
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

  let aspectRatio: '1024x1024' | '1792x1024' = '1024x1024'; // Square for Instagram
  let compositionHint = 'square composition with strong central subject';
  
  if (platform.toLowerCase().includes('twitter') || platform.toLowerCase().includes('linkedin')) {
    aspectRatio = '1792x1024';
    compositionHint = 'horizontal composition, 16:9, subject in left third with text space on right';
  }

  const prompt = `Scroll-stopping social media image for ${platform}. Subject: ${imageContext}. The ${product} as the undeniable hero — bold, graphic, impossible to scroll past. ${compositionHint}. Think Collins design studio meets Wieden+Kennedy's social strategy. Not "stock photo with filter" energy — CAMPAIGN energy. The kind of post that gets screenshot and sent to friends. Bold composition, one clear focal point on the ${product}, dramatic contrast. ${category} context elevated to art. Color palette: rich, saturated, with one color that POPS against the others. Contemporary but not trendy. Shot like an editorial spread for The New York Times Magazine. No text, no logos, no watermarks.`;

  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: aspectRatio,
      quality: 'hd',
      style: 'vivid',
      response_format: 'b64_json'
    });

    const b64 = response.data?.[0]?.b64_json;
    if (b64) return `data:image/png;base64,${b64}`;
    return response.data?.[0]?.url || null;
  } catch (error) {
    console.error('Error generating social image:', error);
    return null;
  }
}
