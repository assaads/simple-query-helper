import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Catch unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // Optionally send to error reporting service
});

// Catch runtime errors
window.addEventListener('error', (event) => {
  console.error('Runtime error:', event.error);
  // Optionally send to error reporting service
});

// Disable browser's default error overlay in development
if (process.env.NODE_ENV === 'development') {
  window.addEventListener('error', (event) => {
    event.preventDefault();
  });
}

// Create root and render app
const container = document.getElementById('root');

if (!container) {
  throw new Error('Failed to find root element');
}

const root = ReactDOM.createRoot(container);

// Strict mode helps identify potential problems
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
