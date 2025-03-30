export type MessageType = 'user' | 'agent' | 'system';

export type StepStatus = 'pending' | 'processing' | 'completed' | 'error';

export interface Step {
  id: string;
  content: string;
  status: StepStatus;
  timestamp: number;
}

export interface Message {
  id: string;
  type: MessageType;
  content: string;
  steps?: Step[];
  timestamp: number;
}

export interface ChatState {
  messages: Message[];
  isProcessing: boolean;
  currentSteps: Step[];
}

export interface AgentStatus {
  isThinking: boolean;
  currentStep: Step | null;
  progress: number;
  needsUserInput: boolean;
}

export type ChatAction = 
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_STEPS'; payload: Step[] }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'UPDATE_STEP_STATUS'; payload: { stepId: string; status: StepStatus } };

