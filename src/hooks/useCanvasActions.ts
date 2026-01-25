import { useState, useEffect, useCallback } from 'react';
import canvasOrchestrator, { 
  CanvasState, 
  CanvasAction, 
  CanvasElement, 
  AgentState 
} from '../services/canvasOrchestrator';
import { CharacterId } from '../types';

export interface UseCanvasActionsReturn {
  // State
  agents: AgentState[];
  elements: CanvasElement[];
  isPlaying: boolean;
  speed: number;
  progress: number; // 0-100
  currentActionIndex: number;
  totalActions: number;
  
  // Controls
  play: () => void;
  pause: () => void;
  reset: () => void;
  setSpeed: (speed: number) => void;
  
  // Actions
  loadActions: (actions: CanvasAction[]) => void;
  addActions: (actions: CanvasAction[]) => void;
  
  // Utilities
  getAgentState: (agentId: CharacterId) => AgentState | undefined;
}

export function useCanvasActions(): UseCanvasActionsReturn {
  const [state, setState] = useState<CanvasState>(canvasOrchestrator.getState());
  
  useEffect(() => {
    const unsubscribe = canvasOrchestrator.subscribe((newState) => {
      setState({ ...newState });
    });
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  const play = useCallback(() => {
    canvasOrchestrator.play();
  }, []);
  
  const pause = useCallback(() => {
    canvasOrchestrator.pause();
  }, []);
  
  const reset = useCallback(() => {
    canvasOrchestrator.reset();
  }, []);
  
  const setSpeed = useCallback((speed: number) => {
    canvasOrchestrator.setSpeed(speed);
  }, []);
  
  const loadActions = useCallback((actions: CanvasAction[]) => {
    canvasOrchestrator.loadActions(actions);
  }, []);
  
  const addActions = useCallback((actions: CanvasAction[]) => {
    canvasOrchestrator.addActions(actions);
  }, []);
  
  const getAgentState = useCallback((agentId: CharacterId) => {
    return canvasOrchestrator.getAgentState(agentId);
  }, []);
  
  const progress = state.actionQueue.length > 0
    ? (state.currentActionIndex / state.actionQueue.length) * 100
    : 0;
  
  return {
    agents: Array.from(state.agents.values()),
    elements: Array.from(state.elements.values()),
    isPlaying: state.isPlaying,
    speed: state.speed,
    progress,
    currentActionIndex: state.currentActionIndex,
    totalActions: state.actionQueue.length,
    play,
    pause,
    reset,
    setSpeed,
    loadActions,
    addActions,
    getAgentState,
  };
}

export default useCanvasActions;

