import { useReducer, useCallback } from 'react';
import { ChatState, ChatAction, Message, Step, StepStatus } from '@/lib/agentTypes';
import { createMessage, createStep } from '@/lib/chatUtils';

const initialState: ChatState = {
  messages: [],
  isProcessing: false,
  currentSteps: [],
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    case 'UPDATE_STEPS':
      return {
        ...state,
        currentSteps: action.payload,
      };
    case 'SET_PROCESSING':
      return {
        ...state,
        isProcessing: action.payload,
      };
    case 'UPDATE_STEP_STATUS':
      return {
        ...state,
        currentSteps: state.currentSteps.map(step =>
          step.id === action.payload.stepId
            ? { ...step, status: action.payload.status }
            : step
        ),
      };
    default:
      return state;
  }
}

export function useChat() {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const addMessage = useCallback((content: string, type: Message['type']) => {
    dispatch({
      type: 'ADD_MESSAGE',
      payload: createMessage(content, type),
    });
  }, []);

  const setProcessing = useCallback((isProcessing: boolean) => {
    dispatch({ type: 'SET_PROCESSING', payload: isProcessing });
  }, []);

  const addStep = useCallback((step: Step) => {
    dispatch({
      type: 'UPDATE_STEPS',
      payload: [...state.currentSteps, step],
    });
    return step.id;
  }, [state.currentSteps]);

  const updateStepStatus = useCallback((stepId: string, status: StepStatus) => {
    dispatch({
      type: 'UPDATE_STEP_STATUS',
      payload: { stepId, status },
    });
  }, []);

  const finalizeSteps = useCallback(() => {
    if (state.currentSteps.length > 0 && state.messages.length > 0) {
      const lastMessage = state.messages[state.messages.length - 1];
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          ...lastMessage,
          steps: state.currentSteps,
        },
      });
      dispatch({ type: 'UPDATE_STEPS', payload: [] });
    }
  }, [state.currentSteps, state.messages]);

  return {
    messages: state.messages,
    isProcessing: state.isProcessing,
    currentSteps: state.currentSteps,
    addMessage,
    setProcessing,
    addStep,
    updateStepStatus,
    finalizeSteps,
  };
}

