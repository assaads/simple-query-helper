import React from 'react';
import type { ChatInputProps } from '../../lib/chatTypes';
import { cn } from '../../lib/utils';

export function ChatInput({ onSendMessage, disabled = false }: ChatInputProps) {
  const [message, setMessage] = React.useState('');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || disabled) return;

    try {
      await onSendMessage(message);
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    setMessage(textarea.value);

    // Auto-resize textarea
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 border-t bg-background p-4"
    >
      <div className="relative flex items-end gap-2">
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            disabled={disabled}
            className={cn(
              'w-full resize-none rounded-md border bg-background px-3 py-3 pr-12',
              'placeholder:text-muted-foreground',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
            style={{ minHeight: '2.5rem', maxHeight: '200px' }}
          />
          <div className="absolute right-3 top-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMessage('')}
              className={cn(
                'p-1 text-muted-foreground/50 hover:text-muted-foreground transition-colors',
                'disabled:pointer-events-none disabled:opacity-50',
                !message && 'hidden'
              )}
              disabled={disabled}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 2C4.682 2 2 4.682 2 8C2 11.318 4.682 14 8 14C11.318 14 14 11.318 14 8C14 4.682 11.318 2 8 2ZM10.54 11L8 8.46L5.46 11L5 10.54L7.54 8L5 5.46L5.46 5L8 7.54L10.54 5L11 5.46L8.46 8L11 10.54L10.54 11Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
        </div>
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-md',
            'bg-primary text-primary-foreground shadow hover:bg-primary/90',
            'disabled:pointer-events-none disabled:opacity-50'
          )}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14.6 8.8L3.4 14.4C3 14.6 2.6 14.4 2.4 14L1.6 12C1.4 11.6 1.6 11.2 2 11L7.4 8L2 5C1.6 4.8 1.4 4.4 1.6 4L2.4 2C2.6 1.6 3 1.4 3.4 1.6L14.6 7.2C15 7.4 15 8.6 14.6 8.8Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
      {disabled && (
        <p className="text-xs text-muted-foreground text-center">
          The agent is currently processing your request...
        </p>
      )}
    </form>
  );
}
