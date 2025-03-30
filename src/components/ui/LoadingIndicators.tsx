import React from 'react';
import { cn } from '@/lib/utils';

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

export function Spinner({ className, size = 'md', ...props }: SpinnerProps) {
  return (
    <div
      className={cn(
        'inline-block animate-spin rounded-full border-2 border-current border-t-transparent',
        {
          'h-4 w-4': size === 'sm',
          'h-6 w-6': size === 'md',
          'h-8 w-8': size === 'lg',
        },
        className
      )}
      {...props}
      role="status"
      aria-label="loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingButton({
  children,
  loading = false,
  loadingText = 'Loading...',
  className,
  size = 'md',
  disabled,
  ...props
}: LoadingButtonProps) {
  return (
    <button
      className={cn(
        'flex items-center justify-center gap-2 rounded-md px-4 py-2 font-medium transition-colors',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Spinner size={size} />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

interface LoadingPageProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingPage({ className, text = 'Loading...', size = 'lg', ...props }: LoadingPageProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center min-h-[400px]', className)}
      {...props}
    >
      <Spinner size={size} className="mb-4" />
      <p className="text-muted-foreground">{text}</p>
    </div>
  );
}

interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingOverlay({ className, text = 'Loading...', size = 'lg', ...props }: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm',
        className
      )}
      {...props}
    >
      <Spinner size={size} className="mb-4" />
      <p className="text-muted-foreground">{text}</p>
    </div>
  );
}
