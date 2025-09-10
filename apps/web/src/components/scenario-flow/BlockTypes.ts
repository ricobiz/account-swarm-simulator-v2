
import { 
  MousePointer, 
  Type, 
  Navigation, 
  Clock, 
  Eye, 
  Scroll,
  Download,
  Upload,
  Search,
  Copy,
  Scissors,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  RotateCcw,
  Keyboard,
  Monitor,
  Smartphone,
  Wifi,
  Database,
  Code,
  Globe
} from 'lucide-react';

export interface BlockType {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: string;
  platforms: string[];
  color: string;
  config: Record<string, any>;
  hasMultipleOutputs?: boolean;
  outputs?: Array<{
    id: string;
    label: string;
    color: string;
  }>;
}

export const BLOCK_CATEGORIES = [
  { id: 'basic', name: 'Основные действия', color: 'bg-blue-500' },
  { id: 'navigation', name: 'Навигация', color: 'bg-green-500' },
  { id: 'input', name: 'Ввод данных', color: 'bg-purple-500' },
  { id: 'data', name: 'Работа с данными', color: 'bg-orange-500' },
  { id: 'logic', name: 'Логика и условия', color: 'bg-red-500' },
  { id: 'system', name: 'Системные', color: 'bg-gray-500' }
];

export const BLOCK_TYPES: BlockType[] = [
  // Основные действия
  {
    id: 'click',
    name: 'Клик мышью',
    description: 'Клик по элементу на странице',
    icon: MousePointer,
    category: 'basic',
    platforms: ['all'],
    color: 'bg-blue-500',
    config: {
      selector: {
        type: 'text',
        label: 'CSS селектор',
        placeholder: 'button, .class, #id',
        required: true
      },
      delay: {
        type: 'number',
        label: 'Задержка (мс)',
        default: 1000,
        min: 100,
        max: 10000
      }
    }
  },
  {
    id: 'type',
    name: 'Ввод текста',
    description: 'Ввод текста в поле',
    icon: Type,
    category: 'input',
    platforms: ['all'],
    color: 'bg-purple-500',
    config: {
      selector: {
        type: 'text',
        label: 'CSS селектор поля',
        placeholder: 'input, textarea',
        required: true
      },
      text: {
        type: 'textarea',
        label: 'Текст для ввода',
        placeholder: 'Введите текст...',
        required: true
      },
      clearFirst: {
        type: 'boolean',
        label: 'Очистить поле перед вводом',
        default: true
      }
    }
  },
  {
    id: 'navigate',
    name: 'Переход по URL',
    description: 'Переход на указанную страницу',
    icon: Navigation,
    category: 'navigation',
    platforms: ['all'],
    color: 'bg-green-500',
    config: {
      url: {
        type: 'url',
        label: 'URL адрес',
        placeholder: 'https://example.com',
        required: true
      },
      waitTime: {
        type: 'number',
        label: 'Время ожидания (сек)',
        default: 5,
        min: 1,
        max: 60
      }
    }
  },
  {
    id: 'wait',
    name: 'Ожидание',
    description: 'Пауза в выполнении сценария',
    icon: Clock,
    category: 'basic',
    platforms: ['all'],
    color: 'bg-orange-500',
    config: {
      duration: {
        type: 'number',
        label: 'Длительность (мс)',
        default: 2000,
        min: 100,
        max: 60000
      },
      waitFor: {
        type: 'select',
        label: 'Ожидать',
        options: ['time', 'element', 'text'],
        default: 'time'
      }
    }
  },
  {
    id: 'scroll',
    name: 'Прокрутка',
    description: 'Прокрутка страницы',
    icon: Scroll,
    category: 'navigation',
    platforms: ['all'],
    color: 'bg-cyan-500',
    config: {
      direction: {
        type: 'select',
        label: 'Направление',
        options: ['down', 'up', 'to-element'],
        default: 'down'
      },
      amount: {
        type: 'number',
        label: 'Количество пикселей',
        default: 500,
        min: 100
      }
    }
  },
  {
    id: 'extract',
    name: 'Извлечь данные',
    description: 'Извлечение текста или атрибутов',
    icon: Copy,
    category: 'data',
    platforms: ['all'],
    color: 'bg-yellow-500',
    config: {
      selector: {
        type: 'text',
        label: 'CSS селектор',
        required: true
      },
      attribute: {
        type: 'select',
        label: 'Извлекать',
        options: ['text', 'href', 'src', 'value'],
        default: 'text'
      },
      variableName: {
        type: 'text',
        label: 'Имя переменной',
        required: true
      }
    }
  },
  {
    id: 'condition',
    name: 'Условие',
    description: 'Проверка условия (if/else)',
    icon: AlertCircle,
    category: 'logic',
    platforms: ['all'],
    color: 'bg-red-500',
    hasMultipleOutputs: true,
    outputs: [
      { id: 'true', label: 'Да', color: 'bg-green-500' },
      { id: 'false', label: 'Нет', color: 'bg-red-500' }
    ],
    config: {
      condition: {
        type: 'select',
        label: 'Тип условия',
        options: ['element-exists', 'text-contains', 'url-contains'],
        default: 'element-exists'
      },
      selector: {
        type: 'text',
        label: 'CSS селектор / Текст',
        required: true
      }
    }
  },
  {
    id: 'loop',
    name: 'Цикл',
    description: 'Повторение действий',
    icon: RefreshCw,
    category: 'logic',
    platforms: ['all'],
    color: 'bg-pink-500',
    config: {
      type: {
        type: 'select',
        label: 'Тип цикла',
        options: ['count', 'while-element'],
        default: 'count'
      },
      count: {
        type: 'number',
        label: 'Количество повторений',
        default: 3,
        min: 1,
        max: 100
      }
    }
  }
];

export const getBlockTypeById = (id: string): BlockType | undefined => {
  return BLOCK_TYPES.find(block => block.id === id);
};
