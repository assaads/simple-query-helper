import React from 'react';
import { Link } from 'react-router-dom';
import type { Session } from '../../lib/supabaseTypes';
import { formatDistanceToNow } from 'date-fns';

interface SessionListProps {
  sessions: Session[];
  onDelete: (id: string) => Promise<void>;
}

export function SessionList({ sessions, onDelete }: SessionListProps) {
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedStatus, setSelectedStatus] = React.useState<string>('all');

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this session?')) return;
    
    setIsDeleting(id);
    try {
      await onDelete(id);
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredSessions = React.useMemo(() => {
    return sessions.filter((session) => {
      const matchesSearch =
        searchQuery === '' ||
        session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus =
        selectedStatus === 'all' || session.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [sessions, searchQuery, selectedStatus]);

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="p-2 border rounded-md min-w-[150px]"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="error">Error</option>
        </select>
      </div>

      {/* Sessions Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSessions.map((session) => (
          <div
            key={session.id}
            className="p-4 border rounded-lg hover:border-primary transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <Link
                to={`/session/${session.id}`}
                className="text-lg font-medium hover:underline"
              >
                {session.title || 'Untitled Session'}
              </Link>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'px-2 py-1 text-xs rounded-full',
                    session.status === 'active' && 'bg-green-100 text-green-700',
                    session.status === 'completed' && 'bg-blue-100 text-blue-700',
                    session.status === 'error' && 'bg-red-100 text-red-700'
                  )}
                >
                  {session.status}
                </span>
                <button
                  onClick={() => handleDelete(session.id)}
                  disabled={isDeleting === session.id}
                  className="text-sm text-destructive hover:underline disabled:opacity-50"
                >
                  {isDeleting === session.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {session.description || 'No description'}
            </p>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div>
                Created {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
              </div>
              <div>
                Last updated {formatDistanceToNow(new Date(session.updated_at), { addSuffix: true })}
              </div>
            </div>

            {/* Session Meta */}
            {session.metadata && (
              <div className="mt-2 pt-2 border-t">
                <div className="flex flex-wrap gap-2">
                  {session.metadata.tags?.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs bg-accent rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredSessions.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {sessions.length === 0
              ? 'No sessions found. Start a new chat to begin.'
              : 'No sessions match your search criteria.'}
          </p>
        </div>
      )}
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
