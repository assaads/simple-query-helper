
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { InputBar } from '@/components/InputBar';

const Index = () => {
  const navigate = useNavigate();

  const handleSubmit = (input: string) => {
    // Navigate to agent page with the query
    navigate('/agent', { state: { query: input } });
  };

  return (
    <div className="min-h-screen bg-dark flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Your AI Assistant
          </h1>
          <p className="text-lg md:text-xl text-brand">
            for daily web tasks
          </p>
        </div>
        
        <InputBar onSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default Index;

