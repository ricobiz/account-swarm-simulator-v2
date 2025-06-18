
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Youtube, Instagram, MessageCircle } from 'lucide-react';

interface ScenarioConfig {
  targetUrls: string[];
  searchQueries: string[];
  interactions: {
    likes: boolean;
    comments: boolean;
    follows: boolean;
    shares: boolean;
  };
  timing: {
    minViewTime: number;
    maxViewTime: number;
    pauseBetweenActions: number;
  };
  commentTemplates: string[];
  platformSpecific: Record<string, any>;
}

interface ScenarioConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: ScenarioConfig) => void;
  platform: string;
  templateName: string;
}

export const ScenarioConfigModal: React.FC<ScenarioConfigModalProps> = ({
  isOpen,
  onClose,
  onSave,
  platform,
  templateName
}) => {
  const [config, setConfig] = useState<ScenarioConfig>({
    targetUrls: [''],
    searchQueries: [''],
    interactions: {
      likes: true,
      comments: false,
      follows: false,
      shares: false
    },
    timing: {
      minViewTime: 30,
      maxViewTime: 120,
      pauseBetweenActions: 3
    },
    commentTemplates: [''],
    platformSpecific: {}
  });

  const addUrl = () => {
    setConfig(prev => ({
      ...prev,
      targetUrls: [...prev.targetUrls, '']
    }));
  };

  const removeUrl = (index: number) => {
    setConfig(prev => ({
      ...prev,
      targetUrls: prev.targetUrls.filter((_, i) => i !== index)
    }));
  };

  const updateUrl = (index: number, value: string) => {
    setConfig(prev => ({
      ...prev,
      targetUrls: prev.targetUrls.map((url, i) => i === index ? value : url)
    }));
  };

  const addSearchQuery = () => {
    setConfig(prev => ({
      ...prev,
      searchQueries: [...prev.searchQueries, '']
    }));
  };

  const removeSearchQuery = (index: number) => {
    setConfig(prev => ({
      ...prev,
      searchQueries: prev.searchQueries.filter((_, i) => i !== index)
    }));
  };

  const updateSearchQuery = (index: number, value: string) => {
    setConfig(prev => ({
      ...prev,
      searchQueries: prev.searchQueries.map((query, i) => i === index ? value : query)
    }));
  };

  const addCommentTemplate = () => {
    setConfig(prev => ({
      ...prev,
      commentTemplates: [...prev.commentTemplates, '']
    }));
  };

  const removeCommentTemplate = (index: number) => {
    setConfig(prev => ({
      ...prev,
      commentTemplates: prev.commentTemplates.filter((_, i) => i !== index)
    }));
  };

  const updateCommentTemplate = (index: number, value: string) => {
    setConfig(prev => ({
      ...prev,
      commentTemplates: prev.commentTemplates.map((template, i) => i === index ? value : template)
    }));
  };

  const getPlatformIcon = () => {
    switch (platform.toLowerCase()) {
      case 'youtube': return <Youtube className="h-5 w-5 text-red-500" />;
      case 'instagram': return <Instagram className="h-5 w-5 text-pink-500" />;
      case 'telegram': return <MessageCircle className="h-5 w-5 text-blue-500" />;
      default: return null;
    }
  };

  const getPlatformSpecificFields = () => {
    switch (platform.toLowerCase()) {
      case 'youtube':
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-white">Тип контента</Label>
              <Select 
                value={config.platformSpecific.contentType || 'any'}
                onValueChange={(value) => setConfig(prev => ({
                  ...prev,
                  platformSpecific: { ...prev.platformSpecific, contentType: value }
                }))}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="any">Любой</SelectItem>
                  <SelectItem value="shorts">Shorts</SelectItem>
                  <SelectItem value="long">Длинные видео</SelectItem>
                  <SelectItem value="live">Прямые эфиры</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white">Минимальная длительность (сек)</Label>
              <Input
                type="number"
                value={config.platformSpecific.minDuration || 0}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  platformSpecific: { ...prev.platformSpecific, minDuration: parseInt(e.target.value) }
                }))}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>
        );

      case 'instagram':
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-white">Тип поста</Label>
              <Select 
                value={config.platformSpecific.postType || 'any'}
                onValueChange={(value) => setConfig(prev => ({
                  ...prev,
                  platformSpecific: { ...prev.platformSpecific, postType: value }
                }))}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="any">Любой</SelectItem>
                  <SelectItem value="photo">Фото</SelectItem>
                  <SelectItem value="video">Видео</SelectItem>
                  <SelectItem value="reel">Reels</SelectItem>
                  <SelectItem value="story">Stories</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={config.platformSpecific.followHashtags || false}
                onCheckedChange={(checked) => setConfig(prev => ({
                  ...prev,
                  platformSpecific: { ...prev.platformSpecific, followHashtags: checked }
                }))}
              />
              <Label className="text-white">Искать по хештегам</Label>
            </div>
          </div>
        );

      case 'telegram':
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-white">Целевые каналы/группы</Label>
              <Textarea
                value={config.platformSpecific.targetChannels || ''}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  platformSpecific: { ...prev.platformSpecific, targetChannels: e.target.value }
                }))}
                placeholder="@channel1, @channel2..."
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={config.platformSpecific.joinGroups || false}
                onCheckedChange={(checked) => setConfig(prev => ({
                  ...prev,
                  platformSpecific: { ...prev.platformSpecific, joinGroups: checked }
                }))}
              />
              <Label className="text-white">Вступать в группы</Label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handleSave = () => {
    // Фильтруем пустые значения
    const cleanConfig = {
      ...config,
      targetUrls: config.targetUrls.filter(url => url.trim() !== ''),
      searchQueries: config.searchQueries.filter(query => query.trim() !== ''),
      commentTemplates: config.commentTemplates.filter(template => template.trim() !== '')
    };
    
    onSave(cleanConfig);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getPlatformIcon()}
            Настройка сценария: {templateName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Целевые URL */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-white">Целевые URL/ссылки</Label>
              <Button onClick={addUrl} size="sm" className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-1" />
                Добавить
              </Button>
            </div>
            <div className="space-y-2">
              {config.targetUrls.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={url}
                    onChange={(e) => updateUrl(index, e.target.value)}
                    placeholder={`https://${platform.toLowerCase()}.com/...`}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <Button
                    onClick={() => removeUrl(index)}
                    size="sm"
                    variant="outline"
                    className="border-red-600 text-red-400 hover:bg-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Поисковые запросы */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-white">Поисковые запросы</Label>
              <Button onClick={addSearchQuery} size="sm" className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-1" />
                Добавить
              </Button>
            </div>
            <div className="space-y-2">
              {config.searchQueries.map((query, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={query}
                    onChange={(e) => updateSearchQuery(index, e.target.value)}
                    placeholder="Ключевые слова для поиска..."
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <Button
                    onClick={() => removeSearchQuery(index)}
                    size="sm"
                    variant="outline"
                    className="border-red-600 text-red-400 hover:bg-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Взаимодействия */}
          <div>
            <Label className="text-white mb-3 block">Типы взаимодействий</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.interactions.likes}
                  onCheckedChange={(checked) => setConfig(prev => ({
                    ...prev,
                    interactions: { ...prev.interactions, likes: checked }
                  }))}
                />
                <Label className="text-white">Лайки</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.interactions.comments}
                  onCheckedChange={(checked) => setConfig(prev => ({
                    ...prev,
                    interactions: { ...prev.interactions, comments: checked }
                  }))}
                />
                <Label className="text-white">Комментарии</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.interactions.follows}
                  onCheckedChange={(checked) => setConfig(prev => ({
                    ...prev,
                    interactions: { ...prev.interactions, follows: checked }
                  }))}
                />
                <Label className="text-white">Подписки</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.interactions.shares}
                  onCheckedChange={(checked) => setConfig(prev => ({
                    ...prev,
                    interactions: { ...prev.interactions, shares: checked }
                  }))}
                />
                <Label className="text-white">Репосты</Label>
              </div>
            </div>
          </div>

          {/* Тайминги */}
          <div>
            <Label className="text-white mb-3 block">Настройки времени</Label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-sm text-gray-300">Мин. время просмотра (сек)</Label>
                <Input
                  type="number"
                  value={config.timing.minViewTime}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    timing: { ...prev.timing, minViewTime: parseInt(e.target.value) }
                  }))}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-sm text-gray-300">Макс. время просмотра (сек)</Label>
                <Input
                  type="number"
                  value={config.timing.maxViewTime}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    timing: { ...prev.timing, maxViewTime: parseInt(e.target.value) }
                  }))}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-sm text-gray-300">Пауза между действиями (сек)</Label>
                <Input
                  type="number"
                  value={config.timing.pauseBetweenActions}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    timing: { ...prev.timing, pauseBetweenActions: parseInt(e.target.value) }
                  }))}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
          </div>

          {/* Шаблоны комментариев */}
          {config.interactions.comments && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-white">Шаблоны комментариев</Label>
                <Button onClick={addCommentTemplate} size="sm" className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-1" />
                  Добавить
                </Button>
              </div>
              <div className="space-y-2">
                {config.commentTemplates.map((template, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={template}
                      onChange={(e) => updateCommentTemplate(index, e.target.value)}
                      placeholder="Текст комментария..."
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                    <Button
                      onClick={() => removeCommentTemplate(index)}
                      size="sm"
                      variant="outline"
                      className="border-red-600 text-red-400 hover:bg-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Специфичные настройки платформы */}
          {getPlatformSpecificFields() && (
            <div>
              <Label className="text-white mb-3 block">Настройки {platform}</Label>
              {getPlatformSpecificFields()}
            </div>
          )}

          {/* Кнопки действий */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-600">
            <Button onClick={onClose} variant="outline" className="border-gray-600 text-gray-300">
              Отмена
            </Button>
            <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
              Сохранить конфигурацию
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
