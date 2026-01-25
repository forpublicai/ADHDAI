import OpenAI from 'openai';

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

export interface BrandInfo {
  clientName: string;
  brandColors: {
    primary: string;
    secondary?: string;
    accent?: string;
  };
  brandFonts?: {
    heading?: string;
    body?: string;
  };
  brandTone: string; // e.g., "playful", "serious", "luxury", "accessible"
  brandStyle: string; // e.g., "minimalist", "bold", "classic", "modern"
  brandGuidelines?: string; // Additional brand notes
}

/**
 * Extracts brand information from the brief
 * Infers client name, brand colors, fonts, tone, and style
 */
export async function extractBrandInfo(brief: string): Promise<BrandInfo> {
  const openai = getOpenAIClient();
  
  if (!openai) {
    return getFallbackBrandInfo(brief);
  }

  try {
    const prompt = `Analyze this advertising brief and extract brand information:

Brief: "${brief}"

Extract:
1. Client/Brand name (if mentioned or can be inferred)
2. Brand colors (primary color, secondary if mentioned, accent if mentioned)
3. Brand fonts (if mentioned, otherwise infer based on brand personality)
4. Brand tone (playful, serious, luxury, accessible, etc.)
5. Brand style (minimalist, bold, classic, modern, etc.)
6. Any brand guidelines or aesthetic notes

Return ONLY valid JSON in this exact structure:
{
  "clientName": "Brand Name or 'Unknown'",
  "brandColors": {
    "primary": "#hexcode",
    "secondary": "#hexcode or null",
    "accent": "#hexcode or null"
  },
  "brandFonts": {
    "heading": "Font name or null",
    "body": "Font name or null"
  },
  "brandTone": "tone description",
  "brandStyle": "style description",
  "brandGuidelines": "any additional notes or null"
}

If brand colors aren't mentioned, infer them based on the brand name (e.g., Coca Cola = #F40009 red, Apple = #000000 black, etc.). If you can't infer, use null.
If brand fonts aren't mentioned, infer based on brand personality (e.g., tech brands often use sans-serif, luxury brands use serif, etc.).`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a brand analyst. Extract brand information from briefs. Return ONLY valid JSON, no markdown, no explanations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent extraction
      response_format: { type: 'json_object' },
      max_tokens: 500
    });

    const response = completion.choices[0]?.message?.content?.trim() || '';
    const cleaned = response
      .replace(/^```json\n?/i, '')
      .replace(/^```\n?/i, '')
      .replace(/```\n?$/i, '')
      .trim();

    const parsed = JSON.parse(cleaned);
    
    // Validate and normalize colors
    if (parsed.brandColors) {
      if (parsed.brandColors.primary && !parsed.brandColors.primary.startsWith('#')) {
        parsed.brandColors.primary = normalizeColor(parsed.brandColors.primary);
      }
      if (parsed.brandColors.secondary && !parsed.brandColors.secondary.startsWith('#')) {
        parsed.brandColors.secondary = normalizeColor(parsed.brandColors.secondary);
      }
      if (parsed.brandColors.accent && !parsed.brandColors.accent.startsWith('#')) {
        parsed.brandColors.accent = normalizeColor(parsed.brandColors.accent);
      }
    }

    return parsed as BrandInfo;
  } catch (error) {
    console.error('Error extracting brand info:', error);
    return getFallbackBrandInfo(brief);
  }
}

/**
 * Normalizes color names to hex codes
 */
function normalizeColor(color: string): string {
  const colorMap: Record<string, string> = {
    'red': '#F40009',
    'blue': '#0066CC',
    'green': '#00AA44',
    'yellow': '#FFD700',
    'orange': '#FF6600',
    'purple': '#6633CC',
    'black': '#000000',
    'white': '#FFFFFF',
    'coca cola red': '#F40009',
    'apple black': '#000000',
    'nike black': '#000000',
    'starbucks green': '#00704A',
    'mcdonalds yellow': '#FFC72C',
    'mcdonalds red': '#DA020E'
  };

  const lower = color.toLowerCase().trim();
  return colorMap[lower] || color;
}

/**
 * Fallback brand info when API is unavailable
 */
function getFallbackBrandInfo(brief: string): BrandInfo {
  // Try to extract client name from brief
  const clientMatch = brief.match(/(?:for|client|brand|company):\s*([A-Z][A-Za-z\s]+)/i) ||
                      brief.match(/([A-Z][A-Za-z\s]{2,20})\s+(?:needs|wants|requires)/i);
  const clientName = clientMatch ? clientMatch[1].trim() : 'Client';

  return {
    clientName,
    brandColors: {
      primary: '#1a1a1a', // Default to agency ink color
      secondary: undefined,
      accent: undefined
    },
    brandFonts: {
      heading: undefined,
      body: undefined
    },
    brandTone: 'serious',
    brandStyle: 'minimalist',
    brandGuidelines: undefined
  };
}

/**
 * Known brand color mappings for common brands
 */
export const KNOWN_BRAND_COLORS: Record<string, BrandInfo> = {
  'coca cola': {
    clientName: 'Coca Cola',
    brandColors: {
      primary: '#F40009',
      secondary: '#FFFFFF',
      accent: undefined
    },
    brandFonts: {
      heading: 'Spencerian Script',
      body: 'Helvetica Neue'
    },
    brandTone: 'playful',
    brandStyle: 'classic',
    brandGuidelines: 'Red and white color scheme, Spencerian script logo'
  },
  'apple': {
    clientName: 'Apple',
    brandColors: {
      primary: '#000000',
      secondary: '#FFFFFF',
      accent: '#007AFF'
    },
    brandFonts: {
      heading: 'SF Pro Display',
      body: 'SF Pro Text'
    },
    brandTone: 'premium',
    brandStyle: 'minimalist',
    brandGuidelines: 'Minimalist, clean, premium aesthetic'
  },
  'nike': {
    clientName: 'Nike',
    brandColors: {
      primary: '#000000',
      secondary: '#FFFFFF',
      accent: undefined
    },
    brandFonts: {
      heading: 'Futura',
      body: 'Helvetica Neue'
    },
    brandTone: 'energetic',
    brandStyle: 'bold',
    brandGuidelines: 'Just Do It. Bold, energetic, motivational'
  }
};

/**
 * Checks if brief mentions a known brand and returns brand info
 */
export function checkKnownBrand(brief: string): BrandInfo | null {
  const lowerBrief = brief.toLowerCase();
  for (const [brandKey, brandInfo] of Object.entries(KNOWN_BRAND_COLORS)) {
    if (lowerBrief.includes(brandKey)) {
      return brandInfo;
    }
  }
  return null;
}

