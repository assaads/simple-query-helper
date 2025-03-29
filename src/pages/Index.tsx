
import React from 'react';
import { Navbar } from '@/components/Navbar';
import { InputBar } from '@/components/InputBar';

const Index = () => {
  const handleSubmit = (input: string) => {
    console.log('User input:', input);
    // In a real app, we would process the input and display a response
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
