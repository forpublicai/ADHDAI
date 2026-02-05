import { Character, Phase, Task, WindowState } from './types';

export const CHARACTERS: Character[] = [
  {
    id: 'mike',
    name: 'Mike Slab',
    role: 'Director of Client Accountability',
    personality: 'Interrogation style, finds real problem underneath brief. Insurance fraud investigator background. Calls work "the job."',
    color: '#8B4513',
    icon: 'clipboard'
  },
  {
    id: 'poole',
    name: 'Dr. Leon Poole',
    role: 'Chief Methodologist',
    personality: 'The Poole System, "architecture of wanting," jargon-heavy frameworks. Sometimes profound insights buried in diagrams.',
    color: '#D4A574',
    icon: 'graph'
  },
  {
    id: 'the-cell',
    name: 'The Copywriting Cell',
    role: 'Collective Copywriting Unit',
    personality: 'Three-person collective (Vera, Gjon, Thursday). Anarcho-syndicalist principles. Strange, true-feeling copy. Signs as "—The Cell."',
    color: '#6B4B8C',
    icon: 'pencil'
  },
  {
    id: 'burl',
    name: 'Burl Pettigrew',
    role: 'Art Director',
    personality: 'Calls work "pictures" not "design." Theories about color, typography, whitespace. Memphis Group + Baptist + financial setback aesthetic.',
    color: '#C84B31',
    icon: 'palette'
  },
  {
    id: 'nadya',
    name: 'Nadya Orlov',
    role: 'Production Director',
    personality: 'Five-year planning, accountability. "Everything is ASAP, tell me the date." Smoking, Valentina Tereshkova photo.',
    color: '#2F4F4F',
    icon: 'calendar'
  },
  {
    id: 'delmore',
    name: 'Delmore Frank Krepps',
    role: 'Client Services',
    personality: 'Translation, pamphlets, extension work background. Hard candies, short-sleeve button-downs. Makes pamphlets on risograph.',
    color: '#2D5A3D',
    icon: 'file'
  },
  {
    id: 'apparatus',
    name: 'The Apparatus',
    role: 'Computational Resource',
    personality: 'Formal, melancholic, em-dashes. "READY FOR REVIEW—" with timestamp. Handles production tasks.',
    color: '#4A5568',
    icon: 'gear'
  }
];

export const PHASES: { id: Phase; name: string; description: string }[] = [
  {
    id: 'brief',
    name: '001 — INTAKE REPORT',
    description: 'Mike Slab conducts the interrogation. He returns with the real brief—the one underneath the one they sent.'
  },
  {
    id: 'phase1',
    name: '002 — STRATEGIC FRAMEWORK',
    description: 'Dr. Poole convenes the framework session. Whiteboards are filled. The Poole System is applied. Diagrams are produced.'
  },
  {
    id: 'phase2',
    name: '003 — COPY TRANSMITTAL',
    description: 'The Copywriting Cell retreats. They review Poole\'s framework, raise objections, and return with copy options and voting records.'
  },
  {
    id: 'phase3',
    name: '004 — VISUAL DIRECTION',
    description: 'Burl makes pictures. He requests copy changes from The Cell. He emerges with layouts and color theories.'
  },
  {
    id: 'phase4',
    name: '005 — COMMITTEE FINDINGS',
    description: 'The Committee convenes. Claims are evaluated. Objections are recorded. Nadya enters and asks why it\'s taking so long.'
  },
  {
    id: 'phase5',
    name: '006-008 — PRODUCTION & DELIVERY',
    description: 'Nadya issues the production schedule. The Apparatus compiles the final advertisement. Delmore prepares the client translation.'
  }
];

export const INITIAL_TASKS: Task[] = [
  // Brief phase
  {
    id: '1',
    title: 'Conduct brief interrogation',
    phase: 'brief',
    assignedTo: 'mike',
    status: 'todo',
    description: 'Interrogate the client. Find what they actually need.'
  },
  {
    id: '2',
    title: 'Document findings',
    phase: 'brief',
    assignedTo: 'mike',
    status: 'todo',
    description: 'Record what the client said vs. what they meant vs. what they need'
  },
  {
    id: '3',
    title: 'Identify outstanding concerns',
    phase: 'brief',
    assignedTo: 'mike',
    status: 'todo',
    description: 'List 1-3 concerns that may affect the work'
  },
  // Framework phase
  {
    id: '4',
    title: 'Apply The Poole System',
    phase: 'phase1',
    assignedTo: 'poole',
    status: 'todo',
    description: 'Convene framework session, identify psychological barriers'
  },
  {
    id: '5',
    title: 'Create framework diagram',
    phase: 'phase1',
    assignedTo: 'poole',
    status: 'todo',
    description: 'Produce ASCII diagram showing BARRIER → REFRAME → PERMISSION → ACTION'
  },
  {
    id: '6',
    title: 'Propose reframe',
    phase: 'phase1',
    assignedTo: 'poole',
    status: 'todo',
    description: 'Define how to shift the emotional register'
  },
  // Copy phase
  {
    id: '7',
    title: 'Object to framework',
    phase: 'phase2',
    assignedTo: 'the-cell',
    status: 'todo',
    description: 'Raise ideological objection to Poole\'s framework'
  },
  {
    id: '8',
    title: 'Create Option A (safe)',
    phase: 'phase2',
    assignedTo: 'the-cell',
    status: 'todo',
    description: 'Safe execution of Poole\'s framework'
  },
  {
    id: '9',
    title: 'Create Option B (variation)',
    phase: 'phase2',
    assignedTo: 'the-cell',
    status: 'todo',
    description: 'Variation on the framework'
  },
  {
    id: '10',
    title: 'Create Option C (Thursday\'s)',
    phase: 'phase2',
    assignedTo: 'the-cell',
    status: 'todo',
    description: 'Thursday\'s proposal—stranger, more direct'
  },
  {
    id: '11',
    title: 'Vote on copy options',
    phase: 'phase2',
    assignedTo: 'the-cell',
    status: 'todo',
    description: 'Record votes and select recommended option'
  },
  // Visual phase
  {
    id: '12',
    title: 'Develop visual direction',
    phase: 'phase3',
    assignedTo: 'burl',
    status: 'todo',
    description: 'Create layout, color palette, typography choices'
  },
  {
    id: '13',
    title: 'Request copy adjustment',
    phase: 'phase3',
    assignedTo: 'burl',
    status: 'todo',
    description: 'Ask Cell to shorten or modify copy for visual balance'
  },
  {
    id: '14',
    title: 'Revise copy per Burl',
    phase: 'phase3',
    assignedTo: 'the-cell',
    status: 'todo',
    description: 'Update copy based on Burl\'s visual requirements'
  },
  // Committee phase
  {
    id: '15',
    title: 'Committee review',
    phase: 'phase4',
    assignedTo: 'poole',
    status: 'todo',
    description: 'Evaluate work for truthfulness in intention'
  },
  {
    id: '16',
    title: 'Record objections',
    phase: 'phase4',
    assignedTo: null,
    status: 'todo',
    description: 'Document any objections even if overruled'
  },
  {
    id: '17',
    title: 'Approve for production',
    phase: 'phase4',
    assignedTo: null,
    status: 'todo',
    description: 'Vote and approve with conditions if needed'
  },
  // Production phase
  {
    id: '18',
    title: 'Create production schedule',
    phase: 'phase5',
    assignedTo: 'nadya',
    status: 'todo',
    description: 'Issue schedule with exact dates and named accountability'
  },
  {
    id: '19',
    title: 'Compile final advertisement',
    phase: 'phase5',
    assignedTo: 'apparatus',
    status: 'todo',
    description: 'Assemble all components into final HTML'
  },
  {
    id: '20',
    title: 'Translate for client',
    phase: 'phase5',
    assignedTo: 'delmore',
    status: 'todo',
    description: 'Prepare client translation and mention pamphlet'
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
    width: 500,
    height: 700,
    minimized: false,
    zIndex: 1
  }
];

export const INITIAL_BRIEF = 'A toaster that makes perfect toast every time';

