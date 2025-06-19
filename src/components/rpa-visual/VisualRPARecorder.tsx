
import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Play, 
  Square, 
  MousePointer, 
  Type, 
  Eye, 
  Download, 
  Upload,
  Trash2,
  Settings,
  Target,
  Hand
} from 'lucide-react';

interface RecordedAction {
  id: string;
  type: 'click' | 'type' | 'wait' | 'scroll' | 'hover';
  element: {
    x: number;
    y: number;
    selector?: string;
    text?: string;
    description: string;
  };
  value?: string;
  delay?: number;
  timestamp: number;
}

interface VisualRPARecorderProps {
  onSaveScenario: (actions: RecordedAction[]) => void;
}

export const VisualRPARecorder: React.FC<VisualRPARecorderProps> = ({
  onSaveScenario
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [actions, setActions] = useState<RecordedAction[]>([]);
  const [currentUrl, setCurrentUrl] = useState('');
  const [recordingMode, setRecordingMode] = useState<'click' | 'type' | 'hover'>('click');
  const [overlay, setOverlay] = useState<{ show: boolean; x: number; y: number }>({ 
    show: false, 
    x: 0, 
    y: 0 
  });
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();

  const startRecording = useCallback(() => {
    if (!currentUrl) {
      toast({
        title: "Ошибка",
        description: "Введите URL сайта для записи",
        variant: "destructive"
      });
      return;
    }

    setIsRecording(true);
    setActions([]);
    
    toast({
      title: "Запись началась",
      description: "Кликайте по элементам для записи действий"
    });
  }, [currentUrl, toast]);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    setOverlay({ show: false, x: 0, y: 0 });
    
    toast({
      title: "Запись завершена",
      description: `Записано ${actions.length} действий`
    });
  }, [actions.length, toast]);

  const handleIframeClick = useCallback((event: React.MouseEvent<HTMLIFrameElement>) => {
    if (!isRecording) return;

    event.preventDefault();
    const rect = iframeRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Показываем overlay для подтверждения
    setOverlay({ show: true, x, y });
  }, [isRecording]);

  const confirmAction = useCallback((description: string, actionType?: 'click' | 'type' | 'hover') => {
    const newAction: RecordedAction = {
      id: `action_${Date.now()}`,
      type: actionType || recordingMode,
      element: {
        x: overlay.x,
        y: overlay.y,
        description
      },
      timestamp: Date.now()
    };

    setActions(prev => [...prev, newAction]);
    setOverlay({ show: false, x: 0, y: 0 });

    toast({
      title: "Действие записано",
      description: `${description} (${newAction.type})`
    });
  }, [overlay, recordingMode, toast]);

  const removeAction = useCallback((actionId: string) => {
    setActions(prev => prev.filter(action => action.id !== actionId));
  }, []);

  const clearAllActions = useCallback(() => {
    setActions([]);
    toast({
      title: "Все действия удалены",
      description: "Список действий очищен"
    });
  }, [toast]);

  const saveScenario = useCallback(() => {
    if (actions.length === 0) {
      toast({
        title: "Нет действий",
        description: "Запишите хотя бы одно действие",
        variant: "destructive"
      });
      return;
    }

    onSaveScenario(actions);
    toast({
      title: "Сценарий сохранен",
      description: `Сохранено ${actions.length} действий`
    });
  }, [actions, onSaveScenario, toast]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Панель управления */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="h-5 w-5" />
            Визуальный рекордер RPA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* URL ввод */}
          <div className="space-y-2">
            <label className="text-sm text-gray-300">URL сайта:</label>
            <Input
              value={currentUrl}
              onChange={(e) => setCurrentUrl(e.target.value)}
              placeholder="https://example.com"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          {/* Режим записи */}
          <div className="space-y-2">
            <label className="text-sm text-gray-300">Режим записи:</label>
            <div className="flex gap-2">
              <Button
                variant={recordingMode === 'click' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRecordingMode('click')}
                className="flex-1"
              >
                <MousePointer className="h-4 w-4 mr-1" />
                Клик
              </Button>
              <Button
                variant={recordingMode === 'type' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRecordingMode('type')}
                className="flex-1"
              >
                <Type className="h-4 w-4 mr-1" />
                Ввод
              </Button>
              <Button
                variant={recordingMode === 'hover' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRecordingMode('hover')}
                className="flex-1"
              >
                <Hand className="h-4 w-4 mr-1" />
                Наведение
              </Button>
            </div>
          </div>

          {/* Управление записью */}
          <div className="flex gap-2">
            {!isRecording ? (
              <Button onClick={startRecording} className="flex-1 bg-green-600 hover:bg-green-700">
                <Play className="h-4 w-4 mr-2" />
                Начать запись
              </Button>
            ) : (
              <Button onClick={stopRecording} className="flex-1 bg-red-600 hover:bg-red-700">
                <Square className="h-4 w-4 mr-2" />
                Остановить
              </Button>
            )}
          </div>

          <Separator className="bg-gray-600" />

          {/* Записанные действия */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-300">
                Записанные действия ({actions.length})
              </label>
              {actions.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllActions}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {actions.map((action, index) => (
                <div
                  key={action.id}
                  className="flex items-center justify-between p-2 bg-gray-700 rounded border border-gray-600"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {index + 1}
                    </Badge>
                    <div className="text-sm">
                      <div className="text-white font-medium">{action.element.description}</div>
                      <div className="text-gray-400 text-xs">
                        {action.type} • ({action.element.x}, {action.element.y})
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAction(action.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Сохранение */}
          <Button
            onClick={saveScenario}
            disabled={actions.length === 0}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Сохранить сценарий
          </Button>
        </CardContent>
      </Card>

      {/* Предварительный просмотр */}
      <Card className="bg-gray-800 border-gray-700 relative">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Предварительный просмотр
            {isRecording && (
              <Badge variant="destructive" className="ml-auto">
                Запись активна
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 relative">
          {currentUrl ? (
            <div className="relative">
              <iframe
                ref={iframeRef}
                src={currentUrl}
                className="w-full h-96 border-0"
                onClick={handleIframeClick}
                style={{ pointerEvents: isRecording ? 'auto' : 'none' }}
              />
              
              {/* Overlay для подтверждения действия */}
              {overlay.show && (
                <div
                  className="absolute z-10 bg-black bg-opacity-75 p-4 rounded border border-purple-500"
                  style={{
                    left: overlay.x - 100,
                    top: overlay.y - 50,
                  }}
                >
                  <div className="text-white text-sm mb-2">
                    Описание действия:
                  </div>
                  <Input
                    placeholder="Например: Кнопка 'Войти'"
                    className="mb-2 text-sm"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        confirmAction((e.target as HTMLInputElement).value);
                      }
                    }}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        const input = document.querySelector('input[placeholder="Например: Кнопка \'Войти\'"]') as HTMLInputElement;
                        confirmAction(input?.value || 'Элемент');
                      }}
                    >
                      Сохранить
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setOverlay({ show: false, x: 0, y: 0 })}
                    >
                      Отмена
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-96 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Введите URL для начала записи</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
