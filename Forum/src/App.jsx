import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import AppRoutes from '@/routes/AppRoutes';
import ModalProvider from '@/components/providers/ModalProvider';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppRoutes />
        <ModalProvider />
      </Router>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App;
