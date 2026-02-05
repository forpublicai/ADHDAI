export type CharacterId = 'mike' | 'poole' | 'the-cell' | 'burl' | 'nadya' | 'delmore' | 'apparatus';

export interface Character {
  id: CharacterId;
  name: string;
  role: string;
  personality: string;
  color: string;
  icon: string;
}

export type Phase = 
  | 'brief'
  | 'phase1'
  | 'phase2'
  | 'phase3'
  | 'phase4'
  | 'phase5';

export interface Message {
  id: string;
  characterId: CharacterId;
  timestamp: number;
  content: string;
  type: 'message' | 'action' | 'code';
  code?: string;
  language?: string;
}

export interface Task {
  id: string;
  title: string;
  phase: Phase;
  assignedTo: CharacterId | null;
  status: 'todo' | 'in-progress' | 'done' | 'blocked';
  description?: string;
  workProduct?: string; // Intermediate output (headline, copy, visual description)
  conflicts?: Array<{ with: CharacterId; reason: string }>;
  progress?: number; // 0-100
  subtasks?: Task[];
  completedAt?: number; // Timestamp when task was completed
}

export interface WindowState {
  id: string;
  type: 'chat' | 'code' | 'preview' | 'kanban' | 'moodboard';
  x: number;
  y: number;
  width: number;
  height: number;
  minimized: boolean;
  zIndex: number;
}

export interface AdComponents {
  headline?: string;
  body?: string;
  bodySecondary?: string;
  tagline?: string;
  visual?: string; // HTML for decisions list or visual element
  client?: string;
  clientLocation?: string;
  clientSince?: string;
}

export interface BrandInfo {
  clientName: string;
  brandColors: {
    primary: string;
    secondary?: string | null;
    accent?: string | null;
  };
  brandFonts?: {
    heading?: string | null;
    body?: string | null;
  };
  brandTone: string;
  brandStyle: string;
  brandGuidelines?: string | null;
}

export interface AppState {
  isRunning: boolean;
  currentPhase: Phase;
  messages: Message[];
  tasks: Task[];
  windows: WindowState[];
  generatedAd: string;
  brief: string;
  adComponents?: AdComponents; // Track incremental ad building
  campaignDeliverables?: string; // HTML for campaign deliverables (video, campaign, social)
  brandInfo?: BrandInfo; // Client brand information
}

// ============================================
// DOOMSDAY SCENARIO TYPES
// ============================================

export type TimeHorizon = '1-year' | '5-year' | '10-year' | '50-year';

export type RiskCategory = 
  | 'environmental'
  | 'social'
  | 'financial'
  | 'technological'
  | 'regulatory'
  | 'reputational'
  | 'operational'
  | 'geopolitical';

export type SeverityLevel = 'catastrophic' | 'severe' | 'moderate' | 'concerning';

export interface DoomsdayScenario {
  id: string;
  companyName: string;
  timeHorizon: TimeHorizon;
  title: string;
  description: string;
  category: RiskCategory;
  severity: SeverityLevel;
  likelihood: number; // 0-100
  potentialDamage: string; // Description of the damage
  affectedParties: string[]; // Who gets hurt
  precedents?: string[]; // Similar events that have happened
  selected?: boolean; // Whether user selected this for campaign generation
}

export interface ScenarioAnalysis {
  company: string;
  analyzedAt: number;
  scenarios: DoomsdayScenario[];
  summary: string;
}

// ============================================
// APOLOGY CAMPAIGN TYPES
// ============================================

export interface ApologyCampaign {
  id: string;
  scenarioId: string;
  companyName: string;
  scenarioTitle: string;
  status: 'pending' | 'generating' | 'complete' | 'error';
  
  // Campaign content
  headline?: string;
  subheadline?: string;
  apologyStatement?: string;
  keyMessages?: string[];
  tone?: string;
  
  // Visual direction
  visualConcept?: string;
  colorPalette?: string[];
  typography?: string;
  
  // Deliverables
  deliverables?: ApologyDeliverables;
  
  // Metadata
  generatedAt?: number;
  error?: string;
}

export interface ApologyDeliverables {
  // Print
  fullPageAd?: ApologyAsset;
  poster?: ApologyAsset;
  
  // Video
  videoScript?: VideoScript;
  storyboardFrames?: string[];
  
  // Digital
  socialPosts?: ApologySocialPost[];
  bannerAds?: ApologyAsset[];
  
  // OOH
  billboard?: ApologyAsset;
  busShelter?: ApologyAsset;
  
  // Generated images
  heroImage?: string;
  productImage?: string;
  lifestyleImage?: string;
}

export interface ApologyAsset {
  format: string;
  dimensions?: string;
  headline: string;
  body: string;
  visual: string;
  imageUrl?: string;
}

export interface ApologySocialPost {
  platform: string;
  type: string;
  copy: string;
  visual: string;
  hashtags?: string[];
  imageUrl?: string;
}

export interface VideoScript {
  title: string;
  duration: string;
  format: string;
  script: VideoShot[];
  notes: string;
}

export interface VideoShot {
  shot: string;
  duration: string;
  visual: string;
  audio: string;
  onScreenText?: string;
  imageUrl?: string;
}

// ============================================
// WORKFLOW STATE TYPES
// ============================================

export type ApologyWorkflowPhase = 
  | 'company-selection'
  | 'scenario-analysis'
  | 'scenario-selection'
  | 'campaign-generation'
  | 'campaign-complete';

export interface ApologyWorkflowState {
  phase: ApologyWorkflowPhase;
  selectedCompany: string | null;
  scenarioAnalysis: ScenarioAnalysis | null;
  selectedScenarios: string[]; // IDs of selected scenarios
  campaigns: ApologyCampaign[];
  currentCampaignIndex: number;
  isGenerating: boolean;
  error: string | null;
}
