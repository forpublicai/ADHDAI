import { useState, useCallback } from 'react';
import { AppState, Message, CharacterId } from '../types';
import { CHARACTERS, INITIAL_TASKS, INITIAL_WINDOWS, INITIAL_BRIEF } from '../constants';
import ChatSidebar from '../components/ChatSidebar';
import CodeEditor from '../components/CodeEditor';
import LivePreview from '../components/LivePreview';
import KanbanBoard from '../components/KanbanBoard';
import WindowFrame from '../components/WindowFrame';
import ControlPanel from '../components/ControlPanel';
import { Link } from 'react-router-dom';
import '../App.css';

export default function Agency() {
  const [state, setState] = useState<AppState>({
    isRunning: false,
    currentPhase: 'brief',
    messages: [],
    tasks: INITIAL_TASKS,
    windows: INITIAL_WINDOWS,
    generatedAd: '',
    brief: INITIAL_BRIEF
  });

  const [briefInput, setBriefInput] = useState(INITIAL_BRIEF);

  const addMessage = useCallback((characterId: CharacterId, content: string, type: 'message' | 'action' | 'code' = 'message', code?: string) => {
    const message: Message = {
      id: Date.now().toString(),
      characterId,
      timestamp: Date.now(),
      content,
      type,
      code,
      language: code ? 'html' : undefined
    };
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, message]
    }));
  }, []);

  const updateWindow = useCallback((windowId: string, updates: Partial<AppState['windows'][0]>) => {
    setState(prev => ({
      ...prev,
      windows: prev.windows.map(w => w.id === windowId ? { ...w, ...updates } : w)
    }));
  }, []);

  const bringToFront = useCallback((windowId: string) => {
    setState(prev => {
      const maxZ = Math.max(...prev.windows.map(w => w.zIndex));
      return {
        ...prev,
        windows: prev.windows.map(w => 
          w.id === windowId ? { ...w, zIndex: maxZ + 1 } : w
        )
      };
    });
  }, []);

  const startSimulation = useCallback(() => {
    if (state.isRunning) return;
    
    setState(prev => ({
      ...prev,
      isRunning: true,
      brief: briefInput,
      messages: [],
      currentPhase: 'brief'
    }));

    // Brief expansion phase
    setTimeout(() => {
      addMessage('josh', `Alright team, we got a brief: "${briefInput}". Let me expand this into a comprehensive PRD that completely misses the point.`);
    }, 500);

    setTimeout(() => {
      addMessage('josh', `PRD: We need to create an ad for ${briefInput}. Key requirements: maximum confusion, minimum clarity, and at least 47 buzzwords. Let's make it happen!`);
    }, 2000);

    // Phase 1: Misunderstanding
    setTimeout(() => {
      setState(prev => ({ ...prev, currentPhase: 'phase1' }));
      addMessage('ahnjili', `Wait, so ${briefInput}... is that like a cloud-based blockchain solution for toast? I'm thinking we position it as a revolutionary data transformation platform!`);
    }, 4000);

    setTimeout(() => {
      addMessage('alice', `YES! This is so disruptive! We need to leverage synergies and create a paradigm shift in the toast vertical. Let's make it Web3 native!`);
    }, 6000);

    // Phase 2: Overstimulation
    setTimeout(() => {
      setState(prev => ({ ...prev, currentPhase: 'phase2' }));
      addMessage('andy', `I'm adding ALL the colors! And animations! And gradients! And maybe some particle effects! This is going to be AMAZING!`);
    }, 8000);

    setTimeout(() => {
      addMessage('bob', `Let me write some copy... "Your data is like a butterfly, but also a tank. Revolutionary. Disruptive. Toast."`);
    }, 10000);

    // Phase 3: Broken metaphors
    setTimeout(() => {
      setState(prev => ({ ...prev, currentPhase: 'phase3' }));
      addMessage('bob', `New tagline: "Transform your morning routine into a quantum leap of breakfast innovation. Because toast isn't just bread—it's a state of mind."`);
    }, 12000);

    setTimeout(() => {
      addMessage('alice', `I LOVE IT! It's so... meta! And disruptive! And paradigm-shifting!`);
    }, 14000);

    // Phase 4: Polish
    setTimeout(() => {
      setState(prev => ({ ...prev, currentPhase: 'phase4' }));
      addMessage('josh', `Everyone, add your worst ideas! This is going to be GENIUS!`);
    }, 16000);

    setTimeout(() => {
      const adCode = `<!DOCTYPE html>
<html>
<head>
  <title>Revolutionary Toast Transformation Platform</title>
  <style>
    body {
      background: linear-gradient(45deg, #ff006e, #8338ec, #3a86ff, #ffbe0b, #fb5607);
      animation: rainbow 2s infinite;
      font-family: Comic Sans MS, cursive;
      color: white;
      text-align: center;
      padding: 50px;
    }
    @keyframes rainbow {
      0%, 100% { filter: hue-rotate(0deg); }
      50% { filter: hue-rotate(180deg); }
    }
    h1 { font-size: 72px; text-shadow: 10px 10px 20px black; }
    .tagline { font-size: 36px; margin: 30px 0; }
    .buzzwords { font-size: 24px; margin: 20px 0; }
  </style>
</head>
<body>
  <h1>🚀 REVOLUTIONARY TOAST 🚀</h1>
  <div class="tagline">Transform your morning routine into a quantum leap of breakfast innovation</div>
  <div class="buzzwords">DISRUPTIVE • PARADIGM-SHIFTING • WEB3 NATIVE • BLOCKCHAIN-ENABLED • AI-POWERED</div>
  <p>Because toast isn't just bread—it's a state of mind.</p>
  <p>Your data is like a butterfly, but also a tank.</p>
</body>
</html>`;
      addMessage('andy', `Here's the final design!`, 'code', adCode);
      setState(prev => ({ ...prev, generatedAd: adCode }));
    }, 18000);

    setTimeout(() => {
      setState(prev => ({ ...prev, currentPhase: 'phase5', isRunning: false }));
      addMessage('josh', `Perfect! This is exactly what we needed. A masterpiece of confusion. Ship it!`);
    }, 20000);
  }, [state.isRunning, briefInput, addMessage]);

  const pauseSimulation = useCallback(() => {
    setState(prev => ({ ...prev, isRunning: false }));
  }, []);

  return (
    <div className="app">
      <div style={{ position: 'fixed', top: 20, left: 20, zIndex: 1000 }}>
        <Link to="/" style={{ 
          padding: '8px 16px', 
          background: 'rgba(255, 255, 255, 0.9)', 
          borderRadius: '8px', 
          textDecoration: 'none', 
          color: '#0A0E27',
          fontWeight: 600,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}>
          ← Back to Home
        </Link>
      </div>
      <ControlPanel
        isRunning={state.isRunning}
        currentPhase={state.currentPhase}
        brief={briefInput}
        onBriefChange={setBriefInput}
        onStart={startSimulation}
        onPause={pauseSimulation}
      />
      
      {state.windows.map(window => (
        <WindowFrame
          key={window.id}
          window={window}
          onUpdate={(updates) => updateWindow(window.id, updates)}
          onFocus={() => bringToFront(window.id)}
        >
          {window.type === 'chat' && (
            <ChatSidebar messages={state.messages} characters={CHARACTERS} />
          )}
          {window.type === 'code' && (
            <CodeEditor code={state.generatedAd} />
          )}
          {window.type === 'preview' && (
            <LivePreview code={state.generatedAd} />
          )}
          {window.type === 'kanban' && (
            <KanbanBoard tasks={state.tasks} characters={CHARACTERS} currentPhase={state.currentPhase} />
          )}
        </WindowFrame>
      ))}
    </div>
  );
}
