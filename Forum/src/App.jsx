import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import AppRoutes from '@/routes/AppRoutes';
import ModalProvider from '@/components/providers/ModalProvider';
import ErrorBoundary from '@/components/ErrorBoundary';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <Router>
          <AppRoutes />
          <ModalProvider />
        </Router>
      </ErrorBoundary>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App;
