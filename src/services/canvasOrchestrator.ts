import { CharacterId } from '../types';

// Types for canvas actions
export interface Position {
  x: number;
  y: number;
}

export interface CanvasAction {
  id: string;
  agent: CharacterId;
  action: ActionType;
  position?: Position;
  targetPosition?: Position;
  elementId?: string;
  text?: string;
  color?: string;
  duration?: number;
  charDelay?: number;
  diagramType?: 'framework' | 'flowchart' | 'mindmap';
  arrowFrom?: string;
  arrowTo?: string;
  htmlContent?: string;
}

export type ActionType = 
  | 'moveTo'
  | 'createSticky'
  | 'createText'
  | 'createDiagram'
  | 'createArrow'
  | 'createAdFrame'
  | 'typeInto'
  | 'dragElement'
  | 'deleteElement'
  | 'highlightElement'
  | 'think'
  | 'click'
  | 'select'
  | 'vote'
  | 'updateAdFrame';

export interface CanvasElement {
  id: string;
  type: 'sticky' | 'text' | 'diagram' | 'arrow' | 'adFrame' | 'image';
  position: Position;
  content?: string;
  color?: string;
  createdBy: CharacterId;
  width?: number;
  height?: number;
  htmlContent?: string;
  arrowFrom?: Position;
  arrowTo?: Position;
  diagramType?: string;
  highlighted?: boolean;
  votes?: CharacterId[];
}

export interface AgentState {
  id: CharacterId;
  position: Position;
  status: 'idle' | 'moving' | 'typing' | 'thinking' | 'clicking' | 'dragging';
  currentAction?: string;
}

export interface CanvasState {
  agents: Map<CharacterId, AgentState>;
  elements: Map<string, CanvasElement>;
  actionQueue: CanvasAction[];
  currentActionIndex: number;
  isPlaying: boolean;
  speed: number;
}

type StateListener = (state: CanvasState) => void;
type ActionListener = (action: CanvasAction, state: CanvasState) => void;

class CanvasOrchestrator {
  private state: CanvasState;
  private stateListeners: Set<StateListener> = new Set();
  private actionListeners: Set<ActionListener> = new Set();
  private animationFrameId: number | null = null;
  private actionTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private typingIntervalId: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.state = {
      agents: new Map(),
      elements: new Map(),
      actionQueue: [],
      currentActionIndex: 0,
      isPlaying: false,
      speed: 1,
    };

    // Initialize agent positions
    this.initializeAgents();
  }

  private initializeAgents() {
    const agentConfigs: { id: CharacterId; position: Position }[] = [
      { id: 'mike', position: { x: 100, y: 100 } },
      { id: 'poole', position: { x: 300, y: 150 } },
      { id: 'cell', position: { x: 500, y: 100 } },
      { id: 'burl', position: { x: 700, y: 150 } },
      { id: 'committee', position: { x: 200, y: 400 } },
      { id: 'nadya', position: { x: 400, y: 450 } },
      { id: 'delmore', position: { x: 600, y: 400 } },
      { id: 'apparatus', position: { x: 800, y: 450 } },
    ];

    agentConfigs.forEach(({ id, position }) => {
      this.state.agents.set(id, {
        id,
        position,
        status: 'idle',
      });
    });
  }

  // Subscribe to state changes
  subscribe(listener: StateListener): () => void {
    this.stateListeners.add(listener);
    listener(this.state); // Initial call
    return () => this.stateListeners.delete(listener);
  }

  // Subscribe to action events (for animation triggers)
  onAction(listener: ActionListener): () => void {
    this.actionListeners.add(listener);
    return () => this.actionListeners.delete(listener);
  }

  private notifyStateListeners() {
    this.stateListeners.forEach(listener => listener(this.state));
  }

  private notifyActionListeners(action: CanvasAction) {
    this.actionListeners.forEach(listener => listener(action, this.state));
  }

  // Load a sequence of actions
  loadActions(actions: CanvasAction[]) {
    this.state.actionQueue = actions;
    this.state.currentActionIndex = 0;
    this.notifyStateListeners();
  }

  // Add actions to the queue
  addActions(actions: CanvasAction[]) {
    this.state.actionQueue.push(...actions);
    this.notifyStateListeners();
  }

  // Play/pause controls
  play() {
    if (this.state.isPlaying) return;
    this.state.isPlaying = true;
    this.notifyStateListeners();
    this.processNextAction();
  }

  pause() {
    this.state.isPlaying = false;
    if (this.actionTimeoutId) {
      clearTimeout(this.actionTimeoutId);
      this.actionTimeoutId = null;
    }
    if (this.typingIntervalId) {
      clearInterval(this.typingIntervalId);
      this.typingIntervalId = null;
    }
    this.notifyStateListeners();
  }

  setSpeed(speed: number) {
    this.state.speed = Math.max(0.25, Math.min(4, speed));
    this.notifyStateListeners();
  }

  reset() {
    this.pause();
    this.state.currentActionIndex = 0;
    this.state.elements.clear();
    this.initializeAgents();
    this.notifyStateListeners();
  }

  // Process the next action in the queue
  private async processNextAction() {
    if (!this.state.isPlaying) return;
    if (this.state.currentActionIndex >= this.state.actionQueue.length) {
      this.state.isPlaying = false;
      this.notifyStateListeners();
      return;
    }

    const action = this.state.actionQueue[this.state.currentActionIndex];
    await this.executeAction(action);
    this.notifyActionListeners(action);

    this.state.currentActionIndex++;
    this.notifyStateListeners();

    // Schedule next action
    const delay = this.getActionDelay(action);
    this.actionTimeoutId = setTimeout(() => {
      this.processNextAction();
    }, delay / this.state.speed);
  }

  private getActionDelay(action: CanvasAction): number {
    switch (action.action) {
      case 'moveTo':
        return action.duration || 800;
      case 'typeInto':
        return (action.text?.length || 0) * (action.charDelay || 60) + 200;
      case 'think':
        return action.duration || 2000;
      case 'click':
        return 300;
      case 'createSticky':
      case 'createText':
      case 'createDiagram':
      case 'createAdFrame':
        return 500;
      case 'dragElement':
        return action.duration || 1000;
      case 'highlightElement':
        return 800;
      case 'vote':
        return 600;
      default:
        return 500;
    }
  }

  private async executeAction(action: CanvasAction): Promise<void> {
    const agent = this.state.agents.get(action.agent);
    if (!agent) return;

    switch (action.action) {
      case 'moveTo':
        await this.executeMoveTo(agent, action);
        break;
      case 'createSticky':
        this.executeCreateSticky(agent, action);
        break;
      case 'createText':
        this.executeCreateText(agent, action);
        break;
      case 'createDiagram':
        this.executeCreateDiagram(agent, action);
        break;
      case 'createArrow':
        this.executeCreateArrow(agent, action);
        break;
      case 'createAdFrame':
        this.executeCreateAdFrame(agent, action);
        break;
      case 'typeInto':
        await this.executeTypeInto(agent, action);
        break;
      case 'dragElement':
        await this.executeDragElement(agent, action);
        break;
      case 'highlightElement':
        this.executeHighlightElement(action);
        break;
      case 'think':
        this.executeThink(agent, action);
        break;
      case 'click':
        this.executeClick(agent, action);
        break;
      case 'vote':
        this.executeVote(agent, action);
        break;
      case 'updateAdFrame':
        this.executeUpdateAdFrame(action);
        break;
      case 'deleteElement':
        this.executeDeleteElement(action);
        break;
      case 'select':
        this.executeSelect(agent, action);
        break;
    }
  }

  private async executeMoveTo(agent: AgentState, action: CanvasAction): Promise<void> {
    if (!action.position) return;
    
    agent.status = 'moving';
    const startPos = { ...agent.position };
    const endPos = action.position;
    const duration = action.duration || 800;
    const startTime = performance.now();

    return new Promise((resolve) => {
      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease-out cubic for smooth deceleration
        const eased = 1 - Math.pow(1 - progress, 3);
        
        agent.position = {
          x: startPos.x + (endPos.x - startPos.x) * eased,
          y: startPos.y + (endPos.y - startPos.y) * eased,
        };
        
        this.notifyStateListeners();

        if (progress < 1) {
          this.animationFrameId = requestAnimationFrame(animate);
        } else {
          agent.status = 'idle';
          resolve();
        }
      };
      
      this.animationFrameId = requestAnimationFrame(animate);
    });
  }

  private executeCreateSticky(agent: AgentState, action: CanvasAction) {
    const elementId = action.elementId || `sticky-${Date.now()}`;
    const element: CanvasElement = {
      id: elementId,
      type: 'sticky',
      position: action.position || agent.position,
      content: '',
      color: action.color || this.getAgentColor(agent.id),
      createdBy: agent.id,
      width: 200,
      height: 150,
    };
    this.state.elements.set(elementId, element);
    agent.status = 'clicking';
    setTimeout(() => {
      agent.status = 'idle';
      this.notifyStateListeners();
    }, 200);
  }

  private executeCreateText(agent: AgentState, action: CanvasAction) {
    const elementId = action.elementId || `text-${Date.now()}`;
    const element: CanvasElement = {
      id: elementId,
      type: 'text',
      position: action.position || agent.position,
      content: '',
      color: action.color,
      createdBy: agent.id,
      width: 300,
      height: 100,
    };
    this.state.elements.set(elementId, element);
  }

  private executeCreateDiagram(agent: AgentState, action: CanvasAction) {
    const elementId = action.elementId || `diagram-${Date.now()}`;
    const element: CanvasElement = {
      id: elementId,
      type: 'diagram',
      position: action.position || agent.position,
      content: action.text || '',
      diagramType: action.diagramType || 'framework',
      createdBy: agent.id,
      width: 400,
      height: 300,
    };
    this.state.elements.set(elementId, element);
  }

  private executeCreateArrow(agent: AgentState, action: CanvasAction) {
    const elementId = action.elementId || `arrow-${Date.now()}`;
    
    // Get positions from element IDs or direct positions
    let fromPos = action.position || { x: 0, y: 0 };
    let toPos = action.targetPosition || { x: 100, y: 100 };
    
    if (action.arrowFrom) {
      const fromElement = this.state.elements.get(action.arrowFrom);
      if (fromElement) {
        fromPos = {
          x: fromElement.position.x + (fromElement.width || 100) / 2,
          y: fromElement.position.y + (fromElement.height || 100) / 2,
        };
      }
    }
    
    if (action.arrowTo) {
      const toElement = this.state.elements.get(action.arrowTo);
      if (toElement) {
        toPos = {
          x: toElement.position.x + (toElement.width || 100) / 2,
          y: toElement.position.y + (toElement.height || 100) / 2,
        };
      }
    }

    const element: CanvasElement = {
      id: elementId,
      type: 'arrow',
      position: fromPos,
      arrowFrom: fromPos,
      arrowTo: toPos,
      createdBy: agent.id,
    };
    this.state.elements.set(elementId, element);
  }

  private executeCreateAdFrame(agent: AgentState, action: CanvasAction) {
    const elementId = action.elementId || `adframe-${Date.now()}`;
    const element: CanvasElement = {
      id: elementId,
      type: 'adFrame',
      position: action.position || { x: 400, y: 300 },
      htmlContent: action.htmlContent || '',
      createdBy: agent.id,
      width: 600,
      height: 400,
    };
    this.state.elements.set(elementId, element);
  }

  private async executeTypeInto(agent: AgentState, action: CanvasAction): Promise<void> {
    if (!action.elementId || !action.text) return;
    
    const element = this.state.elements.get(action.elementId);
    if (!element) return;

    agent.status = 'typing';
    agent.currentAction = `Typing into ${action.elementId}`;
    
    const text = action.text;
    const charDelay = action.charDelay || 60;
    let currentIndex = 0;

    return new Promise((resolve) => {
      this.typingIntervalId = setInterval(() => {
        if (currentIndex >= text.length || !this.state.isPlaying) {
          if (this.typingIntervalId) {
            clearInterval(this.typingIntervalId);
            this.typingIntervalId = null;
          }
          agent.status = 'idle';
          agent.currentAction = undefined;
          this.notifyStateListeners();
          resolve();
          return;
        }

        element.content = (element.content || '') + text[currentIndex];
        currentIndex++;
        
        // Add slight randomness to typing speed
        const variance = Math.random() * 40 - 20;
        if (this.typingIntervalId) {
          clearInterval(this.typingIntervalId);
        }
        this.typingIntervalId = setInterval(() => {
          // Recursive call handled by the next iteration
        }, (charDelay + variance) / this.state.speed);
        
        this.notifyStateListeners();
      }, charDelay / this.state.speed);
    });
  }

  private async executeDragElement(agent: AgentState, action: CanvasAction): Promise<void> {
    if (!action.elementId || !action.targetPosition) return;
    
    const element = this.state.elements.get(action.elementId);
    if (!element) return;

    agent.status = 'dragging';
    
    // First move cursor to element
    const startPos = { ...agent.position };
    agent.position = { ...element.position };
    this.notifyStateListeners();
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Now drag element to target
    const duration = action.duration || 1000;
    const elementStart = { ...element.position };
    const startTime = performance.now();

    return new Promise((resolve) => {
      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        
        element.position = {
          x: elementStart.x + (action.targetPosition!.x - elementStart.x) * eased,
          y: elementStart.y + (action.targetPosition!.y - elementStart.y) * eased,
        };
        
        // Agent cursor follows element
        agent.position = {
          x: element.position.x + 10,
          y: element.position.y + 10,
        };
        
        this.notifyStateListeners();

        if (progress < 1) {
          this.animationFrameId = requestAnimationFrame(animate);
        } else {
          agent.status = 'idle';
          resolve();
        }
      };
      
      this.animationFrameId = requestAnimationFrame(animate);
    });
  }

  private executeHighlightElement(action: CanvasAction) {
    if (!action.elementId) return;
    const element = this.state.elements.get(action.elementId);
    if (element) {
      element.highlighted = true;
      this.notifyStateListeners();
      
      // Remove highlight after duration
      setTimeout(() => {
        element.highlighted = false;
        this.notifyStateListeners();
      }, action.duration || 800);
    }
  }

  private executeThink(agent: AgentState, action: CanvasAction) {
    agent.status = 'thinking';
    agent.currentAction = action.text || 'Thinking...';
    this.notifyStateListeners();
    
    setTimeout(() => {
      agent.status = 'idle';
      agent.currentAction = undefined;
      this.notifyStateListeners();
    }, (action.duration || 2000) / this.state.speed);
  }

  private executeClick(agent: AgentState, action: CanvasAction) {
    agent.status = 'clicking';
    if (action.position) {
      agent.position = action.position;
    }
    this.notifyStateListeners();
    
    setTimeout(() => {
      agent.status = 'idle';
      this.notifyStateListeners();
    }, 200);
  }

  private executeVote(agent: AgentState, action: CanvasAction) {
    if (!action.elementId) return;
    const element = this.state.elements.get(action.elementId);
    if (element) {
      if (!element.votes) element.votes = [];
      if (!element.votes.includes(agent.id)) {
        element.votes.push(agent.id);
      }
      this.notifyStateListeners();
    }
  }

  private executeUpdateAdFrame(action: CanvasAction) {
    if (!action.elementId || !action.htmlContent) return;
    const element = this.state.elements.get(action.elementId);
    if (element && element.type === 'adFrame') {
      element.htmlContent = action.htmlContent;
      this.notifyStateListeners();
    }
  }

  private executeDeleteElement(action: CanvasAction) {
    if (action.elementId) {
      this.state.elements.delete(action.elementId);
      this.notifyStateListeners();
    }
  }

  private executeSelect(agent: AgentState, action: CanvasAction) {
    if (action.elementId) {
      const element = this.state.elements.get(action.elementId);
      if (element) {
        agent.position = {
          x: element.position.x + (element.width || 100) / 2,
          y: element.position.y - 20,
        };
      }
    }
    agent.status = 'clicking';
    this.notifyStateListeners();
    
    setTimeout(() => {
      agent.status = 'idle';
      this.notifyStateListeners();
    }, 300);
  }

  private getAgentColor(agentId: CharacterId): string {
    const colors: Record<CharacterId, string> = {
      mike: '#8B4513',
      poole: '#1a1a2e',
      cell: '#2d2d44',
      burl: '#3d3d3d',
      committee: '#4a4a4a',
      nadya: '#cc0000',
      delmore: '#2a4a2a',
      apparatus: '#1a1a1a',
    };
    return colors[agentId] || '#666666';
  }

  // Get current state snapshot
  getState(): CanvasState {
    return this.state;
  }

  // Get specific agent state
  getAgentState(agentId: CharacterId): AgentState | undefined {
    return this.state.agents.get(agentId);
  }

  // Get all elements
  getElements(): CanvasElement[] {
    return Array.from(this.state.elements.values());
  }

  // Cleanup
  destroy() {
    this.pause();
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.stateListeners.clear();
    this.actionListeners.clear();
  }
}

// Singleton instance
export const canvasOrchestrator = new CanvasOrchestrator();

// Helper function to create action sequences
export function createActionSequence(
  phase: string,
  brief: string
): CanvasAction[] {
  // This will be populated with phase-specific sequences
  // For now, return empty array - will be implemented in phase-sequences
  return [];
}

export default canvasOrchestrator;

