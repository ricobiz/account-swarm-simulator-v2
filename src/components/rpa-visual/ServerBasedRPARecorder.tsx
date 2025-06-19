
import React, { useState, useCallback, useRef, useEffect } from 'react';
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
  RefreshCw,
  Monitor,
  Smartphone,
  Clock,
  Globe,
  Target,
  TestTube
} from 'lucide-react';

interface BrowserInfo {
  resolution: { width: number; height: number };
  userAgent: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  timestamp: string;
}

interface ServerScreenshot {
  imageBase64: string;
  browserInfo: BrowserInfo;
  sessionId: string;
}

interface RecordedAction {
  id: string;
  type: 'click' | 'type' | 'wait' | 'scroll' | 'hover';
  coordinates: { x: number; y: number };
  browserResolution: { width: number; height: number };
  description: string;
  value?: string;
  timestamp: number;
}

interface ServerBasedRPARecorderProps {
  onSaveScenario: (actions: RecordedAction[]) => void;
}

export const ServerBasedRPARecorder: React.FC<ServerBasedRPARecorderProps> = ({
  onSaveScenario
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [serverScreenshot, setServerScreenshot] = useState<ServerScreenshot | null>(null);
  const [actions, setActions] = useState<RecordedAction[]>([]);
  const [recordingMode, setRecordingMode] = useState<'click' | 'type' | 'hover'>('click');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const imageRef = useRef<HTMLImageElement>(null);
  const { toast } = useToast();

  // Получение скриншота с сервера
  const getServerScreenshot = useCallback(async (url?: string) => {
    if (!currentUrl && !url) {
      toast({
        title: "Ошибка",
        description: "Введите URL для получения скриншота",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/rpa/screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: url || currentUrl,
          sessionId: sessionId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data: ServerScreenshot = await response.json();
      setServerScreenshot(data);
      setSessionId(data.sessionId);

      toast({
        title: "Скриншот получен",
        description: `Разрешение: ${data.browserInfo.resolution.width}x${data.browserInfo.resolution.height}`
      });
    } catch (error) {
      console.error('Ошибка получения скриншота:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось получить скриншот с сервера",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentUrl, sessionId, toast]);

  // Обработка клика по скриншоту
  const handleScreenshotClick = useCallback((event: React.MouseEvent<HTMLImageElement>) => {
    if (!isRecording || !serverScreenshot || !imageRef.current) return;

    event.preventDefault();
    
    const rect = imageRef.current.getBoundingClientRect();
    const scaleX = serverScreenshot.browserInfo.resolution.width / rect.width;
    const scaleY = serverScreenshot.browserInfo.resolution.height / rect.height;
    
    // Вычисляем реальные координаты на сервере
    const serverX = Math.round((event.clientX - rect.left) * scaleX);
    const serverY = Math.round((event.clientY - rect.top) * scaleY);

    const description = prompt(`Опишите действие в координатах (${serverX}, ${serverY}):`);
    if (!description) return;

    const newAction: RecordedAction = {
      id: `action_${Date.now()}`,
      type: recordingMode,
      coordinates: { x: serverX, y: serverY },
      browserResolution: serverScreenshot.browserInfo.resolution,
      description,
      timestamp: Date.now()
    };

    if (recordingMode === 'type') {
      const text = prompt('Введите текст для ввода:');
      if (text) newAction.value = text;
    }

    setActions(prev => [...prev, newAction]);

    toast({
      title: "Действие записано",
      description: `${description} (${serverX}, ${serverY})`
    });
  }, [isRecording, serverScreenshot, recordingMode, toast]);

  // Тестирование макроса на сервере
  const testMacroOnServer = useCallback(async () => {
    if (actions.length === 0) {
      toast({
        title: "Нет действий",
        description: "Запишите хотя бы одно действие",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Получаем скриншот "до"
      await getServerScreenshot();
      const beforeScreenshot = serverScreenshot?.imageBase64;

      // Выполняем макрос
      const response = await fetch('/api/rpa/test-macro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          actions,
          url: currentUrl
        })
      });

      if (!response.ok) {
        throw new Error(`Ошибка тестирования: ${response.status}`);
      }

      const result = await response.json();
      
      // Получаем скриншот "после"
      await getServerScreenshot();

      toast({
        title: "Тест выполнен",
        description: `Выполнено ${result.completedActions}/${actions.length} действий`,
        variant: result.success ? "default" : "destructive"
      });

    } catch (error) {
      console.error('Ошибка тестирования:', error);
      toast({
        title: "Ошибка тестирования",
        description: "Не удалось выполнить тест на сервере",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [actions, sessionId, currentUrl, serverScreenshot, getServerScreenshot, toast]);

  const startRecording = useCallback(() => {
    if (!serverScreenshot) {
      toast({
        title: "Ошибка",
        description: "Сначала получите скриншот с сервера",
        variant: "destructive"
      });
      return;
    }

    setIsRecording(true);
    setActions([]);
    
    toast({
      title: "Запись началась",
      description: "Кликайте по серверному скриншоту для записи действий"
    });
  }, [serverScreenshot, toast]);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    toast({
      title: "Запись завершена",
      description: `Записано ${actions.length} действий`
    });
  }, [actions.length, toast]);

  const clearActions = useCallback(() => {
    setActions([]);
    toast({
      title: "Действия очищены",
      description: "Список действий очищен"
    });
  }, [toast]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Панель управления */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="h-5 w-5" />
            Серверный RPA Рекордер
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* URL и получение скриншота */}
          <div className="space-y-2">
            <label className="text-sm text-gray-300">URL сайта:</label>
            <div className="flex gap-2">
              <Input
                value={currentUrl}
                onChange={(e) => setCurrentUrl(e.target.value)}
                placeholder="https://example.com"
                className="bg-gray-700 border-gray-600 text-white flex-1"
              />
              <Button 
                onClick={() => getServerScreenshot()}
                disabled={isLoading || !currentUrl}
                size="sm"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Информация о браузере */}
          {serverScreenshot && (
            <Card className="bg-gray-700 border-gray-600">
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Monitor className="h-4 w-4 text-blue-400" />
                  <span className="text-gray-300">Разрешение:</span>
                  <Badge variant="outline">
                    {serverScreenshot.browserInfo.resolution.width}x{serverScreenshot.browserInfo.resolution.height}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Smartphone className="h-4 w-4 text-green-400" />
                  <span className="text-gray-300">Устройство:</span>
                  <Badge variant="outline">
                    {serverScreenshot.browserInfo.deviceType}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-purple-400" />
                  <span className="text-gray-300">User-Agent:</span>
                  <span className="text-xs text-gray-400 truncate">
                    {serverScreenshot.browserInfo.userAgent.substring(0, 50)}...
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-yellow-400" />
                  <span className="text-gray-300">Время:</span>
                  <span className="text-xs text-gray-400">
                    {new Date(serverScreenshot.browserInfo.timestamp).toLocaleString('ru-RU')}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

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
                <Target className="h-4 w-4 mr-1" />
                Наведение
              </Button>
            </div>
          </div>

          {/* Управление записью */}
          <div className="flex gap-2">
            {!isRecording ? (
              <Button 
                onClick={startRecording} 
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={!serverScreenshot}
              >
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
                Действия ({actions.length})
              </label>
              {actions.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearActions} className="text-red-400">
                  Очистить
                </Button>
              )}
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2">
              {actions.map((action, index) => (
                <div
                  key={action.id}
                  className="flex items-center justify-between p-2 bg-gray-700 rounded border border-gray-600"
                >
                  <div className="text-sm">
                    <div className="text-white font-medium">{action.description}</div>
                    <div className="text-gray-400 text-xs">
                      {action.type} • ({action.coordinates.x}, {action.coordinates.y}) • {action.browserResolution.width}x{action.browserResolution.height}
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {index + 1}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Тестирование и сохранение */}
          <div className="space-y-2">
            <Button
              onClick={testMacroOnServer}
              disabled={actions.length === 0 || isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <TestTube className="h-4 w-4 mr-2" />
              Тестировать на сервере
            </Button>
            
            <Button
              onClick={() => onSaveScenario(actions)}
              disabled={actions.length === 0}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Сохранить сценарий
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Серверный скриншот */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Серверный скриншот
            {isRecording && (
              <Badge variant="destructive" className="ml-auto animate-pulse">
                Запись активна
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {serverScreenshot ? (
            <div className="relative">
              <img
                ref={imageRef}
                src={`data:image/png;base64,${serverScreenshot.imageBase64}`}
                alt="Server screenshot"
                className={`w-full h-auto border-0 ${isRecording ? 'cursor-crosshair' : 'cursor-default'}`}
                onClick={handleScreenshotClick}
                style={{ 
                  maxHeight: '600px', 
                  objectFit: 'contain',
                  pointerEvents: isRecording ? 'auto' : 'none'
                }}
              />
              {isRecording && (
                <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs animate-pulse">
                  Кликайте для записи
                </div>
              )}
            </div>
          ) : (
            <div className="h-96 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="mb-2">Получите скриншот с сервера</p>
                <p className="text-sm">Введите URL и нажмите кнопку просмотра</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
