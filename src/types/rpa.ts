
export interface RPATask {
  taskId: string;
  url: string;
  actions: RPAAction[];
  accountId: string;
  scenarioId: string;
  blockId: string;
  timeout?: number;
  metadata?: {
    platform?: string;
    action?: string;
    emoji?: string;
    postUrl?: string;
    [key: string]: any;
  };
}

export interface RPAAction {
  type: 'move' | 'click' | 'type' | 'wait' | 'scroll' | 'key' | 'navigate' | 'check_element' | 'telegram_like';
  x?: number;
  y?: number;
  button?: 'left' | 'right' | 'middle';
  text?: string;
  duration?: number;
  key?: string;
  url?: string;
  selector?: string;
  emoji?: string;
  description?: string;
  [key: string]: any; // Индексная сигнатура для совместимости с Json
}

export interface RPAResult {
  taskId?: string;
  success: boolean;
  message?: string;
  screenshot?: string;
  executionTime?: number;
  error?: string;
  completedActions?: number;
  data?: any;
}

export type RPATaskStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'timeout';

export interface RPATaskInfo {
  id: string;
  taskId: string;
  status: RPATaskStatus;
  createdAt: string;
  updatedAt: string;
  result?: RPAResult;
  task: RPATask;
}
