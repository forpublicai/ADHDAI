import React, { useEffect, useRef, useState, useCallback } from 'react';
import OpenAI from 'openai';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { CHARACTERS } from '../../constants';
import { CharacterId, DoomsdayScenario, ApologyCampaign } from '../../types';
import { Fortune500Company } from '../../data/fortune500';
import { generateApologyCampaign, generateCampaignImage } from '../../services/apologyGenerator';
import { formatApologyCampaignsAsHTML, formatSingleCampaignAsHTML } from '../../services/apologyDeliverables';
import * as dialogue from '../../utils/dialogueGenerator';
import './CanvasWorkspace.css';

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
  onComplete,
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
  const processScenario = useCallback(async (scenario: DoomsdayScenario, index: number) => {
    const scenarioTasks = tasks.filter(t => t.scenarioId === scenario.id);
    
    // Phase 1: Mike analyzes the scenario
    setCurrentPhase(1);
    setPhaseLabel(`ANALYZING SCENARIO ${index + 1}: ${scenario.title.slice(0, 30)}...`);
    
    moveAgentTo('mike', { x: 480, y: 140 }, 'thinking', 'Analyzing scenario...');
    addChatMessage('mike', `*examines dossier* "${scenario.title}" — ${scenario.severity} severity. This is going to require... preemptive contrition.`);
    
    await new Promise(r => setTimeout(r, 2000));
    
    createWorkItem('mike', 'scenario', 
      `SCENARIO ${index + 1}:\n${scenario.title}\n\nSeverity: ${scenario.severity}\nCategory: ${scenario.category}\nTimeline: ${scenario.timeHorizon}`,
      { x: 400, y: 100 }, 1, true, scenario.id
    );
    
    updateTaskStatus(scenarioTasks[0]?.id || '', 'done');
    
    await new Promise(r => setTimeout(r, 2500));
    
    // Phase 2: Poole develops strategy
    setCurrentPhase(2);
    setPhaseLabel('STRATEGIC FRAMEWORK');
    
    moveAgentTo('poole', { x: 820, y: 140 }, 'typing', 'Building apology framework...');
    addChatMessage('poole', `The Proactive Apology Matrix™ suggests we position this as... "anticipatory accountability." The consumer's latent guilt becomes our ally.`);
    
    await new Promise(r => setTimeout(r, 2000));
    
    createWorkItem('poole', 'framework',
      `APOLOGY STRATEGY:\n\n• Pre-emptive contrition\n• Stakeholder deflection\n• Performative transparency\n• Future-state regret positioning`,
      { x: 740, y: 100 }, 2, true, scenario.id
    );
    
    updateTaskStatus(scenarioTasks[1]?.id || '', 'done');
    
    await new Promise(r => setTimeout(r, 2500));
    
    // Phase 3: The Cell writes copy
    setCurrentPhase(3);
    setPhaseLabel('APOLOGY COPYWRITING');
    
    moveAgentTo('the-cell', { x: 1180, y: 140 }, 'typing', 'Writing apology...');
    addChatMessage('the-cell', `[VERA]: We apologize for things that haven't happened yet. [GJON]: It's the new frontier. [THURSDAY]: *already typing*`);
    
    await new Promise(r => setTimeout(r, 2000));
    
    // Generate the actual campaign
    const campaign = await generateApologyCampaign(scenario, company);
    setCampaigns(prev => [...prev, campaign]);
    
    createWorkItem('the-cell', 'apology',
      `APOLOGY HEADLINE:\n"${campaign.headline}"\n\n${campaign.subheadline}\n\n${campaign.apologyStatement}`,
      { x: 1080, y: 90 }, 3, true, scenario.id
    );
    
    addChatMessage('the-cell', `[THURSDAY]: "${campaign.headline}" — it sounds sorry but commits to nothing. Perfect.`);
    
    updateTaskStatus(scenarioTasks[2]?.id || '', 'done');
    
    await new Promise(r => setTimeout(r, 3000));
    
    // Phase 4: Burl does visual direction
    setCurrentPhase(4);
    setPhaseLabel('VISUAL DIRECTION');
    
    moveAgentTo('burl', { x: 480, y: 440 }, 'designing', 'Setting visual tone...');
    addChatMessage('burl', `The visual language should say "we're sorry" in a way that photographs well. Corporate blue. Handclasp imagery. Dawn breaking over... something.`);
    
    await new Promise(r => setTimeout(r, 2000));
    
    createWorkItem('burl', 'visual',
      `VISUAL DIRECTION:\n\n• Colors: ${campaign.colorPalette?.join(', ') || 'Corporate trust palette'}\n• Typography: ${campaign.typography || 'Helvetica Neue / Georgia'}\n• Mood: ${campaign.visualConcept || 'Sincere but safely vague'}`,
      { x: 400, y: 380 }, 4, true, scenario.id
    );
    
    updateTaskStatus(scenarioTasks[3]?.id || '', 'done');
    
    await new Promise(r => setTimeout(r, 2500));
    
    // Phase 5: Apparatus compiles
    setCurrentPhase(5);
    setPhaseLabel('CAMPAIGN COMPILATION');
    
    moveAgentTo('apparatus', { x: 820, y: 700 }, 'typing', 'Compiling campaign...');
    addChatMessage('apparatus', `COMPILING APOLOGY CAMPAIGN ${index + 1} OF ${scenarios.length}—`);
    
    await new Promise(r => setTimeout(r, 2000));
    
    createWorkItem('apparatus', 'approval',
      `✓ CAMPAIGN ${index + 1} COMPLETE\n\n"${campaign.headline}"\n\nScenario: ${scenario.title}\nStatus: READY FOR DEPLOYMENT`,
      { x: 760, y: 660 }, 5, false, scenario.id
    );
    
    updateTaskStatus(scenarioTasks[4]?.id || '', 'done');
    
    addChatMessage('apparatus', `APOLOGY CAMPAIGN ${index + 1} COMPILED SUCCESSFULLY—${new Date().toLocaleTimeString()}`);
    
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
    for (let i = 0; i < scenarios.length; i++) {
      setCurrentScenarioIndex(i);
      await processScenario(scenarios[i], i);
      
      if (i < scenarios.length - 1) {
        addChatMessage('nadya', `⏱ Scenario ${i + 1} complete. Moving to next. We are ${i + 1}/${scenarios.length} done.`);
        await new Promise(r => setTimeout(r, 1500));
      }
    }
    
    // Completion
    setPhaseLabel('✓ ALL CAMPAIGNS COMPLETE');
    addChatMessage('apparatus', `ALL ${scenarios.length} APOLOGY CAMPAIGNS COMPILED—READY FOR REVIEW—${new Date().toLocaleTimeString()}`);
    addChatMessage('mike', `The work is done. ${company.name} can now apologize for disasters that haven't happened yet. The future of corporate accountability.`);
    addChatMessage('delmore', `*preparing client translation* "Proactive Stakeholder Alignment Initiative" — that's what we'll call it.`);
    
    setAgents(prev => prev.map(a => ({ ...a, status: 'idle', action: '', isActive: false })));
    
    if (onComplete) {
      onComplete(campaigns);
    }
  }, [company, scenarios, processScenario, addChatMessage, campaigns, onComplete]);

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
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${folderName}.zip`);
    
    addChatMessage('apparatus', `DELIVERABLES PACKAGE READY—${folderName}.zip downloaded.`);
  }, [company, campaigns, addChatMessage]);

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
              ← Back
            </button>
          )}
          {!isRunning ? (
            <button className="control-btn start-btn" onClick={handleStart}>
              ▶ START CAMPAIGNS
            </button>
          ) : (
            <button className="control-btn pause-btn" onClick={handleReset}>
              ⏹ STOP
            </button>
          )}
          <button className="control-btn reset-btn" onClick={handleReset}>
            ↺ RESET
          </button>
        </div>
        
        <div className="controls-center">
          <div className="phase-indicator">{phaseLabel}</div>
          <span className="item-count">
            {company.name} • Scenario {currentScenarioIndex + 1}/{scenarios.length}
          </span>
        </div>
        
        <div className="controls-right">
          <span className="task-summary">
            {taskCounts.todo} todo • {taskCounts.inProgress} active • {taskCounts.done} done
          </span>
          {campaigns.length > 0 && (
            <button className="control-btn download-btn" onClick={() => setShowCodePanel(true)}>
              📦 VIEW CAMPAIGNS
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
                <span>📋 TASKS</span>
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
                        <span className="task-emoji">{char.emoji}</span>
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
                        <span className="task-emoji">{char.emoji}</span>
                        <span className="task-title">{task.title}</span>
                        <span className="task-working">⏳</span>
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
                        <span className="task-emoji">{char.emoji}</span>
                        <span className="task-title">{task.title}</span>
                        <span className="task-check">✓</span>
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
                    {char.emoji} {char.name.split(' ')[0]}
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
                <span>📦 CAMPAIGNS</span>
                {campaigns.length > 0 && (
                  <button className="view-code-btn" onClick={() => setShowCodePanel(true)}>
                    VIEW ALL
                  </button>
                )}
              </div>
              <div className="final-output-content">
                {campaigns.length > 0 ? (
                  <div className="output-ready">
                    <span className="output-status">✓ {campaigns.length} READY</span>
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
                    {char.emoji}
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
            <span className="chat-title">💬 AGENT CHAT</span>
            <span className="chat-phase">Phase {currentPhase}/5</span>
          </div>
          <div className="chat-messages" ref={chatMessagesRef}>
            {chatMessages.map(msg => {
              const char = getCharacterInfo(msg.from);
              return (
                <div key={msg.id} className="chat-message" style={{ borderLeftColor: char.color }}>
                  <div className="chat-sender">
                    <span className="chat-emoji">{char.emoji}</span>
                    <span className="chat-name" style={{ color: char.color }}>{char.name.split(' ')[0]}</span>
                  </div>
                  <div className="chat-content">{msg.content}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Code Panel */}
      {showCodePanel && (
        <div className="code-panel-overlay" onClick={() => setShowCodePanel(false)}>
          <div className="code-panel" onClick={e => e.stopPropagation()}>
            <div className="code-panel-header">
              <span>📦 APOLOGY CAMPAIGNS ({campaigns.length})</span>
              <div className="code-panel-actions">
                <button className="download-btn" onClick={downloadZip}>📥 DOWNLOAD ZIP</button>
                <button className="close-btn" onClick={() => setShowCodePanel(false)}>✕</button>
              </div>
            </div>
            <div className="code-panel-content">
              {campaigns.map((campaign, index) => (
                <div key={campaign.id} className="campaign-preview">
                  <h3>Campaign {index + 1}: {campaign.scenarioTitle}</h3>
                  <div className="campaign-headline">"{campaign.headline}"</div>
                  <div className="campaign-subheadline">{campaign.subheadline}</div>
                  <p className="campaign-statement">{campaign.apologyStatement}</p>
                  <div className="campaign-messages">
                    <strong>Key Messages:</strong>
                    <ul>
                      {campaign.keyMessages?.map((msg, i) => (
                        <li key={i}>{msg}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
            <div className="code-panel-footer">
              <strong>Download ZIP</strong> for full deliverables including images, video scripts, social copy, and print specifications.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApologyCanvasWorkspace;
