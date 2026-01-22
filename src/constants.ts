import { Character, Phase, Task, WindowState } from './types';

export const CHARACTERS: Character[] = [
  {
    id: 'alice',
    name: 'Alice',
    role: 'Creative Director',
    personality: 'Overconfident, loves buzzwords, thinks every bad idea is "disruptive"',
    color: '#FF006E',
    emoji: '🎨'
  },
  {
    id: 'bob',
    name: 'Bob',
    role: 'Copywriter',
    personality: 'Obsessed with metaphors, creates tonal whiplash, writes like he\'s being paid per word',
    color: '#8338EC',
    emoji: '✍️'
  },
  {
    id: 'ahnjili',
    name: 'Ahnjili',
    role: 'Strategist',
    personality: 'Misunderstands products completely, optimizes for wrong metrics, very enthusiastic about it',
    color: '#3A86FF',
    emoji: '📊'
  },
  {
    id: 'andy',
    name: 'Andy',
    role: 'Designer',
    personality: 'Overstimulating visuals, ignores UX principles, thinks more colors = better',
    color: '#FFBE0B',
    emoji: '🎭'
  },
  {
    id: 'josh',
    name: 'Josh',
    role: 'Director',
    personality: 'Injects chaos, approves everything, thinks bugs are features',
    color: '#FB5607',
    emoji: '🎬'
  }
];

export const PHASES: { id: Phase; name: string; description: string }[] = [
  {
    id: 'brief',
    name: 'Brief Expansion',
    description: 'Josh takes your one-liner and expands it into a beautifully confused PRD'
  },
  {
    id: 'phase1',
    name: 'Phase 1: Misunderstanding',
    description: 'Ahnjili misunderstands the product, Alice adds buzzwords, chaos begins'
  },
  {
    id: 'phase2',
    name: 'Phase 2: Overstimulation',
    description: 'Andy adds ALL the colors, Bob writes copy that makes no sense'
  },
  {
    id: 'phase3',
    name: 'Phase 3: Broken Metaphors',
    description: 'Bob creates metaphors that break physics, Alice approves everything'
  },
  {
    id: 'phase4',
    name: 'Phase 4: Polish (The Bad Kind)',
    description: 'Everyone adds their worst ideas, Josh calls it "genius"'
  },
  {
    id: 'phase5',
    name: 'Phase 5+: Infinite Chaos',
    description: 'The ad gets worse. And worse. And somehow worse.'
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    title: 'Misunderstand the product',
    phase: 'phase1',
    assignedTo: 'ahnjili',
    status: 'todo',
    description: 'Take the product and completely misunderstand what it does'
  },
  {
    id: '2',
    title: 'Add buzzwords',
    phase: 'phase1',
    assignedTo: 'alice',
    status: 'todo',
    description: 'Insert as many marketing buzzwords as possible'
  },
  {
    id: '3',
    title: 'Create broken metaphors',
    phase: 'phase3',
    assignedTo: 'bob',
    status: 'todo',
    description: 'Write copy with metaphors that make no sense'
  },
  {
    id: '4',
    title: 'Overstimulate visually',
    phase: 'phase2',
    assignedTo: 'andy',
    status: 'todo',
    description: 'Use every color, animation, and effect possible'
  }
];

export const INITIAL_WINDOWS: WindowState[] = [
  {
    id: 'chat',
    type: 'chat',
    x: 50,
    y: 50,
    width: 400,
    height: 500,
    minimized: false,
    zIndex: 1
  },
  {
    id: 'code',
    type: 'code',
    x: 470,
    y: 50,
    width: 600,
    height: 500,
    minimized: false,
    zIndex: 2
  },
  {
    id: 'preview',
    type: 'preview',
    x: 50,
    y: 570,
    width: 800,
    height: 400,
    minimized: false,
    zIndex: 3
  },
  {
    id: 'kanban',
    type: 'kanban',
    x: 870,
    y: 50,
    width: 350,
    height: 500,
    minimized: false,
    zIndex: 1
  }
];

export const INITIAL_BRIEF = 'A toaster that makes perfect toast every time';
