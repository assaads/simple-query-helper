import React from 'react';
import { SessionList } from '../components/history/SessionList';
import { SessionService } from '../services/sessionService';
import type { Session } from '../lib/supabaseTypes';
import { supabase } from '../lib/supabaseClient';

export default function HistoryPage() {
  const [sessions, setSessions] = React.useState<Session[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadSessions = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const data = await SessionService.listSessions();
      setSessions(data.sessions);
    } catch (err) {
      console.error('Failed to load sessions:', err);
      setError('Failed to load session history');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleDelete = async (id: string) => {
    try {
      await SessionService.deleteSession(id);
      await loadSessions();
    } catch (err) {
      console.error('Failed to delete session:', err);
      setError('Failed to delete session');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Session History</h1>
        <p className="text-muted-foreground mt-2">
          View and manage your past conversations and automation sessions
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-md">
          {error}
          <button
            onClick={loadSessions}
            className="ml-2 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      <SessionList sessions={sessions} onDelete={handleDelete} />

      {/* Help Section */}
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-medium mb-2">About Session History</h3>
        <div className="text-sm text-muted-foreground space-y-2">
          <p>
            Your session history contains all your interactions with the AI agent.
            Each session includes:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Chat conversations and commands</li>
            <li>Browser automation steps and screenshots</li>
            <li>Agent thoughts and reasoning</li>
            <li>Task completion status and results</li>
          </ul>
          <p className="mt-4">
            Sessions are automatically saved and can be resumed at any time. You can
            also delete sessions you no longer need.
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="p-4 border rounded-lg">
          <div className="text-2xl font-semibold">
            {sessions.length}
          </div>
          <div className="text-sm text-muted-foreground">
            Total Sessions
          </div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="text-2xl font-semibold">
            {sessions.filter(s => s.status === 'completed').length}
          </div>
          <div className="text-sm text-muted-foreground">
            Completed Tasks
          </div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="text-2xl font-semibold">
            {sessions.filter(s => s.status === 'active').length}
          </div>
          <div className="text-sm text-muted-foreground">
            Active Sessions
          </div>
        </div>
      </div>
    </div>
  );
}
