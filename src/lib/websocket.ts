import type {
  WebSocketMessage,
  MessageType,
  BrowserActionRequest,
  BrowserActionResponse,
  AgentThought,
  SystemEvent,
  ErrorMessage,
  WorkflowUpdateMessage,
} from './browserTypes';
import { createWorkflowState } from './stateService';

type MessageHandler = (message: WebSocketMessage) => void;
type MessageTypeHandlers = Partial<Record<MessageType, MessageHandler[]>>;

class WebSocketClient {
  private ws: WebSocket | null = null;
  private messageHandlers: MessageTypeHandlers = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;

  constructor(private url: string) {}

  connect(): void {
    try {
      this.ws = new WebSocket(this.url);
      this.setupEventHandlers();
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.handleReconnect();
    }
  }

  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onclose = () => {
      console.log('WebSocket closed');
      this.handleReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        this.handleMessage(message);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(), this.reconnectDelay);
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    const handlers = this.messageHandlers[message.type] || [];
    handlers.forEach((handler) => handler(message));
  }

  send(message: WebSocketMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  addMessageHandler(type: MessageType, handler: MessageHandler): void {
    this.messageHandlers[type] = [...(this.messageHandlers[type] || []), handler];
  }

  removeMessageHandler(type: MessageType, handler: MessageHandler): void {
    this.messageHandlers[type] = (this.messageHandlers[type] || []).filter(
      (h) => h !== handler
    );
  }

  close(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Helper functions for creating typed messages
export function createBrowserAction(
  action: BrowserActionRequest['action'],
  sessionId: string
): WebSocketMessage {
  return {
    type: 'browser_action',
    payload: { action, sessionId },
  };
}

export function createSystemEvent(event: string, data: Record<string, unknown>): WebSocketMessage {
  return {
    type: 'system_event',
    payload: { event, data },
  };
}

export function createAgentThought(
  thought: string,
  state: string,
  sessionId: string
): WebSocketMessage {
  return {
    type: 'agent_thought',
    payload: { thought, state, sessionId },
  };
}

export function createWorkflowUpdate(
  state: string,
  data: Record<string, unknown>
): WebSocketMessage {
  return {
    type: 'workflow_update',
    payload: createWorkflowState(state, data),
  };
}

export function createErrorMessage(error: string, details?: unknown): WebSocketMessage {
  return {
    type: 'error',
    payload: { error, details },
  };
}

export { WebSocketClient };
