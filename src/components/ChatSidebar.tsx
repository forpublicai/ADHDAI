import {
  ClipboardText,
  Graph,
  PencilSimple,
  Palette,
  CalendarBlank,
  FileText,
  Gear
} from '@phosphor-icons/react';
import { Message, Character } from '../types';
import './ChatSidebar.css';

interface ChatSidebarProps {
  messages: Message[];
  characters: Character[];
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

/**
 * Formats message content for better readability
 * Converts markdown-style formatting to readable plain text
 */
function formatMessageContent(content: string): JSX.Element {
  // Split by double newlines to preserve paragraph breaks
  const paragraphs = content.split(/\n\n+/);
  
  return (
    <div className="formatted-content">
      {paragraphs.map((para, idx) => {
        // Skip empty paragraphs
        if (!para.trim()) return null;
        
        // Check if it's a header (starts with ###)
        if (para.trim().startsWith('###')) {
          const headerText = para.replace(/^###\s*/, '').replace(/\*\*/g, '').trim();
          return (
            <h4 key={idx} className="message-header-text">
              {headerText}
            </h4>
          );
        }
        
        // Check if it's a bold section (starts with **)
        if (para.trim().startsWith('**') && para.includes('**')) {
          const parts = para.split(/(\*\*[^*]+\*\*)/g);
          return (
            <div key={idx} className="message-paragraph">
              {parts.map((part, partIdx) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  const boldText = part.replace(/\*\*/g, '');
                  return <strong key={partIdx} className="message-bold">{boldText}</strong>;
                }
                return <span key={partIdx}>{part}</span>;
              })}
            </div>
          );
        }
        
        // Check if it's a list item (starts with - or *)
        if (para.trim().startsWith('-') || para.trim().startsWith('*')) {
          const items = para.split(/\n(?=-|\*)/).filter(item => item.trim());
          return (
            <ul key={idx} className="message-list">
              {items.map((item, itemIdx) => {
                const cleanItem = item.replace(/^[-*]\s+/, '').trim();
                return <li key={itemIdx} className="message-list-item">{cleanItem}</li>;
              })}
            </ul>
          );
        }
        
        // Regular paragraph
        return (
          <p key={idx} className="message-paragraph">
            {para.split(/(\*\*[^*]+\*\*)/g).map((part, partIdx) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                const boldText = part.replace(/\*\*/g, '');
                return <strong key={partIdx} className="message-bold">{boldText}</strong>;
              }
              return <span key={partIdx}>{part}</span>;
            })}
          </p>
        );
      })}
    </div>
  );
}

export default function ChatSidebar({ messages, characters }: ChatSidebarProps) {
  const getCharacter = (id: string) => characters.find(c => c.id === id);

  return (
    <div className="chat-sidebar">
      <div className="chat-header">
        <h3>Agent Conversations</h3>
      </div>
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <p>No messages yet. Start the simulation to see the agents work!</p>
          </div>
        ) : (
          messages.map(message => {
            const character = getCharacter(message.characterId);
            if (!character) return null;
            
            return (
              <div key={message.id} className="chat-message">
                <div className="message-header">
                  <span className="message-icon" style={{ color: character.color }}>{getCharacterIcon(character.icon)}</span>
                  <span className="message-name" style={{ color: character.color }}>
                    {character.name}
                  </span>
                  <span className="message-role">{character.role}</span>
                </div>
                <div className="message-content">
                  {formatMessageContent(message.content)}
                </div>
                {message.code && (
                  <div className="message-code-preview">
                    <code>{message.code.substring(0, 100)}...</code>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
