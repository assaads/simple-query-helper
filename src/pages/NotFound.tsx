import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="mx-auto max-w-md space-y-8 px-4 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">404</h1>
          <h2 className="text-2xl font-semibold">Page Not Found</h2>
          <p className="text-gray-500">
            The page you're looking for doesn't exist or may have been moved.
          </p>
        </div>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="rounded-md border border-primary px-4 py-2 text-primary hover:bg-primary/10"
          >
            Go Back
          </button>
          <button
            onClick={() => navigate('/')}
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
