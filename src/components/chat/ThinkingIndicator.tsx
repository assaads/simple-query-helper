import React from 'react';
import type { ThinkingIndicatorProps } from '../../lib/chatTypes';
import { cn } from '../../lib/utils';

const stateIcons = {
  idle: null,
  thinking: (
    <svg
      className="animate-spin"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  reading: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 4H14M2 8H14M2 12H8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  planning: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 9L6 13L14 3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  executing: (
    <svg
      className="animate-pulse"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14.4 8L8 2.4V13.6L14.4 8ZM1.6 2.4V13.6H4V2.4H1.6Z"
        fill="currentColor"
      />
    </svg>
  ),
};

const stateLabels = {
  idle: '',
  thinking: 'Thinking...',
  reading: 'Reading...',
  planning: 'Planning next steps...',
  executing: 'Executing actions...',
};

export function ThinkingIndicator({ state, thoughts }: ThinkingIndicatorProps) {
  if (state === 'idle') return null;

  const icon = stateIcons[state];
  const label = stateLabels[state];

  return (
    <div className="flex w-full gap-3 p-4 bg-accent/20">
      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center">
        <div className="text-primary">{icon}</div>
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{label}</span>
          <div className="animate-pulse flex space-x-1">
            <div className="h-1 w-1 rounded-full bg-current" />
            <div className="h-1 w-1 rounded-full bg-current animation-delay-200" />
            <div className="h-1 w-1 rounded-full bg-current animation-delay-400" />
          </div>
        </div>
        {thoughts && (
          <div className="text-sm text-muted-foreground italic">
            {thoughts}
          </div>
        )}
      </div>
    </div>
  );
}

// Utility component for the dots animation
const ThinkingDots = () => (
  <div className="flex space-x-1">
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className={cn(
          'h-1 w-1 rounded-full bg-current opacity-75',
          i === 1 && 'animation-delay-200',
          i === 2 && 'animation-delay-400'
        )}
      />
    ))}
  </div>
);
