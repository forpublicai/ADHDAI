export type CharacterId = 'alice' | 'bob' | 'ahnjili' | 'andy' | 'josh';

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
  status: 'todo' | 'in-progress' | 'done';
  description?: string;
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

export interface AppState {
  isRunning: boolean;
  currentPhase: Phase;
  messages: Message[];
  tasks: Task[];
  windows: WindowState[];
  generatedAd: string;
  brief: string;
}
