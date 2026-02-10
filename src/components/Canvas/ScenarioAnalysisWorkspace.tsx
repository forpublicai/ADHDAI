import React, { useEffect, useRef, useState, useCallback } from 'react';
import OpenAI from 'openai';
import {
  ClipboardText,
  Graph,
  PencilSimple,
  Palette,
  CalendarBlank,
  FileText,
  Gear,
  Play,
  Stop,
  ArrowCounterClockwise,
  ArrowLeft,
  ArrowRight,
  FastForward,
  Check,
  Timer,
  Lightning,
  Calendar,
  Binoculars,
  Planet
} from '@phosphor-icons/react';
import { CHARACTERS } from '../../constants';
import { CharacterId, DoomsdayScenario, ScenarioAnalysis, TimeHorizon, RiskCategory, SeverityLevel } from '../../types';
import { Fortune500Company } from '../../data/fortune500';
import { getHorizonLabel } from '../../services/doomsdayAnalyzer';
import './CanvasWorkspace.css';
import './ScenarioAnalysisWorkspace.css';

// Randomized dialogue helper
const pickRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Get icon component for character
const getCharacterIcon = (icon: string, size: number = 16) => {
  const iconProps = { size, weight: 'bold' as const };
  const icons: Record<string, React.ReactNode> = {
    clipboard: <ClipboardText {...iconProps} />,
    graph: <Graph {...iconProps} />,
    pencil: <PencilSimple {...iconProps} />,
    palette: <Palette {...iconProps} />,
    calendar: <CalendarBlank {...iconProps} />,
    file: <FileText {...iconProps} />,
    gear: <Gear {...iconProps} />,
  };
  return icons[icon] || <Gear {...iconProps} />;
};

// Get horizon icon
const getHorizonIcon = (horizon: TimeHorizon, size: number = 14) => {
  const iconProps = { size, weight: 'bold' as const };
  const icons: Record<TimeHorizon, React.ReactNode> = {
    '1-year': <Lightning {...iconProps} />,
    '5-year': <Calendar {...iconProps} />,
    '10-year': <Binoculars {...iconProps} />,
    '50-year': <Planet {...iconProps} />,
  };
  return icons[horizon];
};

// Initialize OpenAI
const getOpenAI = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
};

interface Position {
  x: number;
  y: number;
}

interface WorkItem {
  id: string;
  type: 'sticky' | 'risk' | 'scenario' | 'analysis' | 'timeline' | 'category';
  content: string;
  position: Position;
  color: string;
  createdBy: CharacterId;
  timestamp: number;
  phase: number;
  isTyping?: boolean;
  displayedContent?: string;
  isDragging?: boolean;
  timeHorizon?: TimeHorizon;
  scenario?: DoomsdayScenario;
}

interface ChatMessage {
  id: string;
  from: CharacterId;
  content: string;
  timestamp: number;
}

interface AgentState {
  id: CharacterId;
  position: Position;
  targetPosition: Position;
  status: 'idle' | 'moving' | 'typing' | 'thinking' | 'clicking' | 'analyzing' | 'researching';
  action: string;
  currentPhase: number;
  workZone: { x: number; y: number; width: number; height: number };
  isActive: boolean;
}

interface KanbanTask {
  id: string;
  title: string;
  assignee: CharacterId;
  status: 'todo' | 'in-progress' | 'done';
  phase: number;
}

interface ScenarioAnalysisWorkspaceProps {
  company: Fortune500Company;
  onComplete: (analysis: ScenarioAnalysis) => void;
  onBack?: () => void;
}

// Work zone definitions
const WORK_ZONES: Record<CharacterId, { x: number; y: number; width: number; height: number }> = {
  mike: { x: 380, y: 60, width: 320, height: 200 },
  poole: { x: 720, y: 60, width: 320, height: 200 },
  'the-cell': { x: 1060, y: 60, width: 380, height: 200 },
  burl: { x: 380, y: 280, width: 320, height: 200 },
  nadya: { x: 720, y: 280, width: 320, height: 200 },
  delmore: { x: 1060, y: 280, width: 380, height: 200 },
  apparatus: { x: 720, y: 500, width: 320, height: 160 },
};

const KANBAN_ZONE = { x: 30, y: 60, width: 320, height: 600 };
const TIMELINE_ZONES: Record<TimeHorizon, { x: number; y: number; width: number; height: number }> = {
  '1-year': { x: 380, y: 500, width: 240, height: 160 },
  '5-year': { x: 640, y: 500, width: 240, height: 160 },
  '10-year': { x: 900, y: 500, width: 240, height: 160 },
  '50-year': { x: 1160, y: 500, width: 280, height: 160 },
};

const ITEM_COLORS: Record<string, string> = {
  sticky: '#fff9c4',
  risk: '#ffcdd2',
  scenario: '#ffecb3',
  analysis: '#c8e6c9',
  timeline: '#b3e5fc',
  category: '#e1bee7',
};

const HORIZON_COLORS: Record<TimeHorizon, string> = {
  '1-year': '#ff5252',
  '5-year': '#ff9800',
  '10-year': '#ffeb3b',
  '50-year': '#8bc34a',
};

const ScenarioAnalysisWorkspace: React.FC<ScenarioAnalysisWorkspaceProps> = ({
  company,
  onComplete,
  onBack
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [agents, setAgents] = useState<AgentState[]>([]);
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isAnalysisComplete, setIsAnalysisComplete] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [phaseLabel, setPhaseLabel] = useState('Ready to analyze');
  const [scenarios, setScenarios] = useState<DoomsdayScenario[]>([]);
  
  const [canvasOffset, setCanvasOffset] = useState<Position>({ x: 50, y: 20 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Position>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.75);
  
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  
  const typingRef = useRef<NodeJS.Timeout[]>([]);
  const skipRef = useRef(false);
  const workItemIdRef = useRef(0);
  const chatIdRef = useRef(0);
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  // Delay helper that can be skipped
  const delayOrSkip = useCallback((ms: number) => {
    if (skipRef.current) return Promise.resolve();
    return new Promise<void>(r => setTimeout(r, ms));
  }, []);

  // Helper to get character info
  const getCharacterInfo = useCallback((agentId: CharacterId) => {
    return CHARACTERS.find(c => c.id === agentId) || CHARACTERS[0];
  }, []);

  // Generate initial tasks
  const generateTasks = useCallback((): KanbanTask[] => {
    return [
      { id: 'task-1', title: 'Review company profile', assignee: 'mike', status: 'todo', phase: 1 },
      { id: 'task-2', title: 'Identify risk categories', assignee: 'poole', status: 'todo', phase: 1 },
      { id: 'task-3', title: 'Research 1-year threats', assignee: 'the-cell', status: 'todo', phase: 2 },
      { id: 'task-4', title: 'Analyze 5-year scenarios', assignee: 'burl', status: 'todo', phase: 2 },
      { id: 'task-5', title: 'Project 10-year risks', assignee: 'nadya', status: 'todo', phase: 3 },
      { id: 'task-6', title: 'Extrapolate 50-year futures', assignee: 'delmore', status: 'todo', phase: 3 },
      { id: 'task-7', title: 'Compile doomsday report', assignee: 'apparatus', status: 'todo', phase: 4 },
    ];
  }, []);

  // Initialize agents
  useEffect(() => {
    const initialAgents: AgentState[] = CHARACTERS.map(char => ({
      id: char.id as CharacterId,
      position: {
        x: WORK_ZONES[char.id as CharacterId]?.x + (WORK_ZONES[char.id as CharacterId]?.width || 0) / 2 || 500,
        y: WORK_ZONES[char.id as CharacterId]?.y + (WORK_ZONES[char.id as CharacterId]?.height || 0) / 2 || 300,
      },
      targetPosition: {
        x: WORK_ZONES[char.id as CharacterId]?.x + (WORK_ZONES[char.id as CharacterId]?.width || 0) / 2 || 500,
        y: WORK_ZONES[char.id as CharacterId]?.y + (WORK_ZONES[char.id as CharacterId]?.height || 0) / 2 || 300,
      },
      status: 'idle',
      action: '',
      currentPhase: 0,
      workZone: WORK_ZONES[char.id as CharacterId] || { x: 500, y: 300, width: 200, height: 150 },
      isActive: false,
    }));
    setAgents(initialAgents);
    setTasks(generateTasks());
  }, [generateTasks]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Canvas panning
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0 && !draggedItem) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - canvasOffset.x, y: e.clientY - canvasOffset.y });
    }
  }, [canvasOffset, draggedItem]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    if (isPanning && !draggedItem) {
      setCanvasOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
    
    if (draggedItem) {
      const containerRect = canvasRef.current.getBoundingClientRect();
      const mouseXInCanvas = (e.clientX - containerRect.left - canvasOffset.x) / zoom;
      const mouseYInCanvas = (e.clientY - containerRect.top - canvasOffset.y) / zoom;
      const newX = mouseXInCanvas - dragOffset.x;
      const newY = mouseYInCanvas - dragOffset.y;
      
      setWorkItems(prev => prev.map(item => 
        item.id === draggedItem 
          ? { ...item, position: { x: newX, y: newY }, isDragging: true }
          : item
      ));
    }
  }, [isPanning, panStart, draggedItem, canvasOffset, zoom, dragOffset]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 0.95 : 1.05;
      setZoom(prev => Math.min(2, Math.max(0.3, prev * zoomFactor)));
    } else {
      e.preventDefault();
      setCanvasOffset(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }));
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    if (draggedItem) {
      setWorkItems(prev => prev.map(item => 
        item.id === draggedItem ? { ...item, isDragging: false } : item
      ));
      setDraggedItem(null);
    }
  }, [draggedItem]);

  const handleItemMouseDown = useCallback((e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!canvasRef.current) return;
    
    const item = workItems.find(i => i.id === itemId);
    if (item) {
      const containerRect = canvasRef.current.getBoundingClientRect();
      const mouseXInCanvas = (e.clientX - containerRect.left - canvasOffset.x) / zoom;
      const mouseYInCanvas = (e.clientY - containerRect.top - canvasOffset.y) / zoom;
      
      setDragOffset({
        x: mouseXInCanvas - item.position.x,
        y: mouseYInCanvas - item.position.y,
      });
      setDraggedItem(itemId);
    }
  }, [workItems, zoom, canvasOffset]);

  const updateTaskStatus = useCallback((taskId: string, newStatus: KanbanTask['status']) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  }, []);

  const addChatMessage = useCallback((from: CharacterId, content: string) => {
    const msg: ChatMessage = {
      id: `chat-${chatIdRef.current++}`,
      from,
      content,
      timestamp: Date.now(),
    };
    setChatMessages(prev => [...prev.slice(-30), msg]);
  }, []);

  const createWorkItem = useCallback((
    agentId: CharacterId, 
    type: WorkItem['type'], 
    content: string, 
    position: Position,
    phase: number,
    shouldType: boolean = false,
    timeHorizon?: TimeHorizon,
    scenario?: DoomsdayScenario
  ): string => {
    const id = `item-${workItemIdRef.current++}`;
    const color = timeHorizon ? HORIZON_COLORS[timeHorizon] : ITEM_COLORS[type];
    const item: WorkItem = {
      id,
      type,
      content,
      position,
      color,
      createdBy: agentId,
      timestamp: Date.now(),
      phase,
      isTyping: shouldType,
      displayedContent: shouldType ? '' : content,
      timeHorizon,
      scenario,
    };
    setWorkItems(prev => [...prev, item]);
    
    if (shouldType && content.length > 0) {
      let charIndex = 0;
      const typeInterval = setInterval(() => {
        charIndex += 2;
        setWorkItems(prev => prev.map(wi => 
          wi.id === id 
            ? { ...wi, displayedContent: content.slice(0, charIndex), isTyping: charIndex < content.length }
            : wi
        ));
        if (charIndex >= content.length) {
          clearInterval(typeInterval);
        }
      }, 30);
      typingRef.current.push(typeInterval as unknown as NodeJS.Timeout);
    }
    
    return id;
  }, []);

  const moveAgentTo = useCallback((agentId: CharacterId, target: Position, status: AgentState['status'], action: string) => {
    setAgents(prev => prev.map(agent => 
      agent.id === agentId 
        ? { ...agent, targetPosition: target, status, action, isActive: true }
        : agent
    ));
  }, []);

  // Smooth agent position updates
  useEffect(() => {
    let animationId: number;
    const animate = () => {
      setAgents(prev => prev.map(agent => {
        const dx = agent.targetPosition.x - agent.position.x;
        const dy = agent.targetPosition.y - agent.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 2) {
          return {
            ...agent,
            position: {
              x: agent.position.x + dx * 0.08,
              y: agent.position.y + dy * 0.08,
            },
          };
        }
        return agent;
      }));
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  // Generate a unique ID
  const generateScenarioId = () => `scenario-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Generate scenarios using OpenAI
  const generateScenariosWithAI = useCallback(async (
    horizon: TimeHorizon,
    _agentId: CharacterId
  ): Promise<DoomsdayScenario[]> => {
    const openai = getOpenAI();
    
    if (!openai) {
      // Fallback scenarios
      return generateFallbackScenarios(horizon);
    }

    const horizonDescriptions: Record<TimeHorizon, string> = {
      '1-year': 'within the next year (imminent, urgent, could happen tomorrow)',
      '5-year': 'within the next 5 years (near-term, emerging threats)',
      '10-year': 'within the next decade (medium-term, systemic risks)',
      '50-year': 'within the next 50 years (long-term, existential or transformative)'
    };

    const prompt = `You are a risk analyst identifying SPECIFIC doomsday scenarios for ${company.name}.

COMPANY CONTEXT:
- Name: ${company.name}
- Industry: ${company.industry}
- Sector: ${company.sector}
- Description: ${company.description}
- Known Risk Areas: ${company.riskProfile.join(', ')}

Generate 2-3 SPECIFIC doomsday scenarios that could occur ${horizonDescriptions[horizon]}.

IMPORTANT - Each scenario MUST have:
1. A SPECIFIC, NEWS-HEADLINE-STYLE TITLE (not generic like "Environmental Incident" but specific like "Amazon Warehouse Collapse Kills 47 During Prime Day Rush")
2. Be REALISTIC but concerning - things that could actually happen to THIS company
3. Focus on HARM to people, environment, or society
4. Include specific details (numbers, locations, mechanisms)

Return JSON:
{
  "scenarios": [
    {
      "title": "Specific headline-style title with details",
      "description": "2-3 sentences describing what happens",
      "category": "environmental" | "social" | "financial" | "technological" | "regulatory" | "reputational" | "operational" | "geopolitical",
      "severity": "catastrophic" | "severe" | "moderate" | "concerning",
      "likelihood": number (0-100),
      "potentialDamage": "Specific description of the damage",
      "affectedParties": ["Specific groups affected"],
      "precedents": ["Similar past events if any"]
    }
  ]
}

Be creative, specific, and think like an investigative journalist uncovering what could go wrong.`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a sardonic risk analyst who identifies highly specific corporate catastrophe scenarios. You write like an investigative journalist crossed with a Michael Lewis book — specific details, real precedents, dark wit. Every scenario must be specific to THIS company, not interchangeable with any other. Output ONLY valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.95,
        response_format: { type: 'json_object' },
        max_tokens: 2000
      });

      const response = completion.choices[0]?.message?.content?.trim() || '';
      const parsed = JSON.parse(response);
      const scenariosData = parsed.scenarios || [parsed];

      return scenariosData.map((s: Record<string, unknown>) => ({
        id: generateScenarioId(),
        companyName: company.name,
        timeHorizon: horizon,
        title: (s.title as string) || `${company.name} ${horizon} Incident`,
        description: (s.description as string) || '',
        category: (s.category as RiskCategory) || 'operational',
        severity: (s.severity as SeverityLevel) || 'moderate',
        likelihood: typeof s.likelihood === 'number' ? s.likelihood : 50,
        potentialDamage: (s.potentialDamage as string) || '',
        affectedParties: Array.isArray(s.affectedParties) ? s.affectedParties as string[] : [],
        precedents: Array.isArray(s.precedents) ? s.precedents as string[] : [],
        selected: false
      }));
    } catch (error) {
      console.error('Error generating scenarios:', error);
      return generateFallbackScenarios(horizon);
    }
  }, [company]);

  // Fallback scenarios
  const generateFallbackScenarios = useCallback((horizon: TimeHorizon): DoomsdayScenario[] => {
    const templates: Record<TimeHorizon, Array<{ title: string; description: string; category: RiskCategory; severity: SeverityLevel }>> = {
      '1-year': [
        { title: `${company.name} Data Breach Exposes 50 Million Customer Records`, description: `A sophisticated cyberattack compromises ${company.name}'s customer database, exposing personal information, payment details, and private communications.`, category: 'technological', severity: 'catastrophic' },
        { title: `${company.name} Workers Stage Nationwide Strike Over Safety Conditions`, description: `Employees walk off the job citing unsafe working conditions and inadequate pay, bringing operations to a halt.`, category: 'social', severity: 'severe' },
      ],
      '5-year': [
        { title: `${company.name} Implicated in Major Environmental Contamination`, description: `Investigation reveals years of toxic waste disposal affecting local water supplies and causing health issues in surrounding communities.`, category: 'environmental', severity: 'catastrophic' },
        { title: `${company.name} Faces Antitrust Action, Forced Breakup Looms`, description: `Federal regulators move to break up ${company.name} citing monopolistic practices that harm consumers and competitors.`, category: 'regulatory', severity: 'severe' },
      ],
      '10-year': [
        { title: `${company.name}'s Business Model Collapses as Industry Disrupted`, description: `Technological advances and changing consumer preferences render ${company.name}'s core business obsolete.`, category: 'technological', severity: 'catastrophic' },
        { title: `${company.name} Supply Chain Failure Triggers Global Shortage`, description: `Climate disasters and geopolitical instability disrupt supply chains, causing widespread product shortages.`, category: 'operational', severity: 'severe' },
      ],
      '50-year': [
        { title: `${company.name} Legacy: The Corporate Catastrophe That Changed Regulations`, description: `Historians document how ${company.name}'s actions contributed to a major societal or environmental crisis, leading to sweeping reforms.`, category: 'reputational', severity: 'catastrophic' },
        { title: `${company.name} Archives Reveal Decades of Concealed Harm`, description: `Leaked internal documents from ${company.name} show executives knew about harmful effects of their products for decades.`, category: 'social', severity: 'catastrophic' },
      ],
    };

    return templates[horizon].map(t => ({
      id: generateScenarioId(),
      companyName: company.name,
      timeHorizon: horizon,
      title: t.title,
      description: t.description,
      category: t.category,
      severity: t.severity,
      likelihood: 30 + Math.random() * 40,
      potentialDamage: `Significant ${t.category} damage affecting multiple stakeholder groups`,
      affectedParties: ['Employees', 'Customers', 'Communities', 'Shareholders'],
      precedents: [],
      selected: false
    }));
  }, [company.name]);

  // Run the analysis workflow
  const runWorkflow = useCallback(async () => {
    const allScenarios: DoomsdayScenario[] = [];
    
    // Opening
    addChatMessage('apparatus', pickRandom([
      `INITIATING DOOMSDAY SCENARIO ANALYSIS FOR ${company.name.toUpperCase()} — ALL RISK VECTORS ONLINE —`,
      `SCENARIO ANALYSIS PROTOCOL ENGAGED — TARGET: ${company.name.toUpperCase()} — SCANNING RISK LANDSCAPE —`,
      `DOOMSDAY MATRIX ACTIVATED — SUBJECT: ${company.name.toUpperCase()} — THREAT DETECTION COMMENCING —`,
      `RISK ANALYSIS SEQUENCE INITIATED — ${company.name.toUpperCase()} — ALL AGENTS REPORTING FOR ANALYSIS DUTY —`,
    ]));
    addChatMessage('mike', pickRandom([
      `*opens dossier* ${company.name}. ${company.industry}. Let's see what catastrophes are lurking in their future.`,
      `*spreads files across table* ${company.name}. ${company.sector}. Twenty-two years doing this — I can smell the risk from here.`,
      `*lights cigarette, reads file* ${company.name}. ${company.industry}. The brief says "risk analysis." The brief means "find what they're hiding."`,
      `*pins company profile to board* ${company.name}. Big company. Big risks. Let's find the ones nobody wants to talk about.`,
      `*cracks knuckles, opens file* ${company.name}. ${company.sector} sector. Everyone thinks they're safe until someone does what we're about to do.`,
      `*adjusts reading glasses* ${company.name}. I've seen companies like this before. The question isn't IF something goes wrong. It's WHEN, and HOW BAD.`,
    ]));
    
    await delayOrSkip(2000);
    
    // Phase 1: Company Analysis
    setCurrentPhase(1);
    setPhaseLabel('COMPANY PROFILE ANALYSIS');
    
    moveAgentTo('mike', { x: 480, y: 140 }, 'analyzing', 'Reviewing company profile...');
    updateTaskStatus('task-1', 'in-progress');
    addChatMessage('mike', pickRandom([
      `${company.name}. ${company.sector} sector. Known risk areas: ${company.riskProfile.slice(0, 3).join(', ')}. This should be... interesting.`,
      `*taps file* ${company.name} operates in ${company.industry}. Risk profile includes: ${company.riskProfile.slice(0, 3).join(', ')}. That's a lot of surface area for disaster.`,
      `${company.sector}. The risk vectors here — ${company.riskProfile.slice(0, 3).join(', ')} — each one of these could be a headline. Let's figure out which ones will be.`,
      `Company profile: ${company.name}. Industry: ${company.industry}. Key exposures: ${company.riskProfile.slice(0, 3).join(', ')}. *circles three items* These are the ones that keep their board up at night.`,
      `*reads aloud* "${company.name}. ${company.sector}." Known weaknesses: ${company.riskProfile.slice(0, 3).join(', ')}. I already see four ways this goes wrong. At minimum.`,
      `${company.name}. ${company.industry}. Risk areas: ${company.riskProfile.slice(0, 3).join(', ')}. Every one of these is a ticking clock. The question is which alarm goes off first.`,
    ]));
    
    await delayOrSkip(2000);
    
    createWorkItem('mike', 'analysis',
      `COMPANY PROFILE:\n${company.name}\n\nIndustry: ${company.industry}\nSector: ${company.sector}\n\nRisk Areas:\n${company.riskProfile.map(r => `• ${r}`).join('\n')}`,
      { x: 400, y: 80 }, 1, true
    );
    
    updateTaskStatus('task-1', 'done');
    
    await delayOrSkip(2000);
    
    // Phase 1b: Risk Categories
    moveAgentTo('poole', { x: 820, y: 140 }, 'thinking', 'Mapping risk categories...');
    updateTaskStatus('task-2', 'in-progress');
    addChatMessage('poole', pickRandom([
      `The Doomsday Matrix™ identifies key vectors: ${company.riskProfile.slice(0, 4).join(', ')}. Each one a potential apocalypse.`,
      `*approaches whiteboard* The risk topology is forming. Key vectors: ${company.riskProfile.slice(0, 4).join(', ')}. Each represents what I call a "catastrophe pathway." Let me map them.`,
      `Fascinating. Applying the Poole Risk Framework, I see ${company.riskProfile.length} primary threat categories: ${company.riskProfile.slice(0, 4).join(', ')}. The intersections between them are where the real danger lies.`,
      `*pulls out colored markers* The risk architecture is complex. ${company.riskProfile.slice(0, 4).join(', ')} — these aren't independent vectors. They interact. They amplify. That's what makes this analysis interesting.`,
      `My preliminary mapping identifies ${company.riskProfile.length} risk domains: ${company.riskProfile.slice(0, 4).join(', ')}. Per the Poole System, each domain has secondary and tertiary failure modes. We'll need to examine all of them.`,
      `*adjusts glasses, studies data* ${company.riskProfile.slice(0, 4).join(', ')} — these are the surface-level risks. But the Doomsday Matrix reveals deeper structural vulnerabilities. I'll need the full analysis to confirm.`,
    ]));
    
    await delayOrSkip(2000);
    
    createWorkItem('poole', 'category',
      `RISK CATEGORIES:\n\n${company.riskProfile.map(r => `⚠️ ${r.toUpperCase()}`).join('\n')}`,
      { x: 740, y: 80 }, 1, true
    );
    
    updateTaskStatus('task-2', 'done');
    
    await delayOrSkip(2000);
    
    // Phase 2: Near-term analysis (1-year, 5-year)
    setCurrentPhase(2);
    setPhaseLabel('NEAR-TERM THREAT ANALYSIS');
    
    // 1-year scenarios
    moveAgentTo('the-cell', { x: 1180, y: 140 }, 'researching', 'Researching 1-year threats...');
    updateTaskStatus('task-3', 'in-progress');
    addChatMessage('the-cell', pickRandom([
      `[VERA]: What could go wrong in the next 12 months? [GJON]: Everything. [THURSDAY]: *researching intensifies*`,
      `[GJON]: One year. Imminent threats. The kind that are already forming in the supply chain right now. [VERA]: Let's be systematic. [THURSDAY]: *pulling data, silent*`,
      `[VERA]: Near-term analysis first. What's the 12-month outlook? [GJON]: Bleak. As always. [THURSDAY]: *already three index cards deep*`,
      `[GJON]: The one-year horizon is where the real dangers live. Things that are already happening. [VERA]: Focus. [THURSDAY]: *nods, opens research files*`,
      `[VERA]: Twelve-month threat assessment. Go. [GJON]: This is the part where we find what they're already ignoring. [THURSDAY]: *begins mapping connections*`,
      `[GJON]: One year out. The threats that are already in the pipeline. [VERA]: Let's document them before they document themselves. [THURSDAY]: *writing rapidly*`,
    ]));
    
    await delayOrSkip(2000);
    
    const oneYearScenarios = await generateScenariosWithAI('1-year', 'the-cell');
    allScenarios.push(...oneYearScenarios);
    
    for (const scenario of oneYearScenarios) {
      createWorkItem('the-cell', 'scenario',
        `⚡ 1-YEAR THREAT:\n"${scenario.title}"\n\n${scenario.description.slice(0, 100)}...`,
        { x: TIMELINE_ZONES['1-year'].x + Math.random() * 50, y: TIMELINE_ZONES['1-year'].y + 20 }, 
        2, true, '1-year', scenario
      );
      addChatMessage('the-cell', pickRandom([
        `[THURSDAY]: IDENTIFIED — "${scenario.title}" (${scenario.severity})`,
        `[GJON]: There it is. "${scenario.title}" — ${scenario.severity}. That's a real one.`,
        `[VERA]: Logging threat: "${scenario.title}." Severity: ${scenario.severity}. This needs attention.`,
        `[THURSDAY]: *pins card to board* "${scenario.title}" — ${scenario.severity}. *taps it twice*`,
        `[GJON]: "${scenario.title}" — rated ${scenario.severity}. This one has teeth.`,
        `[VERA]: Captured: "${scenario.title}." ${scenario.severity} severity. Adding to the matrix.`,
      ]));
      await delayOrSkip(1500);
    }
    
    updateTaskStatus('task-3', 'done');
    
    // 5-year scenarios
    moveAgentTo('burl', { x: 480, y: 360 }, 'analyzing', 'Analyzing 5-year scenarios...');
    updateTaskStatus('task-4', 'in-progress');
    addChatMessage('burl', pickRandom([
      `Looking five years out... the patterns emerge. The cracks become canyons.`,
      `*squints at timeline* Five years. That's when the slow problems become fast problems. I've seen this before.`,
      `*stares into middle distance* Five-year horizon. The risks that look manageable today become monsters by then. I can see the pictures forming.`,
      `*sketches timeline on napkin* Five years out, the small cracks become structural failures. ${company.name}'s got some cracks worth examining.`,
      `Half a decade. Long enough for a trend to become a crisis. Let me look at what's building under the surface.`,
      `*pulls out reference photos* Five years. Things that seem distant feel that way until they don't. Let's map what's coming.`,
    ]));
    
    await delayOrSkip(2000);
    
    const fiveYearScenarios = await generateScenariosWithAI('5-year', 'burl');
    allScenarios.push(...fiveYearScenarios);
    
    for (const scenario of fiveYearScenarios) {
      createWorkItem('burl', 'scenario',
        `📅 5-YEAR RISK:\n"${scenario.title}"\n\n${scenario.description.slice(0, 100)}...`,
        { x: TIMELINE_ZONES['5-year'].x + Math.random() * 50, y: TIMELINE_ZONES['5-year'].y + 20 },
        2, true, '5-year', scenario
      );
      addChatMessage('burl', pickRandom([
        `*pins reference* "${scenario.title}" — I can already see the visual for this one.`,
        `PROJECTED — "${scenario.title}." The cracks are visible if you know where to look.`,
        `*nods slowly* "${scenario.title}." Five years feels far away until it doesn't.`,
        `There. "${scenario.title}." That's the kind of scenario that starts small and ends big.`,
        `*sketches thumbnail* "${scenario.title}" — this one has a visual language I recognize. Inevitable.`,
        `"${scenario.title}" — mapped. The picture is already forming in my head.`,
      ]));
      await delayOrSkip(1500);
    }
    
    updateTaskStatus('task-4', 'done');
    
    await delayOrSkip(2000);
    
    // Phase 3: Long-term analysis (10-year, 50-year)
    setCurrentPhase(3);
    setPhaseLabel('LONG-TERM RISK PROJECTION');
    
    // 10-year scenarios
    moveAgentTo('nadya', { x: 820, y: 360 }, 'analyzing', 'Projecting 10-year risks...');
    updateTaskStatus('task-5', 'in-progress');
    addChatMessage('nadya', pickRandom([
      `Ten years. Enough time for small problems to become existential threats. I have seen it before.`,
      `*lights cigarette* A decade. In Soviet planning, decade was minimum unit of meaningful prediction. The schedule extends.`,
      `*checks calendar* Ten-year projection window. Long enough for regulations to change, markets to shift, and chickens to come home to roost.`,
      `Ten years. Valentina Tereshkova's orbit happened in less time than this. What disasters can develop in a decade? Many. I will document them.`,
      `*taps clipboard* Decade-scale analysis. The problems that feel theoretical today become budgetary reality by then. I know timelines.`,
      `A ten-year window. Enough time for every risk that management is currently ignoring to mature into a full-grown catastrophe. Proceed.`,
    ]));
    
    await delayOrSkip(2000);
    
    const tenYearScenarios = await generateScenariosWithAI('10-year', 'nadya');
    allScenarios.push(...tenYearScenarios);
    
    for (const scenario of tenYearScenarios) {
      createWorkItem('nadya', 'scenario',
        `🔮 10-YEAR PROJECTION:\n"${scenario.title}"\n\n${scenario.description.slice(0, 100)}...`,
        { x: TIMELINE_ZONES['10-year'].x + Math.random() * 50, y: TIMELINE_ZONES['10-year'].y + 20 },
        3, true, '10-year', scenario
      );
      addChatMessage('nadya', pickRandom([
        `*notes time* "${scenario.title.slice(0, 50)}..." — logged with timestamp. The schedule absorbs this.`,
        `Scenario documented: "${scenario.title.slice(0, 50)}..." — timeline implications calculated.`,
        `*checks watch* "${scenario.title.slice(0, 50)}..." — filed. Every disaster has a deadline. This one too.`,
        `"${scenario.title.slice(0, 50)}..." — recorded. The ten-year window accommodates this threat.`,
        `*taps clipboard* "${scenario.title.slice(0, 50)}..." — added to projection matrix. Proceed.`,
        `Noted: "${scenario.title.slice(0, 50)}..." — the schedule will account for this scenario.`,
      ]));
      await delayOrSkip(1500);
    }
    
    updateTaskStatus('task-5', 'done');
    
    // 50-year scenarios
    moveAgentTo('delmore', { x: 1180, y: 360 }, 'thinking', 'Extrapolating 50-year futures...');
    updateTaskStatus('task-6', 'in-progress');
    addChatMessage('delmore', pickRandom([
      `*stares into the abyss* Fifty years. What legacy will ${company.name} leave? Let's find out.`,
      `*adjusts collar* Half a century. That's generational. What will ${company.name} mean to our grandchildren? I'm afraid to find out. But it's my job.`,
      `*distributes hard candies for strength* Fifty years out. This is where we stop being analysts and start being historians of the future. ${company.name}'s long shadow.`,
      `*opens fresh notebook* Fifty years. Most companies don't survive fifty years. The question is: what does ${company.name} leave behind when it's gone? Or worse — what does it leave behind while it's still here?`,
      `*settles in with coffee* The fifty-year view. This is where we ask not "what goes wrong" but "what permanent mark does ${company.name} leave on the world?" Sometimes the answer is... heavy.`,
      `*warm but serious* Now friends, the fifty-year horizon is different. We're not predicting — we're imagining. What story will historians tell about ${company.name}? Let's write that story first.`,
    ]));
    
    await delayOrSkip(2000);
    
    const fiftyYearScenarios = await generateScenariosWithAI('50-year', 'delmore');
    allScenarios.push(...fiftyYearScenarios);
    
    for (const scenario of fiftyYearScenarios) {
      createWorkItem('delmore', 'scenario',
        `🌌 50-YEAR VISION:\n"${scenario.title}"\n\n${scenario.description.slice(0, 100)}...`,
        { x: TIMELINE_ZONES['50-year'].x + Math.random() * 50, y: TIMELINE_ZONES['50-year'].y + 20 },
        3, true, '50-year', scenario
      );
      addChatMessage('delmore', pickRandom([
        `*transcribing carefully* "${scenario.title.slice(0, 40)}..." — this one will need delicate framing for the client.`,
        `*adjusts glasses, writes* "${scenario.title.slice(0, 40)}..." — heavy. But important. The truth always is.`,
        `*warm but serious* "${scenario.title.slice(0, 40)}..." — fifty years is a long shadow. I'll find the words.`,
        `*notes in leather journal* "${scenario.title.slice(0, 40)}..." — generational. The kind of scenario that defines a company's legacy.`,
        `*offers candy to self for strength* "${scenario.title.slice(0, 40)}..." — documented. Some futures need to be spoken aloud to be prevented.`,
        `*pauses, then writes* "${scenario.title.slice(0, 40)}..." — this will require my most careful translation when the time comes.`,
      ]));
      await delayOrSkip(1500);
    }
    
    updateTaskStatus('task-6', 'done');
    
    await delayOrSkip(2000);
    
    // Phase 4: Compilation
    setCurrentPhase(4);
    setPhaseLabel('COMPILING DOOMSDAY REPORT');
    
    moveAgentTo('apparatus', { x: 820, y: 580 }, 'typing', 'Compiling analysis...');
    updateTaskStatus('task-7', 'in-progress');
    addChatMessage('apparatus', pickRandom([
      `COMPILING ${allScenarios.length} DOOMSDAY SCENARIOS — AGGREGATION IN PROGRESS —`,
      `SYNTHESIS INITIATED — ${allScenarios.length} CATASTROPHE VECTORS — CROSS-REFERENCING TIMELINES —`,
      `DOSSIER ASSEMBLY — ${allScenarios.length} SCENARIOS ACROSS ALL HORIZONS — COMPILING FINAL REPORT —`,
      `FINAL AGGREGATION — ${allScenarios.length} RISK EVENTS CATALOGUED — GENERATING SUMMARY —`,
    ]));
    
    await delayOrSkip(2000);
    
    setScenarios(allScenarios);
    
    createWorkItem('apparatus', 'analysis',
      `✓ ANALYSIS COMPLETE\n\n${allScenarios.length} scenarios identified:\n• ${allScenarios.filter(s => s.timeHorizon === '1-year').length} 1-year threats\n• ${allScenarios.filter(s => s.timeHorizon === '5-year').length} 5-year risks\n• ${allScenarios.filter(s => s.timeHorizon === '10-year').length} 10-year projections\n• ${allScenarios.filter(s => s.timeHorizon === '50-year').length} 50-year visions`,
      { x: 760, y: 520 }, 4, false
    );
    
    updateTaskStatus('task-7', 'done');
    setPhaseLabel('✓ ANALYSIS COMPLETE');
    
    addChatMessage('apparatus', pickRandom([
      `DOOMSDAY REPORT READY — ${allScenarios.length} SCENARIOS IDENTIFIED — ${new Date().toLocaleTimeString()} —`,
      `ANALYSIS COMPILATION SUCCESSFUL — ${allScenarios.length} CATASTROPHE VECTORS MAPPED — REPORT FINALIZED —`,
      `RISK MATRIX COMPLETE — ${allScenarios.length} SCENARIOS CATALOGUED ACROSS ALL TIME HORIZONS — READY FOR REVIEW —`,
      `DOOMSDAY INDEX COMPILED — ${allScenarios.length} POTENTIAL DISASTERS DOCUMENTED — STANDING BY —`,
    ]));
    addChatMessage('mike', pickRandom([
      `The future is bleak. Or at least, it will be if ${company.name} doesn't get ahead of these. Your move.`,
      `*stubs cigarette* ${allScenarios.length} ways it could go wrong. And those are just the ones we found. The ones we didn't find are worse. Choose wisely.`,
      `That's the picture. ${allScenarios.length} scenarios, none of them pretty. ${company.name}'s got some decisions to make. So do we.`,
      `*closes dossier* ${allScenarios.length} potential disasters. Some imminent, some generational. All real. Now we decide which ones to apologize for.`,
      `Twenty-two years and I still get a chill reading these. ${allScenarios.length} scenarios for ${company.name}. Pick the ones that keep you up at night.`,
      `The analysis is done. ${allScenarios.length} ways ${company.name} could make history — and not the kind they put in annual reports. Time to choose our battles.`,
    ]));
    addChatMessage('apparatus', pickRandom([
      `ANALYSIS COMPLETE — Select "CONTINUE TO SCENARIOS" to proceed to campaign selection —`,
      `REPORT FINALIZED — Awaiting user input — Press "CONTINUE TO SCENARIOS" when ready —`,
      `DOOMSDAY INDEX SEALED — Review complete — Proceed via "CONTINUE TO SCENARIOS" —`,
      `ALL SCENARIOS DOCUMENTED — The Apparatus awaits your selection — "CONTINUE TO SCENARIOS" to proceed —`,
    ]));
    
    setAgents(prev => prev.map(a => ({ ...a, status: 'idle', action: '', isActive: false })));
    setIsRunning(false);
    setIsAnalysisComplete(true);
    
    // NOTE: We no longer auto-advance. User must click the continue button.
    
  }, [company, addChatMessage, createWorkItem, moveAgentTo, updateTaskStatus, generateScenariosWithAI, generateFallbackScenarios]);

  // Handler for user to manually continue to scenario selection
  const handleContinueToScenarios = useCallback(() => {
    const summary = `${company.name}'s risk profile reveals ${scenarios.length} potential doomsday scenarios across multiple time horizons. Key threats span ${[...new Set(scenarios.map(s => s.category))].join(', ')}.`;
    
    onComplete({
      company: company.name,
      analyzedAt: Date.now(),
      scenarios: scenarios,
      summary
    });
  }, [company, scenarios, onComplete]);

  const handleStart = useCallback(() => {
    setIsRunning(true);
    setWorkItems([]);
    setChatMessages([]);
    setScenarios([]);
    setTasks(generateTasks());
    setCurrentPhase(0);
    setPhaseLabel('Starting analysis...');
    
    setAgents(prev => prev.map(agent => ({
      ...agent,
      status: 'idle',
      action: '',
      isActive: false,
      position: {
        x: agent.workZone.x + agent.workZone.width / 2,
        y: agent.workZone.y + agent.workZone.height / 2,
      },
      targetPosition: {
        x: agent.workZone.x + agent.workZone.width / 2,
        y: agent.workZone.y + agent.workZone.height / 2,
      },
    })));
    
    setTimeout(() => runWorkflow(), 500);
  }, [generateTasks, runWorkflow]);

  const handleSkipToEnd = useCallback(() => {
    skipRef.current = true;
    addChatMessage('apparatus', pickRandom([
      `FAST FORWARD ENGAGED — Completing analysis at accelerated pace —`,
      `ACCELERATION PROTOCOL ACTIVATED — Compressing remaining analysis into rapid sequence —`,
      `TIME COMPRESSION ENGAGED — All agents operating at maximum throughput —`,
      `SKIP INITIATED — Collapsing remaining phases into summary output —`,
    ]));
  }, [addChatMessage]);

  const handleReset = () => {
    setIsRunning(false);
    setIsAnalysisComplete(false);
    skipRef.current = false;
    typingRef.current.forEach(t => clearInterval(t));
    setWorkItems([]);
    setChatMessages([]);
    setScenarios([]);
    setTasks(generateTasks());
    setCurrentPhase(0);
    setPhaseLabel('Ready to analyze');
    setAgents(prev => prev.map(agent => ({
      ...agent,
      status: 'idle',
      action: '',
      isActive: false,
      position: {
        x: agent.workZone.x + agent.workZone.width / 2,
        y: agent.workZone.y + agent.workZone.height / 2,
      },
      targetPosition: {
        x: agent.workZone.x + agent.workZone.width / 2,
        y: agent.workZone.y + agent.workZone.height / 2,
      },
    })));
  };

  // NOTE: We no longer auto-start. User must click START ANALYSIS button.

  const taskCounts = {
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    done: tasks.filter(t => t.status === 'done').length,
  };

  return (
    <div className="canvas-workspace-v2 scenario-analysis-workspace">
      {/* Control Bar */}
      <div className="controls-bar">
        <div className="controls-left">
          {onBack && (
            <button className="control-btn back-btn" onClick={onBack}>
              <ArrowLeft size={16} weight="bold" />
              <span>Back</span>
            </button>
          )}
          {!isRunning && !isAnalysisComplete && (
            <button className="control-btn start-btn" onClick={handleStart}>
              <Play size={16} weight="bold" />
              <span>START ANALYSIS</span>
            </button>
          )}
          {isRunning && (
            <>
              <button className="control-btn skip-btn" onClick={handleSkipToEnd}>
                <FastForward size={16} weight="bold" />
                <span>SKIP TO END</span>
              </button>
              <button className="control-btn pause-btn" onClick={handleReset}>
                <Stop size={16} weight="bold" />
                <span>STOP</span>
              </button>
            </>
          )}
          {isAnalysisComplete && (
            <button className="control-btn continue-btn" onClick={handleContinueToScenarios}>
              <ArrowRight size={16} weight="bold" />
              <span>CONTINUE TO SCENARIOS</span>
            </button>
          )}
          <button className="control-btn reset-btn" onClick={handleReset}>
            <ArrowCounterClockwise size={16} weight="bold" />
            <span>RESET</span>
          </button>
        </div>
        
        <div className="controls-center">
          <div className="phase-indicator">{phaseLabel}</div>
          <span className="item-count">
            {company.name} • {scenarios.length} scenarios found
          </span>
        </div>
        
        <div className="controls-right">
          <span className="task-summary">
            {taskCounts.todo} todo • {taskCounts.inProgress} active • {taskCounts.done} done
          </span>
          <span className="zoom-level">{Math.round(zoom * 100)}%</span>
        </div>
      </div>

      {/* Company Banner */}
      <div className="scenario-banner">
        <span className="banner-label">ANALYZING:</span>
        <span className="banner-title">{company.name}</span>
        <span className="banner-meta">{company.industry} • {company.sector}</span>
      </div>

      {/* Main Content Area */}
      <div className="main-content-area">
        {/* Main Canvas */}
        <div 
          className={`canvas-container ${isPanning ? 'panning' : ''} ${draggedItem ? 'dragging-item' : ''}`}
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <div 
            className="canvas-content"
            style={{
              transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
            }}
          >
            {/* KANBAN BOARD */}
            <div 
              className="kanban-board-canvas"
              style={{
                left: KANBAN_ZONE.x,
                top: KANBAN_ZONE.y,
                width: KANBAN_ZONE.width,
                height: KANBAN_ZONE.height,
              }}
            >
              <div className="kanban-header">
                <span><ClipboardText size={14} weight="bold" /> ANALYSIS TASKS</span>
                <span className="kanban-phase">Phase {currentPhase}/4</span>
              </div>
              
              <div className="kanban-column">
                <div className="column-header todo-header">
                  <span>TO DO</span>
                  <span className="column-count">{taskCounts.todo}</span>
                </div>
                <div className="column-tasks">
                  {tasks.filter(t => t.status === 'todo').map(task => {
                    const char = getCharacterInfo(task.assignee);
                    return (
                      <div key={task.id} className="kanban-task" style={{ borderLeftColor: char.color }}>
                        <span className="task-icon" style={{ color: char.color }}>{getCharacterIcon(char.icon, 14)}</span>
                        <span className="task-title">{task.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="kanban-column">
                <div className="column-header progress-header">
                  <span>IN PROGRESS</span>
                  <span className="column-count">{taskCounts.inProgress}</span>
                </div>
                <div className="column-tasks">
                  {tasks.filter(t => t.status === 'in-progress').map(task => {
                    const char = getCharacterInfo(task.assignee);
                    return (
                      <div key={task.id} className="kanban-task active" style={{ borderLeftColor: char.color }}>
                        <span className="task-icon" style={{ color: char.color }}>{getCharacterIcon(char.icon, 14)}</span>
                        <span className="task-title">{task.title}</span>
                        <span className="task-working"><Timer size={14} weight="bold" /></span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="kanban-column">
                <div className="column-header done-header">
                  <span>DONE</span>
                  <span className="column-count">{taskCounts.done}</span>
                </div>
                <div className="column-tasks">
                  {tasks.filter(t => t.status === 'done').map(task => {
                    const char = getCharacterInfo(task.assignee);
                    return (
                      <div key={task.id} className="kanban-task done" style={{ borderLeftColor: char.color }}>
                        <span className="task-icon" style={{ color: char.color }}>{getCharacterIcon(char.icon, 14)}</span>
                        <span className="task-title">{task.title}</span>
                        <span className="task-check"><Check size={14} weight="bold" /></span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Work Zone Labels */}
            {Object.entries(WORK_ZONES).map(([agentId, zone]) => {
              const char = getCharacterInfo(agentId as CharacterId);
              const agent = agents.find(a => a.id === agentId);
              const isActive = agent?.isActive;
              return (
                <div
                  key={`zone-${agentId}`}
                  className={`work-zone ${isActive ? 'active' : ''}`}
                  style={{
                    left: zone.x,
                    top: zone.y,
                    width: zone.width,
                    height: zone.height,
                    borderColor: isActive ? char.color : char.color + '20',
                  }}
                >
                  <span 
                    className="zone-label-corner" 
                    style={{ 
                      color: '#fff', 
                      backgroundColor: char.color,
                    }}
                  >
                    {getCharacterIcon(char.icon, 12)} {char.name}
                  </span>
                </div>
              );
            })}

            {/* Timeline Zones */}
            {Object.entries(TIMELINE_ZONES).map(([horizon, zone]) => (
              <div
                key={`timeline-${horizon}`}
                className="timeline-zone"
                style={{
                  left: zone.x,
                  top: zone.y,
                  width: zone.width,
                  height: zone.height,
                  borderColor: HORIZON_COLORS[horizon as TimeHorizon],
                }}
              >
                <span 
                  className="timeline-label"
                  style={{ backgroundColor: HORIZON_COLORS[horizon as TimeHorizon] }}
                >
                  {getHorizonLabel(horizon as TimeHorizon)}
                </span>
              </div>
            ))}

            {/* Work Items */}
            {workItems.map(item => {
              const char = getCharacterInfo(item.createdBy);
              return (
                <div
                  key={item.id}
                  className={`work-item ${item.type} ${item.isTyping ? 'typing' : ''} ${item.isDragging ? 'dragging' : ''} ${item.timeHorizon ? 'scenario-item' : ''}`}
                  style={{
                    left: item.position.x,
                    top: item.position.y,
                    backgroundColor: item.color,
                    borderLeftColor: item.timeHorizon ? HORIZON_COLORS[item.timeHorizon] : char.color,
                    cursor: 'grab',
                    zIndex: item.isDragging ? 1000 : 10,
                  }}
                  onMouseDown={(e) => handleItemMouseDown(e, item.id)}
                >
                  <pre className="item-content">{item.displayedContent || item.content}{item.isTyping && <span className="cursor">|</span>}</pre>
                  <div className="item-author" style={{ backgroundColor: item.timeHorizon ? HORIZON_COLORS[item.timeHorizon] : char.color }}>
                    {item.timeHorizon ? getHorizonIcon(item.timeHorizon, 12) : getCharacterIcon(char.icon, 12)}
                  </div>
                </div>
              );
            })}

            {/* Agent Cursors */}
            {agents.map(agent => {
              const char = getCharacterInfo(agent.id);
              if (!agent.isActive) return null;
              return (
                <div
                  key={agent.id}
                  className={`agent-cursor-v2 ${agent.status} active`}
                  style={{
                    left: agent.position.x,
                    top: agent.position.y,
                  }}
                >
                  <svg className="cursor-svg" width="20" height="20" viewBox="0 0 24 24">
                    <path
                      d="M5.65 2.65L19.35 12L12 14L9 21L5.65 2.65Z"
                      fill={char.color}
                      stroke="#fff"
                      strokeWidth="1.5"
                    />
                  </svg>
                  
                  {agent.action && (
                    <div className="cursor-action-label" style={{ backgroundColor: char.color }}>
                      {agent.action}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="canvas-hint">Drag items to rearrange • Scroll to pan • Pinch to zoom</div>
        </div>

        {/* Chat Panel */}
        <div className="chat-panel">
          <div className="chat-header">
            <span className="chat-title">AGENT DIALOGUE</span>
            <span className="chat-phase">Phase {currentPhase}/4</span>
          </div>
          <div className="chat-messages" ref={chatMessagesRef}>
            {chatMessages.map(msg => {
              const char = getCharacterInfo(msg.from);
              return (
                <div key={msg.id} className="chat-message" style={{ borderLeftColor: char.color }}>
                  <div className="chat-sender">
                    <span className="chat-icon" style={{ color: char.color }}>{getCharacterIcon(char.icon, 14)}</span>
                    <span className="chat-name" style={{ color: char.color }}>{char.name}</span>
                  </div>
                  <div className="chat-content">{msg.content}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScenarioAnalysisWorkspace;
