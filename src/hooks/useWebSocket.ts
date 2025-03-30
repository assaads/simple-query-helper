import { useState, useEffect, useCallback, useRef } from 'react';
import type { WebSocketMessage } from '../lib/browserTypes';

type WebSocketHookOptions = {
  url?: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
};

const DEFAULT_WS_URL = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${
  window.location.host
}/ws`;

export function useWebSocket(options: WebSocketHookOptions = {}) {
  const {
    url = DEFAULT_WS_URL,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
  } = options;

  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<number>();

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
      };

      ws.onclose = () => {
        setIsConnected(false);
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectTimeoutRef.current = window.setTimeout(() => {
            reconnectAttemptsRef.current += 1;
            connect();
          }, reconnectInterval);
        }
      };

      ws.onerror = (event) => {
        setError(new Error('WebSocket error'));
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          setLastMessage(message);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      wsRef.current = ws;
    } catch (err) {
      setError(err as Error);
    }
  }, [url, reconnectInterval, maxReconnectAttempts]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const sendMessage = useCallback(
    (message: WebSocketMessage) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(message));
      } else {
        console.warn('WebSocket is not connected');
      }
    },
    []
  );

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    lastMessage,
    sendMessage,
    isConnected,
    error,
    reconnect: connect,
  };
}

export type WebSocketHook = ReturnType<typeof useWebSocket>;
