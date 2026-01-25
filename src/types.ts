export type CharacterId = 'mike' | 'poole' | 'the-cell' | 'burl' | 'nadya' | 'delmore' | 'apparatus';

export interface Character {
  id: CharacterId;
  name: string;
  role: string;
  personality: string;
  color: string;
  emoji: string;
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
