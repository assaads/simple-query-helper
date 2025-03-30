import React, { useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Navbar } from '@/components/Navbar';
import { MessageList } from '@/components/chat/MessageList';
import { ChatInput } from '@/components/chat/ChatInput';
import { BrowserView } from '@/components/browser/BrowserView';
import { WorkflowVisualizer } from '@/components/agent/WorkflowVisualizer';
import { useChat } from '@/hooks/useChat';
import { useAgentStatus } from '@/hooks/useAgentStatus';
import { useBrowserAutomation } from '@/hooks/useBrowserAutomation';
import { getCurrentUser } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { BrowserState, BrowserAction } from '@/lib/browserTypes';
import { createStep, createMessage, agentMessageToChatMessage } from '@/lib/chatUtils';
import { stateService, useStateAutosave } from '@/lib/stateService';
import { Message, Step } from '@/lib/agentTypes';
import { ThinkingState } from '@/lib/chatTypes';
import { cn } from '@/lib/utils';

const Agent: React.FC = () => {
  const sessionId = React.useMemo(() => uuidv4(), []);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Initialize hooks
  const {
    messages,
    isProcessing,
    currentSteps,
    addMessage,
    setProcessing,
    addStep,
    updateStepStatus,
    finalizeSteps,
  } = useChat();

  const {
    isThinking,
    currentStep,
    progress,
    needsUserInput,
    startThinking,
    updateStep,
    stopThinking,
    setProgress,
    requestUserInput,
    clearUserInput,
  } = useAgentStatus();

  const {
    state: browserState,
    isConnected,
    agentState,
    actions: browserActions,
  } = useBrowserAutomation(sessionId);

  // Convert agent messages to chat messages for UI
  const chatMessages = React.useMemo(() => {
    return messages.map(agentMessageToChatMessage);
  }, [messages]);

  // Process initial query from Index page
  useEffect(() => {
    const processInitialQuery = async () => {
      const query = location.state?.query;
      if (query) {
        handleSubmit(query);
      }
    };

    processInitialQuery();
  }, [location.state]); // eslint-disable-line react-hooks/exhaustive-deps

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to continue",
          variant: "destructive",
        });
        navigate('/login', { state: { from: location } });
      }
    };
    
    checkAuth();
  }, [location, navigate, toast]);

  // Load saved state on component mount
  useEffect(() => {
    const loadSavedState = async () => {
      const savedState = await stateService.getState();
      if (savedState) {
        // Restore workflow state
        browserActions.navigate(savedState.browserState.url);
        savedState.messages?.forEach(msg => {
          addMessage(msg.content, msg.type);
        });
        savedState.completedSteps?.forEach(step => {
          if (step.id) {
            addStep(step);
          }
        });
      }
    };
    loadSavedState();
  }, [browserActions, addMessage, addStep]);

  // Auto-save state
  useStateAutosave(
    {
      sessionId,
      currentStep: typeof currentStep === 'string' ? currentStep : currentStep?.id || '',
      completedSteps: currentSteps,
      browserState,
      requiresInput: needsUserInput,
      inputPrompt: needsUserInput ? "Please provide input..." : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages
    },
    currentSteps,
    browserState,
    messages
  );

  const handleSubmit = useCallback(async (input: string) => {
    addMessage(input, 'user');
    startThinking(input);
    setProcessing(true);

    const step = createStep('Processing your request...', 'processing');
    const stepId = addStep(step);
    
    try {
      // For now, just navigate to a URL if it looks like one
      if (input.startsWith('http://') || input.startsWith('https://')) {
        await browserActions.navigate(input);
        
        updateStepStatus(stepId, 'completed');
        addMessage(`Navigated to ${input}`, 'agent');
      } else {
        // TODO: Replace with actual agent processing logic
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        updateStepStatus(stepId, 'completed');
        addMessage('I understand your request. Let me help you with that.', 'agent');
        
        const step2 = createStep('Analyzing possible solutions...', 'processing');
        const step2Id = addStep(step2);
        await new Promise(resolve => setTimeout(resolve, 1500));
        updateStepStatus(step2Id, 'completed');
      }
      
      setProgress(100);
      finalizeSteps();
      
    } catch (error) {
      console.error('Error processing request:', error);
      toast({
        title: "Error",
        description: "Failed to process your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      stopThinking();
      setProcessing(false);
    }
  }, [addMessage, startThinking, setProcessing, addStep, browserActions, updateStepStatus, setProgress, finalizeSteps, stopThinking, toast]);

  const leftContent = (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col p-4">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          <MessageList
            messages={chatMessages}
            isProcessing={isProcessing}
            currentStep={currentStep}
            progress={progress}
            thinkingState={agentState as ThinkingState}
            className="min-h-0"
          />
        </div>
        
        <div className="mt-auto">
          <ChatInput
            onSendMessage={handleSubmit}
            disabled={isProcessing || needsUserInput || !isConnected}
          />
          <div className="text-xs text-muted-foreground mt-2 text-center">
            Your data is processed securely. See our{' '}
            <a href="/privacy" className="text-primary hover:underline">
              privacy policy
            </a>
            .
          </div>
        </div>
      </div>
      
      <div className="w-64 border-l p-4 bg-muted/10">
        <WorkflowVisualizer
          currentStep={typeof currentStep === 'string' ? null : currentStep}
          completedSteps={currentSteps}
          requiresInput={needsUserInput}
          inputPrompt={needsUserInput ? "Please provide input..." : undefined}
          onInputSubmit={(input) => {
            clearUserInput();
            handleSubmit(input);
          }}
        />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-background">
      <Navbar />
      <div className="flex-1 overflow-hidden">
        <div className="flex h-full">
          <div className="flex-1">
            {leftContent}
          </div>
          <BrowserView
            state={browserState}
            onAction={browserActions.execute}
          />
        </div>
      </div>
    </div>
  );
};

export default Agent;
