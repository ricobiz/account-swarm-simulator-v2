
import { Node, Edge } from '@xyflow/react';

export interface ScenarioPreset {
  id: string;
  name: string;
  description: string;
  category: string;
  platform: string;
  nodes: Node[];
  edges: Edge[];
  tags: string[];
}

export const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    id: 'youtube_engagement',
    name: 'Прокачка YouTube канала',
    description: 'Просмотр, лайки и комментарии на YouTube видео',
    category: 'engagement',
    platform: 'youtube',
    tags: ['youtube', 'лайки', 'просмотры', 'комментарии'],
    nodes: [
      {
        id: 'start',
        type: 'input',
        data: { label: 'Начало' },
        position: { x: 100, y: 50 }
      },
      {
        id: 'navigate-1',
        type: 'action',
        data: {
          id: 'navigate-1',
          type: 'navigate',
          label: 'Переход на YouTube',
          icon: 'Navigation',
          config: { url: 'https://youtube.com/watch?v=VIDEO_ID', waitTime: 5 },
          isConfigured: true
        },
        position: { x: 100, y: 150 }
      },
      {
        id: 'view-1',
        type: 'action',
        data: {
          id: 'view-1',
          type: 'view',
          label: 'Просмотр видео',
          icon: 'Eye',
          config: { viewTime: 60, scrollBehavior: 'random', interactions: true },
          isConfigured: true
        },
        position: { x: 100, y: 250 }
      },
      {
        id: 'like-1',
        type: 'action',
        data: {
          id: 'like-1',
          type: 'like',
          label: 'Поставить лайк',
          icon: 'Heart',
          config: { selector: '[aria-label*="like"]', checkIfLiked: true, delay: 1000 },
          isConfigured: true
        },
        position: { x: 100, y: 350 }
      },
      {
        id: 'comment-1',
        type: 'action',
        data: {
          id: 'comment-1',
          type: 'comment',
          label: 'Написать комментарий',
          icon: 'MessageCircle',
          config: { 
            text: 'Отличное видео! 👍',
            textVariations: 'Отличное видео! 👍\nКлассно! 🔥\nСпасибо за контент! ✨',
            selector: '#placeholder-area',
            submitSelector: '#submit-button'
          },
          isConfigured: true
        },
        position: { x: 100, y: 450 }
      }
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'navigate-1' },
      { id: 'e2', source: 'navigate-1', target: 'view-1' },
      { id: 'e3', source: 'view-1', target: 'like-1' },
      { id: 'e4', source: 'like-1', target: 'comment-1' }
    ]
  },
  
  {
    id: 'tiktok_spam',
    name: 'Активность в TikTok',
    description: 'Массовые лайки и подписки в TikTok',
    category: 'spam',
    platform: 'tiktok',
    tags: ['tiktok', 'лайки', 'подписки', 'массовая активность'],
    nodes: [
      {
        id: 'start',
        type: 'input',
        data: { label: 'Начало' },
        position: { x: 100, y: 50 }
      },
      {
        id: 'navigate-1',
        type: 'action',
        data: {
          id: 'navigate-1',
          type: 'navigate',
          label: 'Переход на TikTok',
          icon: 'Navigation',
          config: { url: 'https://tiktok.com/@USERNAME', waitTime: 3 },
          isConfigured: true
        },
        position: { x: 100, y: 150 }
      },
      {
        id: 'loop-1',
        type: 'action',
        data: {
          id: 'loop-1',
          type: 'loop',
          label: 'Цикл по видео',
          icon: 'RotateCcw',
          config: { loopType: 'count', count: 10, maxIterations: 10 },
          isConfigured: true
        },
        position: { x: 100, y: 250 }
      },
      {
        id: 'like-1',
        type: 'action',
        data: {
          id: 'like-1',
          type: 'like',
          label: 'Лайк видео',
          icon: 'Heart',
          config: { selector: '[data-e2e="like-button"]', checkIfLiked: true, delay: 500 },
          isConfigured: true
        },
        position: { x: 300, y: 350 }
      },
      {
        id: 'wait-1',
        type: 'action',
        data: {
          id: 'wait-1',
          type: 'wait_random',
          label: 'Случайная пауза',
          icon: 'Pause',
          config: { minTime: 2, maxTime: 5, humanBehavior: true },
          isConfigured: true
        },
        position: { x: 300, y: 450 }
      }
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'navigate-1' },
      { id: 'e2', source: 'navigate-1', target: 'loop-1' },
      { id: 'e3', source: 'loop-1', target: 'like-1' },
      { id: 'e4', source: 'like-1', target: 'wait-1' },
      { id: 'e5', source: 'wait-1', target: 'loop-1' }
    ]
  },
  
  {
    id: 'telegram_join',
    name: 'Вступление в Telegram каналы',
    description: 'Автоматическое вступление в список Telegram каналов',
    category: 'automation',
    platform: 'telegram',
    tags: ['telegram', 'каналы', 'подписки', 'автоматизация'],
    nodes: [
      {
        id: 'start',
        type: 'input',
        data: { label: 'Начало' },
        position: { x: 100, y: 50 }
      },
      {
        id: 'proxy-1',
        type: 'action',
        data: {
          id: 'proxy-1',
          type: 'proxy_change',
          label: 'Смена прокси',
          icon: 'Shuffle',
          config: { proxyType: 'random', testConnection: true },
          isConfigured: true
        },
        position: { x: 100, y: 150 }
      },
      {
        id: 'navigate-1',
        type: 'action',
        data: {
          id: 'navigate-1',
          type: 'navigate',
          label: 'Переход в Telegram',
          icon: 'Navigation',
          config: { url: 'https://t.me/CHANNEL_NAME', waitTime: 3 },
          isConfigured: true
        },
        position: { x: 100, y: 250 }
      },
      {
        id: 'condition-1',
        type: 'action',
        data: {
          id: 'condition-1',
          type: 'condition',
          label: 'Проверка кнопки Join',
          icon: 'GitBranch',
          config: { 
            conditionType: 'element_exists', 
            selector: '.tgme_action_button_new',
            randomChance: 50
          },
          isConfigured: true
        },
        position: { x: 100, y: 350 }
      },
      {
        id: 'click-1',
        type: 'action',
        data: {
          id: 'click-1',
          type: 'click',
          label: 'Нажать Join',
          icon: 'MousePointer',
          config: { 
            selector: '.tgme_action_button_new',
            waitForElement: true,
            timeout: 5000
          },
          isConfigured: true
        },
        position: { x: 300, y: 450 }
      },
      {
        id: 'wait-1',
        type: 'action',
        data: {
          id: 'wait-1',
          type: 'wait_random',
          label: 'Пауза после подписки',
          icon: 'Pause',
          config: { minTime: 3, maxTime: 8, humanBehavior: true },
          isConfigured: true
        },
        position: { x: 300, y: 550 }
      }
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'proxy-1' },
      { id: 'e2', source: 'proxy-1', target: 'navigate-1' },
      { id: 'e3', source: 'navigate-1', target: 'condition-1' },
      { id: 'e4', source: 'condition-1', target: 'click-1', sourceHandle: 'true' },
      { id: 'e5', source: 'click-1', target: 'wait-1' }
    ]
  }
];

export function getPresetsByCategory(category: string): ScenarioPreset[] {
  return SCENARIO_PRESETS.filter(preset => preset.category === category);
}

export function getPresetsByPlatform(platform: string): ScenarioPreset[] {
  return SCENARIO_PRESETS.filter(preset => preset.platform === platform);
}

export function getPresetById(id: string): ScenarioPreset | undefined {
  return SCENARIO_PRESETS.find(preset => preset.id === id);
}
