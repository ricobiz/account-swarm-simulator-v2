
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Settings } from 'lucide-react';
import type { RPAAction } from '@/types/rpa';

interface RPABlockConfigProps {
  config: {
    executeViaRPA?: boolean;
    url?: string;
    actions?: RPAAction[];
    timeout?: number;
  };
  onConfigChange: (config: any) => void;
}

export const RPABlockConfig: React.FC<RPABlockConfigProps> = ({ config, onConfigChange }) => {
  const [actions, setActions] = useState<RPAAction[]>(config.actions || []);

  const addAction = () => {
    const newAction: RPAAction = {
      type: 'click',
      x: 500,
      y: 300
    };
    const updatedActions = [...actions, newAction];
    setActions(updatedActions);
    onConfigChange({ ...config, actions: updatedActions });
  };

  const updateAction = (index: number, action: RPAAction) => {
    const updatedActions = actions.map((a, i) => i === index ? action : a);
    setActions(updatedActions);
    onConfigChange({ ...config, actions: updatedActions });
  };

  const removeAction = (index: number) => {
    const updatedActions = actions.filter((_, i) => i !== index);
    setActions(updatedActions);
    onConfigChange({ ...config, actions: updatedActions });
  };

  const getActionTypeText = (type: RPAAction['type']) => {
    switch (type) {
      case 'move': return 'Движение мыши';
      case 'click': return 'Клик мыши';
      case 'type': return 'Ввод текста';
      case 'wait': return 'Ожидание';
      case 'scroll': return 'Прокрутка';
      case 'key': return 'Нажатие клавиши';
      default: return type;
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Settings className="h-5 w-5 text-orange-400" />
          Настройки RPA блока
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">Выполнить через RPA</label>
          <Switch
            checked={config.executeViaRPA || false}
            onCheckedChange={(checked) => onConfigChange({ ...config, executeViaRPA: checked })}
          />
        </div>

        {config.executeViaRPA && (
          <>
            <div>
              <label className="text-sm font-medium text-gray-300">URL страницы</label>
              <Input
                value={config.url || ''}
                onChange={(e) => onConfigChange({ ...config, url: e.target.value })}
                placeholder="https://example.com"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300">Таймаут (мс)</label>
              <Input
                type="number"
                value={config.timeout || 60000}
                onChange={(e) => onConfigChange({ ...config, timeout: parseInt(e.target.value) })}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">Действия RPA</label>
                <Button onClick={addAction} size="sm" className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-1" />
                  Добавить
                </Button>
              </div>

              {actions.map((action, index) => (
                <div key={index} className="bg-gray-900 p-3 rounded border border-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-orange-400 border-orange-400">
                      {getActionTypeText(action.type)}
                    </Badge>
                    <Button
                      onClick={() => removeAction(index)}
                      size="sm"
                      variant="outline"
                      className="border-red-600 text-red-400 hover:bg-red-900"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-400">Тип действия</label>
                      <Select
                        value={action.type}
                        onValueChange={(value) => updateAction(index, { ...action, type: value as RPAAction['type'] })}
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="move">Движение мыши</SelectItem>
                          <SelectItem value="click">Клик мыши</SelectItem>
                          <SelectItem value="type">Ввод текста</SelectItem>
                          <SelectItem value="wait">Ожидание</SelectItem>
                          <SelectItem value="scroll">Прокрутка</SelectItem>
                          <SelectItem value="key">Нажатие клавиши</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {(action.type === 'move' || action.type === 'click') && (
                      <>
                        <div>
                          <label className="text-xs text-gray-400">X координата</label>
                          <Input
                            type="number"
                            value={action.x || 0}
                            onChange={(e) => updateAction(index, { ...action, x: parseInt(e.target.value) })}
                            className="bg-gray-700 border-gray-600 text-white h-8"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400">Y координата</label>
                          <Input
                            type="number"
                            value={action.y || 0}
                            onChange={(e) => updateAction(index, { ...action, y: parseInt(e.target.value) })}
                            className="bg-gray-700 border-gray-600 text-white h-8"
                          />
                        </div>
                      </>
                    )}

                    {action.type === 'click' && (
                      <div>
                        <label className="text-xs text-gray-400">Кнопка мыши</label>
                        <Select
                          value={action.button || 'left'}
                          onValueChange={(value) => updateAction(index, { ...action, button: value as 'left' | 'right' | 'middle' })}
                        >
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-600">
                            <SelectItem value="left">Левая</SelectItem>
                            <SelectItem value="right">Правая</SelectItem>
                            <SelectItem value="middle">Средняя</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {action.type === 'type' && (
                      <div className="col-span-2">
                        <label className="text-xs text-gray-400">Текст для ввода</label>
                        <Textarea
                          value={action.text || ''}
                          onChange={(e) => updateAction(index, { ...action, text: e.target.value })}
                          className="bg-gray-700 border-gray-600 text-white"
                          rows={2}
                        />
                      </div>
                    )}

                    {action.type === 'wait' && (
                      <div>
                        <label className="text-xs text-gray-400">Длительность (мс)</label>
                        <Input
                          type="number"
                          value={action.duration || 1000}
                          onChange={(e) => updateAction(index, { ...action, duration: parseInt(e.target.value) })}
                          className="bg-gray-700 border-gray-600 text-white h-8"
                        />
                      </div>
                    )}

                    {action.type === 'scroll' && (
                      <>
                        <div>
                          <label className="text-xs text-gray-400">X прокрутка</label>
                          <Input
                            type="number"
                            value={action.x || 0}
                            onChange={(e) => updateAction(index, { ...action, x: parseInt(e.target.value) })}
                            className="bg-gray-700 border-gray-600 text-white h-8"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400">Y прокрутка</label>
                          <Input
                            type="number"
                            value={action.y || 0}
                            onChange={(e) => updateAction(index, { ...action, y: parseInt(e.target.value) })}
                            className="bg-gray-700 border-gray-600 text-white h-8"
                          />
                        </div>
                      </>
                    )}

                    {action.type === 'key' && (
                      <div>
                        <label className="text-xs text-gray-400">Клавиша</label>
                        <Input
                          value={action.key || ''}
                          onChange={(e) => updateAction(index, { ...action, key: e.target.value })}
                          placeholder="Enter, Space, Tab..."
                          className="bg-gray-700 border-gray-600 text-white h-8"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {actions.length === 0 && (
                <div className="text-center py-4 text-gray-400 border-2 border-dashed border-gray-600 rounded">
                  <p className="text-sm">Нет действий RPA</p>
                  <p className="text-xs">Нажмите "Добавить" чтобы создать первое действие</p>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
