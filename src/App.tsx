import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import PrivateRoute from './components/PrivateRoute';
import ProcessMonitor from './pages/ProcessMonitor';
import { ProcessMonitorProvider } from './contexts/ProcessMonitorContext';
import Settings from './pages/Settings';
import VisualRPA from './pages/VisualRPA';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <AuthProvider>
          <ProcessMonitorProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/process-monitor" element={<PrivateRoute><ProcessMonitor /></PrivateRoute>} />
              <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
              <Route path="/visual-rpa" element={<VisualRPA />} />
            </Routes>
          </ProcessMonitorProvider>
        </AuthProvider>
      </div>
    </Router>
  );
}

export default App;
