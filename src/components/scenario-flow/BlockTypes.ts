
import { 
  Navigation, MousePointer, Type, Clock, Eye, Heart, MessageCircle, 
  UserPlus, Share, GitBranch, RotateCcw, Shuffle, Settings, Play, Pause,
  Upload, Download, Zap, Network, AlertCircle, CheckCircle
} from 'lucide-react';

export interface BlockConfig {
  [key: string]: {
    type: 'text' | 'number' | 'select' | 'boolean' | 'textarea' | 'url' | 'file';
    label: string;
    default: any;
    options?: string[];
    min?: number;
    max?: number;
    placeholder?: string;
    required?: boolean;
  };
}

export interface BlockType {
  id: string;
  name: string;
  category: 'navigation' | 'social' | 'interaction' | 'logic' | 'system' | 'timing';
  icon: React.ComponentType<any>;
  color: string;
  description: string;
  platforms: string[];
  config: BlockConfig;
  hasMultipleOutputs?: boolean;
  outputs?: { id: string; label: string; color: string }[];
}

export const BLOCK_TYPES: BlockType[] = [
  // Navigation blocks
  {
    id: 'navigate',
    name: 'Переход на сайт',
    category: 'navigation',
    icon: Navigation,
    color: 'bg-blue-600',
    description: 'Переход по URL адресу',
    platforms: ['all'],
    config: {
      url: { type: 'url', label: 'URL адрес', default: '', required: true, placeholder: 'https://example.com' },
      waitTime: { type: 'number', label: 'Время ожидания (сек)', default: 5, min: 1, max: 60 },
      newTab: { type: 'boolean', label: 'Открыть в новой вкладке', default: false }
    }
  },
  
  // Social blocks
  {
    id: 'like',
    name: 'Поставить лайк',
    category: 'social',
    icon: Heart,
    color: 'bg-red-600',
    description: 'Лайкнуть контент',
    platforms: ['youtube', 'tiktok', 'instagram', 'twitter'],
    config: {
      selector: { type: 'text', label: 'CSS селектор кнопки лайка', default: '', placeholder: '.like-button, [aria-label*="like"]' },
      checkIfLiked: { type: 'boolean', label: 'Проверить, не лайкнуто ли уже', default: true },
      delay: { type: 'number', label: 'Задержка (мс)', default: 1000, min: 100, max: 10000 }
    }
  },
  
  {
    id: 'subscribe',
    name: 'Подписаться',
    category: 'social',
    icon: UserPlus,
    color: 'bg-green-600',
    description: 'Подписаться на канал/аккаунт',
    platforms: ['youtube', 'tiktok', 'instagram', 'twitter'],
    config: {
      selector: { type: 'text', label: 'CSS селектор кнопки подписки', default: '', placeholder: '.subscribe-button' },
      checkIfSubscribed: { type: 'boolean', label: 'Проверить подписку', default: true },
      unfollowAfter: { type: 'number', label: 'Отписаться через (дней)', default: 0, min: 0, max: 365 }
    }
  },
  
  {
    id: 'comment',
    name: 'Написать комментарий',
    category: 'social',
    icon: MessageCircle,
    color: 'bg-purple-600',
    description: 'Оставить комментарий',
    platforms: ['youtube', 'instagram', 'twitter', 'reddit'],
    config: {
      text: { type: 'textarea', label: 'Текст комментария', default: '', required: true, placeholder: 'Введите текст комментария...' },
      textVariations: { type: 'textarea', label: 'Варианты текста (каждый с новой строки)', default: '', placeholder: 'Вариант 1\nВариант 2\nВариант 3' },
      selector: { type: 'text', label: 'CSS селектор поля ввода', default: '', placeholder: 'textarea, input[type="text"]' },
      submitSelector: { type: 'text', label: 'CSS селектор кнопки отправки', default: '', placeholder: 'button[type="submit"]' }
    }
  },
  
  {
    id: 'share',
    name: 'Поделиться/Репост',
    category: 'social',
    icon: Share,
    color: 'bg-indigo-600',
    description: 'Поделиться контентом',
    platforms: ['twitter', 'instagram', 'telegram'],
    config: {
      shareType: { type: 'select', label: 'Тип шеринга', default: 'repost', options: ['repost', 'quote', 'story'] },
      addComment: { type: 'boolean', label: 'Добавить комментарий', default: false },
      commentText: { type: 'text', label: 'Текст комментария', default: '', placeholder: 'Опциональный комментарий' }
    }
  },
  
  // Interaction blocks
  {
    id: 'click',
    name: 'Клик по элементу',
    category: 'interaction',
    icon: MousePointer,
    color: 'bg-orange-600',
    description: 'Кликнуть по элементу на странице',
    platforms: ['all'],
    config: {
      selector: { type: 'text', label: 'CSS селектор', default: '', required: true, placeholder: 'button, .class, #id' },
      waitForElement: { type: 'boolean', label: 'Ждать появления элемента', default: true },
      timeout: { type: 'number', label: 'Таймаут ожидания (мс)', default: 5000, min: 1000, max: 30000 },
      doubleClick: { type: 'boolean', label: 'Двойной клик', default: false }
    }
  },
  
  {
    id: 'type',
    name: 'Ввод текста',
    category: 'interaction',
    icon: Type,
    color: 'bg-teal-600',
    description: 'Ввести текст в поле',
    platforms: ['all'],
    config: {
      selector: { type: 'text', label: 'CSS селектор поля', default: '', required: true, placeholder: 'input, textarea' },
      text: { type: 'textarea', label: 'Текст для ввода', default: '', required: true },
      clearFirst: { type: 'boolean', label: 'Очистить поле сначала', default: true },
      typeSpeed: { type: 'number', label: 'Скорость печати (мс между символами)', default: 50, min: 10, max: 500 }
    }
  },
  
  {
    id: 'view',
    name: 'Просмотр контента',
    category: 'interaction',
    icon: Eye,
    color: 'bg-pink-600',
    description: 'Просмотреть контент определенное время',
    platforms: ['youtube', 'tiktok', 'instagram'],
    config: {
      viewTime: { type: 'number', label: 'Время просмотра (сек)', default: 30, min: 5, max: 300 },
      scrollBehavior: { type: 'select', label: 'Поведение прокрутки', default: 'random', options: ['none', 'random', 'full', 'smooth'] },
      interactions: { type: 'boolean', label: 'Случайные взаимодействия', default: false }
    }
  },
  
  // Logic blocks
  {
    id: 'condition',
    name: 'Условие (If/Else)',
    category: 'logic',
    icon: GitBranch,
    color: 'bg-yellow-600',
    description: 'Проверить условие и выбрать путь',
    platforms: ['all'],
    hasMultipleOutputs: true,
    outputs: [
      { id: 'true', label: 'Да', color: 'bg-green-500' },
      { id: 'false', label: 'Нет', color: 'bg-red-500' }
    ],
    config: {
      conditionType: { type: 'select', label: 'Тип условия', default: 'element_exists', options: ['element_exists', 'element_visible', 'text_contains', 'url_contains', 'random_chance'] },
      selector: { type: 'text', label: 'CSS селектор (для проверки элемента)', default: '', placeholder: '.element-to-check' },
      textToCheck: { type: 'text', label: 'Текст для поиска', default: '', placeholder: 'Текст на странице' },
      urlPattern: { type: 'text', label: 'Шаблон URL', default: '', placeholder: 'example.com' },
      randomChance: { type: 'number', label: 'Вероятность выполнения (%)', default: 50, min: 1, max: 100 }
    }
  },
  
  {
    id: 'loop',
    name: 'Цикл',
    category: 'logic',
    icon: RotateCcw,
    color: 'bg-indigo-600',
    description: 'Повторить действия несколько раз',
    platforms: ['all'],
    config: {
      loopType: { type: 'select', label: 'Тип цикла', default: 'count', options: ['count', 'while_element', 'while_not_element'] },
      count: { type: 'number', label: 'Количество повторений', default: 3, min: 1, max: 100 },
      selector: { type: 'text', label: 'CSS селектор для условия', default: '', placeholder: '.element-to-check' },
      maxIterations: { type: 'number', label: 'Максимум итераций', default: 10, min: 1, max: 1000 }
    }
  },
  
  // System blocks
  {
    id: 'proxy_change',
    name: 'Смена прокси',
    category: 'system',
    icon: Shuffle,
    color: 'bg-gray-600',
    description: 'Сменить прокси-сервер',
    platforms: ['all'],
    config: {
      proxyType: { type: 'select', label: 'Тип прокси', default: 'random', options: ['random', 'next_in_list', 'specific'] },
      proxyId: { type: 'text', label: 'ID конкретного прокси', default: '', placeholder: 'proxy-123' },
      testConnection: { type: 'boolean', label: 'Тестировать соединение', default: true }
    }
  },
  
  {
    id: 'account_switch',
    name: 'Смена аккаунта',
    category: 'system',
    icon: Settings,
    color: 'bg-slate-600',
    description: 'Переключиться на другой аккаунт',
    platforms: ['all'],
    config: {
      accountSelection: { type: 'select', label: 'Выбор аккаунта', default: 'next', options: ['next', 'random', 'specific'] },
      accountId: { type: 'text', label: 'ID конкретного аккаунта', default: '', placeholder: 'account-123' },
      logoutFirst: { type: 'boolean', label: 'Выйти из текущего аккаунта', default: true }
    }
  },
  
  // Timing blocks
  {
    id: 'wait',
    name: 'Пауза',
    category: 'timing',
    icon: Clock,
    color: 'bg-amber-600',
    description: 'Пауза в выполнении',
    platforms: ['all'],
    config: {
      waitType: { type: 'select', label: 'Тип ожидания', default: 'fixed', options: ['fixed', 'random', 'element', 'load'] },
      minTime: { type: 'number', label: 'Мин. время (мс)', default: 1000, min: 100, max: 300000 },
      maxTime: { type: 'number', label: 'Макс. время (мс)', default: 3000, min: 100, max: 300000 },
      selector: { type: 'text', label: 'CSS селектор элемента', default: '', placeholder: '.element-to-wait-for' }
    }
  },
  
  {
    id: 'wait_random',
    name: 'Случайная пауза',
    category: 'timing',
    icon: Pause,
    color: 'bg-orange-500',
    description: 'Случайная пауза для имитации человека',
    platforms: ['all'],
    config: {
      minTime: { type: 'number', label: 'Мин. время (сек)', default: 1, min: 1, max: 300 },
      maxTime: { type: 'number', label: 'Макс. время (сек)', default: 5, min: 1, max: 300 },
      humanBehavior: { type: 'boolean', label: 'Имитация человеческого поведения', default: true }
    }
  }
];

export const BLOCK_CATEGORIES = [
  { id: 'navigation', name: 'Навигация', color: 'bg-blue-100' },
  { id: 'social', name: 'Социальные действия', color: 'bg-red-100' },
  { id: 'interaction', name: 'Взаимодействие', color: 'bg-green-100' },
  { id: 'logic', name: 'Логика', color: 'bg-yellow-100' },
  { id: 'system', name: 'Система', color: 'bg-gray-100' },
  { id: 'timing', name: 'Тайминг', color: 'bg-orange-100' }
];

export function getBlockTypeById(id: string): BlockType | undefined {
  return BLOCK_TYPES.find(type => type.id === id);
}

export function getBlocksByCategory(category: string): BlockType[] {
  return BLOCK_TYPES.filter(type => type.category === category);
}

export function getBlocksByPlatform(platform: string): BlockType[] {
  return BLOCK_TYPES.filter(type => 
    type.platforms.includes('all') || type.platforms.includes(platform)
  );
}
