import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';
import { useAgentStatus } from './useAgentStatus';
import type {
  BrowserState,
  BrowserAction,
  WebSocketMessage,
  BrowserActionRequest,
  BrowserActionResponse,
} from '../lib/browserTypes';
import { createBrowserMessage, createInitialBrowserState } from '../lib/browserUtils';

export function useBrowserAutomation(sessionId?: string) {
  const [state, setState] = useState<BrowserState>(createInitialBrowserState());
  const [isConnected, setIsConnected] = useState(false);
  const { agentState } = useAgentStatus();

  const { sendMessage, lastMessage } = useWebSocket();

  useEffect(() => {
    if (!lastMessage) return;

    const message = lastMessage as WebSocketMessage;

    switch (message.type) {
      case 'browser_response': {
        const response = message.payload as BrowserActionResponse;
        if (response.state) {
          setState(response.state);
        }
        break;
      }
      case 'system_event': {
        const { event } = message.payload;
        if (event === 'browser_connected') {
          setIsConnected(true);
        } else if (event === 'browser_disconnected') {
          setIsConnected(false);
        }
        break;
      }
    }
  }, [lastMessage]);

  const executeBrowserAction = useCallback(
    async (action: BrowserAction) => {
      if (!sessionId || !isConnected) {
        console.error('Browser not ready:', { sessionId, isConnected });
        return;
      }

      const request: BrowserActionRequest = {
        action,
        sessionId,
      };

      const message = {
        type: 'browser_action' as const,
        payload: request,
        sessionId
      };
      sendMessage(message);
    },
    [sessionId, isConnected, sendMessage]
  );

  const navigate = useCallback(
    (url: string) => {
      executeBrowserAction({
        type: 'navigate',
        url,
      });
    },
    [executeBrowserAction]
  );

  const clickElement = useCallback(
    (elementId: string) => {
      executeBrowserAction({
        type: 'click',
        elementId,
      });
    },
    [executeBrowserAction]
  );

  const typeText = useCallback(
    (elementId: string, value: string) => {
      executeBrowserAction({
        type: 'type',
        elementId,
        value,
      });
    },
    [executeBrowserAction]
  );

  return {
    state,
    isConnected,
    agentState,
    actions: {
      navigate,
      clickElement,
      typeText,
      execute: executeBrowserAction,
    },
  };
}

export type BrowserAutomation = ReturnType<typeof useBrowserAutomation>;
