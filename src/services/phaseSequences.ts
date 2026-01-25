import { CanvasAction } from './canvasOrchestrator';

// Generate unique IDs for elements
let elementCounter = 0;
const generateId = (prefix: string) => `${prefix}-${++elementCounter}`;

// Phase 1: Strategy Board - Mike and Poole set up the strategic framework
export function createStrategyPhaseActions(brief: string): CanvasAction[] {
  const briefAnalysisId = generateId('sticky');
  const frameworkId = generateId('diagram');
  const insightId = generateId('sticky');
  const objectionId = generateId('sticky');
  const responseId = generateId('sticky');
  
  // Extract key info from brief for dynamic content
  const briefWords = brief.toLowerCase();
  const hasProduct = briefWords.includes('product') || briefWords.includes('brand');
  const hasProblem = briefWords.includes('problem') || briefWords.includes('issue') || briefWords.includes('challenge');
  
  return [
    // Mike enters and reviews the brief
    { id: 'a1', agent: 'mike', action: 'moveTo', position: { x: 100, y: 80 }, duration: 1000 },
    { id: 'a2', agent: 'mike', action: 'think', text: 'Reading brief...', duration: 2000 },
    
    // Mike creates analysis sticky
    { id: 'a3', agent: 'mike', action: 'moveTo', position: { x: 150, y: 120 }, duration: 600 },
    { id: 'a4', agent: 'mike', action: 'createSticky', position: { x: 150, y: 120 }, elementId: briefAnalysisId, color: '#8B4513' },
    { id: 'a5', agent: 'mike', action: 'typeInto', elementId: briefAnalysisId, text: 'INTAKE ANALYSIS\n\nWhat they say they want vs. what they actually need...', charDelay: 50 },
    
    // Mike adds more insight
    { id: 'a6', agent: 'mike', action: 'moveTo', position: { x: 150, y: 300 }, duration: 500 },
    { id: 'a7', agent: 'mike', action: 'createSticky', position: { x: 150, y: 300 }, elementId: insightId, color: '#8B4513' },
    { id: 'a8', agent: 'mike', action: 'typeInto', elementId: insightId, text: hasProblem ? 'ROOT PROBLEM:\nThey know something is wrong but can\'t name it' : 'HIDDEN TRUTH:\nThe real story isn\'t what they told us', charDelay: 55 },
    
    // Poole arrives and sets up framework
    { id: 'a9', agent: 'poole', action: 'moveTo', position: { x: 450, y: 100 }, duration: 1200 },
    { id: 'a10', agent: 'poole', action: 'think', text: 'Preparing strategic framework...', duration: 1500 },
    
    // Poole creates the Poole System diagram
    { id: 'a11', agent: 'poole', action: 'createDiagram', position: { x: 450, y: 150 }, elementId: frameworkId, diagramType: 'framework', text: 'THE POOLE SYSTEM\n\n1. EXCAVATION\n   ↓\n2. CONTRADICTION\n   ↓\n3. SYNTHESIS\n   ↓\n4. DEPLOYMENT' },
    
    // Cell member objects
    { id: 'a12', agent: 'cell', action: 'moveTo', position: { x: 700, y: 200 }, duration: 800 },
    { id: 'a13', agent: 'cell', action: 'think', text: 'Reviewing framework with skepticism...', duration: 1000 },
    { id: 'a14', agent: 'cell', action: 'createSticky', position: { x: 700, y: 200 }, elementId: objectionId, color: '#cc3333' },
    { id: 'a15', agent: 'cell', action: 'typeInto', elementId: objectionId, text: 'OBJECTION:\nPoole\'s framework assumes client honesty. They never know what they need.', charDelay: 45 },
    
    // Poole defends
    { id: 'a16', agent: 'poole', action: 'moveTo', position: { x: 550, y: 350 }, duration: 600 },
    { id: 'a17', agent: 'poole', action: 'createSticky', position: { x: 550, y: 350 }, elementId: responseId, color: '#1a1a2e' },
    { id: 'a18', agent: 'poole', action: 'typeInto', elementId: responseId, text: 'RE: Objection\n\nThe framework accounts for this. See step 1: EXCAVATION. We dig beneath their words.', charDelay: 50 },
    
    // Create arrow connecting framework to response
    { id: 'a19', agent: 'poole', action: 'createArrow', arrowFrom: frameworkId, arrowTo: responseId },
  ];
}

// Phase 2: Copy Development - Cell writes copy, Burl comments on visuals
export function createCopyPhaseActions(brief: string): CanvasAction[] {
  const headline1Id = generateId('text');
  const headline2Id = generateId('text');
  const headline3Id = generateId('text');
  const burlCommentId = generateId('sticky');
  const vote1Id = generateId('sticky');
  const vote2Id = generateId('sticky');
  
  return [
    // Cell moves to copy area
    { id: 'b1', agent: 'cell', action: 'moveTo', position: { x: 100, y: 500 }, duration: 800 },
    { id: 'b2', agent: 'cell', action: 'think', text: 'Generating headline options...', duration: 2000 },
    
    // Cell creates headline options
    { id: 'b3', agent: 'cell', action: 'createText', position: { x: 100, y: 500 }, elementId: headline1Id },
    { id: 'b4', agent: 'cell', action: 'typeInto', elementId: headline1Id, text: 'OPTION A:\n"You already know.\nYou just haven\'t said it yet."', charDelay: 60 },
    
    { id: 'b5', agent: 'cell', action: 'moveTo', position: { x: 100, y: 650 }, duration: 400 },
    { id: 'b6', agent: 'cell', action: 'createText', position: { x: 100, y: 650 }, elementId: headline2Id },
    { id: 'b7', agent: 'cell', action: 'typeInto', elementId: headline2Id, text: 'OPTION B:\n"The truth was always there.\nWaiting."', charDelay: 60 },
    
    { id: 'b8', agent: 'cell', action: 'moveTo', position: { x: 100, y: 800 }, duration: 400 },
    { id: 'b9', agent: 'cell', action: 'createText', position: { x: 100, y: 800 }, elementId: headline3Id },
    { id: 'b10', agent: 'cell', action: 'typeInto', elementId: headline3Id, text: 'OPTION C: [THURSDAY SPECIAL]\n"47 decisions and one silence."', charDelay: 60 },
    
    // Burl reviews visuals
    { id: 'b11', agent: 'burl', action: 'moveTo', position: { x: 450, y: 550 }, duration: 1000 },
    { id: 'b12', agent: 'burl', action: 'think', text: 'Assessing visual implications...', duration: 1500 },
    
    // Burl adds comment about visuals
    { id: 'b13', agent: 'burl', action: 'createSticky', position: { x: 450, y: 550 }, elementId: burlCommentId, color: '#3d3d3d' },
    { id: 'b14', agent: 'burl', action: 'typeInto', elementId: burlCommentId, text: 'VISUAL DIRECTION:\n\nOption A needs more negative space.\n\nOption C requires documentary photography.\n\nNo gradients. Paper texture only.', charDelay: 50 },
    
    // Highlight Burl's preferred option
    { id: 'b15', agent: 'burl', action: 'highlightElement', elementId: headline1Id, duration: 1000 },
    
    // Committee arrives to vote
    { id: 'b16', agent: 'committee', action: 'moveTo', position: { x: 350, y: 700 }, duration: 900 },
    { id: 'b17', agent: 'committee', action: 'think', text: 'Deliberating...', duration: 2000 },
    
    // Committee votes
    { id: 'b18', agent: 'committee', action: 'vote', elementId: headline1Id },
    { id: 'b19', agent: 'committee', action: 'createSticky', position: { x: 350, y: 650 }, elementId: vote1Id, color: '#4a4a4a' },
    { id: 'b20', agent: 'committee', action: 'typeInto', elementId: vote1Id, text: 'COMMITTEE VOTE:\n\nOption A: ████████ 4\nOption B: ████ 2\nOption C: ██ 1\n\nOption A APPROVED (4-2-1)', charDelay: 40 },
    
    // Poole objects
    { id: 'b21', agent: 'poole', action: 'moveTo', position: { x: 550, y: 750 }, duration: 600 },
    { id: 'b22', agent: 'poole', action: 'createSticky', position: { x: 550, y: 750 }, elementId: vote2Id, color: '#1a1a2e' },
    { id: 'b23', agent: 'poole', action: 'typeInto', elementId: vote2Id, text: 'DEFENSE OF FRAMEWORK:\n\nI maintain Option A aligns with Poole System principles.\n\nThe Cell\'s objection is noted but overruled.', charDelay: 50 },
  ];
}

// Phase 3: Production - Nadya schedules, Delmore translates for client
export function createProductionPhaseActions(): CanvasAction[] {
  const scheduleId = generateId('diagram');
  const translationId = generateId('text');
  const interruptId = generateId('sticky');
  
  return [
    // Nadya enters with schedule
    { id: 'c1', agent: 'nadya', action: 'moveTo', position: { x: 150, y: 950 }, duration: 800 },
    { id: 'c2', agent: 'nadya', action: 'think', text: 'This meeting is already behind schedule...', duration: 1000 },
    
    // Nadya creates production schedule
    { id: 'c3', agent: 'nadya', action: 'createDiagram', position: { x: 150, y: 950 }, elementId: scheduleId, diagramType: 'flowchart', text: 'PRODUCTION SCHEDULE\n━━━━━━━━━━━━━━━━━━\n\nT+0h: Final copy approval\nT+2h: Asset preparation\nT+4h: Layout composition\nT+6h: Review cycle\nT+8h: Client presentation\n\n⚠️ NO EXTENSIONS' },
    
    // Nadya interrupts
    { id: 'c4', agent: 'nadya', action: 'createSticky', position: { x: 350, y: 1000 }, elementId: interruptId, color: '#cc0000' },
    { id: 'c5', agent: 'nadya', action: 'typeInto', elementId: interruptId, text: '⚠️ INTERRUPTION\n\nThis discussion is 12 minutes over allocated time.\n\nMove to assembly phase IMMEDIATELY.', charDelay: 40 },
    
    // Delmore prepares client translation
    { id: 'c6', agent: 'delmore', action: 'moveTo', position: { x: 500, y: 950 }, duration: 1000 },
    { id: 'c7', agent: 'delmore', action: 'think', text: 'Preparing client-friendly version...', duration: 1500 },
    
    // Delmore writes translation
    { id: 'c8', agent: 'delmore', action: 'createText', position: { x: 500, y: 950 }, elementId: translationId },
    { id: 'c9', agent: 'delmore', action: 'typeInto', elementId: translationId, text: 'CLIENT PRESENTATION NOTES:\n\n"The team has developed a campaign that speaks to your audience\'s unspoken needs..."\n\n[Translation: We ignored what you asked for and made something better]', charDelay: 45 },
  ];
}

// Phase 4: Ad Assembly - Final ad is assembled on canvas
export function createAssemblyPhaseActions(adHtml: string): CanvasAction[] {
  const adFrameId = generateId('adframe');
  const approvalId = generateId('sticky');
  const finalNoteId = generateId('text');
  
  return [
    // Apparatus arrives for final assembly
    { id: 'd1', agent: 'apparatus', action: 'moveTo', position: { x: 400, y: 1150 }, duration: 1200 },
    { id: 'd2', agent: 'apparatus', action: 'think', text: 'Compiling final advertisement...', duration: 2000 },
    
    // Create ad frame
    { id: 'd3', agent: 'apparatus', action: 'createAdFrame', position: { x: 300, y: 1200 }, elementId: adFrameId, htmlContent: adHtml },
    
    // Burl reviews final visual
    { id: 'd4', agent: 'burl', action: 'moveTo', position: { x: 650, y: 1250 }, duration: 800 },
    { id: 'd5', agent: 'burl', action: 'think', text: 'Final visual review...', duration: 1500 },
    { id: 'd6', agent: 'burl', action: 'highlightElement', elementId: adFrameId, duration: 1200 },
    
    // Committee final approval
    { id: 'd7', agent: 'committee', action: 'moveTo', position: { x: 700, y: 1350 }, duration: 700 },
    { id: 'd8', agent: 'committee', action: 'createSticky', position: { x: 750, y: 1200 }, elementId: approvalId, color: '#2a4a2a' },
    { id: 'd9', agent: 'committee', action: 'typeInto', elementId: approvalId, text: '✓ FINAL APPROVAL\n\nCommittee has reviewed.\nVote: UNANIMOUS\n\nAd approved for deployment.', charDelay: 45 },
    
    // Apparatus adds final observation
    { id: 'd10', agent: 'apparatus', action: 'moveTo', position: { x: 200, y: 1400 }, duration: 600 },
    { id: 'd11', agent: 'apparatus', action: 'createText', position: { x: 200, y: 1450 }, elementId: finalNoteId },
    { id: 'd12', agent: 'apparatus', action: 'typeInto', elementId: finalNoteId, text: 'APPARATUS OBSERVATION:\n\nAnother advertisement complete.\nThe client wanted certainty.\nWe gave them questions instead.\n\nThis is the way.', charDelay: 55 },
  ];
}

// Combined sequence for full workflow
export function createFullWorkflowActions(brief: string, adHtml: string): CanvasAction[] {
  // Reset element counter for fresh IDs
  elementCounter = 0;
  
  return [
    ...createStrategyPhaseActions(brief),
    ...createCopyPhaseActions(brief),
    ...createProductionPhaseActions(),
    ...createAssemblyPhaseActions(adHtml),
  ];
}

export default {
  createStrategyPhaseActions,
  createCopyPhaseActions,
  createProductionPhaseActions,
  createAssemblyPhaseActions,
  createFullWorkflowActions,
};

