import type { BrowserState, BrowserElement, WebSocketMessage, MessageType } from './browserTypes';

export function createBrowserMessage<T extends MessageType>(
  type: T,
  payload: WebSocketMessage extends { type: T; payload: infer P } ? P : never,
  sessionId?: string
): WebSocketMessage {
  return { type, payload, sessionId };
}

export function createInitialBrowserState(): BrowserState {
  return {
    url: '',
    title: '',
    isLoading: false,
    screenshotUrl: null,
    error: null,
    canGoBack: false,
    canGoForward: false,
    selectedElements: [],
  };
}

export function findElementById(elements: BrowserElement[], id: string): BrowserElement | undefined {
  return elements.find((el) => el.id === id);
}

export function isElementVisible(element: BrowserElement): boolean {
  if (!element.isVisible) return false;
  
  // Check if element is within viewport bounds
  const { x, y, width, height } = element.bbox;
  return (
    x >= 0 && x + width <= 100 &&
    y >= 0 && y + height <= 100
  );
}

export function formatActionDescription(
  type: string, 
  elementId?: string, 
  value?: string
): string {
  switch (type) {
    case 'click':
      return `Click element ${elementId}`;
    case 'type':
      return `Type "${value}" into element ${elementId}`;
    case 'navigate':
      return `Navigate to ${value}`;
    case 'submit':
      return `Submit form ${elementId}`;
    case 'select':
      return `Select "${value}" in element ${elementId}`;
    default:
      return `${type} action`;
  }
}

export function parseWorkflowState(state: string): Record<string, unknown> {
  try {
    return {
      state,
      data: JSON.parse(state),
    };
  } catch (e) {
    return {
      state,
      data: {},
    };
  }
}
