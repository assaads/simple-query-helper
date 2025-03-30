import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const navigation = [
  { name: 'Agent', path: '/agent' },
  { name: 'History', path: '/history' },
  { name: 'Knowledge', path: '/knowledge' },
  { name: 'Settings', path: '/settings' },
];

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="flex h-16 items-center px-4">
          {/* Logo/Brand */}
          <div className="mr-8 flex items-center">
            <Link to="/" className="text-xl font-bold">
              Query Helper
            </Link>
          </div>

          {/* Main navigation */}
          <nav className="flex flex-1 items-center space-x-4">
            {navigation.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground ${
                  location.pathname === item.path
                    ? 'bg-accent text-accent-foreground'
                    : 'text-foreground/60'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User menu */}
          <div className="ml-auto flex items-center space-x-4">
            {user && (
              <>
                <span className="text-sm text-foreground/60">{user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="text-sm font-medium text-foreground/60 hover:text-foreground"
                >
                  Sign out
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto p-4">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t py-4 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-foreground/60">
          <p>&copy; {new Date().getFullYear()} Query Helper. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
