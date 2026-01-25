import { Message, AdComponents } from '../types';
import { generateAdHTML } from '../services/adGenerator';
import { parseBrief } from './briefParser';

/**
 * Extracts ad components from agent messages
 * Parses messages to find headlines, body copy, taglines, visuals, and client info
 */
export function extractAdComponents(messages: Message[]): AdComponents {
  const components: AdComponents = {};

  // Process messages in order to extract components
  for (const message of messages) {
    const content = message.content;

    // Extract from The Cell's copy transmittal
    if (message.characterId === 'the-cell' && content.includes('COPY TRANSMITTAL')) {
      // Find the recommended option (usually Option C)
      const recommendedMatch = content.match(/\*\*RECOMMENDED OPTION:\*\* ([ABC])/i) || 
                               content.match(/RECOMMENDED OPTION.*?([ABC])/i);
      const optionLetter = recommendedMatch ? recommendedMatch[1] : 'C';

      // Extract headline from recommended option
      // First try to find the specific option section
      const optionSectionMatch = content.match(new RegExp(`\\*\\*OPTION ${optionLetter}:.*?(?=\\*\\*OPTION|\\*\\*RECOMMENDED|$)`, 's'));
      const sectionToSearch = optionSectionMatch ? optionSectionMatch[0] : content;
      
      // Extract headline from the option section (note: * is literal in content, not escaped)
      const headlineMatch = sectionToSearch.match(/\*Headline:\*\s*"([^"]+)"/);
      if (headlineMatch && headlineMatch[1]) {
        components.headline = headlineMatch[1].toUpperCase();
      } else {
        // Fallback: find all headlines and use the last one (usually Option C)
        const allHeadlines = content.match(/\*Headline:\*\s*"([^"]+)"/g);
        if (allHeadlines && allHeadlines.length > 0) {
          const lastHeadline = allHeadlines[allHeadlines.length - 1];
          const headlineText = lastHeadline.match(/"([^"]+)"/);
          if (headlineText && headlineText[1]) {
            components.headline = headlineText[1].toUpperCase();
          }
        }
      }

      // Extract body copy from the option section
      const bodyMatch = sectionToSearch.match(/\*Body:\*\s*"([^"]+)"/);
      if (bodyMatch && bodyMatch[1]) {
        components.body = bodyMatch[1];
      } else {
        // Fallback: find all bodies and use the last one
        const allBodies = content.match(/\*Body:\*\s*"([^"]+)"/g);
        if (allBodies && allBodies.length > 0) {
          const lastBody = allBodies[allBodies.length - 1];
          const bodyText = lastBody.match(/"([^"]+)"/);
          if (bodyText && bodyText[1]) {
            components.body = bodyText[1];
          }
        }
      }

      // Extract tagline from the option section
      const taglineMatch = sectionToSearch.match(/\*Tagline:\*\s*"([^"]+)"/);
      if (taglineMatch && taglineMatch[1]) {
        components.tagline = taglineMatch[1];
      } else {
        // Fallback: find all taglines and use the last one
        const allTaglines = content.match(/\*Tagline:\*\s*"([^"]+)"/g);
        if (allTaglines && allTaglines.length > 0) {
          const lastTagline = allTaglines[allTaglines.length - 1];
          const taglineText = lastTagline.match(/"([^"]+)"/);
          if (taglineText && taglineText[1]) {
            components.tagline = taglineText[1];
          }
        }
      }
      
      // Extract bodySecondary if present (usually in Thursday's option)
      if (optionLetter === 'C' && sectionToSearch.includes('Free consultation')) {
        const bodySecondaryMatch = sectionToSearch.match(/Free consultation[^"]*\./);
        if (bodySecondaryMatch) {
          components.bodySecondary = bodySecondaryMatch[0];
        }
      }

      // Check if Thursday's option has visual concept (numbered list)
      if ((optionLetter === 'C' || content.includes('THURSDAY')) && 
          (content.includes('numbered list') || content.includes('decisions') || content.includes('47'))) {
        // Generate a decisions list based on brief context (will be set in buildPartialAd)
        components.visual = 'GENERATE_DECISIONS_LIST';
      }
    }

    // Extract from Burl's visual direction
    if (message.characterId === 'burl' && content.includes('VISUAL DIRECTION')) {
      // If visual not already set, create a placeholder based on Burl's description
      if (!components.visual) {
        // Look for visual descriptions
        if (content.includes('numbered list') || content.includes('decisions')) {
          components.visual = 'GENERATE_DECISIONS_LIST';
        } else {
          components.visual = `<div style="text-align: center; padding: 40px; color: var(--ink-light);">
            [Visual element per Burl's direction]
          </div>`;
        }
      }
    }

    // Extract from Delmore's client translation
    if (message.characterId === 'delmore' && content.includes('CLIENT TRANSLATION')) {
      // Extract client name from memo - try multiple patterns
      const clientPatterns = [
        /\*\*TO:\*\* ([^,\n]+)/,
        /TO:\s*([^,\n]+)/,
        /Dear ([^,,\n]+),/
      ];
      
      for (const pattern of clientPatterns) {
        const clientMatch = content.match(pattern);
        if (clientMatch) {
          components.client = clientMatch[1].trim();
          break;
        }
      }
      
      // Default to ADHDAI if no client found
      if (!components.client) {
        components.client = 'ADHDAI';
      }
    }
  }

  return components;
}

/**
 * Generates a numbered decisions list HTML based on the brief/product category
 */
function generateDecisionsList(count: number, brief?: string): string {
  // Use intelligent brief parsing for category detection
  const parsed = brief ? parseBrief(brief) : null;
  const category = parsed?.category || 'consumer goods';
  
  let decisions: string[];
  
  if (category === 'pet food' || category === 'food & beverage') {
    decisions = [
      'Wet food or dry',
      'Which brand to trust',
      'Grain-free or not',
      'How many meals per day',
      'What size portions',
      'Indoor formula or outdoor',
      'Age-specific or all-life-stages',
      'Sensitive stomach or regular',
      'Chicken, fish, or beef',
      'Where to buy it',
      'Subscribe or buy once',
      'Store brand or premium',
      'What the vet recommends',
      'What they actually eat',
      'What they refuse',
      'Treats or no treats',
      'Human food ever',
      'Table scraps policy',
      'Feeding schedule',
      'Free-feeding or timed',
      'Water fountain or bowl',
      'Filtered or tap',
      'How to switch foods',
      'What to do when they won\'t eat',
      'Supplements needed',
      'Dental health treats',
      'Weight management',
      'What the reviews say',
      'What your neighbor feeds theirs',
      'What you can afford'
    ];
  } else if (category === 'kitchenware') {
    decisions = [
      'German or Japanese',
      'Which steel type',
      'How many inches',
      'Chef\'s knife or santoku',
      'Full tang or not',
      'Wood handle or synthetic',
      'Individual or set',
      'Stamped or forged',
      'What angle to sharpen',
      'How often to hone',
      'Stone or steel',
      'Where to store them',
      'Block or magnetic strip',
      'Drawer or countertop',
      'How to wash them',
      'Never dishwasher',
      'What cutting board',
      'End grain or edge grain',
      'When to replace',
      'What to cut with what',
      'Tomato knife needed',
      'Bread knife needed',
      'Paring knife needed',
      'Boning knife if ever',
      'What brand to trust',
      'What the pros use',
      'What you can afford',
      'Sharpening service or DIY',
      'What your mother used',
      'What works for your hands'
    ];
  } else if (category === 'automotive') {
    decisions = [
      'New or used',
      'Lease or buy',
      'Which dealer',
      'What color',
      'What trim level',
      'Financing terms',
      'Trade-in value',
      'Insurance coverage',
      'Extended warranty',
      'Gap coverage',
      'Where to service it',
      'Oil change frequency',
      'Premium gas or regular',
      'Winter tires or all-season',
      'Wash it yourself or pay',
      'Garage or street parking',
      'What to tell insurance',
      'Who drives it',
      'Carpool or not',
      'How to split costs',
      'When to replace it',
      'What it says about you',
      'What you actually need',
      'What they\'ll think',
      'What makes sense'
    ];
  } else if (category === 'technology') {
    decisions = [
      'Monthly or annual',
      'Basic or premium',
      'Single user or team',
      'Cloud or local',
      'Mac or Windows',
      'Mobile or desktop',
      'Export your data first',
      'Two-factor or not',
      'Share password or not',
      'Which features matter',
      'What integrations needed',
      'Training required',
      'Support included',
      'Uptime guarantee',
      'Backup frequency',
      'Data retention policy',
      'Cancel anytime or contract',
      'Competitor comparison',
      'Reviews trustworthy',
      'Free trial long enough',
      'Learning curve',
      'Vendor lock-in risk',
      'Migration path',
      'What happens if they fold',
      'What you actually use'
    ];
  } else {
    // Generic decisions that work for any product/service
    decisions = [
      'This one or that one',
      'Now or later',
      'More or less',
      'Here or there',
      'Online or in person',
      'Big or small',
      'Cheap or expensive',
      'Quick or quality',
      'Safe or bold',
      'Same or different',
      'Keep or return',
      'Trust or verify',
      'Ask or decide',
      'Wait or act',
      'Read reviews or wing it',
      'Compare or commit',
      'Overthink or underthink',
      'Your way or their way',
      'What you want',
      'What you need',
      'What you can afford',
      'What they\'ll think',
      'What actually matters',
      'What you\'ll regret',
      'What you\'ll forget',
      'What changes nothing',
      'What changes everything',
      'The thing you know',
      'The thing you don\'t',
      'Starting now'
    ];
  }

  const items = decisions.slice(0, count).map((decision, index) => 
    `<li data-num="${index + 1}">${decision}</li>`
  ).join('\n      ');

  return `<ol class="decisions-list">
      ${items}
    </ol>`;
}

/**
 * Builds partial HTML ad from available components
 * Uses generateAdHTML from adGenerator but with partial data
 */
export function buildPartialAd(components: AdComponents, brief?: string, brandInfo?: import('../types').BrandInfo): string {
  // Determine the visual element - generate decisions list if needed
  let visual = components.visual;
  if (visual === 'GENERATE_DECISIONS_LIST' || !visual) {
    visual = generateDecisionsList(30, brief);
  }
  
  // Use more contextual placeholders that match the aesthetic
  const adData = {
    headline: components.headline || (brief ? `WHEN YOU NEED ${brief.toUpperCase().substring(0, 60)}, YOU WILL HAVE TO MAKE DECISIONS.` : '[HEADLINE PENDING]'),
    body: components.body || (brief ? `Or you could decide now. While you're still deciding.` : '[BODY COPY PENDING]'),
    bodySecondary: components.bodySecondary || (brief ? `Free consultation. You'll feel weird after. That's normal.` : undefined),
    tagline: components.tagline || (brief ? `We've done this before.` : '[TAGLINE PENDING]'),
    visual: visual,
    client: components.client || brandInfo?.clientName || 'ADHDAI',
    clientLocation: components.clientLocation,
    clientSince: components.clientSince
  };

  return generateAdHTML(adData, brandInfo);
}

