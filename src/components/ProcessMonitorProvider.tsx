
import React, { createContext, useContext, ReactNode } from 'react';
import { useProcessMonitor, ProcessStatus } from '@/hooks/useProcessMonitor';

interface ProcessMonitorContextType {
  processes: ProcessStatus[];
  startProcess: (type: ProcessStatus['type'], name: string, details?: string) => string;
  updateProcess: (id: string, updates: Partial<Pick<ProcessStatus, 'status' | 'progress' | 'details' | 'error' | 'stuckStage'>>) => void;
  completeProcess: (id: string, details?: string) => void;
  failProcess: (id: string, error: string, details?: string) => void;
  markStuck: (id: string, stuckStage: string, details?: string) => void;
  removeProcess: (id: string) => void;
  clearCompleted: () => void;
}

const ProcessMonitorContext = createContext<ProcessMonitorContextType | undefined>(undefined);

export const useProcessMonitorContext = () => {
  const context = useContext(ProcessMonitorContext);
  if (!context) {
    throw new Error('useProcessMonitorContext must be used within a ProcessMonitorProvider');
  }
  return context;
};

interface ProcessMonitorProviderProps {
  children: ReactNode;
}

export const ProcessMonitorProvider: React.FC<ProcessMonitorProviderProps> = ({ children }) => {
  const processMonitor = useProcessMonitor();

  return (
    <ProcessMonitorContext.Provider value={processMonitor}>
      {children}
    </ProcessMonitorContext.Provider>
  );
};
