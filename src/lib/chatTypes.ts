export type MessageRole = 'user' | 'assistant' | 'system';
export type MessageStatus = 'pending' | 'sent' | 'received' | 'error';
export type ThinkingState = 'idle' | 'thinking' | 'reading' | 'planning' | 'executing';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  status: MessageStatus;
  metadata?: {
    action?: string;
    result?: string;
    error?: string;
    screenshot?: string;
    thoughts?: string;
  };
}

export interface ChatState {
  messages: Message[];
  thinkingState: ThinkingState;
  isTyping: boolean;
  error: string | null;
}

export interface ChatContextType extends ChatState {
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
  retryLastMessage: () => Promise<void>;
}

export interface ThinkingIndicatorProps {
  state: ThinkingState;
  thoughts?: string;
}

export interface MessageProps {
  message: Message;
  isLast?: boolean;
}

export interface ChatInputProps {
  onSendMessage: (content: string) => Promise<void>;
  disabled?: boolean;
}

export interface MessageListProps {
  messages: Message[];
  thinkingState: ThinkingState;
  thoughts?: string;
}
