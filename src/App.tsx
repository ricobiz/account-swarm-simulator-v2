
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ProcessMonitorProvider } from './components/ProcessMonitorProvider';
import Auth from './pages/Auth';
import VisualRPA from './pages/VisualRPA';
import Index from './pages/Index';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <AuthProvider>
          <ProcessMonitorProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/visual-rpa" element={<VisualRPA />} />
              <Route path="/" element={<Index />} />
            </Routes>
          </ProcessMonitorProvider>
        </AuthProvider>
      </div>
    </Router>
  );
}

export default App;
