import { useState, useCallback } from 'react';
import type { ThinkingState } from '../lib/chatTypes';

interface AgentStatus {
  isThinking: boolean;
  currentStep: string | null;
  progress: number;
  needsUserInput: boolean;
  userPrompt: string | null;
  agentState: ThinkingState;
}

export function useAgentStatus() {
  const [status, setStatus] = useState<AgentStatus>({
    isThinking: false,
    currentStep: null,
    progress: 0,
    needsUserInput: false,
    userPrompt: null,
    agentState: 'idle',
  });

  const startThinking = useCallback((initialStep?: string) => {
    setStatus({
      isThinking: true,
      currentStep: initialStep || 'Starting...',
      progress: 0,
      needsUserInput: false,
      userPrompt: null,
      agentState: 'thinking',
    });
  }, []);

  const updateStep = useCallback((content: string, progress?: number) => {
    setStatus((prev) => ({
      ...prev,
      currentStep: content,
      progress: progress ?? prev.progress,
    }));
  }, []);

  const setProgress = useCallback((value: number) => {
    setStatus((prev) => ({
      ...prev,
      progress: value,
    }));
  }, []);

  const setAgentState = useCallback((state: ThinkingState) => {
    setStatus((prev) => ({
      ...prev,
      agentState: state,
    }));
  }, []);

  const requestUserInput = useCallback((prompt: string) => {
    setStatus((prev) => ({
      ...prev,
      needsUserInput: true,
      userPrompt: prompt,
      isThinking: false,
      agentState: 'idle',
    }));
  }, []);

  const clearUserInput = useCallback(() => {
    setStatus((prev) => ({
      ...prev,
      needsUserInput: false,
      userPrompt: null,
    }));
  }, []);

  const stopThinking = useCallback(() => {
    setStatus((prev) => ({
      ...prev,
      isThinking: false,
      currentStep: null,
      progress: 0,
      agentState: 'idle',
    }));
  }, []);

  const resetStatus = useCallback(() => {
    setStatus({
      isThinking: false,
      currentStep: null,
      progress: 0,
      needsUserInput: false,
      userPrompt: null,
      agentState: 'idle',
    });
  }, []);

  return {
    startThinking,
    updateStep,
    setProgress,
    setAgentState,
    requestUserInput,
    clearUserInput,
    stopThinking,
    resetStatus,
    ...status,
  };
}

export type AgentStatusHook = ReturnType<typeof useAgentStatus>;
