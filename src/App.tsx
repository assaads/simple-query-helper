import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { RouteProvider } from '@/components/layout/RouteProvider';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { LoadingPage } from '@/components/ui/LoadingIndicators';

function ErrorFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4 text-center">
        <h2 className="text-2xl font-bold">Oops! Something went wrong</h2>
        <p className="text-muted-foreground">
          An unexpected error occurred. Please try refreshing the page.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}

function SuspenseFallback() {
  return (
    <LoadingPage
      text="Loading application..."
      className="min-h-screen"
    />
  );
}

export default function App() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <React.Suspense fallback={<SuspenseFallback />}>
        <BrowserRouter>
          <AuthProvider>
            <div className="relative min-h-screen">
              <RouteProvider />
              <Toaster />
            </div>
          </AuthProvider>
        </BrowserRouter>
      </React.Suspense>
    </ErrorBoundary>
  );
}
