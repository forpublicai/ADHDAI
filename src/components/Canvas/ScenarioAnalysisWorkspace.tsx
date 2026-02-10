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
import { generateDialogueBatch, generateAgentLine, sendUserMessageToAgent, clearConversationHistory } from '../../services/dialogueService';
import './CanvasWorkspace.css';
import './ScenarioAnalysisWorkspace.css';

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
  
  // User-to-bot messaging state
  const [selectedAgent, setSelectedAgent] = useState<CharacterId | null>(null);
  const [userInput, setUserInput] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  
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

  // Handle user sending a direct message to an agent
  const handleSendUserMessage = useCallback(async () => {
    if (!selectedAgent || !userInput.trim() || isSendingMessage) return;
    
    const message = userInput.trim();
    setUserInput('');
    setIsSendingMessage(true);
    
    // Add user message to chat
    setChatMessages(prev => [...prev.slice(-30), {
      id: `chat-${chatIdRef.current++}`,
      from: selectedAgent,
      content: `[YOU → ${CHARACTERS.find(c => c.id === selectedAgent)?.name || selectedAgent}]: ${message}`,
      timestamp: Date.now(),
    }]);
    
    try {
      const workContext = `Analyzing ${company.name} (${company.industry}). Doomsday scenario analysis in progress. Phase: ${currentPhase}. ${scenarios.length} scenarios identified so far. Recent messages: ${chatMessages.slice(-5).map(m => `${CHARACTERS.find(c => c.id === m.from)?.name}: ${m.content.slice(0, 50)}`).join('; ')}`;
      
      const response = await sendUserMessageToAgent(selectedAgent, message, workContext);
      addChatMessage(selectedAgent, response);
    } catch (error) {
      console.error('Error sending message to agent:', error);
      addChatMessage(selectedAgent, '*looks up briefly* Give me a moment.');
    }
    
    setIsSendingMessage(false);
  }, [selectedAgent, userInput, isSendingMessage, company, currentPhase, scenarios.length, chatMessages, addChatMessage]);

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

  // ============================================
  // MERGE ON OVERLAP — when items overlap, generate a new combined idea
  // ============================================
  const generateMergeConversation = useCallback(async (item1: WorkItem, item2: WorkItem): Promise<void> => {
    const agent1 = getCharacterInfo(item1.createdBy);
    const agent2 = getCharacterInfo(item2.createdBy);
    const content1 = (item1.content || '').slice(0, 200);
    const content2 = (item2.content || '').slice(0, 200);
    const mergeContext = `Company: ${company.name}. Scenario analysis. Item 1 (${agent1.name}): "${content1}". Item 2 (${agent2.name}): "${content2}".`;

    // Generate merged idea + dialogue in parallel
    const [mergedIdea, dialogueLines] = await Promise.all([
      generateAgentLine('apparatus',
        `Synthesize these two risk analysis items for ${company.name} into a NEW combined insight. Item 1 from ${agent1.name}: "${content1}". Item 2 from ${agent2.name}: "${content2}". Create a merged analysis with a title, 2-3 sentences showing the connection, and 3 bullet points with key implications.`,
        mergeContext
      ),
      generateDialogueBatch(
        [item1.createdBy, item2.createdBy],
        `${agent1.name} and ${agent2.name} discover their analysis items overlap — they see connections between "${content1}" and "${content2}". They realize the combination reveals a deeper risk pattern. ${agent1.name} speaks first, ${agent2.name} builds on it.`,
        mergeContext
      )
    ]);

    // Play out conversation
    addChatMessage(item1.createdBy, dialogueLines[item1.createdBy]);
    
    setTimeout(() => {
      addChatMessage(item2.createdBy, dialogueLines[item2.createdBy]);
    }, 1500);

    setTimeout(() => {
      // Create the merged work item at the midpoint
      const midX = (item1.position.x + item2.position.x) / 2;
      const midY = Math.max(item1.position.y, item2.position.y) + 130;
      
      createWorkItem(
        item1.createdBy,
        'analysis',
        mergedIdea,
        { x: midX, y: midY },
        currentPhase,
        true // Type it out
      );
      
      // Apparatus logs the merge
      generateAgentLine('apparatus',
        `${agent1.name} and ${agent2.name} combined their analysis items into a deeper insight about ${company.name}. Log the synthesis.`,
        mergeContext
      ).then(line => addChatMessage('apparatus', line));
    }, 3000);
  }, [company.name, addChatMessage, createWorkItem, currentPhase, getCharacterInfo]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    if (draggedItem) {
      // Check for collision with other items
      const draggedItemData = workItems.find(item => item.id === draggedItem);
      if (draggedItemData) {
        const collidingItem = workItems.find(item => {
          if (item.id === draggedItem) return false;
          if (item.createdBy === draggedItemData.createdBy) return false;
          const dx = Math.abs(item.position.x - draggedItemData.position.x);
          const dy = Math.abs(item.position.y - draggedItemData.position.y);
          return dx < 150 && dy < 80;
        });
        
        if (collidingItem) {
          generateMergeConversation(draggedItemData, collidingItem);
        }
      }
      
      setWorkItems(prev => prev.map(item => 
        item.id === draggedItem ? { ...item, isDragging: false } : item
      ));
      setDraggedItem(null);
    }
  }, [draggedItem, workItems, generateMergeConversation]);

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
        model: 'gpt-5.2',
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
    
    // Opening — generate all opening dialogue in one API call
    const companyContext = `${company.name} (${company.industry}, ${company.sector}). Known risk areas: ${company.riskProfile.join(', ')}. Description: ${company.description}`;
    
    const openingLines = await generateDialogueBatch(
      ['apparatus', 'mike'],
      `The team is starting a doomsday scenario analysis for ${company.name}. Apparatus initiates the protocol. Mike opens the dossier and gives his first take on the company's risk profile.`,
      companyContext
    );
    addChatMessage('apparatus', openingLines['apparatus']);
    addChatMessage('mike', openingLines['mike']);
    
    await delayOrSkip(2000);
    
    // Phase 1: Company Analysis
    setCurrentPhase(1);
    setPhaseLabel('COMPANY PROFILE ANALYSIS');
    
    moveAgentTo('mike', { x: 480, y: 140 }, 'analyzing', 'Reviewing company profile...');
    updateTaskStatus('task-1', 'in-progress');
    
    const phase1Lines = await generateDialogueBatch(
      ['mike', 'poole'],
      `Mike is reviewing the company profile in detail — sector, industry, risk areas. He shares his initial assessment. Poole follows up by mapping the risk categories through his framework.`,
      companyContext
    );
    addChatMessage('mike', phase1Lines['mike']);
    
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
    addChatMessage('poole', phase1Lines['poole']);
    
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
    
    // 1-year scenarios — generate dialogue for all horizon-analysis agents in one call
    const horizonLines = await generateDialogueBatch(
      ['the-cell', 'burl', 'nadya', 'delmore'],
      `Each agent is assigned a different time horizon to analyze for ${company.name}. The Cell researches 1-year imminent threats. Burl analyzes 5-year emerging risks. Nadya projects 10-year systemic threats. Delmore extrapolates 50-year existential scenarios. Each gives their opening reaction to their assigned horizon.`,
      companyContext
    );
    
    moveAgentTo('the-cell', { x: 1180, y: 140 }, 'researching', 'Researching 1-year threats...');
    updateTaskStatus('task-3', 'in-progress');
    addChatMessage('the-cell', horizonLines['the-cell']);
    
    await delayOrSkip(2000);
    
    const oneYearScenarios = await generateScenariosWithAI('1-year', 'the-cell');
    allScenarios.push(...oneYearScenarios);
    
    for (const scenario of oneYearScenarios) {
      createWorkItem('the-cell', 'scenario',
        `⚡ 1-YEAR THREAT:\n"${scenario.title}"\n\n${scenario.description.slice(0, 100)}...`,
        { x: TIMELINE_ZONES['1-year'].x + Math.random() * 50, y: TIMELINE_ZONES['1-year'].y + 20 }, 
        2, true, '1-year', scenario
      );
      const cellReaction = await generateAgentLine('the-cell',
        `The Cell just identified a 1-year threat: "${scenario.title}" — severity: ${scenario.severity}. They react to discovering this scenario.`,
        `${scenario.description}. Category: ${scenario.category}.`
      );
      addChatMessage('the-cell', cellReaction);
      await delayOrSkip(1500);
    }
    
    updateTaskStatus('task-3', 'done');
    
    // 5-year scenarios
    moveAgentTo('burl', { x: 480, y: 360 }, 'analyzing', 'Analyzing 5-year scenarios...');
    updateTaskStatus('task-4', 'in-progress');
    addChatMessage('burl', horizonLines['burl']);
    
    await delayOrSkip(2000);
    
    const fiveYearScenarios = await generateScenariosWithAI('5-year', 'burl');
    allScenarios.push(...fiveYearScenarios);
    
    for (const scenario of fiveYearScenarios) {
      createWorkItem('burl', 'scenario',
        `📅 5-YEAR RISK:\n"${scenario.title}"\n\n${scenario.description.slice(0, 100)}...`,
        { x: TIMELINE_ZONES['5-year'].x + Math.random() * 50, y: TIMELINE_ZONES['5-year'].y + 20 },
        2, true, '5-year', scenario
      );
      const burlReaction = await generateAgentLine('burl',
        `Burl just projected a 5-year risk scenario: "${scenario.title}" — severity: ${scenario.severity}. He reacts with his visual instincts.`,
        `${scenario.description}. Category: ${scenario.category}.`
      );
      addChatMessage('burl', burlReaction);
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
    addChatMessage('nadya', horizonLines['nadya']);
    
    await delayOrSkip(2000);
    
    const tenYearScenarios = await generateScenariosWithAI('10-year', 'nadya');
    allScenarios.push(...tenYearScenarios);
    
    for (const scenario of tenYearScenarios) {
      createWorkItem('nadya', 'scenario',
        `🔮 10-YEAR PROJECTION:\n"${scenario.title}"\n\n${scenario.description.slice(0, 100)}...`,
        { x: TIMELINE_ZONES['10-year'].x + Math.random() * 50, y: TIMELINE_ZONES['10-year'].y + 20 },
        3, true, '10-year', scenario
      );
      const nadyaReaction = await generateAgentLine('nadya',
        `Nadya just documented a 10-year projection: "${scenario.title}" — severity: ${scenario.severity}. She reacts with her deadline-focused worldview.`,
        `${scenario.description}. Category: ${scenario.category}.`
      );
      addChatMessage('nadya', nadyaReaction);
      await delayOrSkip(1500);
    }
    
    updateTaskStatus('task-5', 'done');
    
    // 50-year scenarios
    moveAgentTo('delmore', { x: 1180, y: 360 }, 'thinking', 'Extrapolating 50-year futures...');
    updateTaskStatus('task-6', 'in-progress');
    addChatMessage('delmore', horizonLines['delmore']);
    
    await delayOrSkip(2000);
    
    const fiftyYearScenarios = await generateScenariosWithAI('50-year', 'delmore');
    allScenarios.push(...fiftyYearScenarios);
    
    for (const scenario of fiftyYearScenarios) {
      createWorkItem('delmore', 'scenario',
        `🌌 50-YEAR VISION:\n"${scenario.title}"\n\n${scenario.description.slice(0, 100)}...`,
        { x: TIMELINE_ZONES['50-year'].x + Math.random() * 50, y: TIMELINE_ZONES['50-year'].y + 20 },
        3, true, '50-year', scenario
      );
      const delmoreReaction = await generateAgentLine('delmore',
        `Delmore just documented a 50-year existential scenario: "${scenario.title}" — severity: ${scenario.severity}. He reacts with his warm, humanistic perspective.`,
        `${scenario.description}. Category: ${scenario.category}.`
      );
      addChatMessage('delmore', delmoreReaction);
      await delayOrSkip(1500);
    }
    
    updateTaskStatus('task-6', 'done');
    
    await delayOrSkip(2000);
    
    // Phase 4: Compilation
    setCurrentPhase(4);
    setPhaseLabel('COMPILING DOOMSDAY REPORT');
    
    moveAgentTo('apparatus', { x: 820, y: 580 }, 'typing', 'Compiling analysis...');
    updateTaskStatus('task-7', 'in-progress');
    
    const scenarioSummary = `${allScenarios.length} total scenarios: ${allScenarios.filter(s => s.timeHorizon === '1-year').length} imminent, ${allScenarios.filter(s => s.timeHorizon === '5-year').length} near-term, ${allScenarios.filter(s => s.timeHorizon === '10-year').length} decade-scale, ${allScenarios.filter(s => s.timeHorizon === '50-year').length} generational. Top threats include: ${allScenarios.slice(0, 3).map(s => s.title).join('; ')}`;
    
    const closingLines = await generateDialogueBatch(
      ['apparatus', 'mike'],
      `The analysis is complete. Apparatus compiles the final doomsday report with all ${allScenarios.length} scenarios. Mike gives his closing assessment — world-weary but engaged. Then Apparatus tells the user to click "CONTINUE TO SCENARIOS" to proceed.`,
      `${companyContext}. ${scenarioSummary}`
    );
    
    addChatMessage('apparatus', closingLines['apparatus']);
    
    await delayOrSkip(2000);
    
    setScenarios(allScenarios);
    
    createWorkItem('apparatus', 'analysis',
      `✓ ANALYSIS COMPLETE\n\n${allScenarios.length} scenarios identified:\n• ${allScenarios.filter(s => s.timeHorizon === '1-year').length} 1-year threats\n• ${allScenarios.filter(s => s.timeHorizon === '5-year').length} 5-year risks\n• ${allScenarios.filter(s => s.timeHorizon === '10-year').length} 10-year projections\n• ${allScenarios.filter(s => s.timeHorizon === '50-year').length} 50-year visions`,
      { x: 760, y: 520 }, 4, false
    );
    
    updateTaskStatus('task-7', 'done');
    setPhaseLabel('✓ ANALYSIS COMPLETE');
    
    addChatMessage('mike', closingLines['mike']);
    
    const apparatusClosing = await generateAgentLine('apparatus',
      `Analysis is done. Tell the user to click "CONTINUE TO SCENARIOS" to proceed to campaign selection.`,
      scenarioSummary
    );
    addChatMessage('apparatus', apparatusClosing);
    
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
    clearConversationHistory();
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
    generateAgentLine('apparatus', 'Fast forward has been activated. Acknowledge the acceleration in your mechanical style.', `Analyzing ${company.name}`).then(line => {
      addChatMessage('apparatus', line);
    });
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
              const isUserMsg = msg.content.startsWith('[YOU →');
              return (
                <div key={msg.id} className={`chat-message ${isUserMsg ? 'user-message' : ''}`} style={{ borderLeftColor: isUserMsg ? '#4a9' : char.color }}>
                  <div className="chat-sender">
                    <span className="chat-icon" style={{ color: isUserMsg ? '#4a9' : char.color }}>{isUserMsg ? '👤' : getCharacterIcon(char.icon, 14)}</span>
                    <span className="chat-name" style={{ color: isUserMsg ? '#4a9' : char.color }}>{isUserMsg ? 'You' : char.name}</span>
                  </div>
                  <div className="chat-content">{isUserMsg ? msg.content.replace(/^\[YOU → [^\]]+\]: /, '') : msg.content}</div>
                </div>
              );
            })}
          </div>
          
          {/* User-to-Bot Direct Messaging */}
          <div className="chat-input-area">
            <div className="chat-agent-selector">
              {CHARACTERS.map(char => (
                <button
                  key={char.id}
                  className={`agent-select-btn ${selectedAgent === char.id ? 'selected' : ''}`}
                  style={{ color: char.color }}
                  onClick={() => setSelectedAgent(selectedAgent === char.id ? null : char.id)}
                  title={`Message ${char.name}`}
                >
                  {getCharacterIcon(char.icon, 12)}
                </button>
              ))}
            </div>
            {selectedAgent && (
              <>
                <div className="chat-selected-label">
                  <span>Talking to</span>
                  <span className="chat-selected-name" style={{ color: getCharacterInfo(selectedAgent).color }}>
                    {getCharacterInfo(selectedAgent).name}
                  </span>
                </div>
                <div className="chat-input-row">
                  <input
                    className="chat-input"
                    type="text"
                    placeholder={`Message ${getCharacterInfo(selectedAgent).name}...`}
                    value={userInput}
                    onChange={e => setUserInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSendUserMessage(); }}
                    disabled={isSendingMessage}
                  />
                  <button
                    className="chat-send-btn"
                    onClick={handleSendUserMessage}
                    disabled={!userInput.trim() || isSendingMessage}
                  >
                    {isSendingMessage ? '...' : 'Send'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScenarioAnalysisWorkspace;
