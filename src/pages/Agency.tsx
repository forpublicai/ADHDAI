import { useState, useCallback } from 'react';
import { AppState, Message, CharacterId, Task } from '../types';
import { CHARACTERS, INITIAL_TASKS, INITIAL_WINDOWS, INITIAL_BRIEF } from '../constants';
import ChatSidebar from '../components/ChatSidebar';
import CodeEditor from '../components/CodeEditor';
import LivePreview from '../components/LivePreview';
import KanbanBoard from '../components/KanbanBoard';
import WindowFrame from '../components/WindowFrame';
import ControlPanel from '../components/ControlPanel';
import CanvasWorkspace from '../components/Canvas/CanvasWorkspace';
import { Link } from 'react-router-dom';
import { generateBadAd } from '../services/adGenerator';
import { extractAdComponents, buildPartialAd } from '../utils/adBuilder';
import { generateCampaignDeliverables, formatDeliverablesAsHTML } from '../services/campaignDeliverables';
import { extractBrandInfo, checkKnownBrand } from '../services/brandExtractor';
import {
  generateSlabIntakeReport,
  generatePooleFramework,
  generateCellCopyTransmittal,
  generateBurlVisualDirection,
  generateCommitteeFindings,
  generateNadyaProductionSchedule,
  generateDelmoreClientTranslation,
  generateApparatusFinalAdvertisement,
  generateApparatusReady,
  generateCellObjectionToPoole,
  generateBurlCopyRequest,
  generateNadyaInterruption,
  generatePooleDefense
} from '../utils/messageGenerator';
import '../App.css';

export default function Agency() {
  const [state, setState] = useState<AppState>({
    isRunning: false,
    currentPhase: 'brief',
    messages: [],
    tasks: INITIAL_TASKS,
    windows: INITIAL_WINDOWS,
    generatedAd: '',
    brief: INITIAL_BRIEF,
    adComponents: {}
  });

  const [briefInput, setBriefInput] = useState(INITIAL_BRIEF);

  // Update task status, work products, and progress
  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      )
    }));
  }, []);


  const addMessage = useCallback((characterId: CharacterId, content: string, type: 'message' | 'action' | 'code' = 'message', code?: string) => {
    // Use a more unique ID to prevent duplicate keys
    const messageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const message: Message = {
      id: messageId,
      characterId,
      timestamp: Date.now(),
      content,
      type,
      code,
      language: code ? 'html' : undefined
    };
    setState(prev => {
      const newMessages = [...prev.messages, message];
      // Extract ad components from all messages and update
      const components = extractAdComponents(newMessages);
      const partialAd = buildPartialAd(components, prev.brief || briefInput, prev.brandInfo);
      return {
      ...prev,
        messages: newMessages,
        adComponents: components,
        generatedAd: partialAd
      };
    });
  }, [briefInput]);

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

  const startSimulation = useCallback(async () => {
    if (state.isRunning) return;
    
    // Track messages for threaded responses
    let slabReport = '';
    let pooleFramework = '';
    let cellCopy = '';
    let burlVisual = '';
    
    setState(prev => ({
      ...prev,
      isRunning: true,
      brief: briefInput,
      messages: [],
      currentPhase: 'brief',
      generatedAd: '',
      adComponents: {},
      campaignDeliverables: undefined,
      brandInfo: undefined,
      tasks: INITIAL_TASKS.map(task => ({ ...task, status: 'todo' as const }))
    }));

    // Extract brand information from brief
    let brandInfo = checkKnownBrand(briefInput);
    if (!brandInfo) {
      try {
        brandInfo = await extractBrandInfo(briefInput);
      } catch (error) {
        console.error('Error extracting brand info:', error);
      }
    }
    
    if (brandInfo) {
      setState(prev => ({ ...prev, brandInfo }));
    }

    // 001 — INTAKE REPORT (Slab)
    setTimeout(() => {
      updateTask('1', { status: 'in-progress', progress: 0, workProduct: 'Analyzing brief...' });
      setTimeout(() => updateTask('1', { progress: 25, workProduct: 'Conducting interrogation...' }), 800);
      setTimeout(() => updateTask('1', { progress: 50, workProduct: 'Identifying real problem...' }), 1600);
      setTimeout(() => updateTask('1', { progress: 75, workProduct: 'Compiling findings...' }), 2400);
      setTimeout(() => {
        slabReport = generateSlabIntakeReport(briefInput);
        addMessage('mike', slabReport);
        updateTask('1', { status: 'done', progress: 100, workProduct: 'Intake report completed', completedAt: Date.now() });
        updateTask('2', { status: 'in-progress', progress: 0, workProduct: 'Documenting findings...' });
        setTimeout(() => updateTask('2', { progress: 50 }), 1000);
        setTimeout(() => {
          updateTask('2', { status: 'done', progress: 100, workProduct: 'Findings documented', completedAt: Date.now() });
          updateTask('3', { status: 'in-progress', progress: 0, workProduct: 'Identifying concerns...' });
          setTimeout(() => updateTask('3', { progress: 50 }), 1000);
    setTimeout(() => {
            updateTask('3', { status: 'done', progress: 100, workProduct: 'Outstanding concerns identified', completedAt: Date.now() });
          }, 2000);
    }, 2000);
      }, 3200);
    }, 1000);

    // 002 — STRATEGIC FRAMEWORK (Dr. Poole) - responds to Slab's report
    setTimeout(() => {
      setState(prev => ({ ...prev, currentPhase: 'phase1' }));
      updateTask('4', { status: 'in-progress', progress: 0, workProduct: 'Reviewing intake report...' });
      setTimeout(() => updateTask('4', { progress: 20, workProduct: 'Applying The Poole System...' }), 1500);
      setTimeout(() => updateTask('4', { progress: 40, workProduct: 'Mapping desire pathways...' }), 3000);
      setTimeout(() => updateTask('4', { progress: 60, workProduct: 'Identifying barriers...' }), 4500);
      setTimeout(() => updateTask('4', { progress: 80, workProduct: 'Formulating reframe...' }), 6000);
      setTimeout(() => {
        pooleFramework = generatePooleFramework(slabReport, briefInput);
        addMessage('poole', pooleFramework);
        // Extract framework snippet
        const frameworkSnippet = pooleFramework.match(/Principle \d+: "([^"]+)"/)?.[1] || 'Framework developed';
        updateTask('4', { status: 'done', progress: 100, workProduct: `Framework: ${frameworkSnippet}`, completedAt: Date.now() });
        updateTask('5', { status: 'in-progress', progress: 0, workProduct: 'Creating framework diagram...' });
        setTimeout(() => updateTask('5', { progress: 50 }), 1500);
        setTimeout(() => {
          updateTask('5', { status: 'done', progress: 100, workProduct: 'Diagram: BARRIER → REFRAME → PERMISSION → ACTION', completedAt: Date.now() });
          updateTask('6', { status: 'in-progress', progress: 0, workProduct: 'Proposing reframe...' });
          setTimeout(() => updateTask('6', { progress: 50 }), 1500);
    setTimeout(() => {
            const reframeMatch = pooleFramework.match(/RECOMMENDED DESIRE PATHWAY:\*\* ([^\n]+)/);
            const reframeSnippet = reframeMatch ? reframeMatch[1] : 'Reframe proposed';
            updateTask('6', { status: 'done', progress: 100, workProduct: `Pathway: ${reframeSnippet}`, completedAt: Date.now() });
          }, 2000);
        }, 2000);
      }, 7500);
    }, 8000);

    // 003 — COPY TRANSMITTAL (The Cell) - responds to Poole's framework, with objection
    setTimeout(() => {
      setState(prev => ({ ...prev, currentPhase: 'phase2' }));
      updateTask('7', { status: 'in-progress', progress: 0, workProduct: 'Reviewing framework...' });
      setTimeout(() => updateTask('7', { progress: 30, workProduct: 'Internal deliberation...' }), 2000);
      setTimeout(() => updateTask('7', { progress: 60, workProduct: 'Formulating objection...' }), 4000);
      setTimeout(() => {
        const objection = generateCellObjectionToPoole(pooleFramework);
        addMessage('the-cell', objection);
        updateTask('7', { 
          status: 'done', 
          progress: 100, 
          workProduct: 'Objection raised to framework',
          conflicts: [{ with: 'poole', reason: 'Ideological concerns' }],
          completedAt: Date.now() 
        });
        updateTask('8', { status: 'in-progress', progress: 0, workProduct: 'Writing Option A...' });
        setTimeout(() => updateTask('8', { progress: 30, workProduct: 'Drafting headline...' }), 1500);
        setTimeout(() => updateTask('8', { progress: 60, workProduct: 'Writing body copy...' }), 3000);
        setTimeout(() => {
          // Extract Option A headline snippet
          const optionAMatch = cellCopy.match(/\*\*OPTION A:.*?\*Headline:\*\s*"([^"]+)"/s);
          const optionASnippet = optionAMatch ? `"${optionAMatch[1].substring(0, 50)}..."` : 'Option A created';
          updateTask('8', { status: 'done', progress: 100, workProduct: `Option A: ${optionASnippet}`, completedAt: Date.now() });
          updateTask('9', { status: 'in-progress', progress: 0, workProduct: 'Writing Option B...' });
          setTimeout(() => updateTask('9', { progress: 30, workProduct: 'Exploring variation...' }), 1500);
          setTimeout(() => updateTask('9', { progress: 60, workProduct: 'Refining copy...' }), 3000);
          setTimeout(() => {
            // Extract Option B headline snippet
            const optionBMatch = cellCopy.match(/\*\*OPTION B:.*?\*Headline:\*\s*"([^"]+)"/s);
            const optionBSnippet = optionBMatch ? `"${optionBMatch[1].substring(0, 50)}..."` : 'Option B created';
            updateTask('9', { status: 'done', progress: 100, workProduct: `Option B: ${optionBSnippet}`, completedAt: Date.now() });
            updateTask('10', { status: 'in-progress', progress: 0, workProduct: 'Thursday is writing...' });
            setTimeout(() => updateTask('10', { progress: 25, workProduct: 'Something strange emerging...' }), 2000);
            setTimeout(() => updateTask('10', { progress: 50, workProduct: 'Words that feel true...' }), 4000);
            setTimeout(() => updateTask('10', { progress: 75, workProduct: 'The uncomfortable option...' }), 6000);
            setTimeout(() => {
              cellCopy = generateCellCopyTransmittal(pooleFramework, briefInput);
              addMessage('the-cell', cellCopy);
              // Extract headline from Option C
              const headlineMatch = cellCopy.match(/\*Headline:\*\s*"([^"]+)"/g);
              const headlineSnippet = headlineMatch && headlineMatch.length > 0 
                ? headlineMatch[headlineMatch.length - 1].replace(/\*Headline:\*\s*"/, '').replace(/"$/, '').substring(0, 60) + '...'
                : 'Option C created';
              updateTask('10', { status: 'done', progress: 100, workProduct: `Headline: "${headlineSnippet}"`, completedAt: Date.now() });
              updateTask('11', { status: 'in-progress', progress: 0, workProduct: 'Convening vote...' });
              setTimeout(() => updateTask('11', { progress: 33, workProduct: 'Vera: voting...' }), 1500);
              setTimeout(() => updateTask('11', { progress: 66, workProduct: 'Gjon: voting...' }), 3000);
              setTimeout(() => updateTask('11', { progress: 80, workProduct: 'Thursday: voting...' }), 4500);
              setTimeout(() => {
                const recommendedMatch = cellCopy.match(/RECOMMENDED OPTION.*?([ABC])/i);
                const option = recommendedMatch ? recommendedMatch[1] : 'C';
                updateTask('11', { status: 'done', progress: 100, workProduct: `Voting complete, Option ${option} recommended`, completedAt: Date.now() });
              }, 6000);
    }, 8000);
          }, 4500);
        }, 4500);
      }, 6000);
    }, 18000);

    // POOLE DEFENSE (decision shortcut: defends 70% of the time)
    setTimeout(() => {
      const pooleDefense = generatePooleDefense();
      if (pooleDefense) {
        addMessage('poole', pooleDefense);
        updateTask('7', { 
          conflicts: [{ with: 'poole', reason: 'Ideological concerns' }, { with: 'the-cell', reason: 'Poole defended framework' }]
        });
      }
    }, 28000);

    // 004 — VISUAL DIRECTION (Burl) - responds to Cell's copy
    setTimeout(() => {
      setState(prev => ({ ...prev, currentPhase: 'phase3' }));
      updateTask('12', { status: 'in-progress', progress: 0, workProduct: 'Studying the copy...' });
      setTimeout(() => updateTask('12', { progress: 15, workProduct: 'Thinking about pictures...' }), 2000);
      setTimeout(() => updateTask('12', { progress: 30, workProduct: 'Considering colors...' }), 4000);
      setTimeout(() => updateTask('12', { progress: 45, workProduct: 'Testing typography...' }), 6000);
      setTimeout(() => updateTask('12', { progress: 60, workProduct: 'Measuring whitespace...' }), 8000);
      setTimeout(() => updateTask('12', { progress: 80, workProduct: 'Making the picture...' }), 10000);
      setTimeout(() => {
        burlVisual = generateBurlVisualDirection(cellCopy, briefInput);
        addMessage('burl', burlVisual);
        // Extract visual direction snippet
        const colorMatch = burlVisual.match(/COLOR:[\s\S]*?([^\.]+\.)/);
        const colorSnippet = colorMatch ? colorMatch[1].substring(0, 80) + '...' : 'Visual direction complete';
        updateTask('12', { status: 'done', progress: 100, workProduct: `Visual: ${colorSnippet}`, completedAt: Date.now() });
    }, 12000);
    }, 55000);

    // BURL COPY REQUEST (decision shortcut: >10 words = 90%, ≤10 words = 40%)
    setTimeout(() => {
      const burlRequest = generateBurlCopyRequest(cellCopy);
      if (burlRequest) {
        addMessage('burl', burlRequest);
        updateTask('13', { status: 'in-progress', progress: 0, workProduct: 'Measuring headline...', conflicts: [{ with: 'the-cell', reason: 'Copy too long for visual' }] });
        setTimeout(() => updateTask('13', { progress: 50, workProduct: 'Too many words...' }), 2000);
        setTimeout(() => {
          updateTask('13', { status: 'done', progress: 100, workProduct: 'Request: "Headline too long, picture needs room"', completedAt: Date.now() });
          updateTask('14', { status: 'in-progress', progress: 0, workProduct: 'Cell deliberating...' });
          setTimeout(() => updateTask('14', { progress: 30, workProduct: 'Revising copy...' }), 2000);
          setTimeout(() => updateTask('14', { progress: 60, workProduct: 'Shortening headline...' }), 4000);
          setTimeout(() => {
            addMessage('the-cell', '[REVISED COPY PER BURL\'S REQUEST]\n\nWe have shortened the headline. The picture now has room to breathe.\n\n—The Cell');
            updateTask('14', { status: 'done', progress: 100, workProduct: 'Revision: Headline shortened per Burl\'s request', completedAt: Date.now() });
          }, 6000);
        }, 4000);
      }
    }, 70000);

    // 005 — COMMITTEE FINDINGS - reviews work (itemCount = 3 for decision shortcut)
    setTimeout(() => {
      setState(prev => ({ ...prev, currentPhase: 'phase4' }));
      updateTask('15', { status: 'in-progress', progress: 0, workProduct: 'Committee convening...' });
      setTimeout(() => updateTask('15', { progress: 20, workProduct: 'Reviewing copy for truth...' }), 3000);
      setTimeout(() => updateTask('15', { progress: 40, workProduct: 'Evaluating visual direction...' }), 6000);
      setTimeout(() => updateTask('15', { progress: 60, workProduct: 'Assessing alignment...' }), 9000);
      setTimeout(() => updateTask('15', { progress: 80, workProduct: 'Formulating findings...' }), 12000);
      setTimeout(() => {
        addMessage('poole', generateCommitteeFindings(burlVisual, cellCopy, briefInput, 3));
        updateTask('15', { status: 'done', progress: 100, workProduct: 'Committee review complete', completedAt: Date.now() });
        updateTask('16', { status: 'in-progress', progress: 0, workProduct: 'Recording objections...' });
        setTimeout(() => updateTask('16', { progress: 50, workProduct: 'Documenting concerns...' }), 3000);
        setTimeout(() => {
          updateTask('16', { status: 'done', progress: 100, workProduct: 'Objections recorded', completedAt: Date.now() });
          updateTask('17', { status: 'in-progress', progress: 0, workProduct: 'Voting on approval...' });
          setTimeout(() => updateTask('17', { progress: 50, workProduct: 'Counting votes...' }), 2000);
          setTimeout(() => {
            updateTask('17', { status: 'done', progress: 100, workProduct: 'Approved for production', completedAt: Date.now() });
          }, 4000);
        }, 6000);
      }, 15000);
    }, 82000);

    // NADYA INTERRUPTION (decision shortcut: >2 items = 80%, ≤2 items = 30%)
    setTimeout(() => {
      const nadyaInterruption = generateNadyaInterruption(3);
      if (nadyaInterruption) {
        addMessage('nadya', nadyaInterruption);
      }
    }, 95000);

    // 006 — PRODUCTION SCHEDULE (Nadya) - locks schedule
    setTimeout(() => {
      setState(prev => ({ ...prev, currentPhase: 'phase5' }));
      updateTask('18', { status: 'in-progress', progress: 0, workProduct: 'Calculating dates...' });
      setTimeout(() => updateTask('18', { progress: 25, workProduct: 'Assigning accountability...' }), 2000);
      setTimeout(() => updateTask('18', { progress: 50, workProduct: 'Locking deadlines...' }), 4000);
      setTimeout(() => updateTask('18', { progress: 75, workProduct: 'Finalizing schedule...' }), 6000);
      setTimeout(() => {
        addMessage('nadya', generateNadyaProductionSchedule(briefInput));
        updateTask('18', { status: 'done', progress: 100, workProduct: 'Schedule locked', completedAt: Date.now() });
      }, 8000);
    }, 100000);

    // 008 — FINAL ADVERTISEMENT (Apparatus) - compiles everything
    setTimeout(async () => {
      updateTask('19', { status: 'in-progress', progress: 0, workProduct: 'Receiving all documents...' });
      setTimeout(() => updateTask('19', { progress: 15, workProduct: 'Compiling dossier...' }), 2000);
      setTimeout(() => updateTask('19', { progress: 30, workProduct: 'Integrating copy...' }), 4000);
      setTimeout(() => updateTask('19', { progress: 45, workProduct: 'Applying visual direction...' }), 6000);
      setTimeout(() => {
        addMessage('apparatus', generateApparatusFinalAdvertisement(briefInput));
        updateTask('19', { progress: 60, workProduct: 'Generating final advertisement...' });
      }, 8000);
      
      setTimeout(async () => {
        try {
          setState(prev => {
            const currentBrandInfo = prev.brandInfo;
            updateTask('19', { progress: 70, workProduct: 'Calling API for ad generation...' });
            generateBadAd(briefInput, currentBrandInfo)
              .then(adCode => {
                updateTask('19', { progress: 85, workProduct: 'Finalizing ad HTML...' });
                addMessage('apparatus', generateApparatusReady(briefInput), 'code', adCode);
                // Update generatedAd state directly
                setState(prev => {
                  const components = prev.adComponents || {};
                  updateTask('19', { progress: 90, workProduct: 'Generating campaign deliverables...' });
                  // Generate campaign deliverables (video, campaign deck, social media)
                  generateCampaignDeliverables(briefInput, components, currentBrandInfo)
                    .then(deliverables => {
                      const deliverablesHTML = formatDeliverablesAsHTML(deliverables, briefInput, currentBrandInfo);
                      setState(prevState => ({ ...prevState, campaignDeliverables: deliverablesHTML }));
                      addMessage('apparatus', `CAMPAIGN DELIVERABLES COMPILED—${new Date().toLocaleTimeString()}\n\nVideo script, campaign deck, and social media activation ready for review.`, 'code', '');
                      updateTask('19', { status: 'done', progress: 100, workProduct: 'Final ad and deliverables compiled', completedAt: Date.now() });
                    })
                    .catch(error => {
                      console.error('Error generating campaign deliverables:', error);
                      updateTask('19', { status: 'done', progress: 100, workProduct: 'Final ad compiled (deliverables failed)', completedAt: Date.now() });
                    });
                  return { ...prev, generatedAd: adCode };
                });
              })
              .catch(error => {
                console.error('Error generating ad:', error);
                addMessage('apparatus', `ERROR IN PRODUCTION—FALLBACK INITIATED—${new Date().toLocaleTimeString()}`, 'code', '');
                updateTask('19', { status: 'done', progress: 100, workProduct: 'Fallback template used', completedAt: Date.now() });
              });
            return prev;
          });
        } catch (error) {
          console.error('Error generating ad:', error);
          addMessage('apparatus', `ERROR IN PRODUCTION—FALLBACK INITIATED—${new Date().toLocaleTimeString()}`, 'code', '');
          updateTask('19', { status: 'done', progress: 100, workProduct: 'Fallback template used', completedAt: Date.now() });
        }
      }, 10000);
    }, 45000);

    // 007 — CLIENT TRANSLATION (Delmore) - translates for client
    setTimeout(() => {
      updateTask('20', { status: 'in-progress', progress: 0 });
      setTimeout(() => {
        addMessage('delmore', generateDelmoreClientTranslation(briefInput));
        updateTask('20', { status: 'done', progress: 100, workProduct: 'Client translation complete', completedAt: Date.now() });
        setState(prev => ({ ...prev, isRunning: false }));
      }, 300);
    }, 22000);
  }, [state.isRunning, briefInput, addMessage]);

  const pauseSimulation = useCallback(() => {
    setState(prev => ({ ...prev, isRunning: false }));
  }, []);

  const handleCanvasComplete = useCallback(() => {
    console.log('Canvas workflow complete');
  }, []);

  return (
    <div className="app">
      <div style={{ position: 'fixed', top: 24, left: 40, zIndex: 1000 }}>
        <Link to="/" style={{ 
          padding: '0', 
          background: 'transparent', 
          borderRadius: '0', 
          textDecoration: 'none', 
          color: '#000000',
          fontWeight: 400,
          fontSize: '16px',
          letterSpacing: '0.01em',
          boxShadow: 'none',
          transition: 'opacity 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.6'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          ← Back to Home
        </Link>
      </div>
      
      <div style={{ 
        position: 'fixed', 
        top: 60, 
        left: 0, 
        right: 0, 
        bottom: 0,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Brief Input */}
        <div style={{
          padding: '16px 24px',
          background: '#fafafa',
          borderBottom: '1px solid #ddd',
          display: 'flex',
          gap: '16px',
          alignItems: 'center'
        }}>
          <label style={{ 
            fontFamily: "'JetBrains Mono', monospace", 
            fontSize: '12px',
            color: '#666'
          }}>
            Brief:
          </label>
          <input
            type="text"
            value={briefInput}
            onChange={(e) => setBriefInput(e.target.value)}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px'
            }}
            placeholder="Enter your creative brief..."
          />
        </div>
        
        {/* Canvas Workspace */}
        <div style={{ flex: 1 }}>
          <CanvasWorkspace
            brief={briefInput}
            generatedAd={state.generatedAd || '<div style="padding: 40px; text-align: center; color: #888;">Ad will appear here...</div>'}
            onComplete={handleCanvasComplete}
          />
        </div>
      </div>
    </div>
  );
}
