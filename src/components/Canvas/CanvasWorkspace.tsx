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
  Check,
  Timer,
  Package,
  DownloadSimple,
  Copy,
  X,
  Eye
} from '@phosphor-icons/react';
import { CHARACTERS } from '../../constants';
import { CharacterId } from '../../types';
import { parseBrief, getImagePromptContext } from '../../utils/briefParser';
import { generateDialogueBatch, generateAgentLine } from '../../services/dialogueService';
import './CanvasWorkspace.css';

// Get icon component for character
const getCharacterIcon = (icon: string, size: number = 14) => {
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

// Initialize OpenAI — requires API key in .env
const getOpenAI = (): OpenAI => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('VITE_OPENAI_API_KEY is not set. Add it to your .env file.');
  }
  return new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
};

interface Position {
  x: number;
  y: number;
}

interface WorkItem {
  id: string;
  type: 'sticky' | 'headline' | 'visual' | 'mockup' | 'strategy' | 'framework' | 'draft' | 'approval' | 'board' | 'concept';
  content: string;
  position: Position;
  color: string;
  createdBy: CharacterId;
  timestamp: number;
  phase: number;
  isTyping?: boolean;
  displayedContent?: string;
  isDragging?: boolean;
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
}

interface CanvasWorkspaceProps {
  brief: string;
  generatedAd: string;
  onComplete?: () => void;
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
};

const INITIAL_TASKS: KanbanTask[] = [
  { id: 'task-1', title: 'Analyze brief & find truth', assignee: 'mike', status: 'todo', phase: 1 },
  { id: 'task-2', title: 'Extract human tension', assignee: 'mike', status: 'todo', phase: 1 },
  { id: 'task-3', title: 'Build strategic framework', assignee: 'poole', status: 'todo', phase: 2 },
  { id: 'task-4', title: 'Define consumer barrier', assignee: 'poole', status: 'todo', phase: 2 },
  { id: 'task-5', title: 'Create strategic reframe', assignee: 'poole', status: 'todo', phase: 2 },
  { id: 'task-6', title: 'Write headline Option A', assignee: 'the-cell', status: 'todo', phase: 3 },
  { id: 'task-7', title: 'Write headline Option B', assignee: 'the-cell', status: 'todo', phase: 3 },
  { id: 'task-8', title: 'Write headline Option C', assignee: 'the-cell', status: 'todo', phase: 3 },
  { id: 'task-9', title: 'Vote on copy direction', assignee: 'the-cell', status: 'todo', phase: 3 },
  { id: 'task-10', title: 'Define visual language', assignee: 'burl', status: 'todo', phase: 4 },
  { id: 'task-11', title: 'Set typography system', assignee: 'burl', status: 'todo', phase: 4 },
  { id: 'task-12', title: 'Create art direction', assignee: 'burl', status: 'todo', phase: 4 },
  { id: 'task-13', title: 'Lock production schedule', assignee: 'nadya', status: 'todo', phase: 5 },
  { id: 'task-14', title: 'Prepare client deck', assignee: 'delmore', status: 'todo', phase: 6 },
  { id: 'task-15', title: 'Assemble final campaign', assignee: 'apparatus', status: 'todo', phase: 7 },
  { id: 'task-16', title: 'Generate production code', assignee: 'apparatus', status: 'todo', phase: 7 },
];

const CanvasWorkspace: React.FC<CanvasWorkspaceProps> = ({ 
  brief, 
  generatedAd: _generatedAd,
  onComplete: _onComplete 
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [agents, setAgents] = useState<AgentState[]>([]);
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [tasks, setTasks] = useState<KanbanTask[]>(INITIAL_TASKS);
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [phaseLabel, setPhaseLabel] = useState('Ready to begin');
  const [finalAdCode, setFinalAdCode] = useState('');
  const [showCodePanel, setShowCodePanel] = useState(false);
  
  // Initialize with better starting position to show work areas
  const [canvasOffset, setCanvasOffset] = useState<Position>({ x: 50, y: 20 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Position>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.75);
  
  // Drag state for work items
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  
  const workflowRef = useRef<NodeJS.Timeout[]>([]);
  const typingRef = useRef<NodeJS.Timeout[]>([]);
  const workItemIdRef = useRef(0);
  const chatIdRef = useRef(0);
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  
  // Store brief in a ref to always get the latest value in callbacks
  const briefRef = useRef(brief);
  briefRef.current = brief;

  // Helper to get character info (defined early as it has no dependencies)
  const getCharacterInfo = useCallback((agentId: CharacterId) => {
    return CHARACTERS.find(c => c.id === agentId) || CHARACTERS[0];
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
  }, []);

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Generate creative content using API
  const generateCreativeContent = useCallback(async (prompt: string, _maxTokens: number = 150): Promise<string> => {
    const openai = getOpenAI();

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an Executive Creative Director at an agency on par with Wieden+Kennedy, Droga5, and Pentagram. Your work wins Cannes Grand Prix. Every word earns its place. Your style:
- DECEPTIVELY SIMPLE: Headlines that seem obvious but reveal devastating truth
- UNCOMFORTABLY HONEST: Say what everyone thinks but won't say — with craft
- VISUALLY SPARSE: Pentagram restraint — type, space, meaning
- TONALLY PRECISE: Dry wit meets emotional intelligence. No exclamation marks. Matter-of-fact surrealism.
- SPECIFIC: Never generic. Every line is about THIS product, THIS brief, THIS human tension.

Output ONLY the creative content. No explanations. No preamble. Just the work. Make it different every time — never repeat yourself.`
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: _maxTokens,
      temperature: 0.9,
    });
    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new Error('Empty response from API');
    }
    return content;
  }, []);

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
      // Get canvas container position
      const containerRect = canvasRef.current.getBoundingClientRect();
      
      // Calculate mouse position relative to the canvas content
      const mouseXInCanvas = (e.clientX - containerRect.left - canvasOffset.x) / zoom;
      const mouseYInCanvas = (e.clientY - containerRect.top - canvasOffset.y) / zoom;
      
      // Apply drag offset to get item position
      const newX = mouseXInCanvas - dragOffset.x;
      const newY = mouseYInCanvas - dragOffset.y;
      
      setWorkItems(prev => prev.map(item => 
        item.id === draggedItem 
          ? { ...item, position: { x: newX, y: newY }, isDragging: true }
          : item
      ));
    }
  }, [isPanning, panStart, draggedItem, canvasOffset, zoom, dragOffset]);

  // Handle wheel for panning (scroll), pinch for zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    // Check if it's a pinch gesture (ctrlKey is true for pinch-to-zoom on trackpads)
    if (e.ctrlKey) {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 0.95 : 1.05;
      setZoom(prev => Math.min(2, Math.max(0.3, prev * zoomFactor)));
    } else {
      // Regular scroll = pan the canvas
      e.preventDefault();
      setCanvasOffset(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }));
    }
  }, []);

  // Work item drag handlers - fixed calibration
  const handleItemMouseDown = useCallback((e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!canvasRef.current) return;
    
    const item = workItems.find(i => i.id === itemId);
    if (item) {
      // Get canvas container position
      const containerRect = canvasRef.current.getBoundingClientRect();
      
      // Calculate mouse position in canvas coordinates
      const mouseXInCanvas = (e.clientX - containerRect.left - canvasOffset.x) / zoom;
      const mouseYInCanvas = (e.clientY - containerRect.top - canvasOffset.y) / zoom;
      
      // Offset is the difference between mouse position and item position
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

  const addChatMessage = useCallback((from: CharacterId, content: string, to?: CharacterId) => {
    const msg: ChatMessage = {
      id: `chat-${chatIdRef.current++}`,
      from,
      to,
      content,
      timestamp: Date.now(),
    };
    setChatMessages(prev => [...prev.slice(-20), msg]);
  }, []);

  const createWorkItem = useCallback((
    agentId: CharacterId, 
    type: WorkItem['type'], 
    content: string, 
    position: Position,
    phase: number,
    shouldType: boolean = false
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

  // Generate agent conversation about merged ideas AND create new combined work item
  const generateMergeConversation = useCallback(async (item1: WorkItem, item2: WorkItem): Promise<void> => {
    const agent1 = getCharacterInfo(item1.createdBy);
    const agent2 = getCharacterInfo(item2.createdBy);
    const currentBrief = briefRef.current;
    
    const openai = getOpenAI();
    
    // Generate the merged idea
    const generateMergedIdea = async (): Promise<string> => {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a senior creative director synthesizing two ideas into one powerful new concept for an ad campaign. Brief: "${currentBrief}". 
            
Idea 1 from ${agent1.name}: "${item1.content}"
Idea 2 from ${agent2.name}: "${item2.content}"

Create a NEW merged concept that takes the best of both. Be specific and creative. Output in this format:
MERGED CONCEPT: [title]

[2-3 sentences describing the merged idea]

KEY ELEMENTS:
• [element from idea 1]
• [element from idea 2]  
• [new element from synthesis]`
          },
          { role: 'user', content: 'Create the merged concept.' }
        ],
        max_tokens: 200,
        temperature: 0.8,
      });
      const content = response.choices[0]?.message?.content?.trim();
      if (!content) throw new Error('Empty response from API');
      return content;
    };
    
    // Generate the dialogue
    const generateDialogue = async (): Promise<{agent1: string, agent2: string, agent1_reply: string, resolution: string}> => {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are writing dialogue between two ad agency creatives who are EXCITED about merging their ideas. ${agent1.name} (${agent1.role}) created: "${item1.content}". ${agent2.name} (${agent2.role}) created: "${item2.content}". They see potential in combining them. Be witty, creative, and build to an "aha!" moment. Output as JSON: {"agent1": "first line observing the other's work", "agent2": "response seeing the connection", "agent1_reply": "building on the synthesis", "resolution": "the breakthrough moment"}`
          },
          { role: 'user', content: 'Generate their excited collaboration dialogue.' }
        ],
        max_tokens: 300,
        temperature: 0.9,
      });
      
      const text = response.choices[0]?.message?.content || '';
      return JSON.parse(text);
    };
    
    // Execute both in parallel
    const [mergedIdea, dialogue] = await Promise.all([
      generateMergedIdea(),
      generateDialogue()
    ]);
    
    // Play out the conversation
    addChatMessage(item1.createdBy, dialogue.agent1);
    
    setTimeout(() => addChatMessage(item2.createdBy, dialogue.agent2), 1500);
    
    setTimeout(() => addChatMessage(item1.createdBy, dialogue.agent1_reply), 3000);
    
    setTimeout(() => {
      addChatMessage(item2.createdBy, dialogue.resolution);
      
      // Create the merged work item at the midpoint between the two items
      const midX = (item1.position.x + item2.position.x) / 2;
      const midY = Math.max(item1.position.y, item2.position.y) + 120;
      
      createWorkItem(
        item1.createdBy, // Credit the initiator
        'concept', // Use concept type for merged ideas
        mergedIdea,
        { x: midX, y: midY },
        currentPhase,
        true // Type it out
      );
      
      generateAgentLine('apparatus', `${agent1.name} and ${agent2.name} have merged their ideas into a new concept. Log the synthesis.`, `Collaboration between ${agent1.name} and ${agent2.name}`).then(line => {
        addChatMessage('apparatus', line);
      });
    }, 4500);
    
  }, [addChatMessage, createWorkItem, currentPhase, getCharacterInfo]);

  // Handle mouse up - detect collision for merging items
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

  // Generate final ad code with complete campaign suite
  const generateFinalAdCode = useCallback((headline: string, briefForCampaign: string) => {
    const timestamp = new Date().toISOString().slice(0, 10);
    const campaignId = Math.random().toString(36).substr(2, 6).toUpperCase();
    
    // Use intelligent brief parsing to extract product
    const parsed = parseBrief(briefForCampaign);
    const product = parsed.product || 'Campaign';
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${product.toUpperCase()} — Campaign Dossier</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, sans-serif;
      background: #0a0a0a;
      color: #e0e0e0;
      min-height: 100vh;
      padding: 40px;
      line-height: 1.6;
    }
    .campaign-dossier {
      max-width: 1200px;
      margin: 0 auto;
    }
    .dossier-header {
      border-bottom: 1px solid #333;
      padding-bottom: 30px;
      margin-bottom: 40px;
    }
    .dossier-number {
      font-size: 10px;
      letter-spacing: 3px;
      color: #666;
      margin-bottom: 10px;
    }
    .campaign-title {
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 4px;
      text-transform: uppercase;
      color: #8f8;
      margin-bottom: 20px;
    }
    .tagline {
      font-size: 32px;
      font-weight: 300;
      color: #fff;
      max-width: 600px;
      line-height: 1.3;
    }
    .section {
      margin-bottom: 60px;
    }
    .section-title {
      font-size: 10px;
      letter-spacing: 2px;
      color: #666;
      border-bottom: 1px solid #222;
      padding-bottom: 10px;
      margin-bottom: 30px;
    }
    .deliverables-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
    }
    .deliverable {
      background: #111;
      border: 1px solid #222;
      overflow: hidden;
    }
    .deliverable-header {
      padding: 15px 20px;
      background: #1a1a1a;
      border-bottom: 1px solid #222;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .deliverable-type {
      font-size: 9px;
      letter-spacing: 2px;
      color: #888;
    }
    .deliverable-format {
      font-size: 9px;
      color: #4a9;
    }
    .deliverable-preview {
      aspect-ratio: 16/9;
      background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
      position: relative;
    }
    .deliverable-preview.portrait {
      aspect-ratio: 9/16;
    }
    .deliverable-preview.square {
      aspect-ratio: 1/1;
    }
    .preview-headline {
      font-size: 18px;
      font-weight: 300;
      color: #fff;
      text-align: center;
      max-width: 80%;
    }
    .preview-brand {
      position: absolute;
      bottom: 20px;
      right: 20px;
      font-size: 8px;
      letter-spacing: 3px;
      color: #555;
    }
    .deliverable-specs {
      padding: 15px 20px;
      background: #0f0f0f;
      font-size: 10px;
      color: #666;
    }
    .spec-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
    }
    .video-frames {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 2px;
    }
    .video-frame {
      aspect-ratio: 16/9;
      background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 10px;
      text-align: center;
    }
    .frame-number {
      font-size: 8px;
      color: #4a9;
      margin-bottom: 5px;
    }
    .frame-desc {
      font-size: 8px;
      color: #888;
    }
    .social-preview {
      background: #fff;
      color: #1a1a1a;
      padding: 20px;
    }
    .social-handle {
      font-size: 10px;
      font-weight: 600;
      margin-bottom: 10px;
    }
    .social-copy {
      font-size: 12px;
      line-height: 1.5;
    }
    .social-engagement {
      margin-top: 15px;
      font-size: 9px;
      color: #888;
    }
    .ooh-preview {
      position: relative;
      background: linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%);
    }
    .ooh-context {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23333" width="100" height="100"/><rect fill="%23555" x="20" y="20" width="60" height="60" rx="2"/></svg>');
      background-size: 100px;
      opacity: 0.1;
    }
    .footer {
      margin-top: 60px;
      padding-top: 30px;
      border-top: 1px solid #222;
      display: flex;
      justify-content: space-between;
      font-size: 9px;
      color: #555;
    }
  </style>
</head>
<body>
  <div class="campaign-dossier">
    <header class="dossier-header">
      <div class="dossier-number">DOSSIER #${campaignId} — ${timestamp}</div>
      <div class="campaign-title">${product} CAMPAIGN</div>
      <h1 class="tagline">"${headline}"</h1>
    </header>

    <!-- HERO PRINT AD -->
    <section class="section">
      <div class="section-title">001 — HERO PRINT EXECUTION</div>
      <div class="deliverables-grid">
        <div class="deliverable">
          <div class="deliverable-header">
            <span class="deliverable-type">PRINT — MAGAZINE SPREAD</span>
            <span class="deliverable-format">420×297mm</span>
          </div>
          <div class="deliverable-preview">
            <p class="preview-headline">${headline}</p>
            <span class="preview-brand">${product.toUpperCase()}</span>
          </div>
          <div class="deliverable-specs">
            <div class="spec-row"><span>Format</span><span>Double Page Spread</span></div>
            <div class="spec-row"><span>Color Space</span><span>CMYK / 300dpi</span></div>
            <div class="spec-row"><span>Placement</span><span>Premium Editorial</span></div>
          </div>
        </div>
        <div class="deliverable">
          <div class="deliverable-header">
            <span class="deliverable-type">PRINT — POSTER</span>
            <span class="deliverable-format">A1 Portrait</span>
          </div>
          <div class="deliverable-preview portrait">
            <p class="preview-headline" style="font-size: 14px;">${headline}</p>
            <span class="preview-brand">${product.toUpperCase()}</span>
          </div>
          <div class="deliverable-specs">
            <div class="spec-row"><span>Format</span><span>594×841mm</span></div>
            <div class="spec-row"><span>Paper</span><span>Uncoated 200gsm</span></div>
          </div>
        </div>
      </div>
    </section>

    <!-- VIDEO STORYBOARD -->
    <section class="section">
      <div class="section-title">002 — :30 VIDEO SPOT — STORYBOARD</div>
      <div class="deliverable">
        <div class="deliverable-header">
          <span class="deliverable-type">VIDEO — BROADCAST + DIGITAL</span>
          <span class="deliverable-format">1920×1080 / 30fps</span>
        </div>
        <div class="video-frames">
          <div class="video-frame">
            <span class="frame-number">00:00</span>
            <span class="frame-desc">Black screen. Ambient sound.</span>
          </div>
          <div class="video-frame">
            <span class="frame-number">00:05</span>
            <span class="frame-desc">Slow fade. Subject appears.</span>
          </div>
          <div class="video-frame">
            <span class="frame-number">00:12</span>
            <span class="frame-desc">Close-up. The moment.</span>
          </div>
          <div class="video-frame">
            <span class="frame-number">00:18</span>
            <span class="frame-desc">Pull back. Context revealed.</span>
          </div>
          <div class="video-frame">
            <span class="frame-number">00:22</span>
            <span class="frame-desc">Text appears: "${headline.slice(0, 20)}..."</span>
          </div>
          <div class="video-frame">
            <span class="frame-number">00:26</span>
            <span class="frame-desc">Beat. Silence.</span>
          </div>
          <div class="video-frame">
            <span class="frame-number">00:28</span>
            <span class="frame-desc">Logo. End frame.</span>
          </div>
          <div class="video-frame">
            <span class="frame-number">00:30</span>
            <span class="frame-desc">${product.toUpperCase()}</span>
          </div>
        </div>
        <div class="deliverable-specs">
          <div class="spec-row"><span>Audio</span><span>VO + Ambient</span></div>
          <div class="spec-row"><span>Mood</span><span>Contemplative / Unexpected</span></div>
        </div>
      </div>
    </section>

    <!-- SOCIAL MEDIA -->
    <section class="section">
      <div class="section-title">003 — SOCIAL MEDIA ACTIVATION</div>
      <div class="deliverables-grid">
        <div class="deliverable">
          <div class="deliverable-header">
            <span class="deliverable-type">INSTAGRAM — FEED</span>
            <span class="deliverable-format">1080×1080</span>
          </div>
          <div class="deliverable-preview square social-preview">
            <div class="social-handle">@${product.toLowerCase().replace(/\s/g, '')}</div>
            <div class="social-copy">${headline}</div>
            <div class="social-engagement">♡ 12.4K    💬 847    ↗ 2.1K</div>
          </div>
        </div>
        <div class="deliverable">
          <div class="deliverable-header">
            <span class="deliverable-type">INSTAGRAM — STORY</span>
            <span class="deliverable-format">1080×1920</span>
          </div>
          <div class="deliverable-preview portrait">
            <p class="preview-headline" style="font-size: 14px;">${headline}</p>
            <span class="preview-brand">Swipe up ↑</span>
          </div>
        </div>
      </div>
    </section>

    <!-- OOH -->
    <section class="section">
      <div class="section-title">004 — OUT OF HOME</div>
      <div class="deliverables-grid">
        <div class="deliverable">
          <div class="deliverable-header">
            <span class="deliverable-type">BILLBOARD — 48 SHEET</span>
            <span class="deliverable-format">6096×3048mm</span>
          </div>
          <div class="deliverable-preview ooh-preview">
            <div class="ooh-context"></div>
            <p class="preview-headline">${headline}</p>
            <span class="preview-brand">${product.toUpperCase()}</span>
          </div>
          <div class="deliverable-specs">
            <div class="spec-row"><span>Placement</span><span>Urban High-Traffic</span></div>
            <div class="spec-row"><span>Duration</span><span>4 weeks</span></div>
          </div>
        </div>
        <div class="deliverable">
          <div class="deliverable-header">
            <span class="deliverable-type">BUS SHELTER</span>
            <span class="deliverable-format">1800×1200mm</span>
          </div>
          <div class="deliverable-preview">
            <p class="preview-headline" style="font-size: 16px;">${headline}</p>
            <span class="preview-brand">${product.toUpperCase()}</span>
          </div>
        </div>
      </div>
    </section>

    <footer class="footer">
      <span>THE FERAL CREATIVE COLLECTIVE — ADHDAI</span>
      <span>CAMPAIGN #${campaignId}</span>
      <span>${timestamp}</span>
    </footer>
  </div>
</body>
</html>`;
  }, []);

  // Run the workflow with collaborative, non-linear agent interactions
  const runWorkflow = useCallback(async () => {
    const currentBrief = briefRef.current;
    if (!currentBrief) return;
    
    let delay = 0;
    
    workflowRef.current.forEach(t => clearTimeout(t));
    typingRef.current.forEach(t => clearInterval(t));
    workflowRef.current = [];
    typingRef.current = [];

    const schedule = (fn: () => void, ms: number) => {
      const timeout = setTimeout(fn, delay + ms);
      workflowRef.current.push(timeout);
      return timeout;
    };

    const briefContext = `Brief: "${currentBrief}". Product/subject being advertised.`;
    
    // ===== OPENING: Multiple agents notice the brief =====
    schedule(async () => {
      setCurrentPhase(1);
      setPhaseLabel('COLLABORATIVE INTAKE');
      updateTaskStatus('task-1', 'in-progress');
      
      moveAgentTo('mike', { x: 480, y: 140 }, 'thinking', 'Reading brief...');
      moveAgentTo('poole', { x: 520, y: 180 }, 'thinking', 'Observing...');
      
      const openingLines = await generateDialogueBatch(
        ['mike', 'poole', 'the-cell'],
        `The team is seeing the brief "${currentBrief}" for the first time. Mike opens the dossier and gives his skeptical first take. Poole begins to see strategic framework possibilities. The Cell enters — Vera, Gjon, and Thursday each react differently.`,
        briefContext
      );
      addChatMessage('mike', openingLines['mike']);
      
      setTimeout(() => {
        addChatMessage('poole', openingLines['poole']);
        moveAgentTo('the-cell', { x: 560, y: 140 }, 'reviewing', 'Reviewing brief...');
      }, 3000);
      
      setTimeout(() => {
        addChatMessage('the-cell', openingLines['the-cell']);
      }, 5000);
    }, 0);

    // Mike's initial analysis - others watching
    schedule(async () => {
      const insight = await generateCreativeContent(
        `Brief: "${currentBrief}". As Mike Slab, identify the REAL human tension beneath this brief. What uncomfortable truth does this address? Be brutally honest in 2 sentences.`
      );
      createWorkItem('mike', 'sticky', insight, { x: 400, y: 100 }, 1, true);
      addChatMessage('mike', await generateAgentLine('mike', `Mike just posted his insight about the brief "${currentBrief}". He makes a brief comment about finding what the client won't say.`, briefContext));
      updateTaskStatus('task-1', 'done');
    }, 7000);

    // Poole reacts, moves to Mike's work
    schedule(async () => {
      moveAgentTo('poole', { x: 420, y: 130 }, 'reviewing', 'Examining Mike\'s insight...');
      addChatMessage('poole', await generateAgentLine('poole', `Poole is reading Mike's insight about "${currentBrief}". He sees strategic structure in Mike's raw intuition.`, briefContext));
    }, 11000);

    // Burl wanders over early
    schedule(async () => {
      moveAgentTo('burl', { x: 450, y: 200 }, 'thinking', 'Thinking about visuals...');
      addChatMessage('burl', await generateAgentLine('burl', `Burl wanders over to look at the brief "${currentBrief}" early. He's already seeing images forming.`, briefContext));
    }, 14000);

    // Mike adds human tension, others comment
    schedule(async () => {
      updateTaskStatus('task-2', 'in-progress');
      const tension = await generateCreativeContent(
        `Brief: "${currentBrief}". What is the psychological conflict consumers face? What do they secretly want but won't admit? One powerful sentence.`
      );
      createWorkItem('mike', 'concept', `HUMAN TENSION:\n${tension}`, { x: 480, y: 180 }, 1, true);
    }, 17000);

    schedule(async () => {
      addChatMessage('the-cell', await generateAgentLine('the-cell', `The Cell sees Mike's human tension analysis for "${currentBrief}". Vera, Gjon, and Thursday each react in their own way — they're starting to see the copy angle.`, briefContext));
      updateTaskStatus('task-2', 'done');
    }, 20000);

    delay = 22000;

    // ===== STRATEGY: Poole builds framework while others kibitz =====
    schedule(async () => {
      setCurrentPhase(2);
      setPhaseLabel('STRATEGIC FRAMEWORK');
      updateTaskStatus('task-3', 'in-progress');
      moveAgentTo('poole', { x: 820, y: 140 }, 'typing', 'Building framework...');
      
      const strategyLines = await generateDialogueBatch(
        ['poole', 'mike', 'the-cell', 'burl'],
        `Poole is building his strategic framework for the brief "${currentBrief}". He approaches the whiteboard with diagrams and jargon. Mike watches skeptically. The Cell gets impatient waiting for the framework to finish. Burl starts seeing how the strategy could translate to visuals.`,
        briefContext
      );
      addChatMessage('poole', strategyLines['poole']);
      
      setTimeout(() => {
        moveAgentTo('mike', { x: 780, y: 200 }, 'reviewing', 'Watching Poole...');
        addChatMessage('mike', strategyLines['mike']);
      }, 3000);

    schedule(async () => {
      const barrier = await generateCreativeContent(
        `Brief: "${currentBrief}". What BARRIER prevents consumers from engaging? What mental block must be overcome? One sentence starting with "They believe..."`
      );
      createWorkItem('poole', 'framework', `BARRIER:\n${barrier}`, { x: 740, y: 100 }, 2, true);
      addChatMessage('poole', await generateAgentLine('poole', `Poole has identified the consumer barrier for "${currentBrief}". He comments on the diagram he just created.`, briefContext));
      updateTaskStatus('task-3', 'done');
    }, 6000);

    // The Cell gets impatient, moves over
    schedule(async () => {
      moveAgentTo('the-cell', { x: 860, y: 180 }, 'reviewing', 'Getting impatient...');
      addChatMessage('the-cell', strategyLines['the-cell']);
      updateTaskStatus('task-4', 'in-progress');
    }, 9000);

    schedule(async () => {
      const reframe = await generateCreativeContent(
        `Brief: "${currentBrief}". Create a REFRAME - how do we flip the script on this product? One sentence starting with "But what if..."`
      );
      createWorkItem('poole', 'strategy', `REFRAME:\n${reframe}`, { x: 820, y: 170 }, 2, true);
      addChatMessage('poole', await generateAgentLine('poole', `Poole has completed his strategic reframe for "${currentBrief}". He steps back from the whiteboard triumphantly.`, briefContext));
    }, 12000);

    // Burl comments on strategy
    schedule(async () => {
      moveAgentTo('burl', { x: 880, y: 140 }, 'thinking', 'Visualizing reframe...');
      addChatMessage('burl', strategyLines['burl']);
      updateTaskStatus('task-4', 'done');
      updateTaskStatus('task-5', 'done');
    }, 15000);
    }, 0);

    delay += 17000;

    // ===== COPY: Cell writes while others hover and critique =====
    schedule(async () => {
      setCurrentPhase(3);
      setPhaseLabel('COPY DEVELOPMENT');
      updateTaskStatus('task-6', 'in-progress');
      moveAgentTo('the-cell', { x: 1180, y: 140 }, 'typing', 'Vera drafting...');
      addChatMessage('the-cell', await generateAgentLine('the-cell', `The Cell begins writing copy options for "${currentBrief}". Vera starts conventional, Gjon pushes back, Thursday is already writing silently.`, briefContext));
    }, 0);

    schedule(async () => {
      moveAgentTo('poole', { x: 1140, y: 200 }, 'reviewing', 'Supervising copy...');
      const copyLines = await generateDialogueBatch(['poole', 'the-cell'], `Poole hovers over the Cell's work trying to supervise. The Cell tells him to back off.`, briefContext);
      addChatMessage('poole', copyLines['poole']);
      addChatMessage('the-cell', copyLines['the-cell']);
    }, 3000);

    schedule(async () => {
      const optionA = await generateCreativeContent(
        `Brief: "${currentBrief}". Write OPTION A - compelling but conventional headline. Swiss-style minimalism. Under 10 words. Just the headline.`
      );
      createWorkItem('the-cell', 'headline', `OPTION A (Vera):\n\n"${optionA}"`, { x: 1080, y: 90 }, 3, true);
      addChatMessage('the-cell', await generateAgentLine('the-cell', `Option A is done — Vera's safe version. She presents it. Gjon is unimpressed.`, briefContext));
      updateTaskStatus('task-6', 'done');
      updateTaskStatus('task-7', 'in-progress');
    }, 6000);

    schedule(async () => {
      moveAgentTo('burl', { x: 1100, y: 150 }, 'reviewing', 'Reading Option A...');
      addChatMessage('burl', await generateAgentLine('burl', `Burl reads Option A for "${currentBrief}". It's technically correct but visually uninspiring.`, briefContext));
      moveAgentTo('the-cell', { x: 1220, y: 180 }, 'typing', 'Gjon writing...');
    }, 9000);

    schedule(async () => {
      const optionB = await generateCreativeContent(
        `Brief: "${currentBrief}". Write OPTION B - provocative headline that challenges assumptions. Under 12 words. Just the headline.`
      );
      createWorkItem('the-cell', 'headline', `OPTION B (Gjon):\n\n"${optionB}"`, { x: 1200, y: 150 }, 3, true);
      addChatMessage('the-cell', await generateAgentLine('the-cell', `Gjon presents Option B — confrontational, challenging assumptions about "${currentBrief}". Vera thinks it's too much. Gjon disagrees.`, briefContext));
      updateTaskStatus('task-7', 'done');
    }, 12000);

    schedule(async () => {
      moveAgentTo('mike', { x: 1160, y: 220 }, 'reviewing', 'Watching Cell argue...');
      addChatMessage('mike', await generateAgentLine('mike', `Mike wanders over to watch the Cell argue about headline options for "${currentBrief}". He's amused — this is where the magic happens.`, briefContext));
      updateTaskStatus('task-8', 'in-progress');
    }, 15000);

    schedule(async () => {
      const optionC = await generateCreativeContent(
        `Brief: "${currentBrief}". Write OPTION C - deeply strange, uncomfortable headline that reveals unexpected truth. Deranged but logical. Under 15 words.`
      );
      createWorkItem('the-cell', 'headline', `OPTION C (Thursday):\n\n"${optionC}"`, { x: 1140, y: 220 }, 3, true);
      addChatMessage('the-cell', await generateAgentLine('the-cell', `Thursday presents Option C — strange, unexpected, and devastating. The others react. This is the one that always wins.`, briefContext));
      updateTaskStatus('task-8', 'done');
    }, 18000);

    schedule(async () => {
      const reactionLines = await generateDialogueBatch(['mike', 'the-cell'], 
        `Everyone reacts to Thursday's Option C headline for "${currentBrief}". Mike is impressed by the gut punch. Then the Cell votes — Thursday wins 2-1, as always.`,
        briefContext
      );
      addChatMessage('mike', reactionLines['mike']);
      updateTaskStatus('task-9', 'in-progress');
      
      setTimeout(() => {
        createWorkItem('the-cell', 'approval', '✓ VOTE: C wins 2-1\nThursday always wins.', { x: 1280, y: 260 }, 3, false);
        addChatMessage('the-cell', reactionLines['the-cell']);
        updateTaskStatus('task-9', 'done');
      }, 3000);
    }, 21000);

    delay += 26000;

    // ===== VISUAL: Burl works while others interrupt =====
    schedule(async () => {
      setCurrentPhase(4);
      setPhaseLabel('ART DIRECTION');
      updateTaskStatus('task-10', 'in-progress');
      moveAgentTo('burl', { x: 480, y: 440 }, 'designing', 'Defining visual language...');
      addChatMessage('burl', await generateAgentLine('burl', `Burl starts designing the visual language for "${currentBrief}". He needs space to think in pictures.`, briefContext));
    }, 0);

    schedule(async () => {
      moveAgentTo('nadya', { x: 520, y: 480 }, 'clicking', 'Checking timeline...');
      const nadyaBurlLines = await generateDialogueBatch(['nadya', 'burl'], `Nadya appears demanding a visual timeline. Burl resists — art doesn't punch a clock. Nadya fires back with her trademark deadpan.`, briefContext);
      addChatMessage('nadya', nadyaBurlLines['nadya']);
      addChatMessage('burl', nadyaBurlLines['burl']);
    }, 3000);

    schedule(async () => {
      const visual = await generateCreativeContent(
        `Brief: "${currentBrief}". Describe VISUAL LANGUAGE in 3 bullet points: colors (hex codes), typography, mood. Swiss-style minimalism.`
      );
      createWorkItem('burl', 'visual', visual, { x: 400, y: 380 }, 4, true);
      addChatMessage('burl', await generateAgentLine('burl', `Burl has defined the color palette for "${currentBrief}". He comments on his choice.`, briefContext));
      updateTaskStatus('task-10', 'done');
    }, 6000);

    schedule(async () => {
      moveAgentTo('poole', { x: 440, y: 420 }, 'reviewing', 'Examining colors...');
      const colorLines = await generateDialogueBatch(['poole', 'burl'], `Poole examines Burl's color choices and sees his framework reflected in the palette. Burl shrugs off the theoretical analysis.`, briefContext);
      addChatMessage('poole', colorLines['poole']);
      addChatMessage('burl', colorLines['burl']);
      updateTaskStatus('task-11', 'in-progress');
    }, 9000);

    schedule(async () => {
      const typography = await generateCreativeContent(
        `For "${currentBrief}" campaign: TYPOGRAPHY SYSTEM with primary font, size hierarchy, spacing philosophy. 3 lines max.`
      );
      createWorkItem('burl', 'mockup', `TYPOGRAPHY:\n${typography}`, { x: 500, y: 450 }, 4, true);
      updateTaskStatus('task-11', 'done');
      updateTaskStatus('task-12', 'in-progress');
    }, 12000);

    schedule(async () => {
      moveAgentTo('the-cell', { x: 480, y: 500 }, 'reviewing', 'Reviewing visual direction...');
      addChatMessage('the-cell', await generateAgentLine('the-cell', `The Cell visits Burl's workspace to evaluate the visual direction for "${currentBrief}". They assess whether the visuals support the copy.`, briefContext));
    }, 15000);

    schedule(async () => {
      const artDirection = await generateCreativeContent(
        `Brief: "${currentBrief}". Describe the KEY VISUAL for the hero ad. What single image captures the essence? Be specific and unexpected. 2 sentences.`
      );
      createWorkItem('burl', 'visual', `KEY VISUAL:\n${artDirection}`, { x: 420, y: 520 }, 4, true);
      addChatMessage('burl', await generateAgentLine('burl', `Burl has finished the key visual concept for "${currentBrief}". He steps back, satisfied. It's not pretty — it's true.`, briefContext));
      updateTaskStatus('task-12', 'done');
    }, 18000);

    delay += 20000;

    // ===== PRODUCTION: Nadya takes control, others protest =====
    schedule(async () => {
      setCurrentPhase(5);
      setPhaseLabel('PRODUCTION');
      updateTaskStatus('task-13', 'in-progress');
      moveAgentTo('nadya', { x: 820, y: 440 }, 'clicking', 'Locking schedule...');
      const prodLines = await generateDialogueBatch(['nadya', 'mike'], `Nadya announces the production schedule for "${currentBrief}" — aggressive deadlines. Mike protests. Nadya counters.`, briefContext);
      addChatMessage('nadya', prodLines['nadya']);
      
      setTimeout(() => {
        moveAgentTo('mike', { x: 780, y: 480 }, 'reviewing', 'Checking dates...');
        addChatMessage('mike', prodLines['mike']);
      }, 3000);
      
      setTimeout(async () => {
        const tomorrow = new Date(Date.now() + 86400000).toLocaleDateString();
        createWorkItem('nadya', 'sticky', `SHOOT: ${tomorrow}\nDELIVERY: +48hrs\nNO DELAYS.`, { x: 740, y: 380 }, 5, false);
        createWorkItem('nadya', 'approval', '⏱ LOCKED', { x: 840, y: 440 }, 5, false);
        addChatMessage('nadya', await generateAgentLine('nadya', `The schedule is locked. Nadya makes a final declaration.`, briefContext));
        updateTaskStatus('task-13', 'done');
      }, 6000);
    }, 0);

    delay += 8000;

    // ===== CLIENT PREP: Delmore while others mock the process =====
    schedule(async () => {
      setCurrentPhase(6);
      setPhaseLabel('CLIENT TRANSLATION');
      updateTaskStatus('task-14', 'in-progress');
      moveAgentTo('delmore', { x: 1180, y: 440 }, 'typing', 'Preparing client deck...');
      const clientLines = await generateDialogueBatch(['delmore', 'mike', 'the-cell', 'poole'], `Delmore translates the campaign for "${currentBrief}" into client-friendly language. Mike watches with amusement. The Cell is fascinated/disturbed by how their words get softened. Poole admires the translation work.`, briefContext);
      addChatMessage('delmore', clientLines['delmore']);
      
      setTimeout(() => {
        moveAgentTo('mike', { x: 1140, y: 480 }, 'reviewing', 'Watching translation...');
        addChatMessage('mike', clientLines['mike']);
        moveAgentTo('the-cell', { x: 1200, y: 500 }, 'reviewing', 'Observing...');
        addChatMessage('the-cell', clientLines['the-cell']);
      }, 3000);

    schedule(async () => {
      const clientSpeak = await generateCreativeContent(
        `Translate this campaign for "${currentBrief}" into CLIENT-SPEAK. Use buzzwords: "authentic", "disruptive", "culturally relevant". 3 impressive-sounding bullet points.`
      );
      createWorkItem('delmore', 'draft', `CLIENT DECK:\n${clientSpeak}`, { x: 1100, y: 380 }, 6, true);
      addChatMessage('delmore', await generateAgentLine('delmore', `Delmore finishes the client translation for "${currentBrief}". He's satisfied — the work survives the softening.`, briefContext));
      updateTaskStatus('task-14', 'done');
    }, 6000);

    schedule(async () => {
      moveAgentTo('poole', { x: 1160, y: 420 }, 'reviewing', 'Admiring translation...');
      addChatMessage('poole', clientLines['poole']);
      addChatMessage('delmore', await generateAgentLine('delmore', `Delmore responds warmly to Poole's compliment about the translation. Mentions the Apparatus is ready for compilation.`, briefContext));
    }, 9000);
    }, 0);

    delay += 11000;

    // ===== FINAL ASSEMBLY: Everyone gathers for the output =====
    schedule(async () => {
      setCurrentPhase(7);
      setPhaseLabel('FINAL ASSEMBLY');
      updateTaskStatus('task-15', 'in-progress');
      moveAgentTo('apparatus', { x: 820, y: 700 }, 'typing', 'Compiling...');
      
      const finalLines = await generateDialogueBatch(
        ['apparatus', 'mike', 'nadya', 'delmore'],
        `Final assembly is starting for "${currentBrief}". Apparatus initiates compilation. Everyone gathers around to watch. Mike watches with anticipation. Nadya times the compilation. Delmore prepares to explain the output to the client.`,
        briefContext
      );
      addChatMessage('apparatus', finalLines['apparatus']);
      
      setTimeout(() => {
        moveAgentTo('mike', { x: 760, y: 680 }, 'reviewing', 'Watching compilation...');
        moveAgentTo('poole', { x: 880, y: 680 }, 'reviewing', 'Verifying framework...');
        moveAgentTo('burl', { x: 760, y: 740 }, 'reviewing', 'Checking visuals...');
        moveAgentTo('the-cell', { x: 880, y: 740 }, 'reviewing', 'Confirming copy...');
        addChatMessage('mike', finalLines['mike']);
      }, 3000);

      setTimeout(() => {
        moveAgentTo('nadya', { x: 920, y: 700 }, 'clicking', 'Timing...');
        moveAgentTo('delmore', { x: 720, y: 700 }, 'reviewing', 'Preparing...');
        addChatMessage('nadya', finalLines['nadya']);
        addChatMessage('delmore', finalLines['delmore']);
      }, 5000);

    schedule(async () => {
      const finalHeadline = await generateCreativeContent(
        `Brief: "${currentBrief}". Write the FINAL approved headline. Memorable, slightly unsettling, true. Under 12 words. Just the headline.`
      );
      
      // Use intelligent brief parsing
      const parsedBrief = parseBrief(currentBrief);
      const productName = parsedBrief.product || 'Campaign';
      
      createWorkItem('apparatus', 'board', `FINAL AD:\n\n"${finalHeadline}"\n\n— ${productName.toUpperCase()}`, { x: 760, y: 660 }, 7, true);
      
      const code = generateFinalAdCode(finalHeadline, currentBrief);
      setFinalAdCode(code);
      
      addChatMessage('apparatus', await generateAgentLine('apparatus', `Compilation is complete for "${currentBrief}". The ad exists now. Announce it.`, briefContext));
    }, 8000);

    // Final reactions from everyone
    schedule(async () => {
      createWorkItem('apparatus', 'approval', `✓ CODE READY\n${currentBrief.split(' ')[0] || 'CAMPAIGN'}.html`, { x: FINAL_OUTPUT_ZONE.x + 40, y: FINAL_OUTPUT_ZONE.y + 40 }, 7, false);
      
      const closingLines = await generateDialogueBatch(
        ['mike', 'burl', 'the-cell', 'poole', 'nadya', 'delmore', 'apparatus'],
        `The campaign for "${currentBrief}" is done. Everyone gives a brief final personal reaction — 1-2 sentences. Mike is satisfied. Burl sees the completed visual. The Cell is proud of the copy. Poole validates the framework. Nadya confirms the schedule was met. Delmore is ready for the client. Apparatus closes the file.`,
        briefContext
      );
      
      addChatMessage('mike', closingLines['mike']);
      addChatMessage('burl', closingLines['burl']);
      addChatMessage('the-cell', closingLines['the-cell']);
      updateTaskStatus('task-15', 'done');
      updateTaskStatus('task-16', 'done');
      
      setTimeout(() => {
        addChatMessage('poole', closingLines['poole']);
        addChatMessage('nadya', closingLines['nadya']);
        addChatMessage('delmore', closingLines['delmore']);
      }, 3000);
      
      setTimeout(() => {
        setPhaseLabel('✓ CAMPAIGN COMPLETE');
        addChatMessage('apparatus', closingLines['apparatus']);
        setAgents(prev => prev.map(a => ({ ...a, status: 'idle', action: '', isActive: false })));
      }, 6000);
    }, 11000);
    }, 0);

  }, [generateCreativeContent, moveAgentTo, addChatMessage, createWorkItem, updateTaskStatus, generateFinalAdCode]);

  // Use ref to always access the latest runWorkflow function
  const runWorkflowRef = useRef(runWorkflow);
  runWorkflowRef.current = runWorkflow;
  
  const handleStart = useCallback(() => {
    setIsRunning(true);
    setWorkItems([]);
    setChatMessages([]);
    setTasks(INITIAL_TASKS);
    setCurrentPhase(0);
    setPhaseLabel('Starting...');
    setFinalAdCode('');
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
    
    // Use ref to always call the latest version of runWorkflow
    setTimeout(() => runWorkflowRef.current(), 500);
  }, []);

  const handleReset = () => {
    setIsRunning(false);
    workflowRef.current.forEach(t => clearTimeout(t));
    typingRef.current.forEach(t => clearInterval(t));
    setWorkItems([]);
    setChatMessages([]);
    setTasks(INITIAL_TASKS);
    setCurrentPhase(0);
    setPhaseLabel('Ready to begin');
    setFinalAdCode('');
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

  const copyCode = () => {
    navigator.clipboard.writeText(finalAdCode);
    generateAgentLine('apparatus', 'Code has been copied to clipboard. Acknowledge briefly.', '').then(line => addChatMessage('apparatus', line));
  };

  // Generate and download ZIP with all deliverables INCLUDING actual images
  const downloadZip = useCallback(async () => {
    const currentBrief = briefRef.current;
    
    // Use intelligent brief parsing
    const parsedBrief = parseBrief(currentBrief);
    const product = parsedBrief.product || 'campaign';
    const category = parsedBrief.category;
    const imageContext = getImagePromptContext(currentBrief);
    const briefContext = `Brief: "${currentBrief}". Product/subject being advertised.`;
    
    const timestamp = new Date().toISOString().split('T')[0];
    const campaignName = `${product.toLowerCase().replace(/\s+/g, '_')}_campaign_${timestamp}`;
    const headline = workItems.find(w => w.type === 'headline')?.content?.split('\n').pop()?.replace(/['"]/g, '') || 'The truth was always there';
    const visualDirection = workItems.find(w => w.type === 'visual')?.content || 'Documentary photography, muted tones';
    
    addChatMessage('apparatus', await generateAgentLine('apparatus', `Compiling deliverables package for "${product}" — generating visual assets.`, briefContext));
    
    const zip = new JSZip();
    
    // Create folder structure
    const printFolder = zip.folder('01_PRINT');
    const videoFolder = zip.folder('02_VIDEO');
    const socialFolder = zip.folder('03_SOCIAL');
    const oohFolder = zip.folder('04_OOH');
    const docsFolder = zip.folder('05_DOCUMENTATION');
    
    // Helper to generate and fetch image using DALL-E with image API key
    const getImageClient = () => {
      const imageApiKey = import.meta.env.VITE_OPENAI_IMAGE_API_KEY;
      if (!imageApiKey) {
        throw new Error('VITE_OPENAI_IMAGE_API_KEY is not set. Add it to your .env file.');
      }
      return new OpenAI({ apiKey: imageApiKey, dangerouslyAllowBrowser: true });
    };
    
    const generateImage = async (prompt: string, filename: string): Promise<{blob: Blob} | null> => {
      try {
        const imageClient = getImageClient();
        const response = await imageClient.images.generate({
          model: 'dall-e-3',
          prompt: `Create a minimalist, Swiss-style advertising visual. ${prompt}. Style: Documentary photography aesthetic, muted earth tones, high contrast, no text or logos visible, cinematic composition, editorial quality. The image should feel contemplative and authentic, not commercial.`,
          n: 1,
          size: '1024x1024',
          quality: 'standard',
          response_format: 'b64_json', // Get base64 directly to avoid CORS
        });
        const b64Data = response.data?.[0]?.b64_json;
        if (b64Data) {
          // Convert base64 to blob
          const byteCharacters = atob(b64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'image/png' });
          return { blob };
        }
      } catch (error) {
        console.error(`Failed to generate ${filename}:`, error);
      }
      return null;
    };
    
    // 1. HTML Campaign Dossier (main file)
    zip.file('campaign_dossier.html', finalAdCode);
    
    // 2. Generate ACTUAL images for print
    addChatMessage('burl', await generateAgentLine('burl', `Generating the hero campaign image for ${product}. React to seeing the primary visual being created.`, briefContext));
    
    const heroImage = await generateImage(
      `A single powerful image for a ${imageContext} campaign in the ${category} industry. Subject: Someone experiencing a quiet moment of realization while interacting with ${product}. Show the actual ${product} in use. Composition: Rule of thirds, significant negative space on one side for text placement. Mood: ${visualDirection}`,
      'hero_image.png'
    );
    
    if (heroImage) {
      printFolder?.file('hero_campaign_image.png', heroImage.blob);
      addChatMessage('burl', await generateAgentLine('burl', `Hero image for ${product} is done. React and note moving to print layouts.`, briefContext));
    }
    
    // Generate print ad mockup
    const printAdImage = await generateImage(
      `A magazine advertisement layout featuring ${imageContext}. Show the ${product} in its natural context - how it's actually used in daily life. Documentary style, unexpected angle, tells a story without words. Category: ${category}. Think: National Geographic meets Swiss design.`,
      'print_ad.png'
    );
    
    if (printAdImage) {
      printFolder?.file('magazine_spread_visual.png', printAdImage.blob);
    }
    
    // Print specifications
    const magazineSpec = `PRINT SPECIFICATION — MAGAZINE SPREAD
=====================================

Campaign: ${product.toUpperCase()}
Format: Double Page Spread
Dimensions: 420mm × 297mm (A3 spread)
Bleed: 3mm
Color Space: CMYK
Resolution: 300dpi

HEADLINE: "${headline}"

VISUAL: See magazine_spread_visual.png
- Place hero image on left page (full bleed)
- Headline on right page, lower third
- Massive negative space above headline

TYPOGRAPHY:
- Primary: Helvetica Neue Light
- Headline: 72pt, #1a1a1a
- Body: 14pt, #333333
- Background: #F5F5F0

Generated by ADHDAI — The Feral Creative Collective
`;
    printFolder?.file('magazine_spread_spec.txt', magazineSpec);
    
    // Poster specs
    const posterSpec = `PRINT SPECIFICATION — A1 POSTER
================================

Campaign: ${product.toUpperCase()}
Format: A1 Portrait (594mm × 841mm)
Bleed: 5mm | CMYK | 300dpi
Paper: Uncoated 200gsm, Matte finish

HEADLINE: "${headline}"
VISUAL: Use hero_campaign_image.png

LAYOUT:
- Hero image: top 2/3 of poster
- Headline: centered, bottom third
- Brand mark: bottom right, 40mm max

Generated by ADHDAI — The Feral Creative Collective
`;
    printFolder?.file('poster_a1_spec.txt', posterSpec);
    
    // 3. Video storyboard with ACTUAL frame images
    addChatMessage('apparatus', await generateAgentLine('apparatus', `Generating video storyboard frames for ${product}. Three key cinematic moments being rendered.`, briefContext));
    
    // Generate key storyboard frames - specific to the product/category
    const frame2Image = await generateImage(
      `Cinematic still frame for ${category} video ad: A person in a contemplative moment, looking at or about to use their ${product}. The ${product} is clearly visible in frame. Natural lighting, shallow depth of field, 16:9 aspect ratio composition. Documentary style, ${category} context.`,
      'frame_02.png'
    );
    if (frame2Image) videoFolder?.file('frame_02_fade_in.png', frame2Image.blob);
    
    const frame3Image = await generateImage(
      `Cinematic close-up detail shot featuring ${imageContext}: The key moment of interaction with ${product}. Extreme close-up on hands using the ${product}, showing texture and detail. Soft focus background, warm natural light. ${category} product photography.`,
      'frame_03.png'
    );
    if (frame3Image) videoFolder?.file('frame_03_detail.png', frame3Image.blob);
    
    const frame5Image = await generateImage(
      `Wide shot establishing context: Subject in their natural environment with ${product}. The ${product} is central to the scene, showing its use case clearly. Pull back to reveal the full ${category} context. Editorial photography style, muted color palette, cinematic composition.`,
      'frame_05.png'
    );
    if (frame5Image) videoFolder?.file('frame_05_context.png', frame5Image.blob);
    
    addChatMessage('burl', await generateAgentLine('burl', `Storyboard frames for ${product} are done. Three key moments captured. React.`, briefContext));
    
    const storyboard = `VIDEO STORYBOARD — :30 SPOT
============================

Campaign: ${product.toUpperCase()}
Format: 1920×1080 / 30fps
Duration: 30 seconds
Aspect Ratios: 16:9 (broadcast), 1:1 (social), 9:16 (vertical)

FRAME 1 — 00:00-00:05
Visual: Black screen
Audio: Ambient room tone, barely perceptible
Copy: None

FRAME 2 — 00:05-00:10 [SEE: frame_02_fade_in.png]
Visual: Slow fade in. Single subject, center frame.
Audio: Sound continues, slight shift
Copy: None

FRAME 3 — 00:10-00:15 [SEE: frame_03_detail.png]
Visual: Close-up detail. The moment of recognition.
Audio: Breath. Pause.
Copy: None

FRAME 4 — 00:15-00:20
Visual: Pull back. Context revealed.
Audio: Ambient returns, warmer
Copy: None

FRAME 5 — 00:20-00:25 [SEE: frame_05_context.png]
Visual: Subject in full context
Audio: Music begins (minimal, piano)
Copy: Headline fades in: "${headline}"

FRAME 6 — 00:25-00:28
Visual: Beat. Let it breathe.
Audio: Music continues
Copy: Headline holds

FRAME 7 — 00:28-00:30
Visual: Brand mark on solid background
Audio: Music resolves
Copy: ${product.toUpperCase()}

---

DIRECTOR'S NOTES:
- No quick cuts — let silence do the work
- Documentary feel, not commercial
- Color grade: muted, desaturated
- Think Terrence Malick meets Swiss design
- KEY FRAMES: See PNG files in this folder

Generated by ADHDAI — The Feral Creative Collective
`;
    videoFolder?.file('storyboard_30sec.txt', storyboard);
    
    // Video specs JSON for production
    const videoSpecs = {
      campaign: product.toUpperCase(),
      headline: headline,
      format: {
        broadcast: { width: 1920, height: 1080, fps: 30 },
        social_square: { width: 1080, height: 1080, fps: 30 },
        social_vertical: { width: 1080, height: 1920, fps: 30 }
      },
      duration_seconds: 30,
      audio: {
        voiceover: false,
        music: "minimal, piano-based",
        ambient: true
      },
      color_grade: "muted, desaturated, documentary",
      pacing: "slow, contemplative",
      key_frames: ["frame_02_fade_in.png", "frame_03_detail.png", "frame_05_context.png"]
    };
    videoFolder?.file('video_specs.json', JSON.stringify(videoSpecs, null, 2));
    
    // 4. Social media with ACTUAL images
    addChatMessage('apparatus', await generateAgentLine('apparatus', `Generating social media assets for ${product} — feed and story formats.`, briefContext));
    
    // Instagram feed image - product specific
    const instaFeedImage = await generateImage(
      `Square format social media post featuring ${imageContext}. Show the ${product} as the hero - clean, striking, scroll-stopping. The ${product} should be immediately recognizable. Bold composition, single focal point on the ${product}, muted but distinct colors. ${category} product photography. Should feel premium and editorial, not sales-y.`,
      'instagram_feed.png'
    );
    if (instaFeedImage) socialFolder?.file('instagram_feed_1080x1080.png', instaFeedImage.blob);
    
    // Instagram story image
    const instaStoryImage = await generateImage(
      `Vertical format (9:16) social media story for ${imageContext}. Full screen mobile experience showing someone about to use or just discovering their ${product}. The ${product} centered in lower third, plenty of space at top for text overlay. Immersive, intimate moment in ${category} context.`,
      'instagram_story.png'
    );
    if (instaStoryImage) socialFolder?.file('instagram_story_1080x1920.png', instaStoryImage.blob);
    
    addChatMessage('the-cell', await generateAgentLine('the-cell', `Social media assets for ${product} are done. The Cell reacts to the feed and story imagery.`, briefContext));
    
    const socialCopy = `SOCIAL MEDIA COPY DECK
======================

Campaign: ${product.toUpperCase()}
Platforms: Instagram, Twitter/X, LinkedIn

---

INSTAGRAM FEED POST [SEE: instagram_feed_1080x1080.png]
Dimensions: 1080×1080

Caption:
"${headline}"

Sometimes the answer was there all along.

#${product.toLowerCase().replace(/\s/g, '')} #advertising #truth

---

INSTAGRAM STORY [SEE: instagram_story_1080x1920.png]
Dimensions: 1080×1920

Frame 1: Full image with headline overlay at top
Frame 2: Add subtle animation (zoom 102%)
Frame 3: Swipe up CTA

---

TWITTER/X [USE: instagram_feed crop to 1200×675]
Character limit: 280

"${headline}"

— ${product}

---

LINKEDIN [USE: instagram_feed or hero image]
Professional context version

We asked ourselves: what do people actually need from ${product.toLowerCase()}?

The answer surprised us.

"${headline}"

#advertising #brandstrategy #creativity

Generated by ADHDAI — The Feral Creative Collective

ASSETS INCLUDED:
- instagram_feed_1080x1080.png
- instagram_story_1080x1920.png
`;
    socialFolder?.file('social_copy_deck.txt', socialCopy);
    
    // Social specs JSON
    const socialSpecs = {
      instagram_feed: { width: 1080, height: 1080, format: 'png', file: 'instagram_feed_1080x1080.png' },
      instagram_story: { width: 1080, height: 1920, format: 'png', file: 'instagram_story_1080x1920.png' },
      instagram_reel: { width: 1080, height: 1920, format: 'mp4', max_duration: 90, note: 'Use storyboard frames to create' },
      twitter: { width: 1200, height: 675, format: 'png', note: 'Crop instagram_feed image' },
      linkedin: { width: 1200, height: 627, format: 'png', note: 'Use hero_campaign_image.png' }
    };
    socialFolder?.file('social_specs.json', JSON.stringify(socialSpecs, null, 2));
    
    // 5. OOH with ACTUAL images
    addChatMessage('apparatus', await generateAgentLine('apparatus', `Generating out-of-home assets for ${product} — billboard and transit formats.`, briefContext));
    
    // Billboard image - product specific
    const billboardImage = await generateImage(
      `Wide format billboard advertisement visual featuring ${imageContext}. The ${product} as the sole visual element. Ultra-simple composition that reads from 50 meters away. One striking image of the ${product}, maximum impact. ${category} product photography. Think: Apple billboard simplicity. Landscape orientation, high contrast, clean background.`,
      'billboard.png'
    );
    if (billboardImage) oohFolder?.file('billboard_visual.png', billboardImage.blob);
    
    // Bus shelter image  
    const busShelterImage = await generateImage(
      `Portrait format bus shelter advertisement for ${imageContext}. Street-level viewing showing someone engaging with ${product} in daily life. ${category} lifestyle context. Eye-catching but not aggressive. A moment of human connection with the ${product}. Works in daylight and at night.`,
      'bus_shelter.png'
    );
    if (busShelterImage) oohFolder?.file('bus_shelter_visual.png', busShelterImage.blob);
    
    addChatMessage('nadya', await generateAgentLine('nadya', `OOH assets for ${product} are complete. React with your trademark deadline awareness.`, briefContext));
    
    // 6. OOH specifications
    const oohSpec = `OUT OF HOME SPECIFICATIONS
==========================

Campaign: ${product.toUpperCase()}
Headline: "${headline}"

---

48-SHEET BILLBOARD [SEE: billboard_visual.png]
Dimensions: 6096mm × 3048mm (20ft × 10ft)
Resolution: 72dpi minimum (viewed from distance)
Bleed: 25mm

Placement: Urban high-traffic locations
Duration: 4 weeks recommended
Viewing distance: 50m+

Design notes:
- Use billboard_visual.png as background
- Overlay headline in Helvetica Neue Bold, white
- Maximum 7 words visible
- Brand mark bottom right, 10% of total area

---

BUS SHELTER (6-SHEET) [SEE: bus_shelter_visual.png]
Dimensions: 1800mm × 1200mm
Resolution: 150dpi
Bleed: 10mm

Placement: Street level, transit hubs
Viewing distance: 2-5m

Design notes:
- Use bus_shelter_visual.png
- Headline can be larger, more detail allowed
- QR code optional (bottom right)
- Must be readable in poor lighting

---

TRANSIT WRAP
Vehicle: Standard city bus
Coverage: Full wrap or super-side
Material: Perforated vinyl for windows

Use: Adapt billboard_visual.png to wrap format
- Design must work with vehicle contours
- Allow for doors, windows, wheel wells

ASSETS INCLUDED:
- billboard_visual.png
- bus_shelter_visual.png

Generated by ADHDAI — The Feral Creative Collective
`;
    oohFolder?.file('ooh_specifications.txt', oohSpec);
    
    // 6. Documentation
    const strategicBrief = `STRATEGIC BRIEF
===============

Client: ${product.toUpperCase()}
Original Brief: "${currentBrief}"

---

HUMAN TENSION IDENTIFIED:
${workItems.find(w => w.type === 'sticky' && w.createdBy === 'mike')?.content || '[See intake report]'}

STRATEGIC FRAMEWORK:
${workItems.find(w => w.type === 'framework')?.content || workItems.find(w => w.type === 'strategy')?.content || '[See strategic framework]'}

CREATIVE DIRECTION:
${workItems.find(w => w.type === 'headline')?.content || '[See copy deck]'}

VISUAL LANGUAGE:
${workItems.find(w => w.type === 'visual')?.content || '[See visual direction]'}

---

AGENCY: ADHDAI — The Feral Creative Collective
DATE: ${new Date().toLocaleDateString()}
VERSION: 1.0

Generated by ADHDAI
`;
    docsFolder?.file('strategic_brief.txt', strategicBrief);
    
    // Work log
    const workLog = workItems.map(item => {
      const agent = CHARACTERS.find(c => c.id === item.createdBy);
      return `[${new Date(item.timestamp).toLocaleTimeString()}] ${agent?.name || item.createdBy}: ${item.content.slice(0, 100)}...`;
    }).join('\n\n');
    docsFolder?.file('work_log.txt', `CREATIVE WORK LOG\n${'='.repeat(50)}\n\n${workLog}`);
    
    // Chat transcript
    const chatLog = chatMessages.map(msg => {
      const agent = CHARACTERS.find(c => c.id === msg.from);
      return `[${new Date(msg.timestamp).toLocaleTimeString()}] ${agent?.name || msg.from}: ${msg.content}`;
    }).join('\n\n');
    docsFolder?.file('chat_transcript.txt', `AGENT CHAT TRANSCRIPT\n${'='.repeat(50)}\n\n${chatLog}`);
    
    // README
    const imageCount = [heroImage, printAdImage, frame2Image, frame3Image, frame5Image, instaFeedImage, instaStoryImage, billboardImage, busShelterImage].filter(Boolean).length;
    
    const readme = `${product.toUpperCase()} CAMPAIGN DELIVERABLES
${'='.repeat(50)}

Generated by ADHDAI — The Feral Creative Collective
Date: ${new Date().toLocaleString()}
Campaign Headline: "${headline}"

CONTENTS:
---------
✓ ${imageCount} AI-generated campaign images (PNG format)
✓ Full HTML campaign dossier
✓ Print specifications with visuals
✓ Video storyboard with key frames
✓ Social media assets with copy deck
✓ Out-of-home advertising visuals
✓ Complete documentation

FOLDER STRUCTURE:
-----------------
01_PRINT/
  - hero_campaign_image.png (main campaign visual)
  - magazine_spread_visual.png (print ad image)
  - magazine_spread_spec.txt
  - poster_a1_spec.txt

02_VIDEO/
  - frame_02_fade_in.png (storyboard frame)
  - frame_03_detail.png (storyboard frame)
  - frame_05_context.png (storyboard frame)
  - storyboard_30sec.txt
  - video_specs.json

03_SOCIAL/
  - instagram_feed_1080x1080.png
  - instagram_story_1080x1920.png
  - social_copy_deck.txt
  - social_specs.json

04_OOH/
  - billboard_visual.png
  - bus_shelter_visual.png
  - ooh_specifications.txt

05_DOCUMENTATION/
  - strategic_brief.txt
  - work_log.txt
  - chat_transcript.txt

campaign_dossier.html - Full visual presentation (open in browser)

HOW TO USE:
-----------
1. All images are production-ready PNGs (1024×1024 base resolution)
2. Scale up for print using AI upscaling tools if needed
3. Text overlays should use Helvetica Neue family
4. Color palette: #F5F5F0 (cream), #1a1a1a (near-black), muted earth tones

---
THE FERAL CREATIVE COLLECTIVE
"We are the best at the worst"
`;
    zip.file('README.txt', readme);
    
    addChatMessage('apparatus', await generateAgentLine('apparatus', `Asset generation complete — ${imageCount} images being packaged into archive.`, briefContext));
    
    // Generate and download
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${campaignName}.zip`);
    
    addChatMessage('apparatus', await generateAgentLine('apparatus', `Download complete: ${campaignName}.zip with ${imageCount} images and full campaign documentation.`, briefContext));
  }, [finalAdCode, workItems, chatMessages, addChatMessage]);

  const taskCounts = {
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    done: tasks.filter(t => t.status === 'done').length,
  };

  return (
    <div className="canvas-workspace-v2">
      {/* Control Bar */}
      <div className="controls-bar">
        <div className="controls-left">
          {!isRunning ? (
            <button className="control-btn start-btn" onClick={handleStart} disabled={!brief}>
              <Play size={16} weight="bold" />
              <span>START</span>
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
          <span className="item-count">{workItems.length} items • {chatMessages.length} messages</span>
        </div>
        
        <div className="controls-right">
          <span className="task-summary">
            {taskCounts.todo} todo • {taskCounts.inProgress} active • {taskCounts.done} done
          </span>
          <span className="zoom-level">{Math.round(zoom * 100)}%</span>
        </div>
      </div>

      {/* Main Content Area - Canvas + Chat Sidebar */}
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
              <span className="kanban-phase">Phase {currentPhase}/7</span>
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

          {/* Work Zone Labels - positioned at corners */}
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

          {/* FINAL OUTPUT ZONE */}
          <div 
            className={`final-output-zone ${finalAdCode ? 'ready' : ''}`}
            style={{
              left: FINAL_OUTPUT_ZONE.x,
              top: FINAL_OUTPUT_ZONE.y,
              width: FINAL_OUTPUT_ZONE.width,
              height: FINAL_OUTPUT_ZONE.height,
            }}
          >
            <div className="final-output-header">
              <span><Package size={14} weight="bold" /> OUTPUT</span>
              {finalAdCode && (
                <button className="view-code-btn" onClick={() => setShowCodePanel(true)}><Eye size={14} weight="bold" />
                  VIEW CODE
                </button>
              )}
            </div>
            <div className="final-output-content">
              {finalAdCode ? (
                <div className="output-ready">
                  <span className="output-status">✓ READY</span>
                  <span className="output-filename">campaign.html</span>
                </div>
              ) : (
                <span className="output-waiting">Waiting...</span>
              )}
            </div>
          </div>

          {/* Work Items - DRAGGABLE */}
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

        {/* Drag hint */}
        <div className="canvas-hint">Drag items to combine ideas • Scroll to pan • Pinch to zoom • Drag canvas to pan</div>
      </div>

      {/* Chat Panel - Right Sidebar */}
      <div className="chat-panel">
        <div className="chat-header">
          <span className="chat-title">AGENT DIALOGUE</span>
          <span className="chat-phase">Phase {currentPhase}/7</span>
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

      {/* Code Panel */}
      {showCodePanel && (
        <div className="code-panel-overlay" onClick={() => setShowCodePanel(false)}>
          <div className="code-panel" onClick={e => e.stopPropagation()}>
            <div className="code-panel-header">
              <span><Package size={14} weight="bold" /> CAMPAIGN DELIVERABLES</span>
              <div className="code-panel-actions">
                <button className="download-btn" onClick={downloadZip}><DownloadSimple size={14} weight="bold" /> DOWNLOAD ZIP</button>
                <button className="copy-btn" onClick={copyCode}><Copy size={14} weight="bold" /> COPY HTML</button>
                <button className="close-btn" onClick={() => setShowCodePanel(false)}><X size={16} weight="bold" /></button>
              </div>
            </div>
            <div className="code-panel-content">
              <pre className="code-block">{finalAdCode}</pre>
            </div>
            <div className="code-panel-footer">
              <strong>Download ZIP</strong> for full deliverables package (print specs, video storyboard, social copy, OOH specs) • Or copy HTML to preview in browser
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CanvasWorkspace;
