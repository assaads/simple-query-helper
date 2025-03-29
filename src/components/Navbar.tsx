
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { getCurrentUser, signOut } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadUser() {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    }
    
    loadUser();
  }, []);

  const handleAuthAction = () => {
    if (user) {
      // Sign out
      signOut().then(() => {
        setUser(null);
        window.location.reload();
      });
    } else {
      // Navigate to login page
      navigate('/login');
    }
  };

  return (
    <nav className="bg-dark px-4 py-4 flex justify-between items-center">
      <div className="text-white text-xl font-semibold">
        AI Assistant
      </div>
      
      <Button 
        variant="ghost" 
        className="text-white hover:bg-white/10" 
        onClick={handleAuthAction}
        disabled={loading}
      >
        {loading ? 'Loading...' : user ? 'Logout' : 'Login'}
      </Button>
    </nav>
  );
};
