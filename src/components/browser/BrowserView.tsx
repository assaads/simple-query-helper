import React from 'react';
import type { BrowserViewProps, BrowserAction } from '../../lib/browserTypes';
import { cn } from '../../lib/utils';
import { ResizablePanel } from './ResizablePanel';

export function BrowserView({
  state,
  onAction,
  isInteractive = true,
  highlightElement = null,
}: BrowserViewProps) {
  const handleNavigate = (url: string) => {
    onAction?.({
      type: 'navigate',
      url,
    });
  };

  const handleRefresh = () => {
    onAction?.({
      type: 'navigate',
      url: state.url,
    });
  };

  const handleGoBack = () => {
    onAction?.({
      type: 'navigate',
      url: 'back',
    });
  };

  const handleGoForward = () => {
    onAction?.({
      type: 'navigate',
      url: 'forward',
    });
  };

  const handleElementClick = (elementId: string) => {
    if (!isInteractive) return;
    onAction?.({
      type: 'click',
      elementId,
    });
  };

  return (
    <ResizablePanel defaultSize={40} minSize={30} maxSize={70}>
      <div className="flex h-full flex-col">
        {/* Browser Toolbar */}
        <div className="flex items-center gap-2 border-b bg-card px-4 py-2">
          <div className="flex items-center gap-1">
            <button
              onClick={handleGoBack}
              disabled={!state.canGoBack}
              className={cn(
                'p-1 hover:bg-accent rounded-md',
                'disabled:opacity-50 disabled:pointer-events-none'
              )}
            >
              <ArrowLeftIcon />
            </button>
            <button
              onClick={handleGoForward}
              disabled={!state.canGoForward}
              className={cn(
                'p-1 hover:bg-accent rounded-md',
                'disabled:opacity-50 disabled:pointer-events-none'
              )}
            >
              <ArrowRightIcon />
            </button>
            <button
              onClick={handleRefresh}
              disabled={state.isLoading}
              className={cn(
                'p-1 hover:bg-accent rounded-md',
                'disabled:opacity-50 disabled:pointer-events-none'
              )}
            >
              <RefreshIcon className={state.isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 w-full bg-background rounded-md border px-3 py-1">
              {state.isLoading && (
                <div className="h-4 w-4 shrink-0">
                  <SpinnerIcon className="animate-spin" />
                </div>
              )}
              <span className="truncate text-sm">{state.url}</span>
            </div>
          </div>
        </div>

        {/* Browser Content */}
        <div className="relative flex-1 overflow-hidden">
          {state.error ? (
            <div className="flex h-full items-center justify-center p-8">
              <div className="max-w-md space-y-2 text-center">
                <h3 className="text-lg font-semibold text-destructive">Error</h3>
                <p className="text-sm text-muted-foreground">{state.error}</p>
              </div>
            </div>
          ) : !state.screenshotUrl ? (
            <div className="flex h-full items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <div className="relative h-full w-full">
              <img
                src={state.screenshotUrl}
                alt="Browser Screenshot"
                className="h-full w-full object-contain"
              />
              {/* Element Overlays */}
              {state.selectedElements.map((element) => (
                <div
                  key={element.id}
                  onClick={() => handleElementClick(element.id)}
                  className={cn(
                    'absolute border-2 pointer-events-auto cursor-pointer',
                    'transition-colors hover:bg-accent/20',
                    highlightElement === element.id && 'border-primary bg-primary/20',
                    !element.isVisible && 'opacity-50'
                  )}
                  style={{
                    left: `${element.bbox.x}%`,
                    top: `${element.bbox.y}%`,
                    width: `${element.bbox.width}%`,
                    height: `${element.bbox.height}%`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </ResizablePanel>
  );
}

function ArrowLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 8H3M3 8L8 3M3 8L8 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 8H13M13 8L8 3M13 8L8 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function RefreshIcon({ className = '' }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function SpinnerIcon({ className = '' }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 1.5V4.5M8 11.5V14.5M3.5 8H0.5M15.5 8H12.5M13.3536 13.3536L11.2322 11.2322M13.3536 2.64645L11.2322 4.76777M2.64645 13.3536L4.76777 11.2322M2.64645 2.64645L4.76777 4.76777" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
