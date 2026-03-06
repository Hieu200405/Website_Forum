import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import AppRoutes from '@/routes/AppRoutes';
import ModalProvider from '@/components/providers/ModalProvider';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ThemeProvider } from '@/contexts/ThemeContext';
import CommandPalette from '@/components/CommandPalette';

const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <Router>
            <AppRoutes />
            <ModalProvider />
            <CommandPalette />
          </Router>
        </ErrorBoundary>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: '14px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 600,
            },
          }}
        />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
