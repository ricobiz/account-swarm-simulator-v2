
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  MousePointer, 
  Clock, 
  Eye, 
  Keyboard,
  Activity,
  Shield,
  Zap
} from 'lucide-react';

interface HumanBehaviorSettings {
  mouseMovement: {
    enabled: boolean;
    naturalPath: boolean;
    speed: number;
    randomness: number;
  };
  typing: {
    enabled: boolean;
    humanSpeed: boolean;
    mistakes: boolean;
    pausesBetweenWords: boolean;
  };
  delays: {
    enabled: boolean;
    randomRange: [number, number];
    readingPauses: boolean;
    thinkingPauses: boolean;
  };
  antiDetection: {
    enabled: boolean;
    userAgentRotation: boolean;
    viewportVariation: boolean;
    canvasFingerprint: boolean;
  };
  advanced: {
    scrollBehavior: boolean;
    focusSimulation: boolean;
    pageInteraction: boolean;
    backgroundActivity: boolean;
  };
}

export const HumanBehaviorEngine: React.FC = () => {
  const [settings, setSettings] = useState<HumanBehaviorSettings>({
    mouseMovement: {
      enabled: true,
      naturalPath: true,
      speed: 75,
      randomness: 50
    },
    typing: {
      enabled: true,
      humanSpeed: true,
      mistakes: false,
      pausesBetweenWords: true
    },
    delays: {
      enabled: true,
      randomRange: [100, 500],
      readingPauses: true,
      thinkingPauses: true
    },
    antiDetection: {
      enabled: true,
      userAgentRotation: true,
      viewportVariation: true,
      canvasFingerprint: true
    },
    advanced: {
      scrollBehavior: true,
      focusSimulation: true,
      pageInteraction: false,
      backgroundActivity: false
    }
  });

  const [previewMode, setPreviewMode] = useState(false);

  const updateSettings = (category: keyof HumanBehaviorSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const getHumanismLevel = () => {
    const scores = {
      mouseMovement: settings.mouseMovement.enabled ? 20 : 0,
      typing: settings.typing.enabled ? 20 : 0,
      delays: settings.delays.enabled ? 20 : 0,
      antiDetection: settings.antiDetection.enabled ? 20 : 0,
      advanced: Object.values(settings.advanced).filter(Boolean).length * 5
    };
    
    const total = Object.values(scores).reduce((a, b) => a + b, 0);
    return Math.min(100, total);
  };

  const getHumanismColor = (level: number) => {
    if (level >= 80) return 'text-green-400';
    if (level >= 60) return 'text-yellow-400';
    if (level >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const presets = {
    minimal: {
      name: 'Минимальный',
      description: 'Базовая эмуляция для быстрого выполнения',
      apply: () => {
        setSettings(prev => ({
          ...prev,
          mouseMovement: { ...prev.mouseMovement, enabled: true, naturalPath: false, speed: 90, randomness: 20 },
          typing: { ...prev.typing, enabled: true, humanSpeed: false, mistakes: false, pausesBetweenWords: false },
          delays: { ...prev.delays, enabled: true, randomRange: [50, 200], readingPauses: false, thinkingPauses: false },
          antiDetection: { ...prev.antiDetection, enabled: true, userAgentRotation: false, viewportVariation: false, canvasFingerprint: false },
          advanced: { scrollBehavior: false, focusSimulation: false, pageInteraction: false, backgroundActivity: false }
        }));
      }
    },
    balanced: {
      name: 'Сбалансированный',
      description: 'Оптимальное соотношение скорости и маскировки',
      apply: () => {
        setSettings(prev => ({
          ...prev,
          mouseMovement: { ...prev.mouseMovement, enabled: true, naturalPath: true, speed: 75, randomness: 50 },
          typing: { ...prev.typing, enabled: true, humanSpeed: true, mistakes: false, pausesBetweenWords: true },
          delays: { ...prev.delays, enabled: true, randomRange: [100, 500], readingPauses: true, thinkingPauses: true },
          antiDetection: { ...prev.antiDetection, enabled: true, userAgentRotation: true, viewportVariation: true, canvasFingerprint: true },
          advanced: { scrollBehavior: true, focusSimulation: true, pageInteraction: false, backgroundActivity: false }
        }));
      }
    },
    maximum: {
      name: 'Максимальный',
      description: 'Максимальная эмуляция человеческого поведения',
      apply: () => {
        setSettings(prev => ({
          ...prev,
          mouseMovement: { ...prev.mouseMovement, enabled: true, naturalPath: true, speed: 60, randomness: 80 },
          typing: { ...prev.typing, enabled: true, humanSpeed: true, mistakes: true, pausesBetweenWords: true },
          delays: { ...prev.delays, enabled: true, randomRange: [200, 1000], readingPauses: true, thinkingPauses: true },
          antiDetection: { ...prev.antiDetection, enabled: true, userAgentRotation: true, viewportVariation: true, canvasFingerprint: true },
          advanced: { scrollBehavior: true, focusSimulation: true, pageInteraction: true, backgroundActivity: true }
        }));
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Статус человекоподобности */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Движок эмуляции человеческого поведения
            <Badge className={`ml-auto ${getHumanismColor(getHumanismLevel())}`}>
              {getHumanismLevel()}% человечности
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(presets).map(([key, preset]) => (
                <Button
                  key={key}
                  variant="outline"
                  className="p-4 h-auto flex-col items-start"
                  onClick={preset.apply}
                >
                  <div className="font-medium text-white">{preset.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{preset.description}</div>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Настройки движения мыши */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MousePointer className="h-5 w-5" />
            Движение мыши
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Включить эмуляцию движения мыши</span>
            <Switch
              checked={settings.mouseMovement.enabled}
              onCheckedChange={(checked) => updateSettings('mouseMovement', 'enabled', checked)}
            />
          </div>

          {settings.mouseMovement.enabled && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Естественная траектория</span>
                <Switch
                  checked={settings.mouseMovement.naturalPath}
                  onCheckedChange={(checked) => updateSettings('mouseMovement', 'naturalPath', checked)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-300">Скорость движения: {settings.mouseMovement.speed}%</label>
                <Slider
                  value={[settings.mouseMovement.speed]}
                  onValueChange={(value) => updateSettings('mouseMovement', 'speed', value[0])}
                  min={20}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-300">Случайность: {settings.mouseMovement.randomness}%</label>
                <Slider
                  value={[settings.mouseMovement.randomness]}
                  onValueChange={(value) => updateSettings('mouseMovement', 'randomness', value[0])}
                  min={0}
                  max={100}
                  step={10}
                  className="w-full"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Настройки печати */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Эмуляция печати
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Включить эмуляцию печати</span>
            <Switch
              checked={settings.typing.enabled}
              onCheckedChange={(checked) => updateSettings('typing', 'enabled', checked)}
            />
          </div>

          {settings.typing.enabled && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Человеческая скорость печати</span>
                <Switch
                  checked={settings.typing.humanSpeed}
                  onCheckedChange={(checked) => updateSettings('typing', 'humanSpeed', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-300">Случайные опечатки</span>
                <Switch
                  checked={settings.typing.mistakes}
                  onCheckedChange={(checked) => updateSettings('typing', 'mistakes', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-300">Паузы между словами</span>
                <Switch
                  checked={settings.typing.pausesBetweenWords}
                  onCheckedChange={(checked) => updateSettings('typing', 'pausesBetweenWords', checked)}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Настройки задержек */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Временные задержки
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Включить случайные задержки</span>
            <Switch
              checked={settings.delays.enabled}
              onCheckedChange={(checked) => updateSettings('delays', 'enabled', checked)}
            />
          </div>

          {settings.delays.enabled && (
            <>
              <div className="space-y-2">
                <label className="text-sm text-gray-300">
                  Диапазон задержек: {settings.delays.randomRange[0]}-{settings.delays.randomRange[1]}мс
                </label>
                <div className="flex gap-4">
                  <Slider
                    value={settings.delays.randomRange}
                    onValueChange={(value) => updateSettings('delays', 'randomRange', value)}
                    min={50}
                    max={2000}
                    step={50}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-300">Паузы для чтения</span>
                <Switch
                  checked={settings.delays.readingPauses}
                  onCheckedChange={(checked) => updateSettings('delays', 'readingPauses', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-300">Паузы для размышления</span>
                <Switch
                  checked={settings.delays.thinkingPauses}
                  onCheckedChange={(checked) => updateSettings('delays', 'thinkingPauses', checked)}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Антидетект */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Антидетект защита
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Включить антидетект</span>
            <Switch
              checked={settings.antiDetection.enabled}
              onCheckedChange={(checked) => updateSettings('antiDetection', 'enabled', checked)}
            />
          </div>

          {settings.antiDetection.enabled && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Ротация User-Agent</span>
                <Switch
                  checked={settings.antiDetection.userAgentRotation}
                  onCheckedChange={(checked) => updateSettings('antiDetection', 'userAgentRotation', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-300">Изменение размера окна</span>
                <Switch
                  checked={settings.antiDetection.viewportVariation}
                  onCheckedChange={(checked) => updateSettings('antiDetection', 'viewportVariation', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-300">Canvas отпечаток</span>
                <Switch
                  checked={settings.antiDetection.canvasFingerprint}
                  onCheckedChange={(checked) => updateSettings('antiDetection', 'canvasFingerprint', checked)}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Продвинутые настройки */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Продвинутые настройки
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Естественный скролл</span>
            <Switch
              checked={settings.advanced.scrollBehavior}
              onCheckedChange={(checked) => updateSettings('advanced', 'scrollBehavior', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-300">Симуляция фокуса</span>
            <Switch
              checked={settings.advanced.focusSimulation}
              onCheckedChange={(checked) => updateSettings('advanced', 'focusSimulation', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-300">Случайные взаимодействия</span>
            <Switch
              checked={settings.advanced.pageInteraction}
              onCheckedChange={(checked) => updateSettings('advanced', 'pageInteraction', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-300">Фоновая активность</span>
            <Switch
              checked={settings.advanced.backgroundActivity}
              onCheckedChange={(checked) => updateSettings('advanced', 'backgroundActivity', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Кнопки действий */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <Button
              onClick={() => {
                localStorage.setItem('rpa_human_behavior_settings', JSON.stringify(settings));
                alert('Настройки сохранены!');
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Сохранить настройки
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setPreviewMode(!previewMode)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {previewMode ? 'Скрыть превью' : 'Показать превью'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
