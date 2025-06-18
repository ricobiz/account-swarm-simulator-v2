

export interface RPATask {
  taskId: string;
  url: string;
  actions: RPAAction[];
  accountId: string;
  scenarioId: string;
  blockId: string;
  timeout?: number;
}

export interface RPAAction {
  type: 'move' | 'click' | 'type' | 'wait' | 'scroll' | 'key';
  x?: number;
  y?: number;
  button?: 'left' | 'right' | 'middle';
  text?: string;
  duration?: number;
  key?: string;
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

