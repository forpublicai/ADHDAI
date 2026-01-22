import { Task, Character, Phase } from '../types';
import { PHASES } from '../constants';
import './KanbanBoard.css';

interface KanbanBoardProps {
  tasks: Task[];
  characters: Character[];
  currentPhase: Phase;
}

export default function KanbanBoard({ tasks, characters, currentPhase }: KanbanBoardProps) {
  const getCharacter = (id: string | null) => {
    if (!id) return null;
    return characters.find(c => c.id === id);
  };

  const getPhaseName = (phase: Phase) => {
    return PHASES.find(p => p.id === phase)?.name || phase;
  };

  const todos = tasks.filter(t => t.status === 'todo');
  const inProgress = tasks.filter(t => t.status === 'in-progress');
  const done = tasks.filter(t => t.status === 'done');

  return (
    <div className="kanban-board">
      <div className="kanban-header">
        <h3>Task Board</h3>
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
                      {character.emoji} {character.name}
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
                <div key={task.id} className="kanban-task">
                  <div className="task-title">{task.title}</div>
                  {character && (
                    <div className="task-assignee" style={{ color: character.color }}>
                      {character.emoji} {character.name}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="kanban-column">
          <div className="column-header">Done</div>
          <div className="column-content">
            {done.map(task => {
              const character = getCharacter(task.assignedTo);
              return (
                <div key={task.id} className="kanban-task done">
                  <div className="task-title">{task.title}</div>
                  {character && (
                    <div className="task-assignee" style={{ color: character.color }}>
                      {character.emoji} {character.name}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
