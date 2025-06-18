
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/components/AuthProvider';
import Auth from '@/pages/Auth';
import Index from '@/pages/Index';
import RPA from '@/pages/RPA';
import ScenarioLaunch from '@/pages/ScenarioLaunch';
import NotFound from '@/pages/NotFound';
import { ProcessMonitorProvider } from '@/components/ProcessMonitorProvider';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ProcessMonitorProvider>
          <TooltipProvider>
            <Router>
              <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/" element={<Index />} />
                  <Route path="/rpa" element={<RPA />} />
                  <Route path="/launch" element={<ScenarioLaunch />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Toaster />
              </div>
            </Router>
          </TooltipProvider>
        </ProcessMonitorProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
