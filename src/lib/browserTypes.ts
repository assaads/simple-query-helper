// Browser state types
export type BrowserState = {
  url: string;
  title: string;
  isLoading: boolean;
  screenshotUrl: string | null;
  error: string | null;
  canGoBack: boolean;
  canGoForward: boolean;
  selectedElements: BrowserElement[];
};

export type BrowserElement = {
  id: string;
  tagName: string;
  type?: string;
  value?: string;
  textContent?: string;
  label?: string;
  isVisible: boolean;
  attributes: {
    [key: string]: string;
  };
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

export type BrowserAction = {
  type: 'click' | 'type' | 'navigate' | 'submit' | 'select' | 'hover';
  elementId?: string;
  value?: string;
  url?: string;
};

// WebSocket message types
export type MessageType = 
  | 'browser_action'
  | 'browser_response'
  | 'agent_thought'
  | 'system_event'
  | 'error'
  | 'workflow_update'
  | 'ping'
  | 'pong';

export interface BaseMessage {
  type: MessageType;
  sessionId?: string;
}

export interface BrowserActionMessage extends BaseMessage {
  type: 'browser_action';
  payload: BrowserActionRequest;
}

export interface BrowserResponseMessage extends BaseMessage {
  type: 'browser_response';
  payload: BrowserActionResponse;
}

export interface AgentThoughtMessage extends BaseMessage {
  type: 'agent_thought';
  payload: AgentThought;
}

export interface SystemEventMessage extends BaseMessage {
  type: 'system_event';
  payload: SystemEvent;
}

export interface ErrorMessage extends BaseMessage {
  type: 'error';
  payload: {
    error: string;
    details: unknown;
  };
}

export interface WorkflowUpdateMessage extends BaseMessage {
  type: 'workflow_update';
  payload: {
    state: string;
    data: Record<string, unknown>;
  };
}

export interface PingMessage extends BaseMessage {
  type: 'ping';
}

export interface PongMessage extends BaseMessage {
  type: 'pong';
}

export type WebSocketMessage =
  | BrowserActionMessage
  | BrowserResponseMessage
  | AgentThoughtMessage
  | SystemEventMessage
  | ErrorMessage
  | WorkflowUpdateMessage
  | PingMessage
  | PongMessage;

// Request/Response types
export interface BrowserActionRequest {
  action: BrowserAction;
  sessionId: string;
}

export interface BrowserActionResponse {
  success: boolean;
  error?: string;
  screenshot?: string;
  state?: BrowserState;
}

export interface AgentThought {
  thought: string;
  state: string;
  sessionId: string;
}

export interface SystemEvent {
  event: string;
  data: Record<string, unknown>;
}

// Component props types
export interface BrowserViewProps {
  state: BrowserState;
  onAction?: (action: BrowserAction) => void;
  isInteractive?: boolean;
  highlightElement?: string | null;
}

export interface ElementHighlightProps {
  element: BrowserElement;
  isSelected?: boolean;
  isHighlighted?: boolean;
  onClick?: () => void;
}

export interface BrowserToolbarProps {
  url: string;
  title: string;
  isLoading: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  onNavigate: (url: string) => void;
  onRefresh: () => void;
  onGoBack: () => void;
  onGoForward: () => void;
}

export interface ScreenshotViewerProps {
  screenshotUrl: string;
  elements: BrowserElement[];
  selectedElements: BrowserElement[];
  highlightElement?: string | null;
  onElementClick?: (element: BrowserElement) => void;
  onElementHover?: (element: BrowserElement | null) => void;
}
