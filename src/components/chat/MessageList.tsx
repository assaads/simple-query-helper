import React from 'react';
import type { MessageListProps } from '../../lib/chatTypes';
import { Message } from './Message';
import { ThinkingIndicator } from './ThinkingIndicator';

export function MessageList({ messages, thinkingState, thoughts }: MessageListProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Scroll to bottom when new messages arrive or thinking state changes
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinkingState]);

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.length === 0 ? (
        <div className="flex h-full items-center justify-center text-center p-8">
          <div className="max-w-md space-y-2">
            <h3 className="text-lg font-semibold">Welcome to AI Browser Agent</h3>
            <p className="text-sm text-muted-foreground">
              Start a conversation with the agent to begin browsing. The agent can help you
              navigate websites, fill forms, and perform various browser actions.
            </p>
          </div>
        </div>
      ) : (
        <div className="divide-y">
          {messages.map((message, index) => (
            <Message
              key={message.id}
              message={message}
              isLast={index === messages.length - 1}
            />
          ))}
          {thinkingState !== 'idle' && (
            <ThinkingIndicator state={thinkingState} thoughts={thoughts} />
          )}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}

// Utility for grouping messages by date
function groupMessagesByDate(messages: MessageListProps['messages']) {
  const groups = new Map<string, typeof messages>();

  messages.forEach((message) => {
    const date = new Date(message.timestamp).toLocaleDateString();
    const group = groups.get(date) || [];
    group.push(message);
    groups.set(date, group);
  });

  return Array.from(groups.entries()).map(([date, messages]) => ({
    date,
    messages,
  }));
}

// Date divider component
function DateDivider({ date }: { date: string }) {
  return (
    <div className="relative py-4">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t" />
      </div>
      <div className="relative flex justify-center">
        <div className="bg-background px-2 text-xs text-muted-foreground">
          {date}
        </div>
      </div>
    </div>
  );
}
