
import { Node, Edge } from '@xyflow/react';

export interface ScenarioPreset {
  id: string;
  name: string;
  description: string;
  category: string;
  nodes: Node[];
  edges: Edge[];
}

export const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    id: 'simple-form-fill',
    name: 'Заполнение формы',
    description: 'Простой сценарий заполнения веб-формы с именем и email',
    category: 'Формы',
    nodes: [
      {
        id: 'start',
        type: 'input',
        data: { label: 'Начало сценария' },
        position: { x: 250, y: 50 },
        style: { 
          background: '#4ade80', 
          color: 'white',
          border: '2px solid #22c55e',
          borderRadius: '8px'
        }
      },
      {
        id: 'navigate-1',
        type: 'action',
        data: {
          id: 'navigate-1',
          type: 'navigate',
          label: 'Переход по URL',
          icon: 'Navigation',
          config: {
            url: 'https://example.com/form',
            waitTime: 5
          },
          isConfigured: true
        },
        position: { x: 250, y: 150 }
      },
      {
        id: 'type-name',
        type: 'action',
        data: {
          id: 'type-name',
          type: 'type',
          label: 'Ввод имени',
          icon: 'Type',
          config: {
            selector: 'input[name="name"]',
            text: 'Иван Иванов',
            clearFirst: true
          },
          isConfigured: true
        },
        position: { x: 250, y: 250 }
      },
      {
        id: 'type-email',
        type: 'action',
        data: {
          id: 'type-email',
          type: 'type',
          label: 'Ввод email',
          icon: 'Type',
          config: {
            selector: 'input[name="email"]',
            text: 'ivan@example.com',
            clearFirst: true
          },
          isConfigured: true
        },
        position: { x: 250, y: 350 }
      },
      {
        id: 'submit-form',
        type: 'action',
        data: {
          id: 'submit-form',
          type: 'click',
          label: 'Отправить форму',
          icon: 'MousePointer',
          config: {
            selector: 'button[type="submit"]',
            delay: 1000
          },
          isConfigured: true
        },
        position: { x: 250, y: 450 }
      }
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'navigate-1', type: 'smoothstep' },
      { id: 'e2', source: 'navigate-1', target: 'type-name', type: 'smoothstep' },
      { id: 'e3', source: 'type-name', target: 'type-email', type: 'smoothstep' },
      { id: 'e4', source: 'type-email', target: 'submit-form', type: 'smoothstep' }
    ]
  },
  {
    id: 'data-extraction',
    name: 'Извлечение данных',
    description: 'Сценарий для извлечения данных с веб-страницы',
    category: 'Парсинг',
    nodes: [
      {
        id: 'start',
        type: 'input',
        data: { label: 'Начало сценария' },
        position: { x: 250, y: 50 },
        style: { 
          background: '#4ade80', 
          color: 'white',
          border: '2px solid #22c55e',
          borderRadius: '8px'
        }
      },
      {
        id: 'navigate-1',
        type: 'action',
        data: {
          id: 'navigate-1',
          type: 'navigate',
          label: 'Открыть страницу',
          icon: 'Navigation',
          config: {
            url: 'https://example.com/products',
            waitTime: 5
          },
          isConfigured: true
        },
        position: { x: 250, y: 150 }
      },
      {
        id: 'extract-title',
        type: 'action',
        data: {
          id: 'extract-title',
          type: 'extract',
          label: 'Извлечь заголовок',
          icon: 'Copy',
          config: {
            selector: 'h1',
            attribute: 'text',
            variableName: 'pageTitle'
          },
          isConfigured: true
        },
        position: { x: 150, y: 250 }
      },
      {
        id: 'extract-price',
        type: 'action',
        data: {
          id: 'extract-price',
          type: 'extract',
          label: 'Извлечь цену',
          icon: 'Copy',
          config: {
            selector: '.price',
            attribute: 'text',
            variableName: 'productPrice'
          },
          isConfigured: true
        },
        position: { x: 350, y: 250 }
      }
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'navigate-1', type: 'smoothstep' },
      { id: 'e2', source: 'navigate-1', target: 'extract-title', type: 'smoothstep' },
      { id: 'e3', source: 'navigate-1', target: 'extract-price', type: 'smoothstep' }
    ]
  },
  {
    id: 'social-media-posting',
    name: 'Публикация в соцсетях',
    description: 'Автоматическая публикация контента в социальных сетях',
    category: 'Социальные сети',
    nodes: [
      {
        id: 'start',
        type: 'input',
        data: { label: 'Начало сценария' },
        position: { x: 250, y: 50 },
        style: { 
          background: '#4ade80', 
          color: 'white',
          border: '2px solid #22c55e',
          borderRadius: '8px'
        }
      },
      {
        id: 'navigate-1',
        type: 'action',
        data: {
          id: 'navigate-1',
          type: 'navigate',
          label: 'Открыть соцсеть',
          icon: 'Navigation',
          config: {
            url: 'https://twitter.com',
            waitTime: 5
          },
          isConfigured: true
        },
        position: { x: 250, y: 150 }
      },
      {
        id: 'click-compose',
        type: 'action',
        data: {
          id: 'click-compose',
          type: 'click',
          label: 'Создать пост',
          icon: 'MousePointer',
          config: {
            selector: '[data-testid="SideNav_NewTweet_Button"]',
            delay: 1000
          },
          isConfigured: true
        },
        position: { x: 250, y: 250 }
      },
      {
        id: 'type-content',
        type: 'action',
        data: {
          id: 'type-content',
          type: 'type',
          label: 'Написать текст',
          icon: 'Type',
          config: {
            selector: '[data-testid="tweetTextarea_0"]',
            text: 'Это автоматически созданный пост! 🤖',
            clearFirst: true
          },
          isConfigured: true
        },
        position: { x: 250, y: 350 }
      },
      {
        id: 'publish',
        type: 'action',
        data: {
          id: 'publish',
          type: 'click',
          label: 'Опубликовать',
          icon: 'MousePointer',
          config: {
            selector: '[data-testid="tweetButtonInline"]',
            delay: 2000
          },
          isConfigured: true
        },
        position: { x: 250, y: 450 }
      }
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'navigate-1', type: 'smoothstep' },
      { id: 'e2', source: 'navigate-1', target: 'click-compose', type: 'smoothstep' },
      { id: 'e3', source: 'click-compose', target: 'type-content', type: 'smoothstep' },
      { id: 'e4', source: 'type-content', target: 'publish', type: 'smoothstep' }
    ]
  }
];
