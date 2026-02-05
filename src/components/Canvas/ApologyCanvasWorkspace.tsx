import React, { useEffect, useRef, useState, useCallback } from 'react';
import OpenAI from 'openai';
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
  type: 'sticky' | 'headline' | 'visual' | 'mockup' | 'strategy' | 'framework' | 'draft' | 'approval' | 'board' | 'concept' | 'apology' | 'scenario';
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
};

const ApologyCanvasWorkspace: React.FC<ApologyCanvasWorkspaceProps> = ({ 
  company,
  scenarios,
  onComplete: _onComplete, // Intentionally unused - user controls when to exit
  onBack
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [agents, setAgents] = useState<AgentState[]>([]);
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [phaseLabel, setPhaseLabel] = useState('Ready to begin');
  const [campaigns, setCampaigns] = useState<ApologyCampaign[]>([]);
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [showCodePanel, setShowCodePanel] = useState(false);
  
  const [canvasOffset, setCanvasOffset] = useState<Position>({ x: 50, y: 20 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Position>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.75);
  
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  
  const workflowRef = useRef<NodeJS.Timeout[]>([]);
  const typingRef = useRef<NodeJS.Timeout[]>([]);
  const workItemIdRef = useRef(0);
  const chatIdRef = useRef(0);
  const chatMessagesRef = useRef<HTMLDivElement>(null);

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
        { id: `task-${taskId++}`, title: `Analyze: ${scenario.title.slice(0, 30)}...`, assignee: 'mike', status: 'todo', phase: 1, scenarioId: scenario.id },
        { id: `task-${taskId++}`, title: `Strategy for scenario ${index + 1}`, assignee: 'poole', status: 'todo', phase: 2, scenarioId: scenario.id },
        { id: `task-${taskId++}`, title: `Write apology copy ${index + 1}`, assignee: 'the-cell', status: 'todo', phase: 3, scenarioId: scenario.id },
        { id: `task-${taskId++}`, title: `Visual direction ${index + 1}`, assignee: 'burl', status: 'todo', phase: 4, scenarioId: scenario.id },
        { id: `task-${taskId++}`, title: `Compile campaign ${index + 1}`, assignee: 'apparatus', status: 'todo', phase: 5, scenarioId: scenario.id }
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

  // Process a single scenario
  const processScenario = useCallback(async (scenario: DoomsdayScenario, index: number): Promise<ApologyCampaign> => {
    const scenarioTasks = tasks.filter(t => t.scenarioId === scenario.id);
    
    // Phase 1: Mike analyzes the scenario
    setCurrentPhase(1);
    setPhaseLabel(`ANALYZING SCENARIO ${index + 1}: ${scenario.title}`);
    
    moveAgentTo('mike', { x: 480, y: 140 }, 'thinking', 'Analyzing scenario...');
    addChatMessage('mike', `*examines dossier* "${scenario.title}" — ${scenario.severity} severity, ${scenario.category} category. ${scenario.description} This is going to require preemptive contrition at scale.`);
    
    await new Promise(r => setTimeout(r, 2000));
    
    createWorkItem('mike', 'scenario', 
      `SCENARIO ${index + 1}:\n${scenario.title}\n\nDescription: ${scenario.description}\n\nSeverity: ${scenario.severity}\nCategory: ${scenario.category}\nTimeline: ${scenario.timeHorizon}\n\nPotential Damage: ${scenario.potentialDamage}\nAffected Parties: ${scenario.affectedParties.join(', ')}`,
      { x: 400, y: 100 }, 1, true, scenario.id
    );
    
    updateTaskStatus(scenarioTasks[0]?.id || '', 'done');
    
    await new Promise(r => setTimeout(r, 2500));
    
    // Phase 2: Poole develops strategy
    setCurrentPhase(2);
    setPhaseLabel('STRATEGIC FRAMEWORK');
    
    moveAgentTo('poole', { x: 820, y: 140 }, 'typing', 'Building apology framework...');
    addChatMessage('poole', `The Proactive Apology Matrix™ identifies the core tension: ${scenario.potentialDamage}. We position this as "anticipatory accountability"—apologizing before the harm occurs creates a unique rhetorical space where contrition exists without admission. The consumer's latent guilt becomes our ally. We acknowledge the future they fear while offering nothing concrete.`);
    
    await new Promise(r => setTimeout(r, 2000));
    
    createWorkItem('poole', 'framework',
      `APOLOGY STRATEGY FOR: ${scenario.title}\n\n• Pre-emptive contrition positioning\n• Stakeholder deflection architecture\n• Performative transparency framework\n• Future-state regret positioning\n• Anticipatory accountability protocol\n\nCore Insight: Apologize before the disaster to own the narrative.`,
      { x: 740, y: 100 }, 2, true, scenario.id
    );
    
    updateTaskStatus(scenarioTasks[1]?.id || '', 'done');
    
    await new Promise(r => setTimeout(r, 2500));
    
    // Phase 3: The Cell writes copy
    setCurrentPhase(3);
    setPhaseLabel('APOLOGY COPYWRITING');
    
    moveAgentTo('the-cell', { x: 1180, y: 140 }, 'typing', 'Writing apology...');
    addChatMessage('the-cell', `[VERA]: We write apologies for things that haven't happened yet. This requires a special kind of insincerity—performed sincerity. [GJON]: The copy must acknowledge harm without admitting causation. It's Eastern European melancholy meets corporate legal. [THURSDAY]: *typing* The headline must sound like an apology but function as a press release. We're creating plausible emotional deniability.`);
    
    await new Promise(r => setTimeout(r, 2000));
    
    // Generate the actual campaign
    const campaign = await generateApologyCampaign(scenario, company);
    setCampaigns(prev => [...prev, campaign]);
    
    createWorkItem('the-cell', 'apology',
      `APOLOGY HEADLINE:\n"${campaign.headline}"\n\nSUBHEADLINE:\n${campaign.subheadline}\n\nAPOLOGY STATEMENT:\n${campaign.apologyStatement}\n\nKEY MESSAGES:\n${campaign.keyMessages?.map((m, i) => `${i + 1}. ${m}`).join('\n') || 'N/A'}`,
      { x: 1080, y: 90 }, 3, true, scenario.id
    );
    
    addChatMessage('the-cell', `[THURSDAY]: HEADLINE: "${campaign.headline}" — It sounds like genuine remorse but commits to absolutely nothing. The subheadline "${campaign.subheadline}" reinforces the tone without adding substance. [VERA]: The Cell votes unanimously to approve. [GJON]: This will win awards. Sad, corporate awards.`);
    
    updateTaskStatus(scenarioTasks[2]?.id || '', 'done');
    
    await new Promise(r => setTimeout(r, 3000));
    
    // Phase 4: Burl does visual direction
    setCurrentPhase(4);
    setPhaseLabel('VISUAL DIRECTION');
    
    moveAgentTo('burl', { x: 480, y: 440 }, 'designing', 'Setting visual tone...');
    addChatMessage('burl', `The visual language must communicate "we're sorry" in a way that photographs well and wins Cannes Lions. Corporate blue for trust—the specific blue of institutions that have failed you before. White space for transparency that doesn't actually exist. Dawn breaking over something—a factory, a community, anything that suggests new beginnings we have no intention of delivering. The color palette: ${campaign.colorPalette?.join(', ') || 'Corporate trust palette'}. Typography: ${campaign.typography || 'Helvetica Neue / Georgia'}—fonts that say "we take this seriously" while taking nothing seriously.`);
    
    await new Promise(r => setTimeout(r, 2000));
    
    createWorkItem('burl', 'visual',
      `VISUAL DIRECTION FOR CAMPAIGN ${index + 1}:\n\n• Colors: ${campaign.colorPalette?.join(', ') || 'Corporate trust palette'}\n• Typography: ${campaign.typography || 'Helvetica Neue / Georgia'}\n• Mood: ${campaign.visualConcept || 'Sincere but safely vague'}\n\nArt Direction Notes:\n- Excessive white space suggesting transparency\n- Human subjects looking thoughtfully into middle distance\n- Warm but clinical color grading\n- Visual metaphors of dawn, hands, and horizons`,
      { x: 400, y: 380 }, 4, true, scenario.id
    );
    
    updateTaskStatus(scenarioTasks[3]?.id || '', 'done');
    
    await new Promise(r => setTimeout(r, 2500));
    
    // Phase 5: Apparatus compiles
    setCurrentPhase(5);
    setPhaseLabel('CAMPAIGN COMPILATION');
    
    moveAgentTo('apparatus', { x: 820, y: 700 }, 'typing', 'Compiling campaign...');
    addChatMessage('apparatus', `COMPILING APOLOGY CAMPAIGN ${index + 1} OF ${scenarios.length}—All deliverables being assembled: full-page print ad, billboard, bus shelter, video script, social media copy deck, digital banners. Status: IN PROGRESS—`);
    
    await new Promise(r => setTimeout(r, 2000));
    
    createWorkItem('apparatus', 'approval',
      `✓ CAMPAIGN ${index + 1} COMPLETE\n\nHEADLINE: "${campaign.headline}"\n\nSCENARIO: ${scenario.title}\n\nDELIVERABLES:\n• Full-page print ad\n• Billboard (14x48ft)\n• Bus shelter\n• :60 video script\n• Social media copy deck\n• Digital banner suite\n\nSTATUS: READY FOR DEPLOYMENT`,
      { x: 760, y: 660 }, 5, false, scenario.id
    );
    
    updateTaskStatus(scenarioTasks[4]?.id || '', 'done');
    
    addChatMessage('apparatus', `APOLOGY CAMPAIGN ${index + 1} COMPILED SUCCESSFULLY—Headline: "${campaign.headline}" | Deliverables: Print, OOH, Video, Social, Digital | Timestamp: ${new Date().toLocaleTimeString()}`);
    
    return campaign;
  }, [company, tasks, addChatMessage, createWorkItem, moveAgentTo, updateTaskStatus, scenarios.length]);

  // Run the full workflow
  const runWorkflow = useCallback(async () => {
    dialogue.resetDialogueCache();
    
    // Opening
    addChatMessage('apparatus', `INITIATING PROACTIVE APOLOGY PROTOCOL FOR ${company.name.toUpperCase()}—`);
    addChatMessage('mike', `*opens dossier* ${scenarios.length} doomsday scenario${scenarios.length !== 1 ? 's' : ''} to apologize for. Let's make some corporate contrition.`);
    
    await new Promise(r => setTimeout(r, 2000));
    
    // Process each scenario
    const completedCampaigns: ApologyCampaign[] = [];
    for (let i = 0; i < scenarios.length; i++) {
      setCurrentScenarioIndex(i);
      const campaign = await processScenario(scenarios[i], i);
      completedCampaigns.push(campaign);
      
      if (i < scenarios.length - 1) {
        addChatMessage('nadya', `⏱ Scenario ${i + 1} complete. Moving to next. We are ${i + 1}/${scenarios.length} done.`);
        await new Promise(r => setTimeout(r, 1500));
      }
    }
    
    // Completion - stay in workspace, don't auto-exit
    setPhaseLabel('✓ ALL CAMPAIGNS COMPLETE — READY FOR DOWNLOAD');
    setIsRunning(false);
    
    // Celebratory completion messages
    addChatMessage('apparatus', `═══════════════════════════════════════════════════════════════`);
    addChatMessage('apparatus', `ALL ${scenarios.length} APOLOGY CAMPAIGNS COMPILED SUCCESSFULLY`);
    addChatMessage('apparatus', `READY FOR REVIEW AND DOWNLOAD—${new Date().toLocaleTimeString()}`);
    addChatMessage('apparatus', `═══════════════════════════════════════════════════════════════`);
    
    await new Promise(r => setTimeout(r, 500));
    
    addChatMessage('mike', `The work is done. ${company.name} can now apologize for disasters that haven't happened yet. This is the future of corporate accountability—preemptive contrition at scale.`);
    
    await new Promise(r => setTimeout(r, 800));
    
    addChatMessage('poole', `The Proactive Apology Matrix™ has been fully deployed. Each campaign represents a unique intersection of anticipated failure and performative responsibility. Remarkable work.`);
    
    await new Promise(r => setTimeout(r, 800));
    
    addChatMessage('the-cell', `[VERA]: The copy has been ratified. [GJON]: It sounds like an apology but commits to nothing. [THURSDAY]: That's the art. We've achieved peak corporate sincerity—completely hollow, utterly professional.`);
    
    await new Promise(r => setTimeout(r, 800));
    
    addChatMessage('burl', `The visuals are locked. Corporate blue for trust, white space for transparency that doesn't exist, dawn imagery for new beginnings that won't happen. It's beautiful in its emptiness.`);
    
    await new Promise(r => setTimeout(r, 800));
    
    addChatMessage('nadya', `⏱ Production complete. All ${scenarios.length} campaigns ready for deployment. Download your deliverables package now. The ZIP contains everything: print specs, video scripts, social copy, visual direction.`);
    
    await new Promise(r => setTimeout(r, 800));
    
    addChatMessage('delmore', `*preparing client translation* We're calling this the "Proactive Stakeholder Alignment Initiative." I've prepared pamphlets explaining each campaign in terms the client can understand. The ZIP file contains everything they need.`);
    
    await new Promise(r => setTimeout(r, 800));
    
    addChatMessage('apparatus', `DELIVERABLES PACKAGE READY FOR DOWNLOAD. Click "DOWNLOAD CAMPAIGN PACKAGE" to receive your complete Cannes-ready apology campaign assets.`);
    
    setAgents(prev => prev.map(a => ({ ...a, status: 'idle', action: '', isActive: false })));
    
    // Auto-show the campaign panel
    setShowCodePanel(true);
    
    // Note: We intentionally do NOT call onComplete here
    // This keeps the user in the workspace to explore and download
  }, [company, scenarios, processScenario, addChatMessage]);

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

  const handleReset = () => {
    setIsRunning(false);
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

  // Download ZIP with all campaign assets
  const downloadZip = useCallback(async () => {
    try {
      console.log('Starting ZIP download...', { campaigns: campaigns.length, company: company.name });
      
      if (campaigns.length === 0) {
        console.error('No campaigns to download');
        addChatMessage('apparatus', 'ERROR—No campaigns available to download.');
        return;
      }
      
      const openai = getOpenAI();
      const zip = new JSZip();
      const timestamp = new Date().toISOString().split('T')[0];
      const folderName = `${company.name.toLowerCase().replace(/\s+/g, '_')}_apology_campaigns_${timestamp}`;
      
      addChatMessage('apparatus', 'COMPILING DELIVERABLES PACKAGE—Generating visual assets...');
    
    // Create main folder structure
    const mainFolder = zip.folder(folderName);
    if (!mainFolder) return;
    
    // Process each campaign
    for (let i = 0; i < campaigns.length; i++) {
      const campaign = campaigns[i];
      const scenarioFolder = mainFolder.folder(`scenario_${i + 1}_${campaign.scenarioTitle.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}`);
      if (!scenarioFolder) continue;
      
      // Campaign overview
      const overview = `PROACTIVE APOLOGY CAMPAIGN ${i + 1}
${'='.repeat(50)}

Company: ${company.name}
Scenario: ${campaign.scenarioTitle}
Generated: ${new Date(campaign.generatedAt || Date.now()).toLocaleString()}

HEADLINE
--------
"${campaign.headline}"

SUBHEADLINE
-----------
${campaign.subheadline}

APOLOGY STATEMENT
-----------------
${campaign.apologyStatement}

KEY MESSAGES
------------
${campaign.keyMessages?.map((m, j) => `${j + 1}. ${m}`).join('\n') || 'N/A'}

TONE
----
${campaign.tone}

VISUAL DIRECTION
----------------
Concept: ${campaign.visualConcept}
Colors: ${campaign.colorPalette?.join(', ') || 'N/A'}
Typography: ${campaign.typography}
`;
      scenarioFolder.file('campaign_overview.txt', overview);
      
      // Generate images if API available
      if (openai) {
        try {
          addChatMessage('burl', `*generating visuals for campaign ${i + 1}...*`);
          
          const heroImage = await generateCampaignImage(campaign, 'hero');
          if (heroImage) {
            const heroData = heroImage.split(',')[1];
            scenarioFolder.file('hero_image.png', heroData, { base64: true });
          }
          
          await new Promise(r => setTimeout(r, 500));
          
          const socialImage = await generateCampaignImage(campaign, 'social');
          if (socialImage) {
            const socialData = socialImage.split(',')[1];
            scenarioFolder.file('social_image.png', socialData, { base64: true });
          }
          
          await new Promise(r => setTimeout(r, 500));
          
          const billboardImage = await generateCampaignImage(campaign, 'billboard');
          if (billboardImage) {
            const billboardData = billboardImage.split(',')[1];
            scenarioFolder.file('billboard_visual.png', billboardData, { base64: true });
          }
        } catch (error) {
          console.error('Error generating images:', error);
        }
      }
      
      // Deliverables specs
      if (campaign.deliverables) {
        const deliverablesFolder = scenarioFolder.folder('deliverables');
        
        // Print specs
        if (campaign.deliverables.fullPageAd) {
          const printSpec = `PRINT AD SPECIFICATION
=====================

Format: ${campaign.deliverables.fullPageAd.format}
Dimensions: ${campaign.deliverables.fullPageAd.dimensions || '8.5x11"'}

HEADLINE: "${campaign.deliverables.fullPageAd.headline}"

BODY COPY:
${campaign.deliverables.fullPageAd.body}

VISUAL DIRECTION:
${campaign.deliverables.fullPageAd.visual}
`;
          deliverablesFolder?.file('print_ad_spec.txt', printSpec);
        }
        
        // Video script
        if (campaign.deliverables.videoScript) {
          const videoScript = `VIDEO SCRIPT - ${campaign.deliverables.videoScript.title}
${'='.repeat(50)}

Duration: ${campaign.deliverables.videoScript.duration}
Format: ${campaign.deliverables.videoScript.format}

SCRIPT
------
${campaign.deliverables.videoScript.script.map(shot => 
`SHOT ${shot.shot} (${shot.duration})
Visual: ${shot.visual}
Audio: ${shot.audio}
${shot.onScreenText ? `Text: ${shot.onScreenText}` : ''}
`).join('\n')}

PRODUCTION NOTES
----------------
${campaign.deliverables.videoScript.notes}
`;
          deliverablesFolder?.file('video_script.txt', videoScript);
        }
        
        // Social media
        if (campaign.deliverables.socialPosts) {
          const socialCopy = `SOCIAL MEDIA COPY DECK
=====================

${campaign.deliverables.socialPosts.map((post, j) => 
`POST ${j + 1} - ${post.platform} (${post.type})
${'─'.repeat(40)}
${post.copy}

Visual: ${post.visual}
${post.hashtags ? `Hashtags: ${post.hashtags.map(h => `#${h}`).join(' ')}` : ''}
`).join('\n')}`;
          deliverablesFolder?.file('social_copy_deck.txt', socialCopy);
        }
        
        // Billboard
        if (campaign.deliverables.billboard) {
          const oohSpec = `OUT OF HOME SPECIFICATION
========================

Format: ${campaign.deliverables.billboard.format}
Dimensions: ${campaign.deliverables.billboard.dimensions || '14x48ft'}

HEADLINE: "${campaign.deliverables.billboard.headline}"
TAGLINE: ${campaign.deliverables.billboard.body}

VISUAL: ${campaign.deliverables.billboard.visual}
`;
          deliverablesFolder?.file('ooh_billboard_spec.txt', oohSpec);
        }
      }
    }
    
    // Generate HTML Dossier
    const htmlDossier = formatApologyCampaignsAsHTML(company, scenarios, campaigns);
    mainFolder.file('apology_dossier.html', htmlDossier);
    
    // Generate individual campaign HTML previews
    campaigns.forEach((campaign, i) => {
      const campaignHtml = formatSingleCampaignAsHTML(campaign);
      const scenarioFolder = mainFolder.folder(`scenario_${i + 1}_${campaign.scenarioTitle.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}`);
      scenarioFolder?.file('campaign_preview.html', campaignHtml);
    });
    
    // Master README
    const readme = `${company.name.toUpperCase()} PROACTIVE APOLOGY CAMPAIGNS
${'='.repeat(60)}

Generated by ADHDAI — The Feral Creative Collective
Date: ${new Date().toLocaleString()}

OVERVIEW
--------
This package contains ${campaigns.length} proactive apology campaign(s) for potential future doomsday scenarios.

CAMPAIGNS INCLUDED
------------------
${campaigns.map((c, i) => `${i + 1}. "${c.headline}" (${c.scenarioTitle})`).join('\n')}

FOLDER STRUCTURE
----------------
Root:
- apology_dossier.html - Complete visual presentation (open in browser)
- README.txt - This file

Each scenario folder contains:
- campaign_overview.txt - Full campaign details
- campaign_preview.html - Individual campaign preview
- hero_image.png - Hero campaign visual (if generated)
- social_image.png - Social media visual (if generated)  
- billboard_visual.png - OOH visual (if generated)
- deliverables/ - Print specs, video scripts, social copy

USAGE NOTES
-----------
These campaigns are designed for PREEMPTIVE deployment. Deploy apology
before the disaster occurs for maximum corporate accountability points.

DISCLAIMER
----------
This is satirical content generated by ADHDAI. Any resemblance to actual
corporate crisis communications is entirely intentional.

---
THE FERAL CREATIVE COLLECTIVE
"We are the best at the worst"
`;
    mainFolder.file('README.txt', readme);
    
    // Generate and download
    addChatMessage('apparatus', 'PACKAGING COMPLETE—Initiating download...');
    console.log('Generating ZIP blob...');
    const content = await zip.generateAsync({ type: 'blob' });
    console.log('ZIP generated, size:', content.size);
    saveAs(content, `${folderName}.zip`);
    
    addChatMessage('apparatus', `DELIVERABLES PACKAGE READY—${folderName}.zip downloaded.`);
    } catch (error) {
      console.error('Error downloading ZIP:', error);
      addChatMessage('apparatus', `ERROR—Failed to generate download: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
          {onBack && (
            <button className="control-btn back-btn" onClick={onBack}>
              <ArrowLeft size={16} weight="bold" />
              <span>Back</span>
            </button>
          )}
          {!isRunning ? (
            <button className="control-btn start-btn" onClick={handleStart}>
              <Play size={16} weight="bold" />
              <span>START CAMPAIGNS</span>
            </button>
          ) : (
            <button className="control-btn pause-btn" onClick={handleReset}>
              <Stop size={16} weight="bold" />
              <span>STOP</span>
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
            {company.name} / Scenario {currentScenarioIndex + 1} of {scenarios.length}
          </span>
        </div>
        
        <div className="controls-right">
          <span className="task-summary">
            {taskCounts.todo} todo / {taskCounts.inProgress} active / {taskCounts.done} done
          </span>
          {campaigns.length > 0 && (
            <button className="control-btn download-btn" onClick={() => setShowCodePanel(true)}>
              <Package size={16} weight="bold" />
              <span>VIEW CAMPAIGNS</span>
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
                    {getCharacterIcon(char.icon, 12)} {char.name.split(' ')[0]}
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
                    <span className="chat-name" style={{ color: char.color }}>{char.name.split(' ')[0]}</span>
                  </div>
                  <div className="chat-content">{msg.content}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

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
