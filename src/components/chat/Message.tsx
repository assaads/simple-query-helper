import React from 'react';
import type { MessageProps } from '../../lib/chatTypes';
import { cn } from '../../lib/utils';

const roleIcons = {
  user: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 8C10.21 8 12 6.21 12 4C12 1.79 10.21 0 8 0C5.79 0 4 1.79 4 4C4 6.21 5.79 8 8 8ZM8 10C5.33 10 0 11.34 0 14V16H16V14C16 11.34 10.67 10 8 10Z" fill="currentColor"/>
    </svg>
  ),
  assistant: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 5.5C15 7.43 13.43 9 11.5 9C11.27 9 11.04 8.98 10.82 8.94C10.17 7.77 8.99 7 7.5 7C6.01 7 4.83 7.77 4.18 8.94C3.96 8.98 3.73 9 3.5 9C1.57 9 0 7.43 0 5.5C0 3.57 1.57 2 3.5 2C4.46 2 5.33 2.38 5.97 3H9.03C9.67 2.38 10.54 2 11.5 2C13.43 2 15 3.57 15 5.5ZM7.5 8C8.88 8 10 9.12 10 10.5C10 11.88 8.88 13 7.5 13C6.12 13 5 11.88 5 10.5C5 9.12 6.12 8 7.5 8Z" fill="currentColor"/>
    </svg>
  ),
  system: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13.7 2.3C13.3 1.9 12.7 1.9 12.3 2.3L8 6.6L3.7 2.3C3.3 1.9 2.7 1.9 2.3 2.3C1.9 2.7 1.9 3.3 2.3 3.7L6.6 8L2.3 12.3C1.9 12.7 1.9 13.3 2.3 13.7C2.5 13.9 2.7 14 3 14C3.3 14 3.5 13.9 3.7 13.7L8 9.4L12.3 13.7C12.5 13.9 12.7 14 13 14C13.3 14 13.5 13.9 13.7 13.7C14.1 13.3 14.1 12.7 13.7 12.3L9.4 8L13.7 3.7C14.1 3.3 14.1 2.7 13.7 2.3Z" fill="currentColor"/>
    </svg>
  ),
};

export function Message({ message, isLast }: MessageProps) {
  const isUser = message.role === 'user';
  const isPending = message.status === 'pending';
  const isError = message.status === 'error';

  return (
    <div
      className={cn(
        'flex w-full gap-3 p-4',
        isUser ? 'bg-accent/50' : 'bg-background',
        isLast && 'rounded-b-lg'
      )}
    >
      {/* Avatar/Icon */}
      <div
        className={cn(
          'mt-0.5 flex h-6 w-6 shrink-0 select-none items-center justify-center rounded-md',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
        )}
      >
        {roleIcons[message.role]}
      </div>

      {/* Message content */}
      <div className="flex-1 space-y-2">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {message.content}
        </div>

        {/* Metadata */}
        {message.metadata && (
          <div className="mt-2 space-y-2">
            {message.metadata.action && (
              <div className="text-xs text-muted-foreground">
                Action: {message.metadata.action}
              </div>
            )}
            {message.metadata.thoughts && (
              <div className="text-xs text-muted-foreground italic">
                Thinking: {message.metadata.thoughts}
              </div>
            )}
            {message.metadata.screenshot && (
              <div className="mt-2">
                <img
                  src={message.metadata.screenshot}
                  alt="Browser Screenshot"
                  className="rounded-md border max-h-64 object-contain"
                />
              </div>
            )}
            {message.metadata.error && (
              <div className="text-xs text-destructive">
                Error: {message.metadata.error}
              </div>
            )}
          </div>
        )}

        {/* Status indicators */}
        {isPending && (
          <div className="text-xs text-muted-foreground animate-pulse">
            Sending...
          </div>
        )}
        {isError && (
          <div className="text-xs text-destructive flex items-center gap-1">
            Failed to send
            <button
              className="text-primary hover:underline"
              onClick={() => {/* TODO: Add retry handler */}}
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
