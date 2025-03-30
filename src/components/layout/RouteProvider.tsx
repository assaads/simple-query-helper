import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AppLayout } from './AppLayout';

// Page imports
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Agent from '@/pages/Agent';
import History from '@/pages/History';
import Knowledge from '@/pages/Knowledge';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';

export function RouteProvider() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected Routes with Layout */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Agent />} />
        <Route path="/agent" element={<Agent />} />
        <Route path="/history" element={<History />} />
        <Route path="/knowledge" element={<Knowledge />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Not Found Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
