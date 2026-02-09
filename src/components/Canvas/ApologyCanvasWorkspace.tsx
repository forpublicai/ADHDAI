import React, { useEffect, useRef, useState, useCallback } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
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
  FastForward,
  Package,
  DownloadSimple,
  X,
  Check,
  Timer,
  Eye,
  Trophy,
  Star
} from '@phosphor-icons/react';
import { CHARACTERS } from '../../constants';
import { CharacterId, DoomsdayScenario, ApologyCampaign } from '../../types';
import { Fortune500Company } from '../../data/fortune500';
import { generateApologyCampaign, generateCampaignImage } from '../../services/apologyGenerator';
import { formatApologyCampaignsAsHTML, formatSingleCampaignAsHTML } from '../../services/apologyDeliverables';
import * as dialogue from '../../utils/dialogueGenerator';
import './CanvasWorkspace.css';

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


interface Position {
  x: number;
  y: number;
}

interface WorkItem {
  id: string;
  type: 'sticky' | 'headline' | 'visual' | 'mockup' | 'strategy' | 'framework' | 'draft' | 'approval' | 'board' | 'concept' | 'apology' | 'scenario' | 'schedule' | 'translation';
  content: string;
  position: Position;
  color: string;
  createdBy: CharacterId;
  timestamp: number;
  phase: number;
  isTyping?: boolean;
  displayedContent?: string;
  isDragging?: boolean;
  scenarioId?: string;
}

interface ChatMessage {
  id: string;
  from: CharacterId;
  to?: CharacterId;
  content: string;
  timestamp: number;
}

interface AgentState {
  id: CharacterId;
  position: Position;
  targetPosition: Position;
  status: 'idle' | 'moving' | 'typing' | 'thinking' | 'clicking' | 'dragging' | 'reviewing' | 'designing';
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
  scenarioId?: string;
}

interface ApologyCanvasWorkspaceProps {
  company: Fortune500Company;
  scenarios: DoomsdayScenario[];
  onComplete?: (campaigns: ApologyCampaign[]) => void;
  onBack?: () => void;
}

// Work zone definitions
const WORK_ZONES: Record<CharacterId, { x: number; y: number; width: number; height: number }> = {
  mike: { x: 380, y: 60, width: 320, height: 240 },
  poole: { x: 720, y: 60, width: 320, height: 240 },
  'the-cell': { x: 1060, y: 60, width: 380, height: 240 },
  burl: { x: 380, y: 340, width: 320, height: 240 },
  nadya: { x: 720, y: 340, width: 320, height: 240 },
  delmore: { x: 1060, y: 340, width: 380, height: 240 },
  apparatus: { x: 720, y: 620, width: 320, height: 180 },
};

const KANBAN_ZONE = { x: 30, y: 60, width: 320, height: 740 };
const FINAL_OUTPUT_ZONE = { x: 1060, y: 620, width: 380, height: 180 };

const ITEM_COLORS: Record<string, string> = {
  sticky: '#fff9c4',
  headline: '#bbdefb',
  visual: '#e1bee7',
  mockup: '#ffcdd2',
  strategy: '#c8e6c9',
  framework: '#ffe0b2',
  draft: '#f5f5f5',
  approval: '#a5d6a7',
  board: '#263238',
  concept: '#b2ebf2',
  apology: '#ffcdd2',
  scenario: '#ffd54f',
  schedule: '#b2dfdb',
  translation: '#c5e1a5',
};

const ApologyCanvasWorkspace: React.FC<ApologyCanvasWorkspaceProps> = ({ 
  company,
  scenarios,
  onComplete,
  onBack
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [agents, setAgents] = useState<AgentState[]>([]);
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [phaseLabel, setPhaseLabel] = useState('Ready to begin');
  const [campaigns, setCampaigns] = useState<ApologyCampaign[]>([]);
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [showCodePanel, setShowCodePanel] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState('');
  const [assetsReady, setAssetsReady] = useState(false);
  
  const [canvasOffset, setCanvasOffset] = useState<Position>({ x: 50, y: 20 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Position>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.75);
  
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  
  const workflowRef = useRef<NodeJS.Timeout[]>([]);
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

  // Generate initial tasks based on scenarios
  const generateTasks = useCallback((): KanbanTask[] => {
    const baseTasks: KanbanTask[] = [];
    let taskId = 1;
    
    scenarios.forEach((scenario, index) => {
      baseTasks.push(
        { id: `task-${taskId++}`, title: `Analyze: ${scenario.title}`, assignee: 'mike', status: 'todo', phase: 1, scenarioId: scenario.id },
        { id: `task-${taskId++}`, title: `Strategy for scenario ${index + 1}`, assignee: 'poole', status: 'todo', phase: 2, scenarioId: scenario.id },
        { id: `task-${taskId++}`, title: `Write apology copy ${index + 1}`, assignee: 'the-cell', status: 'todo', phase: 3, scenarioId: scenario.id },
        { id: `task-${taskId++}`, title: `Visual direction ${index + 1}`, assignee: 'burl', status: 'todo', phase: 4, scenarioId: scenario.id },
        { id: `task-${taskId++}`, title: `Production schedule ${index + 1}`, assignee: 'nadya', status: 'todo', phase: 5, scenarioId: scenario.id },
        { id: `task-${taskId++}`, title: `Client translation ${index + 1}`, assignee: 'delmore', status: 'todo', phase: 6, scenarioId: scenario.id },
        { id: `task-${taskId++}`, title: `Compile campaign ${index + 1}`, assignee: 'apparatus', status: 'todo', phase: 7, scenarioId: scenario.id }
      );
    });
    
    return baseTasks;
  }, [scenarios]);

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

  const addChatMessage = useCallback((from: CharacterId, content: string, _to?: CharacterId) => {
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
    scenarioId?: string
  ): string => {
    const id = `item-${workItemIdRef.current++}`;
    const item: WorkItem = {
      id,
      type,
      content,
      position,
      color: ITEM_COLORS[type],
      createdBy: agentId,
      timestamp: Date.now(),
      phase,
      isTyping: shouldType,
      displayedContent: shouldType ? '' : content,
      scenarioId,
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

  // Process a single scenario - ALL BOTS CONTRIBUTE TO EACH STAGE
  const processScenario = useCallback(async (scenario: DoomsdayScenario, index: number): Promise<ApologyCampaign> => {
    const scenarioTasks = tasks.filter(t => t.scenarioId === scenario.id);
    const hl = (s?: string) => s || 'N/A'; // safe headline helper
    
    // ═══════════════════════════════════════════
    // PHASE 1: SCENARIO ANALYSIS (Mike leads)
    // ═══════════════════════════════════════════
    setCurrentPhase(1);
    setPhaseLabel(`ANALYZING SCENARIO ${index + 1}: ${scenario.title}`);
    
    moveAgentTo('mike', { x: 480, y: 140 }, 'thinking', 'Analyzing scenario...');
    addChatMessage('mike', `*slams folder on table* Alright, here's the situation: "${scenario.title}" — ${scenario.severity} severity, ${scenario.category} category. ${scenario.description} Twenty-two years I've been doing this, and I've never seen a company admit fault BEFORE the fault happens. That's the grift. That's the angle.`);
    
    await delayOrSkip(1500);
    
    // Poole reacts to the scenario
    moveAgentTo('poole', { x: 820, y: 140 }, 'thinking', 'Assessing strategic implications...');
    addChatMessage('poole', `*adjusts glasses, examines scenario* The ${scenario.category} vector is fascinating. I see at least three perception architectures forming. The timeline — ${scenario.timeHorizon} — gives us a unique rhetorical position. We're not reacting. We're PREDICTING. That's Poole Principle Seventeen: preemptive confession.`);
    
    await delayOrSkip(1200);
    
    // Cell weighs in
    moveAgentTo('the-cell', { x: 1180, y: 140 }, 'thinking', 'Evaluating creative angles...');
    addChatMessage('the-cell', `[GJON]: "${scenario.title}" — that's not a crisis, that's a HEADLINE. [VERA]: Focus. What's the human story here? [THURSDAY]: *staring at the affected parties list* ${scenario.affectedParties.slice(0, 2).join(', ')}... these are real people. The copy has to honor that.`);
    
    await delayOrSkip(1000);
    
    // Nadya flags timeline
    addChatMessage('nadya', `*checks watch* Scenario ${index + 1} of ${scenarios.length}. ${scenario.timeHorizon} timeline means production assets must feel urgent yet considered. I am building schedule already.`);
    
    // Burl sees visual potential
    addChatMessage('burl', `*squints at scenario brief* I can already see the picture. ${scenario.category} disaster... there's a visual language for this. Documentary, not commercial. Evidence, not advertising.`);
    
    await delayOrSkip(800);
    
    createWorkItem('mike', 'scenario', 
      `SCENARIO ${index + 1}:\n${scenario.title}\n\nDescription: ${scenario.description}\n\nSeverity: ${scenario.severity}\nCategory: ${scenario.category}\nTimeline: ${scenario.timeHorizon}\n\nPotential Damage: ${scenario.potentialDamage}\nAffected Parties: ${scenario.affectedParties.join(', ')}`,
      { x: 400, y: 100 }, 1, true, scenario.id
    );
    
    updateTaskStatus(scenarioTasks[0]?.id || '', 'done');
    
    // Delmore + Apparatus acknowledge
    addChatMessage('delmore', `*takes notes* I'll need to frame this for ${company.name}'s board. "${scenario.title}" becomes "Anticipated Stakeholder Alignment Opportunity." They'll never see it coming.`);
    addChatMessage('apparatus', `SCENARIO ${index + 1} LOGGED — Severity: ${scenario.severity.toUpperCase()} | Category: ${scenario.category.toUpperCase()} | All agents assigned — proceeding to strategic framework.`);
    
    await delayOrSkip(1500);
    
    // ═══════════════════════════════════════════
    // PHASE 2: STRATEGIC FRAMEWORK (Poole leads)
    // ═══════════════════════════════════════════
    setCurrentPhase(2);
    setPhaseLabel('STRATEGIC FRAMEWORK');
    
    moveAgentTo('poole', { x: 820, y: 140 }, 'typing', 'Building apology framework...');
    addChatMessage('poole', `*approaches whiteboard with fervor* What Mike has identified emotionally, I will now systematize. The Proactive Apology Matrix identifies the core tension: "${scenario.potentialDamage}" — but this isn't about the damage. It's about OWNING the narrative before it exists. We're creating "anticipatory accountability." ${company.name} doesn't need to BE sorry. They need to PERFORM sorry. And we're going to make that performance so compelling it becomes indistinguishable from sincerity.`);
    
    await delayOrSkip(1500);
    
    // Mike reacts to the framework
    addChatMessage('mike', `*leans against wall, arms crossed* Here we go with the diagrams. But... he's right. The pre-emptive angle is the weapon. If ${company.name} apologizes FIRST, they control the entire conversation.`);
    
    await delayOrSkip(1000);
    
    // Burl sees visual direction emerging
    moveAgentTo('burl', { x: 480, y: 440 }, 'thinking', 'Visualizing the strategy...');
    addChatMessage('burl', `*sketches rapidly* When Poole says "anticipatory accountability" — I see it. The visual is ${company.name}'s brand language, but turned confessional. Same fonts, same colors, but deployed for honesty instead of sales. Ugly-beautiful.`);
    
    await delayOrSkip(800);
    
    // Cell objects constructively
    addChatMessage('the-cell', `[GJON]: Poole's framework assumes the audience will believe the apology is genuine. [VERA]: That's the point — MAKE it genuine through craft. [THURSDAY]: *writes on index card* "Sincerity is a technique."`);
    
    // Delmore already thinking about client framing
    addChatMessage('delmore', `*distributes hard candies thoughtfully* The framework needs to be translatable. I'm already seeing how we position this for ${company.name}'s leadership. "Proactive Brand Integrity" — they'll eat it up.`);
    
    // Nadya on strategy timeline
    addChatMessage('nadya', `Strategy phase must conclude soon. The framework is only valuable if it becomes deliverables. Framework without execution is just... diagrams.`);
    
    // Apparatus processes
    addChatMessage('apparatus', `STRATEGIC FRAMEWORK ARCHITECTURE LOGGED — Proceeding to creative development phase.`);
    
    await delayOrSkip(1000);
    
    createWorkItem('poole', 'framework',
      `APOLOGY STRATEGY FOR: ${scenario.title}\n\n• Pre-emptive contrition positioning\n• Stakeholder deflection architecture\n• Performative transparency framework\n• Future-state regret positioning\n• Anticipatory accountability protocol\n\nCore Insight: Apologize before the disaster to own the narrative.`,
      { x: 740, y: 100 }, 2, true, scenario.id
    );
    
    updateTaskStatus(scenarioTasks[1]?.id || '', 'done');
    
    await delayOrSkip(1500);
    
    // ═══════════════════════════════════════════
    // PHASE 3: CREATIVE DEVELOPMENT (Cell leads)
    // ═══════════════════════════════════════════
    setCurrentPhase(3);
    setPhaseLabel('CREATIVE DEVELOPMENT');
    
    moveAgentTo('the-cell', { x: 1180, y: 140 }, 'typing', 'Writing campaign...');
    addChatMessage('the-cell', `[GJON]: We're being asked to write an apology for something that hasn't happened yet. This is either the most honest advertising ever made, or the most dishonest. I can't decide which excites me more. [VERA]: Focus. We need a headline that sounds like accountability but reads like a brand campaign. [THURSDAY]: *staring at wall* The apology IS the campaign. The confession IS the advertisement. We're not selling ${company.name}'s products. We're selling their honesty about their future dishonesty.`);
    
    await delayOrSkip(1500);
    
    // Generate the actual campaign via API
    const campaign = await generateApologyCampaign(scenario, company);
    setCampaigns(prev => [...prev, campaign]);
    
    // Ensure we have valid content even if API failed
    const headline = hl(campaign.headline);
    const subheadline = hl(campaign.subheadline);
    const statement = hl(campaign.apologyStatement);
    
    // Cell presents their output clearly
    createWorkItem('the-cell', 'apology',
      `════════════════════════════════\nCOPYWRITING CELL OUTPUT\n════════════════════════════════\n\nHEADLINE:\n"${headline}"\n\nTAGLINE:\n${subheadline}\n\nMANIFESTO:\n${statement}\n\nKEY CREATIVE ANGLES:\n${campaign.keyMessages?.map((m, i) => `${i + 1}. ${m}`).join('\n') || '1. Pre-emptive accountability\n2. Corporate transparency as brand strategy'}\n\n— The Cell`,
      { x: 1080, y: 90 }, 3, true, scenario.id
    );
    
    await delayOrSkip(1000);
    
    addChatMessage('the-cell', `[THURSDAY]: *slides paper across table without looking* HEADLINE: "${headline}" [VERA]: ...oh. Oh that's good. [GJON]: That's the kind of line that makes people screenshot and share. Tagline: "${subheadline}" — that's the one they'll remember at Cannes. [VERA]: The Cell votes 2-1 in favor. — The Cell`);
    
    // Poole validates against framework
    addChatMessage('poole', `*studies the headline intently* "${headline}" — structurally it encodes the permission pathway perfectly. The reframe is embedded in the syntax. Against all odds, the Cell has produced work that aligns with the framework. Remarkable.`);
    
    await delayOrSkip(800);
    
    // Burl reacts to copy's visual potential
    addChatMessage('burl', `*reads headline aloud, slowly* "${headline}" — THAT I can photograph. That headline wants to be 6 feet tall on a billboard. I know exactly what the key visual looks like now.`);
    
    // Mike approves the direction
    addChatMessage('mike', `*reads it twice, nods* That's the one. Twenty-two years and Thursday still surprises me. The manifesto has teeth — "${statement?.slice(0, 80)}..." — that's real. That hits.`);
    
    // Apparatus logs creative output
    addChatMessage('apparatus', `CREATIVE OUTPUT RECEIVED — Headline: "${headline}" | Tagline: "${subheadline}" | Status: APPROVED — Moving to visual direction.`);
    
    // Nadya tracks progress
    addChatMessage('nadya', `Copy phase complete. Within time allocation. *slight nod of approval* Burl, you have exactly the time you have. No more.`);
    
    // Delmore previews client translation
    addChatMessage('delmore', `*already preparing notes* "${headline}" — the client will love this. I'm positioning it as "Bold Brand Leadership Through Proactive Transparency." They'll feel smart approving it.`);
    
    updateTaskStatus(scenarioTasks[2]?.id || '', 'done');
    
    await delayOrSkip(1500);
    
    // ═══════════════════════════════════════════
    // PHASE 4: VISUAL DIRECTION (Burl leads)
    // ═══════════════════════════════════════════
    setCurrentPhase(4);
    setPhaseLabel('VISUAL DIRECTION');
    
    moveAgentTo('burl', { x: 480, y: 440 }, 'designing', 'Setting visual tone...');
    addChatMessage('burl', `*pins reference images to board* I know exactly what this looks like. It's ${company.name}'s brand aesthetic — but cracked open. We're using their visual language against itself. ${campaign.visualConcept || 'The same clean lines and trustworthy colors, but deployed for confession instead of celebration.'} Colors: ${campaign.colorPalette?.join(', ') || 'Their brand palette, desaturated'}. Typography: ${campaign.typography || 'Something official but weathered'}. This isn't pretty advertising. This is documentary. This is evidence.`);
    
    await delayOrSkip(1500);
    
    // Cell checks copy-visual alignment
    addChatMessage('the-cell', `[VERA]: The visual direction supports the copy well. [GJON]: Make sure the ugliness is intentional, Burl. The headline needs room to breathe — don't crowd it. [THURSDAY]: *nods once, satisfied*`);
    
    await delayOrSkip(800);
    
    // Mike reacts to visual direction
    addChatMessage('mike', `*studies the mood board* Good. This doesn't look like an ad. It looks like a confession that accidentally got printed. That's exactly right.`);
    
    // Poole on color psychology
    addChatMessage('poole', `*examines color palette* The chromatic choices encode the permission mechanism visually. The desaturated tones create what I call "aesthetic contrition." Fascinating how Burl arrives at theoretical truth through pure instinct.`);
    
    // Nadya assigns production requirements
    addChatMessage('nadya', `Visual direction received. Print specs: CMYK conversion by end of day. Digital: RGB at 72dpi and 300dpi. Billboard: vector elements required. The schedule absorbs this. Barely.`);
    
    // Apparatus logs specs
    addChatMessage('apparatus', `VISUAL SPECIFICATIONS RECEIVED — Color palette: ${campaign.colorPalette?.length || 5} colors defined | Typography: set | Format requirements: print, digital, OOH, video — Processing.`);
    
    // Delmore on client optics
    addChatMessage('delmore', `*takes photo of mood board* Perfect. This looks expensive and thoughtful — clients love both. I'll frame the visual direction as "Premium Authenticity Positioning."`);
    
    await delayOrSkip(1000);
    
    createWorkItem('burl', 'visual',
      `VISUAL DIRECTION FOR CAMPAIGN ${index + 1}:\n\n• Colors: ${campaign.colorPalette?.join(', ') || 'Brand palette, desaturated'}\n• Typography: ${campaign.typography || 'Official but weathered'}\n• Concept: ${campaign.visualConcept || 'Documentary authenticity'}\n\nArt Direction Notes:\n- ${company.name} brand language, subverted\n- Confessional minimalism\n- Images that feel found, not staged\n- The aesthetic of uncomfortable truth`,
      { x: 400, y: 380 }, 4, true, scenario.id
    );
    
    updateTaskStatus(scenarioTasks[3]?.id || '', 'done');
    
    await delayOrSkip(1500);
    
    // ═══════════════════════════════════════════
    // PHASE 5: PRODUCTION SCHEDULING (Nadya leads)
    // ═══════════════════════════════════════════
    setCurrentPhase(5);
    setPhaseLabel('PRODUCTION SCHEDULING');
    
    moveAgentTo('nadya', { x: 820, y: 440 }, 'typing', 'Building production schedule...');
    addChatMessage('nadya', `*checks all watches simultaneously* Campaign ${index + 1} requires production schedule. Print: full-page ad goes to prepress by end of week. Billboard specs finalized within 48 hours. Video production begins Monday — casting call Tuesday, shoot Wednesday, edit Thursday, delivery Friday. Social assets deployed in sequence. The schedule does not negotiate.`);
    
    await delayOrSkip(1200);
    
    // Mike reacts to timeline
    addChatMessage('mike', `*whistles low* Nadya, these timelines are aggressive. *to everyone* You heard the woman. The schedule is the schedule.`);
    
    // Apparatus confirms integration
    addChatMessage('apparatus', `PRODUCTION SCHEDULE RECEIVED — All deliverable timelines integrated into master workflow. Asset generation queued. Quality gates assigned.`);
    
    // Poole on production strategy
    addChatMessage('poole', `The phased media deployment — LinkedIn first, then Twitter/X, Instagram, TikTok — follows the credibility cascade model. Nadya's instincts align with the framework. Impressive.`);
    
    // Burl on asset production
    addChatMessage('burl', `*nods grimly* I'll have hero images, social assets, and billboard art ready. The pictures will tell the story the words start. Give me the time, Nadya.`);
    addChatMessage('nadya', `You have the time you have. Not one minute more.`);
    
    // Cell + Delmore acknowledge
    addChatMessage('the-cell', `[VERA]: Copy deck finalized for all formats. [GJON]: Social copy adapts per platform. [THURSDAY]: *already done*`);
    addChatMessage('delmore', `Production assets will need client-facing versions. I'll prepare translated specs alongside the originals.`);
    
    await delayOrSkip(1000);
    
    const tomorrow = new Date(Date.now() + 86400000).toLocaleDateString();
    const nextWeek = new Date(Date.now() + 7 * 86400000).toLocaleDateString();
    
    createWorkItem('nadya', 'schedule',
      `PRODUCTION SCHEDULE — CAMPAIGN ${index + 1}\n\n"${headline}"\n\nPRINT:\n• Prepress: ${tomorrow}\n• Proof: +2 days\n• Final: +4 days\n\nOOH:\n• Billboard specs: ${tomorrow}\n• Bus shelter: +1 day\n\nVIDEO:\n• Casting: +2 days\n• Shoot: +3 days\n• Edit: +5 days\n• Delivery: ${nextWeek}\n\nSOCIAL:\n• LinkedIn: Day 1\n• Twitter/X: Day 2\n• Instagram: Day 3\n• TikTok: Day 4\n\nACCOUNTABILITY: Named. Dated. Non-negotiable.`,
      { x: 720, y: 340 }, 5, true, scenario.id
    );
    
    updateTaskStatus(scenarioTasks[4]?.id || '', 'done');
    
    await delayOrSkip(1500);
    
    // ═══════════════════════════════════════════
    // PHASE 6: CLIENT TRANSLATION (Delmore leads)
    // ═══════════════════════════════════════════
    setCurrentPhase(6);
    setPhaseLabel('CLIENT TRANSLATION');
    
    moveAgentTo('delmore', { x: 1180, y: 440 }, 'typing', 'Translating for client...');
    addChatMessage('delmore', `*distributes hard candies, adjusts pocket square* Now, the creative work is brilliant — it always is — but the client needs to understand WHY it's brilliant, in language that makes them feel smart for buying it. We're positioning "${headline}" not as an apology, but as a "Proactive Brand Integrity Initiative." I've prepared talking points, a FAQ sheet for legal, and a pamphlet explaining the cultural significance of preemptive accountability.`);
    
    await delayOrSkip(1200);
    
    // Poole appreciates the translation
    addChatMessage('poole', `*reads Delmore's deck, nods* Remarkable. You've preserved the strategic architecture while removing all threatening clarity. The framework survives in the subtext. Masterful camouflage.`);
    
    // Cell watches with fascination
    addChatMessage('the-cell', `[GJON]: How does he do it without lying? [VERA]: It's an art form. Our words go in, different words come out, same meaning. [THURSDAY]: *accepts candy*`);
    
    // Burl on visual presentation
    addChatMessage('burl', `*reviews client-facing layouts* The visual presentation deck is clean. Professional enough for the boardroom, provocative enough to actually work. Good balance.`);
    
    // Mike on the client angle
    addChatMessage('mike', `*accepts candy* Watch this magic trick. Same idea, completely different energy. Delmore's about to turn our knife into a pillow. The client will think they thought of it themselves.`);
    
    // Nadya on delivery
    addChatMessage('nadya', `Client presentation materials due alongside campaign assets. Delmore — your translation must be ready for the ZIP package. Non-negotiable.`);
    
    // Apparatus prepares
    addChatMessage('apparatus', `CLIENT TRANSLATION LAYER RECEIVED — Incorporating into final deliverable package. All stakeholder-facing language catalogued.`);
    
    await delayOrSkip(1000);
    
    createWorkItem('delmore', 'translation',
      `CLIENT TRANSLATION — CAMPAIGN ${index + 1}\n\n"${headline}"\n\nCLIENT-FACING LANGUAGE:\n• "Apology" → "Proactive Brand Integrity Initiative"\n• "Disaster" → "Anticipated Market Disruption"\n• "Sorry" → "Stakeholder-Aligned Acknowledgment"\n• "Crisis" → "Opportunity for Authentic Engagement"\n\nTALKING POINTS:\n1. This positions ${company.name} as industry leader in transparency\n2. Pre-emptive accountability builds consumer trust\n3. Campaign is designed for award recognition\n4. ROI measured in brand sentiment, not conversions\n\nPAMPHLET: Prepared on risograph. Distribution pending.`,
      { x: 1060, y: 340 }, 6, true, scenario.id
    );
    
    updateTaskStatus(scenarioTasks[5]?.id || '', 'done');
    
    await delayOrSkip(1500);
    
    // ═══════════════════════════════════════════
    // PHASE 7: CAMPAIGN COMPILATION (Apparatus leads)
    // ═══════════════════════════════════════════
    setCurrentPhase(7);
    setPhaseLabel('CAMPAIGN COMPILATION');
    
    moveAgentTo('apparatus', { x: 820, y: 700 }, 'typing', 'Compiling campaign...');
    addChatMessage('apparatus', `COMPILING APOLOGY CAMPAIGN ${index + 1} OF ${scenarios.length}—All creative assets being assembled. Print specifications, video scripts, social executions, digital banners, OOH specs. INTEGRATION STATUS: IN PROGRESS—`);
    
    await delayOrSkip(1200);
    
    // Nadya confirms schedule compliance
    addChatMessage('nadya', `*checks watch, satisfiedNod* Campaign ${index + 1} compilation within schedule parameters. All deliverables accounted for. The schedule is pleased.`);
    
    // Delmore confirms translation integration
    addChatMessage('delmore', `Client-facing materials integrated into the package. ${company.name}'s leadership will receive a polished presentation alongside the raw creative. They'll feel informed and important.`);
    
    // Mike final check
    addChatMessage('mike', `*reviews compilation* Everything's in there. Strategy, copy, visuals, production, translation. This is a complete weapon — I mean, campaign. A complete campaign. *lights cigarette*`);
    
    // Cell signs off
    addChatMessage('the-cell', `[VERA]: Copy finalized. [GJON]: Every word earned its place. [THURSDAY]: *satisfied silence* — The Cell`);
    
    // Burl signs off
    addChatMessage('burl', `*steps back from monitor* Pictures are in. Every visual tells the truth the headline promises. The aesthetic is locked.`);
    
    // Poole signs off
    addChatMessage('poole', `*closes notebook* Framework successfully deployed across all deliverables. The Poole System is validated. Again. I'll be documenting this case extensively.`);
    
    await delayOrSkip(1000);
    
    createWorkItem('apparatus', 'approval',
      `CAMPAIGN ${index + 1} FINALIZED\n\nHEADLINE: "${headline}"\nTAGLINE: "${subheadline}"\n\nSCENARIO: ${scenario.title}\n\nDELIVERABLES:\n• Print: Full-page, poster\n• OOH: Billboard (14x48ft), bus shelter\n• Video: :60 branded content\n• Social: 5 platform-specific posts\n• Digital: Banner suite\n• Production schedule: Locked\n• Client translation: Complete\n\nSTATUS: DEPLOYMENT READY`,
      { x: 760, y: 660 }, 7, false, scenario.id
    );
    
    updateTaskStatus(scenarioTasks[6]?.id || '', 'done');
    
    addChatMessage('apparatus', `CAMPAIGN ${index + 1} COMPILATION SUCCESSFUL—"${headline}" | Full deliverable suite generated | Quality rating: CANNES-READY | Timestamp: ${new Date().toLocaleTimeString()}`);
    
    return campaign;
  }, [company, tasks, addChatMessage, createWorkItem, moveAgentTo, updateTaskStatus, scenarios.length, delayOrSkip]);

  // Run the full workflow
  const runWorkflow = useCallback(async () => {
    dialogue.resetDialogueCache();
    
    // Opening
    addChatMessage('apparatus', `INITIATING PROACTIVE APOLOGY CAMPAIGN PROTOCOL FOR ${company.name.toUpperCase()} — ${scenarios.length} DOOMSDAY SCENARIO${scenarios.length !== 1 ? 'S' : ''} QUEUED FOR PROCESSING`);
    addChatMessage('mike', `*spreads dossiers across table* Alright everyone, gather round. We've got ${scenarios.length} potential disaster${scenarios.length !== 1 ? 's' : ''} to apologize for. Things that haven't happened yet. Things that might never happen. But we're going to craft apologies so good, so genuine-sounding, that ${company.name} will own the narrative before there's even a narrative to own. This is the job. This is what we do. Let's make some preemptive contrition that would make Cannes weep.`);
    
    await delayOrSkip(2000);
    
    // Process each scenario
    const completedCampaigns: ApologyCampaign[] = [];
    for (let i = 0; i < scenarios.length; i++) {
      setCurrentScenarioIndex(i);
      const campaign = await processScenario(scenarios[i], i);
      completedCampaigns.push(campaign);
      
      if (i < scenarios.length - 1) {
        addChatMessage('nadya', `Campaign ${i + 1} of ${scenarios.length} complete. Moving to next scenario. The schedule proceeds on schedule. ${scenarios.length - i - 1} remaining.`);
        await delayOrSkip(1500);
      }
    }
    
    // Completion - stay in workspace, let user decide when to download
    setPhaseLabel('ALL CAMPAIGNS COMPLETE');
    setIsRunning(false);
    
    // Celebratory completion messages from ALL agents
    addChatMessage('apparatus', `ALL ${scenarios.length} APOLOGY CAMPAIGNS COMPILED SUCCESSFULLY — ASSETS READY FOR GENERATION AND DOWNLOAD`);
    
    await delayOrSkip(500);
    
    addChatMessage('mike', `*lights celebratory cigarette* That's a wrap. ${scenarios.length} campaign${scenarios.length !== 1 ? 's' : ''}. ${company.name} can now apologize for disasters that haven't happened yet. We've invented preemptive contrition. It's honest in a way that's also completely dishonest. It's going to win awards.`);
    
    await delayOrSkip(600);
    
    addChatMessage('poole', `*closes leather notebook with satisfaction* The Proactive Apology Matrix has been fully deployed. What we've created here is not merely advertising — it's a new paradigm. We've given ${company.name} the gift of anticipated failure.`);
    
    await delayOrSkip(600);
    
    addChatMessage('the-cell', `[GJON]: We wrote apologies for things that haven't happened. This is either the most ethical advertising ever made, or the most cynical. [VERA]: Both can be true. [THURSDAY]: *quietly* The headlines will live longer than the disasters they apologize for. — The Cell`);
    
    await delayOrSkip(600);
    
    addChatMessage('burl', `*steps back from work* The pictures are done. Ugly-beautiful, just like I promised. ${company.name}'s brand language, but confessional. It's going to photograph beautifully at Cannes.`);
    
    await delayOrSkip(600);
    
    addChatMessage('nadya', `*checks all watches simultaneously* Production complete. ${scenarios.length} campaigns. All deliverables finalized within deadline. The schedule is satisfied.`);
    
    await delayOrSkip(600);
    
    addChatMessage('delmore', `*distributes hard candies to everyone* Beautiful work, folks. The client translation is ready. ${company.name} is about to become the most honest company in their industry. About things that haven't happened yet.`);
    
    await delayOrSkip(600);
    
    addChatMessage('apparatus', `ALL CAMPAIGNS READY — Press "DOWNLOAD ASSETS" to generate campaign images, ad mockups, video storyboards, and the complete creative package. The assets will be generated fresh using AI and packaged for deployment.`);
    
    setAgents(prev => prev.map(a => ({ ...a, status: 'idle', action: '', isActive: false })));
    
    // Mark as complete but DO NOT auto-show campaign panel or navigate away
    // User must click "DOWNLOAD ASSETS" button to proceed
    setIsComplete(true);
    setAssetsReady(true);
    
    // Note: We do NOT auto-call onComplete or auto-show panel. User must explicitly click download.
  }, [company, scenarios, processScenario, addChatMessage]);

  // Handler for user to manually finish and exit
  const handleFinishSession = useCallback(() => {
    if (onComplete) {
      onComplete(campaigns);
    }
  }, [onComplete, campaigns]);

  const handleStart = useCallback(() => {
    setIsRunning(true);
    setWorkItems([]);
    setChatMessages([]);
    setCampaigns([]);
    setTasks(generateTasks());
    setCurrentPhase(0);
    setCurrentScenarioIndex(0);
    setPhaseLabel('Starting...');
    setShowCodePanel(false);
    
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
    addChatMessage('apparatus', 'FAST FORWARD ENGAGED — Completing remaining work at accelerated pace.');
  }, [addChatMessage]);

  const handleReset = () => {
    setIsRunning(false);
    setIsComplete(false);
    skipRef.current = false;
    workflowRef.current.forEach(t => clearTimeout(t));
    typingRef.current.forEach(t => clearInterval(t));
    setWorkItems([]);
    setChatMessages([]);
    setCampaigns([]);
    setTasks(generateTasks());
    setCurrentPhase(0);
    setCurrentScenarioIndex(0);
    setPhaseLabel('Ready to begin');
    setShowCodePanel(false);
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

  // Helper: Generate HTML print ad mockup
  const generatePrintAdHTML = (campaign: ApologyCampaign, heroImageB64?: string): string => {
    const colors = campaign.colorPalette || ['#1a1a2e', '#16213e', '#e94560'];
    const imgTag = heroImageB64 ? `<img src="data:image/png;base64,${heroImageB64}" style="width:100%;height:100%;object-fit:cover;position:absolute;top:0;left:0;" />` : `<div style="width:100%;height:100%;background:linear-gradient(135deg,${colors[0]||'#1a1a2e'},${colors[1]||'#333'});display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.3);font-size:14px;">[HERO IMAGE]</div>`;
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Print Ad - ${campaign.companyName}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#e8e8e8;display:flex;justify-content:center;padding:40px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif}
.ad{width:612px;height:792px;background:#fff;box-shadow:0 4px 24px rgba(0,0,0,0.15);display:flex;flex-direction:column;overflow:hidden}
.hero{position:relative;height:45%;overflow:hidden;background:#111}
.content{flex:1;padding:40px;display:flex;flex-direction:column}
.company{font-size:10px;letter-spacing:4px;color:#999;text-transform:uppercase;margin-bottom:24px}
h1{font-size:28px;font-weight:300;color:#111;line-height:1.25;margin-bottom:16px}
.tagline{font-size:14px;color:#666;margin-bottom:24px;font-style:italic}
.body{font-size:12px;color:#444;line-height:1.8;flex:1}
.footer{display:flex;justify-content:space-between;align-items:flex-end;padding-top:20px;border-top:1px solid #e0e0e0;margin-top:20px}
.brand{font-size:14px;font-weight:600;color:#111;letter-spacing:1px}
.disclaimer{font-size:8px;color:#bbb;text-transform:uppercase;letter-spacing:1px}
.color-bar{display:flex;height:4px}.color-bar span{flex:1}</style></head>
<body><div class="ad">
<div class="color-bar">${colors.map(c => `<span style="background:${c}"></span>`).join('')}</div>
<div class="hero">${imgTag}</div>
<div class="content">
<div class="company">${campaign.companyName}</div>
<h1>"${campaign.headline || 'Campaign Headline'}"</h1>
<div class="tagline">${campaign.subheadline || ''}</div>
<div class="body">${campaign.apologyStatement || ''}</div>
<div class="footer"><span class="brand">${campaign.companyName}</span><span class="disclaimer">A Proactive Apology</span></div>
</div></div></body></html>`;
  };

  // Helper: Generate HTML billboard mockup
  const generateBillboardHTML = (campaign: ApologyCampaign, imgB64?: string): string => {
    const colors = campaign.colorPalette || ['#1a1a2e', '#16213e'];
    const bgStyle = imgB64 ? `background-image:url(data:image/png;base64,${imgB64});background-size:cover;background-position:center;` : `background:linear-gradient(135deg,${colors[0]||'#111'},${colors[1]||'#333'});`;
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Billboard - ${campaign.companyName}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#333;display:flex;justify-content:center;align-items:center;min-height:100vh;padding:40px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif}
.billboard{width:960px;height:320px;position:relative;box-shadow:0 8px 40px rgba(0,0,0,0.4);overflow:hidden;${bgStyle}}
.overlay{position:absolute;inset:0;background:rgba(0,0,0,0.45);display:flex;align-items:center;padding:0 60px}
.content{color:#fff;max-width:60%}
h1{font-size:48px;font-weight:300;line-height:1.15;margin-bottom:12px;text-shadow:0 2px 8px rgba(0,0,0,0.3)}
.tagline{font-size:16px;opacity:0.85;margin-bottom:20px}
.brand{font-size:12px;letter-spacing:4px;text-transform:uppercase;opacity:0.7}
.logo-area{position:absolute;right:60px;bottom:30px;color:#fff;font-size:18px;font-weight:600;letter-spacing:2px;opacity:0.9}</style></head>
<body><div class="billboard"><div class="overlay"><div class="content">
<h1>${(campaign.headline || 'Campaign').split(' ').slice(0, 7).join(' ')}</h1>
<div class="tagline">${campaign.subheadline || ''}</div>
<div class="brand">A Proactive Apology</div>
</div></div><div class="logo-area">${campaign.companyName}</div></div></body></html>`;
  };

  // Helper: Generate HTML social media mockups
  const generateSocialHTML = (campaign: ApologyCampaign, imgB64?: string): string => {
    const posts = campaign.deliverables?.socialPosts || [];
    const colors = campaign.colorPalette || ['#1a1a2e'];
    const imgSrc = imgB64 ? `data:image/png;base64,${imgB64}` : '';
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Social Media - ${campaign.companyName}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#f0f0f0;padding:40px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
h1{text-align:center;font-size:24px;margin-bottom:32px;color:#111}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:24px;max-width:1100px;margin:0 auto}
.post{background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)}
.post-header{display:flex;align-items:center;gap:10px;padding:14px 16px}
.avatar{width:36px;height:36px;border-radius:50%;background:${colors[0]||'#333'};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600;font-size:14px}
.handle{font-weight:600;font-size:14px;color:#111}
.platform{font-size:12px;color:#888}
.post-image{width:100%;aspect-ratio:1;background:${imgSrc ? `url(${imgSrc}) center/cover` : `linear-gradient(135deg,${colors[0]||'#1a1a2e'},${colors[1]||'#333'})`};display:flex;align-items:center;justify-content:center}
.post-image .overlay-text{color:#fff;font-size:22px;font-weight:300;text-align:center;padding:20px;text-shadow:0 2px 8px rgba(0,0,0,0.5);max-width:80%}
.post-copy{padding:16px;font-size:14px;line-height:1.6;color:#333}
.hashtags{padding:0 16px 16px;font-size:13px;color:${colors[0]||'#1a73e8'}}
.post-footer{padding:12px 16px;border-top:1px solid #eee;font-size:12px;color:#999}</style></head>
<body><h1>${campaign.companyName} — Social Media Campaign</h1><div class="grid">
${posts.length > 0 ? posts.map((post, i) => `<div class="post">
<div class="post-header"><div class="avatar">${(post.platform || 'S')[0]}</div><div><div class="handle">${campaign.companyName}</div><div class="platform">${post.platform} • ${post.type}</div></div></div>
<div class="post-image">${i === 0 && imgSrc ? '' : `<div class="overlay-text">"${(campaign.headline || '').slice(0, 60)}"</div>`}</div>
<div class="post-copy">${post.copy}</div>
${post.hashtags?.length ? `<div class="hashtags">${post.hashtags.map(h => `#${h}`).join(' ')}</div>` : ''}
<div class="post-footer">${post.platform} • ${post.type} • Campaign Asset</div></div>`).join('') : `<div class="post">
<div class="post-header"><div class="avatar">X</div><div><div class="handle">${campaign.companyName}</div><div class="platform">Twitter/X • Thread</div></div></div>
<div class="post-image"><div class="overlay-text">"${campaign.headline || ''}"</div></div>
<div class="post-copy">${campaign.apologyStatement || ''}</div>
<div class="post-footer">Social Campaign Asset</div></div>`}
</div></body></html>`;
  };

  // Helper: Generate video storyboard HTML
  const generateStoryboardHTML = (campaign: ApologyCampaign): string => {
    const script = campaign.deliverables?.videoScript;
    if (!script) return `<!DOCTYPE html><html><body><h1>Video Script - ${campaign.companyName}</h1><p>No video script generated.</p></body></html>`;
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Storyboard - ${campaign.companyName}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#1a1a1a;color:#e0e0e0;padding:40px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif}
h1{font-size:28px;font-weight:300;margin-bottom:8px;color:#fff}
.subtitle{font-size:14px;color:#888;margin-bottom:32px}
.meta{display:flex;gap:24px;margin-bottom:32px;font-size:12px;color:#666;text-transform:uppercase;letter-spacing:1px}
.meta span{padding:6px 12px;border:1px solid #333;border-radius:4px}
.frames{display:grid;grid-template-columns:repeat(auto-fit,minmax(400px,1fr));gap:20px}
.frame{background:#222;border:1px solid #333;overflow:hidden;border-radius:4px}
.frame-visual{aspect-ratio:16/9;background:linear-gradient(135deg,#2a2a2a,#111);display:flex;align-items:center;justify-content:center;position:relative;padding:20px}
.frame-visual .shot-num{position:absolute;top:8px;left:8px;background:rgba(255,255,255,0.9);color:#000;font-size:10px;font-weight:700;padding:2px 6px;font-family:monospace}
.frame-visual .dur{position:absolute;top:8px;right:8px;background:#c41e3a;color:#fff;font-size:10px;padding:2px 6px;font-family:monospace}
.frame-visual .text{color:#fff;font-size:14px;text-align:center;opacity:0.7;font-style:italic}
.frame-info{padding:16px;border-top:1px solid #333}
.frame-info .visual{font-size:12px;color:#888;margin-bottom:8px;font-style:italic}
.frame-info .audio{font-size:13px;color:#ccc}
.notes{margin-top:32px;padding:20px;background:#222;border-left:3px solid #c41e3a;border-radius:0 4px 4px 0}
.notes h3{font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#c41e3a;margin-bottom:8px}
.notes p{font-size:13px;color:#999;line-height:1.6}
.footer{margin-top:40px;padding-top:20px;border-top:1px solid #333;font-size:10px;color:#555;text-transform:uppercase;letter-spacing:2px}</style></head>
<body><h1>${script.title}</h1><div class="subtitle">${campaign.companyName} — Proactive Apology Campaign</div>
<div class="meta"><span>Duration: ${script.duration}</span><span>Format: ${script.format}</span></div>
<div class="frames">${script.script.map(shot => `<div class="frame">
<div class="frame-visual"><span class="shot-num">SHOT ${shot.shot}</span><span class="dur">${shot.duration}</span>
<div class="text">${shot.onScreenText || shot.visual.slice(0, 60)}</div></div>
<div class="frame-info"><div class="visual">${shot.visual}</div><div class="audio">${shot.audio}</div></div></div>`).join('')}</div>
<div class="notes"><h3>Production Notes</h3><p>${script.notes}</p></div>
<div class="footer">ADHDAI — The Feral Creative Collective</div></body></html>`;
  };

  // Download ZIP with REAL campaign assets — generates images via DALL-E
  const downloadZip = useCallback(async () => {
    try {
      if (campaigns.length === 0) {
        addChatMessage('apparatus', 'ERROR—No campaigns available to download.');
        return;
      }
      
      setIsDownloading(true);
      setDownloadProgress('Initializing asset generation...');
      addChatMessage('apparatus', `INITIATING ASSET GENERATION — Generating campaign images, ad mockups, and deliverables for ${campaigns.length} campaign${campaigns.length !== 1 ? 's' : ''}...`);
      
      const zip = new JSZip();
      const timestamp = new Date().toISOString().split('T')[0];
      const folderName = `${company.name.toLowerCase().replace(/\s+/g, '_')}_apology_campaigns_${timestamp}`;
      
      const mainFolder = zip.folder(folderName);
      if (!mainFolder) return;
      
      for (let i = 0; i < campaigns.length; i++) {
        const campaign = campaigns[i];
        const safeName = campaign.scenarioTitle.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').slice(0, 50);
        const scenarioFolder = mainFolder.folder(`campaign_${i + 1}_${safeName}`);
        if (!scenarioFolder) continue;
        
        setDownloadProgress(`Campaign ${i + 1}/${campaigns.length}: Generating hero image...`);
        addChatMessage('burl', `Generating visual assets for campaign ${i + 1}: "${campaign.headline}"...`);
        
        // ════════════════════════════════════════
        // GENERATE REAL IMAGES VIA DALL-E
        // ════════════════════════════════════════
        let heroImageB64: string | undefined;
        let socialImageB64: string | undefined;
        let billboardImageB64: string | undefined;
        
        try {
          // Generate hero image
          const heroResult = await generateCampaignImage(campaign, 'hero');
          if (heroResult) {
            heroImageB64 = heroResult.replace('data:image/png;base64,', '');
          }
          
          setDownloadProgress(`Campaign ${i + 1}/${campaigns.length}: Generating social media image...`);
          
          // Generate social image  
          const socialResult = await generateCampaignImage(campaign, 'social');
          if (socialResult) {
            socialImageB64 = socialResult.replace('data:image/png;base64,', '');
          }
          
          setDownloadProgress(`Campaign ${i + 1}/${campaigns.length}: Generating billboard image...`);
          
          // Generate billboard image
          const billboardResult = await generateCampaignImage(campaign, 'billboard');
          if (billboardResult) {
            billboardImageB64 = billboardResult.replace('data:image/png;base64,', '');
          }
          
          addChatMessage('burl', `Campaign ${i + 1} images generated. ${[heroImageB64, socialImageB64, billboardImageB64].filter(Boolean).length} visual assets created.`);
        } catch (imgError) {
          console.error('Image generation error:', imgError);
          addChatMessage('apparatus', `IMAGE GENERATION NOTE — Some images could not be generated. Text assets will be included. Error: ${imgError instanceof Error ? imgError.message : 'Unknown'}`);
        }
        
        setDownloadProgress(`Campaign ${i + 1}/${campaigns.length}: Building deliverables...`);
        
        // ════════════════════════════════════════
        // ADD GENERATED IMAGES AS REAL FILES
        // ════════════════════════════════════════
        const imagesFolder = scenarioFolder.folder('images');
        if (heroImageB64) {
          imagesFolder?.file('hero_campaign_image.png', heroImageB64, { base64: true });
        }
        if (socialImageB64) {
          imagesFolder?.file('social_media_image.png', socialImageB64, { base64: true });
        }
        if (billboardImageB64) {
          imagesFolder?.file('billboard_image.png', billboardImageB64, { base64: true });
        }
        
        // ════════════════════════════════════════
        // GENERATE HTML AD MOCKUPS (real ads!)
        // ════════════════════════════════════════
        const adsFolder = scenarioFolder.folder('ads');
        
        // Print ad with hero image embedded
        adsFolder?.file('print_ad_fullpage.html', generatePrintAdHTML(campaign, heroImageB64));
        
        // Billboard with billboard image embedded
        adsFolder?.file('billboard_14x48.html', generateBillboardHTML(campaign, billboardImageB64));
        
        // Social media posts with social image embedded
        adsFolder?.file('social_media_posts.html', generateSocialHTML(campaign, socialImageB64));
        
        // Video storyboard
        const videoFolder = scenarioFolder.folder('video');
        videoFolder?.file('storyboard.html', generateStoryboardHTML(campaign));
        
        if (campaign.deliverables?.videoScript) {
          const vs = campaign.deliverables.videoScript;
          videoFolder?.file('video_script.txt', `VIDEO SCRIPT: ${vs.title}
${'='.repeat(50)}
Duration: ${vs.duration}
Format: ${vs.format}

SCRIPT
------
${vs.script.map(shot => `SHOT ${shot.shot} (${shot.duration})
Visual: ${shot.visual}
Audio: ${shot.audio}
${shot.onScreenText ? `On-Screen: ${shot.onScreenText}` : ''}
`).join('\n')}

PRODUCTION NOTES
----------------
${vs.notes}
`);
        }
        
        // ════════════════════════════════════════
        // COPY DECK & CREATIVE SPECS
        // ════════════════════════════════════════
        const copyFolder = scenarioFolder.folder('copy');
        
        copyFolder?.file('campaign_overview.txt', `PROACTIVE APOLOGY CAMPAIGN ${i + 1}
${'='.repeat(50)}

Company: ${company.name}
Scenario: ${campaign.scenarioTitle}
Generated: ${new Date(campaign.generatedAt || Date.now()).toLocaleString()}

HEADLINE
--------
"${campaign.headline}"

TAGLINE
-------
${campaign.subheadline}

MANIFESTO
---------
${campaign.apologyStatement}

KEY CREATIVE ANGLES
-------------------
${campaign.keyMessages?.map((m, j) => `${j + 1}. ${m}`).join('\n') || 'N/A'}

TONE: ${campaign.tone}

VISUAL DIRECTION
----------------
Concept: ${campaign.visualConcept}
Colors: ${campaign.colorPalette?.join(', ') || 'N/A'}
Typography: ${campaign.typography}
`);
        
        // Print spec
        if (campaign.deliverables?.fullPageAd) {
          copyFolder?.file('print_ad_spec.txt', `PRINT AD SPECIFICATION
=====================
Format: ${campaign.deliverables.fullPageAd.format}
Dimensions: ${campaign.deliverables.fullPageAd.dimensions || '8.5x11"'}

HEADLINE: "${campaign.deliverables.fullPageAd.headline}"

BODY COPY:
${campaign.deliverables.fullPageAd.body}

VISUAL DIRECTION:
${campaign.deliverables.fullPageAd.visual}
`);
        }
        
        // Social copy deck
        if (campaign.deliverables?.socialPosts) {
          copyFolder?.file('social_copy_deck.txt', `SOCIAL MEDIA COPY DECK
=====================

${campaign.deliverables.socialPosts.map((post, j) => 
`POST ${j + 1} - ${post.platform} (${post.type})
${'─'.repeat(40)}
${post.copy}

Visual: ${post.visual}
${post.hashtags ? `Hashtags: ${post.hashtags.map(h => `#${h}`).join(' ')}` : ''}
`).join('\n')}`);
        }
        
        // Billboard spec
        if (campaign.deliverables?.billboard) {
          copyFolder?.file('billboard_spec.txt', `BILLBOARD SPECIFICATION
========================
Format: ${campaign.deliverables.billboard.format}
Dimensions: ${campaign.deliverables.billboard.dimensions || '14x48ft'}

HEADLINE: "${campaign.deliverables.billboard.headline}"
TAGLINE: ${campaign.deliverables.billboard.body}
VISUAL: ${campaign.deliverables.billboard.visual}
`);
        }
        
        // Bus shelter spec
        if (campaign.deliverables?.busShelter) {
          copyFolder?.file('bus_shelter_spec.txt', `BUS SHELTER SPECIFICATION
=========================
Format: ${campaign.deliverables.busShelter.format}
Dimensions: ${campaign.deliverables.busShelter.dimensions || '1800x1200mm'}

HEADLINE: "${campaign.deliverables.busShelter.headline}"
BODY: ${campaign.deliverables.busShelter.body}
VISUAL: ${campaign.deliverables.busShelter.visual}
`);
        }
        
        // Digital banners
        if (campaign.deliverables?.bannerAds && campaign.deliverables.bannerAds.length > 0) {
          copyFolder?.file('digital_banners_spec.txt', `DIGITAL BANNER SPECIFICATIONS
=============================

${campaign.deliverables.bannerAds.map((banner, j) =>
`BANNER ${j + 1}: ${banner.format}
Headline: "${banner.headline}"
Body: ${banner.body}
Visual: ${banner.visual}
`).join('\n')}`);
        }
        
        // Individual campaign HTML preview
        const campaignHtml = formatSingleCampaignAsHTML(campaign);
        scenarioFolder.file('campaign_preview.html', campaignHtml);
      }
      
      setDownloadProgress('Building complete dossier...');
      
      // Generate HTML Dossier
      const htmlDossier = formatApologyCampaignsAsHTML(company, scenarios, campaigns);
      mainFolder.file('apology_dossier.html', htmlDossier);
      
      // Master README
      mainFolder.file('README.txt', `${company.name.toUpperCase()} PROACTIVE APOLOGY CAMPAIGNS
${'='.repeat(60)}

Generated by ADHDAI — The Feral Creative Collective
Date: ${new Date().toLocaleString()}

OVERVIEW
--------
This package contains ${campaigns.length} proactive apology campaign(s) with REAL 
generated assets including AI-created images, HTML ad mockups, video storyboards,
and complete creative specifications.

CAMPAIGNS INCLUDED
------------------
${campaigns.map((c, i) => `${i + 1}. "${c.headline}" (${c.scenarioTitle})`).join('\n')}

FOLDER STRUCTURE
----------------
Root:
  apology_dossier.html    Complete visual dossier (open in browser)
  README.txt              This file

Each campaign folder contains:
  /images/                AI-generated campaign images (PNG)
    hero_campaign_image.png     Main campaign hero image
    social_media_image.png      Social media visual
    billboard_image.png         Billboard/OOH visual

  /ads/                   HTML ad mockups (open in browser)
    print_ad_fullpage.html      Full-page print advertisement
    billboard_14x48.html        Billboard mockup (14x48ft)
    social_media_posts.html     Social media post mockups

  /video/                 Video production assets
    storyboard.html             Visual storyboard (open in browser)
    video_script.txt            Complete :60 video script

  /copy/                  Written creative assets
    campaign_overview.txt       Full creative brief & direction
    print_ad_spec.txt           Print ad specifications
    social_copy_deck.txt        Social media copy for all platforms
    billboard_spec.txt          OOH billboard specifications

  campaign_preview.html   Individual campaign overview

USAGE NOTES
-----------
1. Open HTML files in any browser to see the actual ad mockups
2. Images in /images/ are AI-generated campaign visuals
3. All copy is production-ready for adaptation
4. Video storyboard includes shot-by-shot direction

These campaigns are designed for PREEMPTIVE deployment. Deploy apology
before the disaster occurs for maximum corporate accountability points.

DISCLAIMER
----------
This is satirical content generated by ADHDAI. Any resemblance to actual
corporate crisis communications is entirely intentional.

---
THE FERAL CREATIVE COLLECTIVE
"We are the best at the worst"
`);
      
      setDownloadProgress('Packaging ZIP file...');
      
      // Generate and download
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${folderName}.zip`);
      
      addChatMessage('apparatus', `DELIVERABLES PACKAGE DOWNLOADED — ${folderName}.zip | Contains: ${campaigns.length} campaigns with AI-generated images, HTML ad mockups, video storyboards, and complete copy decks.`);
      addChatMessage('nadya', `All assets delivered. On time. As always.`);
      
    } catch (error) {
      console.error('Error downloading ZIP:', error);
      addChatMessage('apparatus', `ERROR—Failed to generate download: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDownloading(false);
      setDownloadProgress('');
    }
  }, [company, campaigns, scenarios, addChatMessage]);

  const taskCounts = {
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    done: tasks.filter(t => t.status === 'done').length,
  };

  const currentScenario = scenarios[currentScenarioIndex];

  return (
    <div className="canvas-workspace-v2">
      {/* Control Bar */}
      <div className="controls-bar">
        <div className="controls-left">
          {onBack && !isComplete && (
            <button className="control-btn back-btn" onClick={onBack}>
              <ArrowLeft size={16} weight="bold" />
              <span>Back</span>
            </button>
          )}
          {!isRunning && !isComplete && (
            <button className="control-btn start-btn" onClick={handleStart}>
              <Play size={16} weight="bold" />
              <span>START CAMPAIGNS</span>
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
          {isComplete && (
            <>
              <button className="control-btn download-btn" onClick={downloadZip} disabled={isDownloading}>
                <DownloadSimple size={16} weight="bold" />
                <span>{isDownloading ? 'GENERATING...' : 'DOWNLOAD ASSETS'}</span>
              </button>
              <button className="control-btn finish-btn" onClick={handleFinishSession}>
                <Check size={16} weight="bold" />
                <span>FINISH SESSION</span>
              </button>
            </>
          )}
          <button className="control-btn reset-btn" onClick={handleReset}>
            <ArrowCounterClockwise size={16} weight="bold" />
            <span>RESET</span>
          </button>
        </div>
        
        <div className="controls-center">
          <div className="phase-indicator">{phaseLabel}</div>
          <span className="item-count">
            {company.name} / Scenario {currentScenarioIndex + 1} of {scenarios.length}
          </span>
        </div>
        
        <div className="controls-right">
          <span className="task-summary">
            {taskCounts.todo} todo / {taskCounts.inProgress} active / {taskCounts.done} done
          </span>
          {campaigns.length > 0 && !isComplete && (
            <button className="control-btn download-btn" onClick={() => setShowCodePanel(true)}>
              <Package size={16} weight="bold" />
              <span>VIEW CAMPAIGNS</span>
            </button>
          )}
          {isComplete && campaigns.length > 0 && (
            <button className="control-btn download-btn" onClick={() => setShowCodePanel(true)}>
              <Eye size={16} weight="bold" />
              <span>PREVIEW</span>
            </button>
          )}
          <span className="zoom-level">{Math.round(zoom * 100)}%</span>
        </div>
      </div>

      {/* Current Scenario Banner */}
      {currentScenario && isRunning && (
        <div className="scenario-banner">
          <span className="banner-label">CURRENT SCENARIO:</span>
          <span className="banner-title">{currentScenario.title}</span>
          <span className="banner-meta">{currentScenario.severity} • {currentScenario.timeHorizon}</span>
        </div>
      )}

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
                <span><ClipboardText size={14} weight="bold" /> TASKS</span>
                <span className="kanban-phase">Phase {currentPhase}/5</span>
              </div>
              
              <div className="kanban-column">
                <div className="column-header todo-header">
                  <span>TO DO</span>
                  <span className="column-count">{taskCounts.todo}</span>
                </div>
                <div className="column-tasks">
                  {tasks.filter(t => t.status === 'todo').slice(0, 8).map(task => {
                    const char = getCharacterInfo(task.assignee);
                    return (
                      <div key={task.id} className="kanban-task" style={{ borderLeftColor: char.color }}>
                        <span className="task-icon" style={{ color: char.color }}>{getCharacterIcon(char.icon, 14)}</span>
                        <span className="task-title">{task.title}</span>
                      </div>
                    );
                  })}
                  {tasks.filter(t => t.status === 'todo').length > 8 && (
                    <div className="kanban-task-more">+{tasks.filter(t => t.status === 'todo').length - 8} more</div>
                  )}
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
                  {tasks.filter(t => t.status === 'done').slice(-8).map(task => {
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

            {/* Final Output Zone */}
            <div 
              className={`final-output-zone ${campaigns.length > 0 ? 'ready' : ''}`}
              style={{
                left: FINAL_OUTPUT_ZONE.x,
                top: FINAL_OUTPUT_ZONE.y,
                width: FINAL_OUTPUT_ZONE.width,
                height: FINAL_OUTPUT_ZONE.height,
              }}
            >
              <div className="final-output-header">
                <span><Package size={14} weight="bold" /> CAMPAIGNS</span>
                {campaigns.length > 0 && (
                  <button className="view-code-btn" onClick={() => setShowCodePanel(true)}>
                    <Eye size={14} weight="bold" /> VIEW ALL
                  </button>
                )}
              </div>
              <div className="final-output-content">
                {campaigns.length > 0 ? (
                  <div className="output-ready">
                    <span className="output-status"><Check size={14} weight="bold" /> {campaigns.length} READY</span>
                    <span className="output-filename">apology_campaigns.zip</span>
                  </div>
                ) : (
                  <span className="output-waiting">Waiting...</span>
                )}
              </div>
            </div>

            {/* Work Items */}
            {workItems.map(item => {
              const char = getCharacterInfo(item.createdBy);
              return (
                <div
                  key={item.id}
                  className={`work-item ${item.type} ${item.isTyping ? 'typing' : ''} ${item.isDragging ? 'dragging' : ''}`}
                  style={{
                    left: item.position.x,
                    top: item.position.y,
                    backgroundColor: item.color,
                    borderLeftColor: char.color,
                    cursor: 'grab',
                    zIndex: item.isDragging ? 1000 : 10,
                  }}
                  onMouseDown={(e) => handleItemMouseDown(e, item.id)}
                >
                  <pre className="item-content">{item.displayedContent || item.content}{item.isTyping && <span className="cursor">|</span>}</pre>
                  <div className="item-author" style={{ backgroundColor: char.color }}>
                    {getCharacterIcon(char.icon, 12)}
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
            <span className="chat-phase">Phase {currentPhase}/5</span>
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

      {/* Assets Ready Banner */}
      {assetsReady && !isDownloading && (
        <div className="assets-ready-banner" onClick={downloadZip}>
          <div className="assets-ready-content">
            <Trophy size={24} weight="bold" />
            <div className="assets-ready-text">
              <span className="assets-ready-title">{campaigns.length} Campaign{campaigns.length !== 1 ? 's' : ''} Complete</span>
              <span className="assets-ready-sub">Click here or press "DOWNLOAD ASSETS" to generate images and download your campaign package</span>
            </div>
            <button className="assets-ready-btn">
              <DownloadSimple size={20} weight="bold" />
              <span>DOWNLOAD ASSETS</span>
            </button>
          </div>
        </div>
      )}

      {/* Download Progress Overlay */}
      {isDownloading && (
        <div className="download-overlay">
          <div className="download-progress-card">
            <div className="download-spinner" />
            <h3>Generating Campaign Assets</h3>
            <p className="download-status">{downloadProgress}</p>
            <p className="download-note">AI is generating real campaign images, ad mockups, and creative assets. This may take a minute...</p>
          </div>
        </div>
      )}

      {/* Campaign Review Panel - Cannes Style */}
      {showCodePanel && (
        <div className="campaign-panel-overlay" onClick={() => setShowCodePanel(false)}>
          <div className="campaign-panel" onClick={e => e.stopPropagation()}>
            <div className="campaign-panel-header">
              <div className="panel-badge">
                <Trophy size={20} weight="bold" />
                <span>CAMPAIGN DOSSIER</span>
              </div>
              <div className="panel-title-row">
                <h2 className="panel-title">Proactive Apology Campaigns</h2>
                <span className="panel-count">{campaigns.length} Campaign{campaigns.length !== 1 ? 's' : ''}</span>
            </div>
              <p className="panel-subtitle">Generated for {company.name}</p>
              <div className="panel-actions">
                <button className="download-btn primary" onClick={downloadZip}>
                  <DownloadSimple size={18} weight="bold" />
                  <span>DOWNLOAD CAMPAIGN PACKAGE</span>
                </button>
                <button className="close-btn" onClick={() => setShowCodePanel(false)}>
                  <X size={20} weight="bold" />
                </button>
              </div>
            </div>
            
            <div className="campaign-panel-content">
              {campaigns.map((campaign, index) => (
                <div key={campaign.id} className="campaign-card-full">
                  <div className="card-number">
                    <span className="number-label">Campaign</span>
                    <span className="number-value">{String(index + 1).padStart(2, '0')}</span>
                  </div>
                  
                  <div className="card-body">
                    <div className="card-scenario">
                      <span className="scenario-label">Scenario</span>
                      <span className="scenario-title">{campaign.scenarioTitle}</span>
                    </div>
                    
                    <div className="card-creative">
                      <h3 className="creative-headline">"{campaign.headline}"</h3>
                      <p className="creative-subheadline">{campaign.subheadline}</p>
                    </div>
                    
                    <div className="card-statement">
                      <span className="statement-label">Official Statement</span>
                      <p className="statement-text">{campaign.apologyStatement}</p>
                    </div>
                    
                    {campaign.keyMessages && campaign.keyMessages.length > 0 && (
                      <div className="card-messages">
                        <span className="messages-label">Key Messages</span>
                        <ul className="messages-list">
                          {campaign.keyMessages.map((msg, i) => (
                        <li key={i}>{msg}</li>
                      ))}
                    </ul>
                  </div>
                    )}
                    
                    <div className="card-visual">
                      <div className="visual-item">
                        <span className="visual-label">Visual Concept</span>
                        <span className="visual-value">{campaign.visualConcept || 'Corporate minimalism'}</span>
                </div>
                      <div className="visual-item">
                        <span className="visual-label">Tone</span>
                        <span className="visual-value">{campaign.tone || 'Performatively sincere'}</span>
                      </div>
                      {campaign.colorPalette && (
                        <div className="visual-item colors">
                          <span className="visual-label">Palette</span>
                          <div className="color-swatches">
                            {campaign.colorPalette.map((color, i) => (
                              <span key={i} className="color-swatch" style={{ backgroundColor: color }} title={color} />
              ))}
            </div>
            </div>
                      )}
                    </div>
                    
                    <div className="card-deliverables">
                      <span className="deliverables-label">Included Deliverables</span>
                      <div className="deliverables-grid">
                        <span className="deliverable-tag">Full-Page Print Ad</span>
                        <span className="deliverable-tag">Billboard (14x48ft)</span>
                        <span className="deliverable-tag">Video Script (:60)</span>
                        <span className="deliverable-tag">Social Media Deck</span>
                        <span className="deliverable-tag">Digital Banners</span>
                        <span className="deliverable-tag">Bus Shelter</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="campaign-panel-footer">
              <div className="footer-info">
                <Star size={16} weight="bold" />
                <span>Download the complete campaign package for all deliverables, creative specifications, video scripts, and visual assets.</span>
              </div>
              <button className="download-btn secondary" onClick={downloadZip}>
                <DownloadSimple size={16} weight="bold" />
                <span>Download ZIP</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApologyCanvasWorkspace;
