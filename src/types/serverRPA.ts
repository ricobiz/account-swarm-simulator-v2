
export interface BrowserInfo {
  resolution: { width: number; height: number };
  userAgent: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  timestamp: string;
}

export interface ServerScreenshot {
  imageBase64: string;
  browserInfo: BrowserInfo;
  sessionId: string;
}

export interface RecordedAction {
  id: string;
  type: 'click' | 'type' | 'wait' | 'scroll' | 'hover';
  coordinates: { x: number; y: number };
  browserResolution: { width: number; height: number };
  description: string;
  value?: string;
  timestamp: number;
}

export interface SavedScenario {
  id: string;
  name: string;
  description: string;
  actions: RecordedAction[];
  created_at: string;
  platform: string;
  browserResolution: { width: number; height: number };
}

export interface MacroTestResult {
  success: boolean;
  completedActions: number;
  totalActions: number;
  error?: string;
  beforeScreenshot?: string;
  afterScreenshot?: string;
  executionTime: number;
}
