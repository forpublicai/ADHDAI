import { Message, Character } from '../types';
import './ChatSidebar.css';

interface ChatSidebarProps {
  messages: Message[];
  characters: Character[];
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
                  <span className="message-emoji">{character.emoji}</span>
                  <span className="message-name" style={{ color: character.color }}>
                    {character.name}
                  </span>
                  <span className="message-role">{character.role}</span>
                </div>
                <div className="message-content">{message.content}</div>
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
