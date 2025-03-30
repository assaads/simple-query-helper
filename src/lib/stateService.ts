import { useState, useEffect } from 'react';
import type { Message, Step } from './agentTypes';
import type { WorkflowUpdateMessage } from './browserTypes';
import type { BrowserState } from './browserTypes';

export type WorkflowState = {
  state: string;
  data: Record<string, unknown>;
};

type SavedState = {
  sessionId: string;
  currentStep: string;
  completedSteps: Step[];
  browserState: BrowserState;
  requiresInput: boolean;
  inputPrompt?: string;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
};

class StateService {
  private state: SavedState | null = null;

  async saveState(state: SavedState): Promise<void> {
    this.state = state;
    localStorage.setItem('workflowState', JSON.stringify(state));
  }

  async getState(): Promise<SavedState | null> {
    if (!this.state) {
      const savedState = localStorage.getItem('workflowState');
      if (savedState) {
        this.state = JSON.parse(savedState);
      }
    }
    return this.state;
  }

  async clearState(): Promise<void> {
    this.state = null;
    localStorage.removeItem('workflowState');
  }
}

export const stateService = new StateService();

export function useStateAutosave(
  state: SavedState,
  steps: Step[],
  browserState: BrowserState,
  messages: Message[]
) {
  useEffect(() => {
    const saveState = async () => {
      await stateService.saveState({
        ...state,
        completedSteps: steps,
        browserState,
        messages,
        updatedAt: new Date().toISOString()
      });
    };

    saveState();
  }, [state, steps, browserState, messages]);
}

export function createWorkflowState(state: string, data: Record<string, unknown> = {}): WorkflowState {
  return { state, data };
}

export function parseWorkflowMessage(message: WorkflowUpdateMessage): WorkflowState {
  const { state, data } = message.payload;
  return { state, data };
}

export function serializeWorkflowState(state: WorkflowState): string {
  return JSON.stringify({
    state: state.state,
    data: state.data,
  });
}

export function parsePayload<T>(payload: unknown): T {
  if (typeof payload === 'string') {
    try {
      return JSON.parse(payload) as T;
    } catch {
      return payload as T;
    }
  }
  return payload as T;
}

export function createMessagePayload<T extends Record<string, unknown>>(
  payload: T,
  sessionId?: string
): T & { sessionId?: string } {
  return sessionId ? { ...payload, sessionId } : payload;
}

export function handleStateTransition<T extends Record<string, unknown>>(
  currentState: T,
  update: Partial<T>
): T {
  return {
    ...currentState,
    ...update,
  };
}

export function validateStateUpdate<T>(
  update: unknown,
  validator: (data: unknown) => data is T
): update is T {
  return validator(update);
}

// Helper function to create a type predicate for workflow states
export function isWorkflowState(state: unknown): state is WorkflowState {
  if (!state || typeof state !== 'object') return false;
  
  const { state: stateName, data } = state as Record<string, unknown>;
  
  return (
    typeof stateName === 'string' &&
    typeof data === 'object' &&
    data !== null
  );
}

// Type guard for workflow update messages
export function isWorkflowUpdate(message: unknown): message is WorkflowUpdateMessage {
  if (!message || typeof message !== 'object') return false;
  
  const { type, payload } = message as Record<string, unknown>;
  
  return (
    type === 'workflow_update' &&
    isWorkflowState(payload)
  );
}
