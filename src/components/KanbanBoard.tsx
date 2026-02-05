import { useState } from 'react';
import {
  ClipboardText,
  Graph,
  PencilSimple,
  Palette,
  CalendarBlank,
  FileText,
  Gear,
  X,
  ArrowsOutSimple,
  Warning,
  Check
} from '@phosphor-icons/react';
import { Task, Character, Phase } from '../types';
import { PHASES } from '../constants';
import './KanbanBoard.css';

interface KanbanBoardProps {
  tasks: Task[];
  characters: Character[];
  currentPhase: Phase;
}

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

export default function KanbanBoard({ tasks, characters, currentPhase }: KanbanBoardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getCharacter = (id: string | null) => {
    if (!id) return null;
    return characters.find(c => c.id === id);
  };

  const getPhaseName = (phase: Phase) => {
    return PHASES.find(p => p.id === phase)?.name || phase;
  };

  const todos = tasks.filter(t => t.status === 'todo');
  const inProgress = tasks.filter(t => t.status === 'in-progress');
  const blocked = tasks.filter(t => t.status === 'blocked');
  const done = tasks.filter(t => t.status === 'done');

  return (
    <>
      {isExpanded && <div className="kanban-overlay" onClick={() => setIsExpanded(false)} />}
      <div className={`kanban-board ${isExpanded ? 'expanded' : ''}`}>
        <div className="kanban-header">
          <div className="kanban-header-top">
            <h3>Task Board</h3>
            <button 
              className="expand-button" 
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? 'Collapse board' : 'Expand board'}
            >
              {isExpanded ? <X size={16} weight="bold" /> : <ArrowsOutSimple size={16} weight="bold" />}
            </button>
          </div>
          <div className="current-phase">
            Current: {getPhaseName(currentPhase)}
          </div>
        </div>
      <div className="kanban-columns">
        <div className="kanban-column">
          <div className="column-header">To Do</div>
          <div className="column-content">
            {todos.map(task => {
              const character = getCharacter(task.assignedTo);
              return (
                <div key={task.id} className="kanban-task">
                  <div className="task-title">{task.title}</div>
                  {task.description && (
                    <div className="task-description">{task.description}</div>
                  )}
                  {character && (
                    <div className="task-assignee" style={{ color: character.color }}>
                      {getCharacterIcon(character.icon)} {character.name}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="kanban-column">
          <div className="column-header">In Progress</div>
          <div className="column-content">
            {inProgress.map(task => {
              const character = getCharacter(task.assignedTo);
              return (
                <div key={task.id} className="kanban-task in-progress">
                  <div className="task-title">{task.title}</div>
                  {task.progress !== undefined && (
                    <div className="task-progress">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${task.progress}%` }}></div>
                      </div>
                      <span className="progress-text">{task.progress}%</span>
                    </div>
                  )}
                  {task.workProduct && (
                    <div className="task-work-product in-progress-work">
                      <div className="work-product-label">Working on:</div>
                      <div className="work-product-content">{task.workProduct}</div>
                    </div>
                  )}
                  {character && (
                    <div className="task-assignee" style={{ color: character.color }}>
                      {getCharacterIcon(character.icon)} {character.name}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        {blocked.length > 0 && (
          <div className="kanban-column">
            <div className="column-header">Blocked</div>
            <div className="column-content">
              {blocked.map(task => {
                const character = getCharacter(task.assignedTo);
                return (
                  <div key={task.id} className="kanban-task blocked">
                    <div className="task-title">{task.title}</div>
                    {task.conflicts && task.conflicts.length > 0 && (
                      <div className="task-conflicts">
                        {task.conflicts.map((conflict, idx) => {
                          const conflictChar = getCharacter(conflict.with);
                          return (
                            <div key={idx} className="conflict-indicator">
                              <Warning size={14} weight="bold" /> Conflict with {conflictChar?.name || conflict.with}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {character && (
                      <div className="task-assignee" style={{ color: character.color }}>
                        {getCharacterIcon(character.icon)} {character.name}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <div className="kanban-column">
          <div className="column-header">Done</div>
          <div className="column-content">
            {done.map(task => {
              const character = getCharacter(task.assignedTo);
              return (
                <div key={task.id} className="kanban-task done">
                  <div className="task-title">{task.title}</div>
                  {task.workProduct && (
                    <div className="task-work-product">
                      <div className="work-product-label">Output:</div>
                      <div className="work-product-content">{task.workProduct}</div>
                    </div>
                  )}
                  {task.conflicts && task.conflicts.length > 0 && (
                    <div className="task-conflicts">
                      {task.conflicts.map((conflict, idx) => {
                        const conflictChar = getCharacter(conflict.with);
                        return (
                          <div key={idx} className="conflict-resolved">
                            <Check size={14} weight="bold" /> Resolved with {conflictChar?.name || conflict.with}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {character && (
                    <div className="task-assignee" style={{ color: character.color }}>
                      {getCharacterIcon(character.icon)} {character.name}
                    </div>
                  )}
                  {task.completedAt && (
                    <div className="task-timestamp">
                      {new Date(task.completedAt).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
