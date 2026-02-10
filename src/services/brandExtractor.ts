import OpenAI from 'openai';

function getOpenAIClient(): OpenAI {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('[BrandExtractor] VITE_OPENAI_API_KEY is not set. Add it to your .env file.');
  }
  return new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
}

const MODELS = ['gpt-5.2', 'gpt-4o', 'gpt-4o-mini'] as const;
async function callWithModelCascade(openai: OpenAI, params: Omit<OpenAI.ChatCompletionCreateParamsNonStreaming, 'model'>): Promise<string> {
  const errors: string[] = [];
  for (const model of MODELS) {
    try { const r = await openai.chat.completions.create({ model, ...params }); const c = r.choices[0]?.message?.content?.trim(); if (c) return c; } catch (e) { const msg = e instanceof Error ? e.message : String(e); console.warn(`[BrandExtractor] ${model} failed:`, msg); errors.push(`${model}: ${msg}`); }
  }
  throw new Error(`[BrandExtractor] All models failed:\n${errors.join('\n')}`);
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

  {
    const prompt = `You are a senior brand strategist at Landor or Pentagram. Analyze this brief and extract comprehensive brand intelligence:

Brief: "${brief}"

Extract with the precision of a Pentagram brand audit:
1. Client/Brand name (if mentioned or inferable from context)
2. Brand colors — if it's a known brand (Coca-Cola, Apple, Nike, etc.), use their ACTUAL brand colors from their official guidelines. If unknown, infer sophisticated colors that match their industry and positioning. No generic blues.
3. Brand fonts — if known brand, use their actual typography. If unknown, recommend Google Fonts that match their personality (e.g., luxury → Playfair Display; tech → Inter; heritage → Source Serif 4; modern → DM Sans)
4. Brand tone — be specific and nuanced. Not just "professional" but "confident without being corporate, warm without being casual — the tone of a CEO who actually cares"
5. Brand style — reference actual design movements or agencies. Not just "modern" but "Pentagram-influenced minimalism" or "Droga5-style cultural intelligence"
6. Brand guidelines — any aesthetic implications from the brief

Return ONLY valid JSON:
{
  "clientName": "Brand Name or 'The Client'",
  "brandColors": {
    "primary": "#hexcode — the dominant brand color",
    "secondary": "#hexcode or null — supporting color",
    "accent": "#hexcode or null — accent/CTA color"
  },
  "brandFonts": {
    "heading": "Specific Google Font name or null",
    "body": "Specific Google Font name or null"
  },
  "brandTone": "Nuanced tone description — at least one sentence with a specific analogy",
  "brandStyle": "Specific style description referencing real design approaches",
  "brandGuidelines": "Additional notes or null"
}

For KNOWN BRANDS, use their REAL colors and fonts. For unknown brands, make sophisticated inferences based on industry, positioning, and competitive landscape.`;

    const rawResponse = await callWithModelCascade(openai, {
      messages: [
        {
          role: 'system',
          content: 'You are a senior brand strategist at Pentagram or Landor. You have encyclopedic knowledge of Fortune 500 brand guidelines, color systems, and typography. When you see "Coca-Cola" you know it\'s #F40009. When you see "Apple" you know it\'s SF Pro Display. For unknown brands, you infer with the sophistication of someone who has designed 200+ brand identity systems. Return ONLY valid JSON.'
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

    const cleaned = rawResponse
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

