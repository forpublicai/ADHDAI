/**
 * Brief Parser Utility
 * Intelligently extracts product, brand, category, and key information from any creative brief.
 */

export interface ParsedBrief {
  product: string;          // The main product/service/subject
  brand: string;            // Brand/company name if present
  category: string;         // Product category (e.g., "kitchenware", "pet food")
  problem: string;          // The core problem/benefit being addressed
  fullContext: string;      // Cleaned up version of the full brief
  keywords: string[];       // Key terms for image generation
}

// Common stop words to skip when looking for products
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'for', 'to', 'of', 'and', 'or', 'but', 'in', 'on', 'at', 'by',
  'with', 'about', 'from', 'into', 'that', 'this', 'which', 'who', 'what', 'when',
  'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most',
  'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than',
  'too', 'very', 'just', 'also', 'now', 'new', 'make', 'makes', 'made', 'making',
  'create', 'creating', 'campaign', 'ad', 'advertisement', 'advertising', 'promote',
  'promoting', 'sell', 'selling', 'market', 'marketing', 'launch', 'launching',
  'brand', 'branding', 'product', 'service', 'company', 'business', 'client',
  'need', 'needs', 'want', 'wants', 'help', 'helps', 'time', 'times', 'every',
  'always', 'never', 'perfect', 'best', 'great', 'good', 'better', 'premium',
  'luxury', 'affordable', 'innovative', 'revolutionary', 'amazing', 'incredible'
]);

// Category keywords mapping
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'kitchenware': ['knife', 'knives', 'kitchen', 'cook', 'cooking', 'toaster', 'blender', 'mixer', 'oven', 'pan', 'pot', 'utensil', 'appliance', 'food prep'],
  'pet food': ['pet', 'dog', 'cat', 'puppy', 'kitten', 'animal', 'food', 'treat', 'kibble', 'wet food', 'dry food'],
  'automotive': ['car', 'auto', 'vehicle', 'truck', 'suv', 'sedan', 'motor', 'drive', 'driving', 'electric vehicle', 'ev'],
  'technology': ['tech', 'software', 'app', 'application', 'platform', 'digital', 'computer', 'phone', 'device', 'gadget', 'ai', 'saas'],
  'food & beverage': ['food', 'drink', 'beverage', 'snack', 'meal', 'restaurant', 'coffee', 'tea', 'wine', 'beer', 'juice', 'soda'],
  'fashion': ['clothes', 'clothing', 'fashion', 'wear', 'shoe', 'shoes', 'accessory', 'jewelry', 'watch', 'bag', 'apparel'],
  'health & wellness': ['health', 'wellness', 'fitness', 'gym', 'supplement', 'vitamin', 'medicine', 'medical', 'therapy', 'spa'],
  'financial services': ['bank', 'banking', 'finance', 'financial', 'invest', 'investment', 'insurance', 'loan', 'credit', 'money', 'savings'],
  'travel': ['travel', 'trip', 'vacation', 'hotel', 'flight', 'airline', 'tourism', 'resort', 'destination'],
  'real estate': ['real estate', 'property', 'home', 'house', 'apartment', 'condo', 'rent', 'mortgage', 'housing'],
  'education': ['education', 'school', 'university', 'college', 'course', 'learning', 'training', 'tutorial', 'class'],
  'entertainment': ['entertainment', 'game', 'gaming', 'movie', 'film', 'music', 'streaming', 'show', 'concert'],
  'beauty': ['beauty', 'cosmetic', 'makeup', 'skincare', 'haircare', 'perfume', 'fragrance', 'salon'],
  'home': ['home', 'furniture', 'decor', 'interior', 'cleaning', 'mattress', 'bed', 'couch', 'chair'],
  'consumer goods': [] // Default category
};

/**
 * Main function to parse a brief and extract structured information
 */
export function parseBrief(brief: string): ParsedBrief {
  const briefLower = brief.toLowerCase();
  const words = brief.split(/\s+/);
  
  // Extract product/subject
  const product = extractProduct(brief, briefLower, words);
  
  // Extract brand name
  const brand = extractBrand(brief);
  
  // Determine category
  const category = determineCategory(briefLower);
  
  // Extract problem/benefit
  const problem = extractProblem(brief, briefLower);
  
  // Generate keywords for image prompts
  const keywords = generateKeywords(brief, product, category);
  
  // Clean up the full context
  const fullContext = cleanBriefContext(brief);
  
  return {
    product,
    brand,
    category,
    problem,
    fullContext,
    keywords
  };
}

/**
 * Extracts the main product/service from the brief
 */
function extractProduct(brief: string, briefLower: string, words: string[]): string {
  // Pattern 1: "for [a/an/the] [adjectives] [PRODUCT]"
  const forPattern = briefLower.match(/(?:for|about|promoting|selling|advertising|launching)\s+(?:a\s+|an\s+|the\s+)?(?:new\s+)?(?:premium\s+)?(?:innovative\s+)?([a-z]+(?:\s+[a-z]+)?)/i);
  if (forPattern && forPattern[1] && !STOP_WORDS.has(forPattern[1].split(' ')[0])) {
    return cleanProductName(forPattern[1]);
  }
  
  // Pattern 2: "[Brand]'s [PRODUCT]" or "[Brand] [PRODUCT]"
  const brandProductPattern = brief.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)'?s?\s+([a-z]+(?:\s+[a-z]+)?)/);
  if (brandProductPattern && brandProductPattern[2] && !STOP_WORDS.has(brandProductPattern[2].split(' ')[0])) {
    return cleanProductName(brandProductPattern[2]);
  }
  
  // Pattern 3: Look for category-specific keywords
  const briefLowerCase = brief.toLowerCase();
  for (const [, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (briefLowerCase.includes(keyword)) {
        // Find the full phrase around the keyword
        const keywordIndex = briefLowerCase.indexOf(keyword);
        const surroundingText = brief.substring(Math.max(0, keywordIndex - 20), Math.min(brief.length, keywordIndex + keyword.length + 20));
        const phraseMatch = surroundingText.match(/(?:(?:premium|luxury|organic|natural|smart|electric|digital|new|best)\s+)?([a-z]+(?:\s+[a-z]+)?)/i);
        if (phraseMatch) {
          return cleanProductName(phraseMatch[0]);
        }
        return cleanProductName(keyword);
      }
    }
  }
  
  // Pattern 4: Find first significant noun phrase after filtering stop words
  const significantWords = words.filter(w => {
    const clean = w.toLowerCase().replace(/[^a-z]/g, '');
    return clean.length > 2 && !STOP_WORDS.has(clean);
  });
  
  if (significantWords.length >= 2) {
    // Try to get a two-word product name
    const firstWord = significantWords[0].replace(/[^a-zA-Z]/g, '');
    const secondWord = significantWords[1].replace(/[^a-zA-Z]/g, '');
    
    // Check if second word is likely part of the product name (not a verb or descriptor)
    const isProductContinuation = !['that', 'which', 'with', 'for', 'to', 'and', 'or'].includes(secondWord.toLowerCase());
    
    if (isProductContinuation && secondWord.length > 2) {
      return cleanProductName(`${firstWord} ${secondWord}`);
    }
    return cleanProductName(firstWord);
  }
  
  if (significantWords.length > 0) {
    return cleanProductName(significantWords[0]);
  }
  
  // Fallback: use first words of brief
  return cleanProductName(words.slice(0, 2).join(' '));
}

/**
 * Extracts brand/company name from the brief
 */
function extractBrand(brief: string): string {
  // Pattern 1: "for [Brand Name]" where Brand Name is capitalized
  const forBrandPattern = brief.match(/(?:for|from|by)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
  if (forBrandPattern && forBrandPattern[1].length < 40) {
    return forBrandPattern[1].trim();
  }
  
  // Pattern 2: "[Brand]'s" at the start
  const possessivePattern = brief.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)'s/);
  if (possessivePattern) {
    return possessivePattern[1].trim();
  }
  
  // Pattern 3: Capitalized name that looks like a brand
  const capitalizedPattern = brief.match(/(?:^|\s)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:brand|company|inc|corp|llc|ltd)/i);
  if (capitalizedPattern) {
    return capitalizedPattern[1].trim();
  }
  
  return 'The Client';
}

/**
 * Determines the product category
 */
function determineCategory(briefLower: string): string {
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.length === 0) continue; // Skip default category
    for (const keyword of keywords) {
      if (briefLower.includes(keyword)) {
        return category;
      }
    }
  }
  return 'consumer goods';
}

/**
 * Extracts the core problem or benefit being addressed
 */
function extractProblem(brief: string, _briefLower: string): string {
  // Pattern 1: "help[s/ing] [people] [do something]"
  const helpPattern = brief.match(/help(?:s|ing)?\s+(?:people\s+)?([^.]+)/i);
  if (helpPattern) {
    return helpPattern[1].trim();
  }
  
  // Pattern 2: "makes/make [something] [better/easier/etc]"
  const makesPattern = brief.match(/makes?\s+([^.]+)/i);
  if (makesPattern) {
    return makesPattern[1].trim();
  }
  
  // Pattern 3: "that [does something]"
  const thatPattern = brief.match(/that\s+([^.]+)/i);
  if (thatPattern) {
    return thatPattern[1].trim();
  }
  
  // Pattern 4: "for [use case]"
  const forPattern = brief.match(/for\s+([^.]+)/i);
  if (forPattern && !forPattern[1].match(/^(?:a|an|the)\s/i)) {
    return forPattern[1].trim();
  }
  
  return 'making life better';
}

/**
 * Generates keywords for image prompts
 */
function generateKeywords(brief: string, product: string, category: string): string[] {
  const keywords: string[] = [product];
  
  // Add category-specific keywords
  const categoryKeywords = CATEGORY_KEYWORDS[category];
  if (categoryKeywords) {
    const matchingKeywords = categoryKeywords.filter(k => brief.toLowerCase().includes(k));
    keywords.push(...matchingKeywords.slice(0, 3));
  }
  
  // Add adjectives from brief
  const adjectives = brief.match(/(?:premium|luxury|organic|natural|smart|electric|digital|innovative|professional|modern|classic|traditional|artisan|handmade|sustainable|eco-friendly|high-end|affordable)/gi);
  if (adjectives) {
    keywords.push(...adjectives.slice(0, 2));
  }
  
  // Remove duplicates and return
  return [...new Set(keywords)];
}

/**
 * Cleans up a product name
 */
function cleanProductName(name: string): string {
  return name
    .replace(/[^a-zA-Z\s]/g, '')
    .trim()
    .split(/\s+/)
    .filter(w => w.length > 0)
    .slice(0, 3) // Max 3 words
    .join(' ');
}

/**
 * Cleans up the brief for use as context
 */
function cleanBriefContext(brief: string): string {
  return brief
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Simple product extraction for backward compatibility
 * Use this when you just need the product name
 */
export function extractProductFromBrief(brief: string): string {
  return parseBrief(brief).product;
}

/**
 * Simple brand extraction for backward compatibility
 */
export function extractBrandFromBrief(brief: string): string {
  return parseBrief(brief).brand;
}

/**
 * Get a description suitable for image generation
 */
export function getImagePromptContext(brief: string): string {
  const parsed = parseBrief(brief);
  return `${parsed.product}${parsed.keywords.length > 1 ? ` (${parsed.keywords.slice(1).join(', ')})` : ''}`;
}

