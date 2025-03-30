import React from 'react';
import { cn } from '@/lib/utils';
import { Step } from '@/lib/agentTypes';

interface WorkflowVisualizerProps {
  currentStep: Step | null;
  completedSteps: Step[];
  requiresInput: boolean;
  inputPrompt?: string;
  onInputSubmit?: (input: string) => void;
  className?: string;
}

export function WorkflowVisualizer({
  currentStep,
  completedSteps,
  requiresInput,
  inputPrompt,
  onInputSubmit,
  className,
}: WorkflowVisualizerProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Workflow Progress */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Workflow Progress</h3>
        <div className="space-y-1">
          {/* Completed Steps */}
          {completedSteps.map((step, index) => (
            <div
              key={step.id}
              className="flex items-center gap-2 text-sm"
            >
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-3 h-3"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="text-muted-foreground">{step.content}</span>
            </div>
          ))}

          {/* Current Step */}
          {currentStep && (
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-3 h-3 animate-pulse"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5.636 5.636a9 9 0 1012.728 0M12 3v9"
                  />
                </svg>
              </div>
              <span className="font-medium">{currentStep.content}</span>
            </div>
          )}
        </div>
      </div>

      {/* User Input Section */}
      {requiresInput && inputPrompt && (
        <div className="rounded-lg border p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4 text-primary"
              >
                <path
                  fillRule="evenodd"
                  d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902.848.137 1.705.248 2.57.331v3.443a.75.75 0 001.28.53l3.58-3.579a.78.78 0 01.527-.224 41.202 41.202 0 005.183-.5c1.437-.232 2.43-1.49 2.43-2.903V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0010 2zm0 7a1 1 0 100-2 1 1 0 000 2zM8 8a1 1 0 11-2 0 1 1 0 012 0zm5 1a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium">Input Required</p>
              <p className="text-sm text-muted-foreground">{inputPrompt}</p>
            </div>
          </div>

          {onInputSubmit && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const input = (e.currentTarget.elements[0] as HTMLInputElement).value;
                onInputSubmit(input);
                e.currentTarget.reset();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                placeholder="Type your response..."
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
              >
                Send
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

