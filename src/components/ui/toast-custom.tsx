import React from 'react';
import { createPortal } from 'react-dom';
import { ErrorDetails } from '../../services/errorService';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
  onClose: (id: string) => void;
}

export function Toast({
  id,
  type,
  message,
  action,
  duration = 5000,
  onClose,
}: ToastProps) {
  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => onClose(id), duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const bgColorClass = {
    success: 'bg-green-100 border-green-500 text-green-700',
    error: 'bg-red-100 border-red-500 text-red-700',
    warning: 'bg-yellow-100 border-yellow-500 text-yellow-700',
    info: 'bg-blue-100 border-blue-500 text-blue-700',
  }[type];

  return (
    <div
      className={`border-l-4 p-4 flex items-center justify-between ${bgColorClass} rounded-r-lg shadow-lg`}
      role="alert"
    >
      <div className="flex-1 mr-4">
        <p className="text-sm">{message}</p>
      </div>
      <div className="flex items-center gap-2">
        {action && (
          <button
            onClick={action.onClick}
            className="text-sm font-medium hover:underline focus:outline-none"
          >
            {action.label}
          </button>
        )}
        <button
          onClick={() => onClose(id)}
          className="text-sm opacity-70 hover:opacity-100 focus:outline-none"
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
}

interface ToastContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  className?: string;
  children?: React.ReactNode;
}

export function ToastContainer({
  position = 'top-right',
  className = '',
  children,
}: ToastContainerProps) {
  return createPortal(
    <div
      className={`fixed z-50 flex flex-col gap-2 m-4 max-w-md ${getPositionClasses(
        position
      )} ${className}`}
      role="region"
      aria-label="Notifications"
    >
      {children}
    </div>,
    document.body
  );
}

function getPositionClasses(position: string): string {
  switch (position) {
    case 'top-left':
      return 'top-0 left-0';
    case 'bottom-right':
      return 'bottom-0 right-0';
    case 'bottom-left':
      return 'bottom-0 left-0';
    default:
      return 'top-0 right-0';
  }
}

// Toast context and provider
interface ToastContextType {
  showToast: (props: Omit<ToastProps, 'id' | 'onClose'>) => void;
  showError: (error: ErrorDetails) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = React.useCallback(
    (props: Omit<ToastProps, 'id' | 'onClose'>) => {
      const id = Math.random().toString(36).substring(2);
      setToasts((prev) => [
        ...prev,
        { ...props, id, onClose: removeToast },
      ]);
    },
    [removeToast]
  );

  const showError = React.useCallback(
    (error: ErrorDetails) => {
      const action = error.retry
        ? {
            label: 'Retry',
            onClick: () => {
              error.retry?.();
              removeToast(error.message);
            },
          }
        : undefined;

      showToast({
        type: 'error',
        message: error.message,
        action,
        duration: error.retry ? 0 : 5000,
      });
    },
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, showError }}>
      {children}
      <ToastContainer>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
