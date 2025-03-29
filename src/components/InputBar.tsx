
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Send } from 'lucide-react';
import { getCurrentUser } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface InputBarProps {
  onSubmit?: (input: string) => void;
}

export const InputBar: React.FC<InputBarProps> = ({ onSubmit }) => {
  const [input, setInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [errorVisible, setErrorVisible] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function checkAuth() {
      const user = await getCurrentUser();
      setIsAuthenticated(!!user);
    }
    
    checkAuth();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    if (!isAuthenticated) {
      setErrorVisible(true);
      toast({
        title: "Authentication required",
        description: "Please log in first to use the AI assistant",
        variant: "destructive",
      });
      
      setTimeout(() => {
        setErrorVisible(false);
      }, 3000);
      
      return;
    }
    
    if (onSubmit) {
      onSubmit(input);
    }
    
    setInput('');
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      {errorVisible && (
        <div className="error-message mb-4 animate-slide-down">
          Please log in first to use the AI assistant
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything or describe your task..."
          className="assistant-input pl-10 pr-20"
          data-testid="assistant-input"
        />
        
        <Button
          type="submit"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-lg"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};
