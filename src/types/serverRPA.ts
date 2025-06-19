
export interface ServerRecordedAction {
  id: string;
  type: 'click' | 'type' | 'navigate' | 'scroll' | 'wait' | 'screenshot';
  timestamp: number;
  element?: {
    selector: string;
    text?: string;
    coordinates?: { x: number; y: number };
  };
  url?: string;
  screenshot?: string;
  browserResolution?: { width: number; height: number };
  delay?: number;
}

export interface ServerSavedScenario {
  id: string;
  name: string;
  description: string;
  actions: ServerRecordedAction[];
  created_at: string;
  platform: string;
  browserResolution: { width: number; height: number };
}

export interface ServerRPAExecutionResult {
  success: boolean;
  scenarioId: string;
  executedActions: number;
  totalActions: number;
  duration: number;
  errors?: string[];
  screenshots?: string[];
}
