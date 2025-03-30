import React from 'react';
import { cn } from '../../lib/utils';

export interface ResizablePanelProps {
  children: React.ReactNode;
  defaultSize: number;
  minSize?: number;
  maxSize?: number;
  side?: 'left' | 'right';
  className?: string;
}

export function ResizablePanel({
  children,
  defaultSize,
  minSize = 0,
  maxSize = 100,
  side = 'right',
  className,
}: ResizablePanelProps) {
  const [size, setSize] = React.useState(defaultSize);
  const [isResizing, setIsResizing] = React.useState(false);
  const resizerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !resizerRef.current) return;

      const container = resizerRef.current.parentElement;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      let newSize;

      if (side === 'right') {
        newSize = ((containerRect.right - e.clientX) / containerRect.width) * 100;
      } else {
        newSize = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      }

      // Clamp size between min and max
      newSize = Math.max(minSize, Math.min(maxSize, newSize));
      setSize(newSize);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, minSize, maxSize, side]);

  return (
    <div
      className={cn(
        'relative h-full',
        side === 'right' ? 'ml-auto' : 'mr-auto',
        className
      )}
      style={{ width: `${size}%` }}
    >
      <div
        ref={resizerRef}
        onMouseDown={() => setIsResizing(true)}
        className={cn(
          'absolute top-0 h-full w-1 cursor-col-resize hover:bg-primary/50 active:bg-primary',
          side === 'right' ? '-left-0.5' : '-right-0.5',
          isResizing && 'bg-primary'
        )}
      />
      {children}
    </div>
  );
}
