import React from 'react';
import { Step } from '@/lib/agentTypes';
import { cn } from '@/lib/utils';
import { CheckCircle, Circle, Loader2, XCircle } from 'lucide-react';
import { formatTimestamp } from '@/lib/chatUtils';

interface StepVisualizerProps {
  steps: Step[];
  className?: string;
}

const StepIcon = ({ status }: { status: Step['status'] }) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'error':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'processing':
      return <Loader2 className="h-4 w-4 text-brand animate-spin" />;
    default:
      return <Circle className="h-4 w-4 text-gray-500" />;
  }
};

export const StepVisualizer: React.FC<StepVisualizerProps> = ({
  steps,
  className,
}) => {
  if (steps.length === 0) return null;

  return (
    <div className={cn('space-y-2', className)}>
      {steps.map((step, index) => (
        <div
          key={step.id}
          className="flex items-start space-x-3 text-sm text-gray-400"
        >
          <div className="mt-1">
            <StepIcon status={step.status} />
          </div>
          <div className="flex-1">
            <div className={cn(
              step.status === 'completed' && 'text-gray-300',
              step.status === 'error' && 'text-red-400'
            )}>
              {step.content}
            </div>
            <div className="text-[10px] mt-0.5 opacity-50">
              {formatTimestamp(step.timestamp)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
