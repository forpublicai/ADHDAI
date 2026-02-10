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
import { generatePrintAdHtml, generateBillboardHtml, generateBillboardSvg, generatePrintAdSvg, generateBannerSvg, generateSocialPostsHtml, generateStoryboardHtml, generateBannerAdsHtml } from '../../utils/assetGenerator';
import { generateDialogueBatch, generateAgentLine } from '../../services/dialogueService';
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
  const proximityCheckRef = useRef<((itemId: string) => void) | null>(null);
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
      // Trigger bot reactions when items are dropped near each other
      if (proximityCheckRef.current) {
        proximityCheckRef.current(draggedItem);
      }
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

  // ============================================
  // MERGE ON OVERLAP — when items overlap, generate a new combined idea
  // ============================================
  const generateMergeConversation = useCallback(async (item1: WorkItem, item2: WorkItem): Promise<void> => {
    const agent1 = getCharacterInfo(item1.createdBy);
    const agent2 = getCharacterInfo(item2.createdBy);
    const content1 = (item1.content || '').slice(0, 200);
    const content2 = (item2.content || '').slice(0, 200);
    const mergeContext = `Company: ${company.name}. Idea 1 (${agent1.name}): "${content1}". Idea 2 (${agent2.name}): "${content2}".`;

    // Generate merged idea + dialogue in parallel via API
    const [mergedIdea, dialogueLines] = await Promise.all([
      generateAgentLine('apparatus',
        `Synthesize these two ideas into a NEW combined concept for ${company.name}'s campaign. Idea 1 from ${agent1.name}: "${content1}". Idea 2 from ${agent2.name}: "${content2}". Output a merged concept with a title, 2-3 sentence description, and 3 bullet points showing what each idea contributes.`,
        mergeContext
      ),
      generateDialogueBatch(
        [item1.createdBy, item2.createdBy],
        `${agent1.name} and ${agent2.name} have just discovered their work items overlap — they see connections between "${content1}" and "${content2}". They get excited about combining them. ${agent1.name} speaks first observing the connection, then ${agent2.name} builds on it.`,
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
        'concept',
        mergedIdea,
        { x: midX, y: midY },
        currentPhase,
        true // Type it out character by character
      );
      
      // Apparatus logs + a third agent reacts
      generateAgentLine('apparatus',
        `${agent1.name} and ${agent2.name} merged their ideas into a new concept. Log the synthesis.`,
        mergeContext
      ).then(line => addChatMessage('apparatus', line));

      // Third agent reacts to the new combined idea
      const others: CharacterId[] = (['mike','poole','the-cell','burl','nadya','delmore'] as CharacterId[])
        .filter(id => id !== item1.createdBy && id !== item2.createdBy);
      const third = others[Math.floor(Math.random() * others.length)];
      setTimeout(() => {
        generateAgentLine(third,
          `You see ${agent1.name} and ${agent2.name} just created a combined concept from their overlapping work. React — what does this synthesis mean for the campaign?`,
          mergeContext
        ).then(line => addChatMessage(third, line));
      }, 1500);
    }, 3000);
  }, [company.name, addChatMessage, createWorkItem, currentPhase, getCharacterInfo]);

  useEffect(() => {
    proximityCheckRef.current = (droppedItemId: string) => {
      const allItems = workItems;
      const droppedItem = allItems.find(i => i.id === droppedItemId);
      if (!droppedItem || allItems.length < 2) return;

      // Find overlapping item
      const collidingItem = allItems.find(item => {
        if (item.id === droppedItemId) return false;
        if (item.createdBy === droppedItem.createdBy) return false;
        const dx = Math.abs(item.position.x - droppedItem.position.x);
        const dy = Math.abs(item.position.y - droppedItem.position.y);
        return dx < 150 && dy < 80;
      });

      if (collidingItem) {
        generateMergeConversation(droppedItem, collidingItem);
      }
    };
  }, [workItems, generateMergeConversation]);

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

  // Process a single scenario — ALL bots contribute to each phase
  const processScenario = useCallback(async (scenario: DoomsdayScenario, index: number): Promise<ApologyCampaign> => {
    const scenarioTasks = tasks.filter(t => t.scenarioId === scenario.id);
    
    // ============================
    // PHASE 1: SCENARIO ANALYSIS (Mike leads, everyone reacts)
    // ============================
    setCurrentPhase(1);
    setPhaseLabel(`ANALYZING SCENARIO ${index + 1}: ${scenario.title}`);
    
    const scenarioContext = `Company: ${company.name} (${company.industry}). Scenario: "${scenario.title}" — ${scenario.severity} severity, ${scenario.category} category. ${scenario.description}. Affected: ${scenario.affectedParties.join(', ')}. Timeline: ${scenario.timeHorizon}.`;
    
    // Phase 1: All agents react to the scenario — one batched API call
    const phase1Lines = await generateDialogueBatch(
      ['mike', 'poole', 'the-cell', 'burl', 'nadya', 'delmore', 'apparatus'],
      `The team is seeing a new doomsday scenario for the first time: "${scenario.title}" (${scenario.severity}, ${scenario.category}). Mike opens the dossier and gives his assessment. Poole maps the strategic implications. The Cell starts thinking about copy angles. Burl sees visual possibilities. Nadya notes the timeline. Delmore considers the client communication. Apparatus logs the data.`,
      scenarioContext
    );
    
    moveAgentTo('mike', { x: 480, y: 140 }, 'thinking', 'Analyzing scenario...');
    addChatMessage('mike', phase1Lines['mike']);
    
    await delayOrSkip(1500);
    
    moveAgentTo('poole', { x: 780, y: 120 }, 'thinking', 'Assessing risk topology...');
    addChatMessage('poole', phase1Lines['poole']);
    
    await delayOrSkip(1200);
    
    moveAgentTo('the-cell', { x: 1160, y: 120 }, 'thinking', 'Reading scenario...');
    addChatMessage('the-cell', phase1Lines['the-cell']);
    
    await delayOrSkip(1000);
    
    addChatMessage('burl', phase1Lines['burl']);
    addChatMessage('nadya', phase1Lines['nadya']);
    addChatMessage('delmore', phase1Lines['delmore']);
    addChatMessage('apparatus', phase1Lines['apparatus']);
    
    await delayOrSkip(1500);
    
    createWorkItem('mike', 'scenario', 
      `SCENARIO ${index + 1}:\n${scenario.title}\n\nDescription: ${scenario.description}\n\nSeverity: ${scenario.severity}\nCategory: ${scenario.category}\nTimeline: ${scenario.timeHorizon}\n\nPotential Damage: ${scenario.potentialDamage}\nAffected Parties: ${scenario.affectedParties.join(', ')}`,
      { x: 400, y: 100 }, 1, true, scenario.id
    );
    
    updateTaskStatus(scenarioTasks[0]?.id || '', 'done');
    
    await delayOrSkip(2000);
    
    // ============================
    // PHASE 2: STRATEGIC FRAMEWORK (Poole leads, all react)
    // ============================
    setCurrentPhase(2);
    setPhaseLabel('STRATEGIC FRAMEWORK');
    
    // Phase 2: Strategy — batched API call
    const phase2Lines = await generateDialogueBatch(
      ['poole', 'mike', 'the-cell', 'burl', 'nadya', 'delmore', 'apparatus'],
      `Poole is building the strategic framework for the preemptive apology. He's mapping "${scenario.potentialDamage}" into his methodology. Mike watches skeptically. The Cell gets impatient waiting for the framework to finish so they can write. Burl starts seeing visuals. Nadya checks the timeline. Delmore prepares for client translation. Apparatus logs the framework.`,
      scenarioContext
    );
    
    moveAgentTo('poole', { x: 820, y: 140 }, 'typing', 'Building apology framework...');
    addChatMessage('poole', phase2Lines['poole']);
    
    await delayOrSkip(1500);
    
    addChatMessage('mike', phase2Lines['mike']);
    
    await delayOrSkip(800);
    
    addChatMessage('the-cell', phase2Lines['the-cell']);
    
    moveAgentTo('burl', { x: 460, y: 400 }, 'designing', 'Sketching...');
    addChatMessage('burl', phase2Lines['burl']);
    
    await delayOrSkip(800);
    
    addChatMessage('nadya', phase2Lines['nadya']);
    addChatMessage('delmore', phase2Lines['delmore']);
    addChatMessage('apparatus', phase2Lines['apparatus']);
    
    await delayOrSkip(1200);
    
    createWorkItem('poole', 'framework',
      `APOLOGY STRATEGY FOR: ${scenario.title}\n\n• Pre-emptive contrition positioning\n• Stakeholder deflection architecture\n• Performative transparency framework\n• Future-state regret positioning\n• Anticipatory accountability protocol\n\nCore Insight: Apologize before the disaster to own the narrative.`,
      { x: 740, y: 100 }, 2, true, scenario.id
    );
    
    updateTaskStatus(scenarioTasks[1]?.id || '', 'done');
    
    await delayOrSkip(2000);
    
    // ============================
    // PHASE 3: CREATIVE DEVELOPMENT (Cell leads, all react)
    // ============================
    setCurrentPhase(3);
    setPhaseLabel('CREATIVE DEVELOPMENT');
    
    moveAgentTo('the-cell', { x: 1180, y: 140 }, 'typing', 'Writing campaign...');
    
    // Cell announces they're starting — single line
    const cellStartLine = await generateAgentLine('the-cell',
      `The Cell is beginning to write copy options for the preemptive apology campaign. Vera starts conventional, Gjon pushes back, Thursday is already silently writing something strange.`,
      scenarioContext
    );
    addChatMessage('the-cell', cellStartLine);
    
    await delayOrSkip(1500);
    
    // Generate the actual campaign via API
    const campaign = await generateApologyCampaign(scenario, company);
    
    // Cell presents options and Thursday's winner
    const copyContext = `${scenarioContext} Campaign headline: "${campaign.headline}". Tagline: "${campaign.subheadline}". Key message: "${campaign.keyMessages?.[0] || ''}".`;
    
    const phase3Lines = await generateDialogueBatch(
      ['the-cell', 'mike', 'poole', 'burl', 'nadya', 'delmore', 'apparatus'],
      `The Cell has finished writing three options. Option A was safe (Vera's). Option B was confrontational (Gjon's). Option C was Thursday's — strange, devastating, and perfect: "${campaign.headline}". Thursday wins the vote 2-1, as usual. Now everyone reacts to the winning headline. Mike is impressed. Poole is theoretically baffled but approves. Burl sees the visual instantly. Nadya notes progress. Delmore considers client presentation. Apparatus logs the creative output.`,
      copyContext
    );
    
    addChatMessage('the-cell', phase3Lines['the-cell']);
    
    await delayOrSkip(1200);
    
    addChatMessage('mike', phase3Lines['mike']);
    addChatMessage('poole', phase3Lines['poole']);
    
    await delayOrSkip(800);
    
    moveAgentTo('burl', { x: 460, y: 420 }, 'designing', 'Reading copy...');
    addChatMessage('burl', phase3Lines['burl']);
    addChatMessage('nadya', phase3Lines['nadya']);
    addChatMessage('delmore', phase3Lines['delmore']);
    addChatMessage('apparatus', phase3Lines['apparatus']);
    
    // Create the Cell's work item with FULL copy output
    createWorkItem('the-cell', 'apology',
      `COPY TRANSMITTAL — The Cell\n\n━━━ OPTION A (Vera) ━━━\n"We See What's Coming."\nSafe. Corporate. Approved.\n\n━━━ OPTION B (Gjon) ━━━\n"${campaign.keyMessages?.[0] || 'The future is our fault.'}"\nConfrontational. Real.\n\n━━━ OPTION C (Thursday) ✓ ━━━\n"${campaign.headline}"\n${campaign.subheadline}\n\nVOTE: 2-1, Thursday carries.\n\n━━━ MANIFESTO ━━━\n${campaign.apologyStatement}\n\n━━━ KEY ANGLES ━━━\n${campaign.keyMessages?.map((m, i) => `${i + 1}. ${m}`).join('\n') || 'N/A'}\n\n— The Cell`,
      { x: 1080, y: 90 }, 3, true, scenario.id
    );
    
    setCampaigns(prev => [...prev, campaign]);
    updateTaskStatus(scenarioTasks[2]?.id || '', 'done');
    
    await delayOrSkip(2500);
    
    // ============================
    // PHASE 4: VISUAL DIRECTION (Burl leads, all react)
    // ============================
    setCurrentPhase(4);
    setPhaseLabel('VISUAL DIRECTION');
    
    const visualContext = `${copyContext} Visual concept: ${campaign.visualConcept || 'confessional minimalism'}. Colors: ${campaign.colorPalette?.join(', ') || 'desaturated brand palette'}. Typography: ${campaign.typography || 'institutional serif meets clean sans'}.`;
    
    moveAgentTo('burl', { x: 480, y: 440 }, 'designing', 'Setting visual tone...');
    
    const phase4Lines = await generateDialogueBatch(
      ['burl', 'the-cell', 'poole', 'mike', 'nadya', 'delmore', 'apparatus'],
      `Burl is defining the visual direction for ${company.name}'s apology campaign. He's using their brand aesthetic but subverting it for confession. The Cell evaluates whether the visual supports the copy. Poole sees his framework reflected in the color choices. Mike appreciates the emotional weight. Nadya demands a timeline for visual deliverables, Burl resists deadlines. Delmore considers how it'll present to the client board. Apparatus logs specs.`,
      visualContext
    );
    
    addChatMessage('burl', phase4Lines['burl']);
    
    await delayOrSkip(1500);
    
    addChatMessage('the-cell', phase4Lines['the-cell']);
    addChatMessage('poole', phase4Lines['poole']);
    
    await delayOrSkip(800);
    
    addChatMessage('mike', phase4Lines['mike']);
    addChatMessage('nadya', phase4Lines['nadya']);
    
    await delayOrSkip(800);
    
    addChatMessage('delmore', phase4Lines['delmore']);
    addChatMessage('apparatus', phase4Lines['apparatus']);
    
    createWorkItem('burl', 'visual',
      `VISUAL DIRECTION — CAMPAIGN ${index + 1}\n\n━━━ ART DIRECTION ━━━\n• Colors: ${campaign.colorPalette?.join(', ') || 'Brand palette, desaturated'}\n• Typography: ${campaign.typography || 'Official but weathered'}\n• Concept: ${campaign.visualConcept || 'Documentary authenticity'}\n\n━━━ NOTES ━━━\n- ${company.name} brand language, subverted\n- Confessional minimalism\n- Images that feel found, not staged\n- The aesthetic of uncomfortable truth\n- "Ugly-beautiful" — Burl's directive`,
      { x: 400, y: 380 }, 4, true, scenario.id
    );
    
    updateTaskStatus(scenarioTasks[3]?.id || '', 'done');
    
    await delayOrSkip(2000);
    
    // ============================
    // PHASE 5: PRODUCTION SCHEDULING (Nadya leads, all react)
    // ============================
    setCurrentPhase(5);
    setPhaseLabel('PRODUCTION SCHEDULING');
    
    moveAgentTo('nadya', { x: 820, y: 440 }, 'typing', 'Building production schedule...');
    
    const phase5Lines = await generateDialogueBatch(
      ['nadya', 'mike', 'poole', 'the-cell', 'burl', 'delmore', 'apparatus'],
      `Nadya is locking the production schedule — print, billboard, video, social, digital. She announces aggressive deadlines. Mike protests the timeline. Nadya counters with her trademark Tereshkova reference or Soviet-inspired wisdom. Poole wants more time for the framework. The Cell is impatient. Burl grumbles about art not punching a clock. Delmore prepares for the client meeting. Apparatus logs the schedule with ${scenarioTasks.length} deliverables.`,
      visualContext
    );
    
    addChatMessage('nadya', phase5Lines['nadya']);
    
    await delayOrSkip(1200);
    
    addChatMessage('mike', phase5Lines['mike']);
    
    await delayOrSkip(800);
    
    addChatMessage('poole', phase5Lines['poole']);
    addChatMessage('the-cell', phase5Lines['the-cell']);
    addChatMessage('burl', phase5Lines['burl']);
    addChatMessage('delmore', phase5Lines['delmore']);
    addChatMessage('apparatus', phase5Lines['apparatus']);
    
    await delayOrSkip(1000);
    
    const tomorrow = new Date(Date.now() + 86400000).toLocaleDateString();
    const nextWeek = new Date(Date.now() + 7 * 86400000).toLocaleDateString();
    
    createWorkItem('nadya', 'schedule',
      `PRODUCTION SCHEDULE — CAMPAIGN ${index + 1}\n\n"${campaign.headline}"\n\nPRINT:\n• Prepress: ${tomorrow}\n• Proof: +2 days\n• Final: +4 days\n\nOOH:\n• Billboard specs: ${tomorrow}\n• Bus shelter: +1 day\n\nVIDEO:\n• Casting: +2 days\n• Shoot: +3 days\n• Edit: +5 days\n• Delivery: ${nextWeek}\n\nSOCIAL:\n• LinkedIn: Day 1\n• Twitter/X: Day 2\n• Instagram: Day 3\n• TikTok: Day 4\n\nACCOUNTABILITY: Named. Dated.`,
      { x: 720, y: 340 }, 5, true, scenario.id
    );
    
    updateTaskStatus(scenarioTasks[4]?.id || '', 'done');
    
    await delayOrSkip(2000);
    
    // ============================
    // PHASE 6: CLIENT TRANSLATION (Delmore leads, all react)
    // ============================
    setCurrentPhase(6);
    setPhaseLabel('CLIENT TRANSLATION');
    
    moveAgentTo('delmore', { x: 1180, y: 440 }, 'typing', 'Translating for client...');
    
    const phase6Lines = await generateDialogueBatch(
      ['delmore', 'mike', 'poole', 'the-cell', 'burl', 'nadya', 'apparatus'],
      `Delmore is translating the creative work into client-friendly language. He's taking "${campaign.headline}" and making it sound strategic and boardroom-safe. Mike watches with amusement — same knife, different handle. Poole admires how the framework survives in translation. The Cell is fascinated/disturbed by how their words get softened. Burl evaluates the presentation aesthetics. Nadya locks the client meeting schedule. Apparatus documents the translation.`,
      visualContext
    );
    
    addChatMessage('delmore', phase6Lines['delmore']);
    
    await delayOrSkip(1200);
    
    addChatMessage('mike', phase6Lines['mike']);
    addChatMessage('poole', phase6Lines['poole']);
    addChatMessage('the-cell', phase6Lines['the-cell']);
    
    await delayOrSkip(800);
    
    addChatMessage('burl', phase6Lines['burl']);
    addChatMessage('nadya', phase6Lines['nadya']);
    addChatMessage('apparatus', phase6Lines['apparatus']);
    
    await delayOrSkip(1000);
    
    createWorkItem('delmore', 'translation',
      `CLIENT TRANSLATION — CAMPAIGN ${index + 1}\n\n"${campaign.headline}"\n\nCLIENT-FACING LANGUAGE:\n• "Apology" → "Proactive Brand Integrity Initiative"\n• "Disaster" → "Anticipated Market Disruption"\n• "Sorry" → "Stakeholder-Aligned Acknowledgment"\n• "Crisis" → "Opportunity for Authentic Engagement"\n\nTALKING POINTS:\n1. Positions ${company.name} as industry leader in transparency\n2. Pre-emptive accountability builds consumer trust\n3. Campaign designed for award recognition\n4. ROI measured in brand sentiment\n\nPAMPHLET: Prepared on risograph.`,
      { x: 1060, y: 340 }, 6, true, scenario.id
    );
    
    updateTaskStatus(scenarioTasks[5]?.id || '', 'done');
    
    await delayOrSkip(2000);
    
    // ============================
    // PHASE 7: COMPILATION & ASSET GENERATION (Apparatus leads, all react)
    // ============================
    setCurrentPhase(7);
    setPhaseLabel('COMPILING CAMPAIGN & GENERATING ASSETS');
    
    moveAgentTo('apparatus', { x: 820, y: 700 }, 'typing', 'Compiling campaign & generating images...');
    
    const compilationLine = await generateAgentLine('apparatus',
      `Apparatus is initiating final compilation of campaign ${index + 1} of ${scenarios.length}. All creative assets are being assembled — copy, visual, production schedule, client translation. Image generation via DALL-E is starting for hero, billboard, and social formats.`,
      visualContext
    );
    addChatMessage('apparatus', compilationLine);
    
    await delayOrSkip(1000);
    
    const imageStartLine = await generateAgentLine('apparatus',
      `Apparatus is now generating campaign images via DALL-E — hero visual, billboard format, social media square. The image pipeline is active.`,
      `Campaign: "${campaign.headline}"`
    );
    addChatMessage('apparatus', imageStartLine);
    
    // Try to generate images
    let generatedImages: { hero?: string; billboard?: string; social?: string } = {};
    try {
      const [heroResult, billboardResult, socialResult] = await Promise.allSettled([
        generateCampaignImage(campaign, 'hero'),
        generateCampaignImage(campaign, 'billboard'),
        generateCampaignImage(campaign, 'social')
      ]);
      
      if (heroResult.status === 'fulfilled' && heroResult.value) {
        generatedImages.hero = heroResult.value;
        addChatMessage('apparatus', await generateAgentLine('apparatus', 'Hero image has been successfully generated at 1024x1024 HD quality.', `Campaign: "${campaign.headline}"`));
      }
      if (billboardResult.status === 'fulfilled' && billboardResult.value) {
        generatedImages.billboard = billboardResult.value;
        addChatMessage('apparatus', await generateAgentLine('apparatus', 'Billboard image has been generated at 1792x1024 wide format.', `Campaign: "${campaign.headline}"`));
      }
      if (socialResult.status === 'fulfilled' && socialResult.value) {
        generatedImages.social = socialResult.value;
        addChatMessage('apparatus', await generateAgentLine('apparatus', 'Social media image has been generated at 1024x1024 square format.', `Campaign: "${campaign.headline}"`));
      }
    } catch (err) {
      console.warn('Image generation skipped:', err);
      addChatMessage('apparatus', await generateAgentLine('apparatus', 'Image generation failed or was rate-limited. Falling back to HTML template-based assets.', `Campaign: "${campaign.headline}"`));
    }
    
    // Store generated images on the campaign
    campaign.generatedImages = generatedImages;
    
    // Update campaign in state
    setCampaigns(prev => {
      const updated = [...prev];
      const idx = updated.findIndex(c => c.id === campaign.id);
      if (idx >= 0) {
        updated[idx] = { ...campaign };
      }
      return updated;
    });
    
    await delayOrSkip(1000);
    
    // Everyone reacts to compilation — batched
    const phase7Lines = await generateDialogueBatch(
      ['mike', 'poole', 'the-cell', 'burl', 'nadya', 'delmore'],
      `Campaign ${index + 1} of ${scenarios.length} has just been compiled for ${company.name}. Headline: "${campaign.headline}". ${generatedImages.hero ? 'AI-generated images were created.' : 'Template assets were used.'} Each agent gives their final reaction to this campaign — a brief, character-specific closing thought.`,
      visualContext
    );
    
    addChatMessage('mike', phase7Lines['mike']);
    addChatMessage('poole', phase7Lines['poole']);
    addChatMessage('the-cell', phase7Lines['the-cell']);
    addChatMessage('burl', phase7Lines['burl']);
    addChatMessage('nadya', phase7Lines['nadya']);
    addChatMessage('delmore', phase7Lines['delmore']);
    
    await delayOrSkip(1000);
    
    createWorkItem('apparatus', 'approval',
      `CAMPAIGN ${index + 1} FINALIZED\n\nHEADLINE: "${campaign.headline}"\nTAGLINE: "${campaign.subheadline}"\n\nSCENARIO: ${scenario.title}\n\nDELIVERABLES:\n• Print Ad (HTML + ${generatedImages.hero ? 'AI Image' : 'Spec'})\n• Billboard (HTML + ${generatedImages.billboard ? 'AI Image' : 'Spec'})\n• Video Storyboard (HTML)\n• Social Deck (HTML + ${generatedImages.social ? 'AI Image' : 'Spec'})\n• Digital Banners (HTML)\n• Copy Deck\n• Production Schedule\n• Client Translation\n\nSTATUS: DEPLOYMENT READY`,
      { x: 760, y: 660 }, 7, false, scenario.id
    );
    
    updateTaskStatus(scenarioTasks[6]?.id || '', 'done');
    
    addChatMessage('apparatus', await generateAgentLine('apparatus',
      `Campaign ${index + 1} of ${scenarios.length} is fully compiled. Headline: "${campaign.headline}". ${generatedImages.hero ? 'AI-generated visuals included.' : 'Template-based assets.'} All deliverables ready for deployment. Log the completion.`,
      visualContext
    ));
    
    return campaign;
  }, [company, tasks, addChatMessage, createWorkItem, moveAgentTo, updateTaskStatus, scenarios.length, delayOrSkip]);

  // Run the full workflow
  const runWorkflow = useCallback(async () => {
    // Dialogue is now fully API-generated — no cache to reset
    
    // Opening
    const workflowContext = `${company.name} (${company.industry}, ${company.sector}). ${scenarios.length} doomsday scenarios queued for proactive apology campaign generation.`;
    
    const openingLines = await generateDialogueBatch(
      ['apparatus', 'mike'],
      `The proactive apology campaign workflow is starting. Apparatus initiates the protocol for ${company.name} with ${scenarios.length} scenarios. Mike rallies the team — he's cynical but excited about the concept of pre-emptive corporate apologies.`,
      workflowContext
    );
    addChatMessage('apparatus', openingLines['apparatus']);
    addChatMessage('mike', openingLines['mike']);
    
    await delayOrSkip(2000);
    
    // Process each scenario
    const completedCampaigns: ApologyCampaign[] = [];
    for (let i = 0; i < scenarios.length; i++) {
      setCurrentScenarioIndex(i);
      const campaign = await processScenario(scenarios[i], i);
      completedCampaigns.push(campaign);
      
      if (i < scenarios.length - 1) {
        addChatMessage('nadya', await generateAgentLine('nadya',
          `Campaign ${i + 1} of ${scenarios.length} is complete. ${scenarios.length - i - 1} remaining. Acknowledge the milestone and push forward.`,
          workflowContext
        ));
        await delayOrSkip(1500);
      }
    }
    
    // Completion - stay in workspace, don't auto-exit
    setPhaseLabel('✓ ALL CAMPAIGNS COMPLETE — READY FOR DOWNLOAD');
    setIsRunning(false);
    
    // Celebratory completion messages from ALL bots
    const completionContext = `${company.name}. ${completedCampaigns.length} campaigns completed. Headlines: ${completedCampaigns.map(c => `"${c.headline}"`).join(', ')}.`;
    
    const completionLines = await generateDialogueBatch(
      ['apparatus', 'mike', 'poole', 'the-cell', 'burl', 'nadya', 'delmore'],
      `ALL campaigns are done. ${completedCampaigns.length} total for ${company.name}. This is the final wrap-up. Apparatus announces completion. Each agent gives their final personal reaction to the body of work they've created — a brief closing thought. Mike is satisfied. Poole validates his framework. The Cell is proud. Burl sees the campaign as a whole. Nadya confirms the schedule was met. Delmore is ready for the client. Keep it brief — 1-2 sentences each.`,
      completionContext
    );
    
    addChatMessage('apparatus', completionLines['apparatus']);
    
    await delayOrSkip(500);
    addChatMessage('mike', completionLines['mike']);
    
    await delayOrSkip(600);
    addChatMessage('poole', completionLines['poole']);
    
    await delayOrSkip(600);
    addChatMessage('the-cell', completionLines['the-cell']);
    
    await delayOrSkip(600);
    addChatMessage('burl', completionLines['burl']);
    
    await delayOrSkip(600);
    addChatMessage('nadya', completionLines['nadya']);
    
    await delayOrSkip(600);
    addChatMessage('delmore', completionLines['delmore']);
    
    await delayOrSkip(600);
    
    addChatMessage('apparatus', await generateAgentLine('apparatus',
      `All ${completedCampaigns.length} campaigns are ready. Tell the user to press "DOWNLOAD ASSETS" to get the complete deliverable archive. Summarize what's included.`,
      completionContext
    ));
    
    setAgents(prev => prev.map(a => ({ ...a, status: 'idle', action: '', isActive: false })));
    
    // Mark as complete but DO NOT auto-show the panel
    // User must click "DOWNLOAD ASSETS" button to proceed
    setIsComplete(true);
    setShowCodePanel(false); // <-- Don't auto-navigate to download screen
    
    // Note: We do NOT auto-call onComplete. User must click "FINISH SESSION" to exit.
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
    generateAgentLine('apparatus', 'Fast forward has been activated. All remaining phases are being compressed into rapid execution.', `Processing campaigns for ${company.name}`).then(line => {
      addChatMessage('apparatus', line);
    });
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

  // Download ZIP with REAL campaign assets — HTML mockups + generated images
  const downloadZip = useCallback(async () => {
    try {
      if (campaigns.length === 0) {
        addChatMessage('apparatus', await generateAgentLine('apparatus', 'Error: no campaigns are available to download. The user needs to run the workflow first.', ''));
        return;
      }
      
      addChatMessage('apparatus', await generateAgentLine('apparatus',
        `Generating deliverables ZIP package for ${campaigns.length} campaign(s). Assembling HTML mockups, images, storyboards, copy decks.`,
        `${company.name} — ${campaigns.length} campaigns`
      ));
      
      const zip = new JSZip();
      const timestamp = new Date().toISOString().split('T')[0];
      const folderName = `${company.name.toLowerCase().replace(/\s+/g, '_')}_apology_campaigns_${timestamp}`;
      
      const mainFolder = zip.folder(folderName);
      if (!mainFolder) return;
      
      // Process each campaign with REAL assets
      for (let i = 0; i < campaigns.length; i++) {
        const campaign = campaigns[i];
        const scenarioSlug = campaign.scenarioTitle.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').slice(0, 40);
        const scenarioFolder = mainFolder.folder(`campaign_${i + 1}_${scenarioSlug}`);
        if (!scenarioFolder) continue;
        
        // Get any previously generated images
        const heroImg = campaign.generatedImages?.hero;
        const billboardImg = campaign.generatedImages?.billboard;
        const socialImg = campaign.generatedImages?.social;
        
        // ================================
        // 1. SVG AD ASSETS (open as images, not HTML)
        // ================================
        const adsFolder = scenarioFolder.folder('ads');
        
        // Billboard SVG — opens as a real image
        const billboardSvg = generateBillboardSvg(campaign, billboardImg || undefined);
        adsFolder?.file('billboard_14x48ft.svg', billboardSvg);
        
        // Print Ad SVG — opens as a real image
        const printAdSvg = generatePrintAdSvg(campaign, heroImg || undefined);
        adsFolder?.file('print_ad_fullpage.svg', printAdSvg);
        
        // Banner SVGs — real image files per size
        adsFolder?.file('banner_leaderboard_728x90.svg', generateBannerSvg(campaign, 728, 90));
        adsFolder?.file('banner_medium_rect_300x250.svg', generateBannerSvg(campaign, 300, 250));
        adsFolder?.file('banner_skyscraper_160x600.svg', generateBannerSvg(campaign, 160, 600));
        
        // Social Media Deck — HTML (multi-post, needs scrolling)
        const socialHtml = generateSocialPostsHtml(campaign, socialImg || undefined);
        adsFolder?.file('social_media_deck.html', socialHtml);
        
        // Video Storyboard — HTML (multi-frame, needs scrolling)
        const storyboardHtml = generateStoryboardHtml(campaign, heroImg || undefined);
        if (storyboardHtml) {
          adsFolder?.file('video_storyboard.html', storyboardHtml);
        }
        
        // Keep HTML versions as bonus previews
        const previewFolder = scenarioFolder.folder('previews');
        previewFolder?.file('print_ad_preview.html', generatePrintAdHtml(campaign, heroImg || undefined));
        previewFolder?.file('billboard_preview.html', generateBillboardHtml(campaign, billboardImg || undefined));
        previewFolder?.file('banner_suite_preview.html', generateBannerAdsHtml(campaign));
        
        // ================================
        // 2. GENERATED IMAGES (PNG)
        // ================================
        const imagesFolder = scenarioFolder.folder('images');
        
        if (heroImg) {
          // heroImg is either base64 data URL or raw base64
          const rawBase64 = heroImg.startsWith('data:') 
            ? heroImg.split(',')[1] 
            : heroImg;
          imagesFolder?.file('hero_image.png', rawBase64, { base64: true });
        }
        
        if (billboardImg) {
          const rawBase64 = billboardImg.startsWith('data:') 
            ? billboardImg.split(',')[1] 
            : billboardImg;
          imagesFolder?.file('billboard_image.png', rawBase64, { base64: true });
        }
        
        if (socialImg) {
          const rawBase64 = socialImg.startsWith('data:') 
            ? socialImg.split(',')[1] 
            : socialImg;
          imagesFolder?.file('social_image.png', rawBase64, { base64: true });
        }
        
        // ================================
        // 3. COPY DECK (text specs)
        // ================================
        const copyFolder = scenarioFolder.folder('copy');
        
        // Campaign overview
        copyFolder?.file('campaign_overview.txt', `PROACTIVE APOLOGY CAMPAIGN ${i + 1}
${'='.repeat(50)}

Company: ${company.name}
Scenario: ${campaign.scenarioTitle || 'Doomsday Scenario'}
Generated: ${new Date(campaign.generatedAt || Date.now()).toLocaleString()}

HEADLINE
--------
"${campaign.headline || 'We Owe You An Apology'}"

TAGLINE
-------
${campaign.subheadline || 'A proactive statement of accountability'}

MANIFESTO
---------
${campaign.apologyStatement || 'We see what is coming. And we believe you deserve to know before it arrives.'}

KEY CREATIVE ANGLES
-------------------
${campaign.keyMessages?.filter(Boolean).map((m, j) => `${j + 1}. ${m}`).join('\n') || '1. Pre-emptive accountability builds trust\n2. Honesty before the headline breaks'}

TONE: ${campaign.tone || 'Sincere corporate confession with controlled vulnerability'}

VISUAL DIRECTION
----------------
Concept: ${campaign.visualConcept || 'Brand aesthetic subverted for confession'}
Colors: ${campaign.colorPalette?.join(', ') || '#1a1a2e, #16213e, #0f3460, #e94560, #f5f5f5'}
Typography: ${campaign.typography || 'Corporate typeface at heavier weights'}
`);
        
        // Video script
        if (campaign.deliverables?.videoScript) {
          const vs = campaign.deliverables.videoScript;
          copyFolder?.file('video_script.txt', `VIDEO SCRIPT — "${vs.title}"
${'='.repeat(50)}
Duration: ${vs.duration} | Format: ${vs.format}

SCRIPT
------
${vs.script.map(shot => 
`SHOT ${shot.shot} (${shot.duration})
  Visual: ${shot.visual}
  Audio: ${shot.audio}${shot.onScreenText ? `\n  On-screen: ${shot.onScreenText}` : ''}
`).join('\n')}

DIRECTOR'S NOTES
----------------
${vs.notes}
`);
        }
        
        // Social copy deck
        if (campaign.deliverables?.socialPosts) {
          copyFolder?.file('social_copy_deck.txt', `SOCIAL MEDIA COPY DECK
${'='.repeat(50)}

${campaign.deliverables.socialPosts.map((post, j) => 
`POST ${j + 1} — ${post.platform} (${post.type})
${'─'.repeat(40)}
${post.copy}

Visual direction: ${post.visual}
${post.hashtags?.length ? `Hashtags: ${post.hashtags.map(h => `#${h}`).join(' ')}` : ''}
`).join('\n')}`);
        }
        
        // Print/OOH specs
        if (campaign.deliverables?.fullPageAd || campaign.deliverables?.billboard) {
          let specs = 'PRINT & OOH SPECIFICATIONS\n' + '='.repeat(50) + '\n\n';
          
          if (campaign.deliverables.fullPageAd) {
            const ad = campaign.deliverables.fullPageAd;
            specs += `FULL-PAGE PRINT AD (${ad.dimensions || '8.5x11"'})\n`;
            specs += `Headline: "${ad.headline}"\n`;
            specs += `Body: ${ad.body}\n`;
            specs += `Visual: ${ad.visual}\n\n`;
          }
          if (campaign.deliverables.billboard) {
            const bb = campaign.deliverables.billboard;
            specs += `BILLBOARD (${bb.dimensions || '14x48ft'})\n`;
            specs += `Headline: "${bb.headline}"\n`;
            specs += `Body: ${bb.body}\n`;
            specs += `Visual: ${bb.visual}\n\n`;
          }
          if (campaign.deliverables.busShelter) {
            const bs = campaign.deliverables.busShelter;
            specs += `BUS SHELTER (${bs.dimensions || '1800x1200mm'})\n`;
            specs += `Headline: "${bs.headline}"\n`;
            specs += `Body: ${bs.body}\n`;
            specs += `Visual: ${bs.visual}\n\n`;
          }
          if (campaign.deliverables.poster) {
            const p = campaign.deliverables.poster;
            specs += `POSTER (${p.dimensions || '594x841mm'})\n`;
            specs += `Headline: "${p.headline}"\n`;
            specs += `Body: ${p.body}\n`;
            specs += `Visual: ${p.visual}\n\n`;
          }
          
          copyFolder?.file('print_ooh_specs.txt', specs);
        }
        
        // Individual campaign HTML preview
        const campaignHtml = formatSingleCampaignAsHTML(campaign);
        scenarioFolder.file('campaign_preview.html', campaignHtml);
      }
      
      // Generate HTML Dossier (master overview)
      const htmlDossier = formatApologyCampaignsAsHTML(company, scenarios, campaigns);
      mainFolder.file('apology_dossier.html', htmlDossier);
      
      // Master README
      const hasImages = campaigns.some(c => c.generatedImages?.hero || c.generatedImages?.billboard || c.generatedImages?.social);
      mainFolder.file('README.txt', `${company.name.toUpperCase()} PROACTIVE APOLOGY CAMPAIGNS
${'='.repeat(60)}

Generated by ADHDAI — The Feral Creative Collective
Date: ${new Date().toLocaleString()}

OVERVIEW
--------
This package contains ${campaigns.length} proactive apology campaign(s) for 
potential future doomsday scenarios, complete with:

${hasImages ? '✓ AI-GENERATED IMAGES (DALL-E) — hero visuals, billboard images, social media assets' : ''}
✓ HTML AD MOCKUPS — Open in any browser to see the actual ads
✓ VIDEO STORYBOARDS — Shot-by-shot visual scripts with frames
✓ SOCIAL MEDIA DECKS — Platform-native post mockups
✓ DIGITAL BANNERS — Web-ready banner ad mockups
✓ COPY DECKS — Full copy specifications for all formats
✓ PRINT/OOH SPECS — Billboard, bus shelter, poster specifications

CAMPAIGNS INCLUDED
------------------
${campaigns.map((c, i) => `${i + 1}. "${c.headline}" (${c.scenarioTitle})`).join('\n')}

HOW TO VIEW
-----------
1. Open "apology_dossier.html" in your browser for the complete overview
2. Each campaign folder contains:
   - ads/ — HTML ad mockups (print, billboard, social, banners, storyboard)
   - images/ — AI-generated campaign images (PNG)
   - copy/ — Text specifications and scripts
   - campaign_preview.html — Individual campaign preview

USAGE NOTES
-----------
These campaigns are designed for PREEMPTIVE deployment. Deploy apology
before the disaster occurs for maximum corporate accountability points.

All HTML files are self-contained and can be opened directly in a browser.
${hasImages ? 'Generated images are included both as standalone PNGs and embedded in the HTML mockups.' : ''}

DISCLAIMER
----------
This is satirical content generated by ADHDAI. Any resemblance to actual
corporate crisis communications is entirely intentional.

---
THE FERAL CREATIVE COLLECTIVE
"We are the best at the worst"
`);
      
      // Generate and download
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${folderName}.zip`);
      addChatMessage('apparatus', await generateAgentLine('apparatus',
        `Download complete: ${folderName}.zip. Contains ${campaigns.length} campaign(s)${hasImages ? ' with AI-generated images' : ''} and full deliverable suite.`,
        `${company.name} deliverables`
      ));
      
    } catch (error) {
      console.error('Error downloading ZIP:', error);
      addChatMessage('apparatus', await generateAgentLine('apparatus',
        `Download failed with error: ${error instanceof Error ? error.message : 'Unknown error'}. Recommend retry.`,
        ''
      ));
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
              <button className="control-btn download-assets-btn" onClick={() => setShowCodePanel(true)}>
                <DownloadSimple size={16} weight="bold" />
                <span>DOWNLOAD ASSETS</span>
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
