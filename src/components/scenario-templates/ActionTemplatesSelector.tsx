
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Heart, MessageCircle, Share, UserPlus, PlayCircle, TrendingUp } from 'lucide-react';

export interface ActionTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  category: string;
  platforms: string[];
  settings: {
    [key: string]: {
      type: 'number' | 'text' | 'select' | 'boolean';
      label: string;
      default: any;
      options?: string[];
      min?: number;
      max?: number;
    };
  };
}

const ACTION_TEMPLATES: ActionTemplate[] = [
  {
    id: 'content_views',
    name: 'Добавить просмотры',
    description: 'Автоматический просмотр контента с естественным поведением',
    icon: Eye,
    category: 'Раскрутка',
    platforms: ['youtube', 'tiktok', 'instagram'],
    settings: {
      viewsCount: { type: 'number', label: 'Количество просмотров', default: 10, min: 1, max: 100 },
      watchTime: { type: 'number', label: 'Время просмотра (сек)', default: 30, min: 5, max: 300 },
      interactionChance: { type: 'number', label: 'Шанс взаимодействия (%)', default: 20, min: 0, max: 100 }
    }
  },
  {
    id: 'likes_generation',
    name: 'Генерация лайков',
    description: 'Автоматическое проставление лайков на контент',
    icon: Heart,
    category: 'Взаимодействие',
    platforms: ['youtube', 'tiktok', 'instagram', 'twitter'],
    settings: {
      likesCount: { type: 'number', label: 'Количество лайков', default: 5, min: 1, max: 50 },
      delay: { type: 'number', label: 'Задержка между лайками (сек)', default: 10, min: 1, max: 60 },
      targetType: { type: 'select', label: 'Тип контента', default: 'recent', options: ['recent', 'popular', 'specific'] }
    }
  },
  {
    id: 'comments_posting',
    name: 'Написание комментариев',
    description: 'Автоматическое создание и публикация комментариев',
    icon: MessageCircle,
    category: 'Взаимодействие',
    platforms: ['youtube', 'instagram', 'twitter', 'reddit'],
    settings: {
      commentsCount: { type: 'number', label: 'Количество комментариев', default: 3, min: 1, max: 20 },
      commentStyle: { type: 'select', label: 'Стиль комментариев', default: 'positive', options: ['positive', 'neutral', 'questions', 'emojis'] },
      customText: { type: 'text', label: 'Свой текст (опционально)', default: '' }
    }
  },
  {
    id: 'content_sharing',
    name: 'Репосты/Шеринг',
    description: 'Автоматическое распространение контента',
    icon: Share,
    category: 'Раскрутка',
    platforms: ['twitter', 'instagram', 'telegram'],
    settings: {
      sharesCount: { type: 'number', label: 'Количество репостов', default: 5, min: 1, max: 30 },
      addComment: { type: 'boolean', label: 'Добавлять комментарий к репосту', default: true },
      shareDelay: { type: 'number', label: 'Задержка между репостами (мин)', default: 15, min: 1, max: 120 }
    }
  },
  {
    id: 'followers_growth',
    name: 'Набор подписчиков',
    description: 'Автоматическая подписка на целевые аккаунты',
    icon: UserPlus,
    category: 'Рост аудитории',
    platforms: ['instagram', 'twitter', 'tiktok'],
    settings: {
      followsCount: { type: 'number', label: 'Количество подписок', default: 20, min: 1, max: 100 },
      targetCriteria: { type: 'select', label: 'Критерий выбора', default: 'similar', options: ['similar', 'competitors', 'hashtags', 'location'] },
      unfollowAfter: { type: 'number', label: 'Отписаться через (дней)', default: 7, min: 1, max: 30 }
    }
  },
  {
    id: 'content_consumption',
    name: 'Просмотр контента',
    description: 'Естественное потребление контента для активности',
    icon: PlayCircle,
    category: 'Активность',
    platforms: ['youtube', 'tiktok', 'instagram'],
    settings: {
      sessionTime: { type: 'number', label: 'Время сессии (мин)', default: 30, min: 5, max: 120 },
      contentType: { type: 'select', label: 'Тип контента', default: 'recommended', options: ['recommended', 'trending', 'subscriptions', 'specific'] },
      interactionRate: { type: 'number', label: 'Активность взаимодействий (%)', default: 15, min: 0, max: 50 }
    }
  },
  {
    id: 'trending_engagement',
    name: 'Работа с трендами',
    description: 'Взаимодействие с трендовым контентом',
    icon: TrendingUp,
    category: 'Раскрутка',
    platforms: ['tiktok', 'instagram', 'twitter'],
    settings: {
      trendsCount: { type: 'number', label: 'Количество трендов', default: 5, min: 1, max: 20 },
      engagementType: { type: 'select', label: 'Тип взаимодействия', default: 'mixed', options: ['likes', 'comments', 'shares', 'mixed'] },
      timeWindow: { type: 'select', label: 'Временное окно', default: 'recent', options: ['recent', 'last_hour', 'today', 'this_week'] }
    }
  }
];

interface ActionTemplatesSelectorProps {
  platform: string;
  onAddAction: (action: any) => void;
}

export const ActionTemplatesSelector: React.FC<ActionTemplatesSelectorProps> = ({
  platform,
  onAddAction
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ActionTemplate | null>(null);
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(ACTION_TEMPLATES.map(t => t.category)))];
  
  const filteredTemplates = ACTION_TEMPLATES.filter(template => {
    const platformMatch = !platform || template.platforms.includes(platform);
    const categoryMatch = activeCategory === 'all' || template.category === activeCategory;
    return platformMatch && categoryMatch;
  });

  const handleTemplateSelect = (template: ActionTemplate) => {
    setSelectedTemplate(template);
    // Устанавливаем дефолтные значения
    const defaultSettings: Record<string, any> = {};
    Object.entries(template.settings).forEach(([key, setting]) => {
      defaultSettings[key] = setting.default;
    });
    setSettings(defaultSettings);
  };

  const handleAddAction = () => {
    if (!selectedTemplate) return;

    const action = {
      id: `${selectedTemplate.id}_${Date.now()}`,
      templateId: selectedTemplate.id,
      name: selectedTemplate.name,
      description: selectedTemplate.description,
      category: selectedTemplate.category,
      settings: { ...settings },
      type: 'template'
    };

    onAddAction(action);
    setSelectedTemplate(null);
    setSettings({});
  };

  const renderSettingInput = (key: string, setting: any) => {
    const value = settings[key] || setting.default;

    switch (setting.type) {
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => setSettings({ ...settings, [key]: parseInt(e.target.value) || setting.default })}
            min={setting.min}
            max={setting.max}
            className="bg-gray-700 border-gray-600 text-white"
          />
        );
      case 'text':
        return (
          <Textarea
            value={value}
            onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
            className="bg-gray-700 border-gray-600 text-white"
            rows={3}
          />
        );
      case 'select':
        return (
          <Select value={value} onValueChange={(newValue) => setSettings({ ...settings, [key]: newValue })}>
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              {setting.options?.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'boolean':
        return (
          <Button
            variant={value ? "default" : "outline"}
            onClick={() => setSettings({ ...settings, [key]: !value })}
            className="w-full"
          >
            {value ? 'Включено' : 'Выключено'}
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Готовые шаблоны действий</CardTitle>
          <p className="text-gray-400">Выберите готовые блоки для автоматизации</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Фильтр по категориям */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(category)}
                className="capitalize"
              >
                {category === 'all' ? 'Все' : category}
              </Button>
            ))}
          </div>

          {/* Список шаблонов */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map(template => {
              const IconComponent = template.icon;
              return (
                <Card
                  key={template.id}
                  className={`cursor-pointer transition-all border-2 ${
                    selectedTemplate?.id === template.id
                      ? 'border-blue-500 bg-blue-900/20'
                      : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                  }`}
                  onClick={() => handleTemplateSelect(template)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-blue-600/20">
                        <IconComponent className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium text-sm mb-1">
                          {template.name}
                        </h3>
                        <p className="text-gray-400 text-xs mb-2">
                          {template.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs">
                            {template.category}
                          </Badge>
                          {template.platforms.map(p => (
                            <Badge key={p} variant="secondary" className="text-xs">
                              {p}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Настройки выбранного шаблона */}
      {selectedTemplate && (
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <selectedTemplate.icon className="h-5 w-5 text-blue-400" />
              Настройки: {selectedTemplate.name}
            </CardTitle>
            <p className="text-gray-400">{selectedTemplate.description}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(selectedTemplate.settings).map(([key, setting]) => (
              <div key={key} className="space-y-1">
                <label className="text-sm font-medium text-gray-300">
                  {setting.label}
                </label>
                {renderSettingInput(key, setting)}
              </div>
            ))}

            <div className="flex gap-2 pt-4 border-t border-gray-700">
              <Button
                onClick={handleAddAction}
                className="bg-blue-500 hover:bg-blue-600 flex-1"
              >
                Добавить действие
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedTemplate(null)}
              >
                Отмена
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
