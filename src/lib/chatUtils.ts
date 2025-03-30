import { Message as AgentMessage, Step, StepStatus } from './agentTypes';
import { Message as ChatMessage, MessageRole, MessageStatus } from './chatTypes';

export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const createMessage = (content: string, type: AgentMessage['type']): AgentMessage => {
  return {
    id: generateId(),
    content,
    type,
    timestamp: Date.now(),
  };
};

export const createStep = (content: string, status: StepStatus = 'pending'): Step => {
  return {
    id: generateId(),
    content,
    status,
    timestamp: Date.now(),
  };
};

export const formatTimestamp = (timestamp: number): string => {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(new Date(timestamp));
};

export const calculateProgress = (steps: Step[]): number => {
  if (steps.length === 0) return 0;
  const completedSteps = steps.filter(step => step.status === 'completed').length;
  return Math.round((completedSteps / steps.length) * 100);
};

// Convert agent message type to chat message role
export const messageTypeToRole = (type: AgentMessage['type']): MessageRole => {
  switch (type) {
    case 'user':
      return 'user';
    case 'agent':
      return 'assistant';
    case 'system':
      return 'system';
    default:
      return 'system';
  }
};

// Convert agent message to chat message
export const agentMessageToChatMessage = (msg: AgentMessage): ChatMessage => {
  return {
    id: msg.id,
    role: messageTypeToRole(msg.type),
    content: msg.content,
    timestamp: new Date(msg.timestamp).toISOString(),
    status: 'received',
    metadata: msg.steps ? {
      action: 'workflow',
      result: JSON.stringify(msg.steps)
    } : undefined
  };
};
