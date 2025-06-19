
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Key, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  ExternalLink,
  Shield,
  AlertTriangle 
} from 'lucide-react';

interface APIKey {
  name: string;
  displayName: string;
  description: string;
  helpUrl?: string;
  required: boolean;
  placeholder: string;
}

const API_KEYS: APIKey[] = [
  {
    name: 'OPENROUTER_API_KEY',
    displayName: 'OpenRouter API Key',
    description: 'Для доступа к различным AI моделям через OpenRouter',
    helpUrl: 'https://openrouter.ai/keys',
    required: true,
    placeholder: 'sk-or-v1-...'
  },
  {
    name: 'OPENAI_API_KEY',
    displayName: 'OpenAI API Key',
    description: 'Для прямого доступа к GPT моделям OpenAI',
    helpUrl: 'https://platform.openai.com/api-keys',
    required: false,
    placeholder: 'sk-...'
  },
  {
    name: 'ANTHROPIC_API_KEY',
    displayName: 'Anthropic API Key',
    description: 'Для доступа к Claude моделям',
    helpUrl: 'https://console.anthropic.com/account/keys',
    required: false,
    placeholder: 'sk-ant-...'
  },
  {
    name: 'GOOGLE_AI_API_KEY',
    displayName: 'Google AI API Key',
    description: 'Для доступа к Gemini моделям',
    helpUrl: 'https://aistudio.google.com/app/apikey',
    required: false,
    placeholder: 'AIza...'
  }
];

export const APIKeysManager: React.FC = () => {
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [testResults, setTestResults] = useState<Record<string, 'success' | 'error' | null>>({});
  const { toast } = useToast();

  useEffect(() => {
    loadStoredKeys();
  }, []);

  const loadStoredKeys = () => {
    API_KEYS.forEach(apiKey => {
      const stored = localStorage.getItem(`rpa_${apiKey.name}`);
      if (stored) {
        setKeys(prev => ({ ...prev, [apiKey.name]: stored }));
      }
    });
  };

  const saveKey = async (keyName: string, value: string) => {
    try {
      setLoading(prev => ({ ...prev, [keyName]: true }));

      // Сохраняем в localStorage для быстрого доступа
      localStorage.setItem(`rpa_${keyName}`, value);
      
      // Также отправляем в Supabase для синхронизации
      const { error } = await supabase.functions.invoke('save-api-key', {
        body: { keyName, value }
      });

      if (error) {
        console.warn('Не удалось синхронизировать с сервером:', error);
      }

      setKeys(prev => ({ ...prev, [keyName]: value }));
      
      toast({
        title: "API ключ сохранен",
        description: `${API_KEYS.find(k => k.name === keyName)?.displayName} сохранен локально`
      });

    } catch (error: any) {
      toast({
        title: "Ошибка сохранения",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, [keyName]: false }));
    }
  };

  const testKey = async (keyName: string) => {
    const key = keys[keyName];
    if (!key) return;

    try {
      setLoading(prev => ({ ...prev, [`test_${keyName}`]: true }));

      // Тестируем ключ через соответствующий API
      const { data, error } = await supabase.functions.invoke('test-api-key', {
        body: { keyName, key }
      });

      if (error) throw error;

      setTestResults(prev => ({
        ...prev,
        [keyName]: data.valid ? 'success' : 'error'
      }));

      toast({
        title: data.valid ? "Ключ работает" : "Ключ недействителен",
        description: data.message || "Тест завершен",
        variant: data.valid ? "default" : "destructive"
      });

    } catch (error: any) {
      setTestResults(prev => ({ ...prev, [keyName]: 'error' }));
      toast({
        title: "Ошибка тестирования",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, [`test_${keyName}`]: false }));
    }
  };

  const toggleShowKey = (keyName: string) => {
    setShowKeys(prev => ({ ...prev, [keyName]: !prev[keyName] }));
  };

  const getKeyStatus = (keyName: string) => {
    const hasKey = !!keys[keyName];
    const testResult = testResults[keyName];
    
    if (!hasKey) return { status: 'missing', color: 'bg-gray-500', text: 'Не задан' };
    if (testResult === 'success') return { status: 'valid', color: 'bg-green-500', text: 'Работает' };
    if (testResult === 'error') return { status: 'invalid', color: 'bg-red-500', text: 'Ошибка' };
    return { status: 'unknown', color: 'bg-yellow-500', text: 'Не проверен' };
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Key className="h-5 w-5" />
          Управление API ключами
        </CardTitle>
        <div className="text-sm text-gray-400">
          Настройте API ключи для работы с различными AI сервисами
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Предупреждение о безопасности */}
        <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-400 mb-2">
            <Shield className="h-4 w-4" />
            <span className="font-medium">Безопасность</span>
          </div>
          <p className="text-sm text-yellow-300">
            API ключи сохраняются локально в вашем браузере. Никогда не делитесь ими с другими.
          </p>
        </div>

        {API_KEYS.map((apiKey, index) => {
          const status = getKeyStatus(apiKey.name);
          const isVisible = showKeys[apiKey.name];
          const isLoading = loading[apiKey.name];
          const isTestLoading = loading[`test_${apiKey.name}`];

          return (
            <div key={apiKey.name}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Label className="text-white font-medium">
                      {apiKey.displayName}
                      {apiKey.required && (
                        <span className="text-red-400 ml-1">*</span>
                      )}
                    </Label>
                    <Badge className={`${status.color} text-white text-xs`}>
                      {status.text}
                    </Badge>
                  </div>
                  {apiKey.helpUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-400 hover:text-blue-300"
                      onClick={() => window.open(apiKey.helpUrl, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Получить ключ
                    </Button>
                  )}
                </div>

                <p className="text-sm text-gray-400">{apiKey.description}</p>

                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Input
                      type={isVisible ? 'text' : 'password'}
                      value={keys[apiKey.name] || ''}
                      onChange={(e) => setKeys(prev => ({ 
                        ...prev, 
                        [apiKey.name]: e.target.value 
                      }))}
                      placeholder={apiKey.placeholder}
                      className="bg-gray-700 border-gray-600 text-white pr-10"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-8 w-8 p-0"
                      onClick={() => toggleShowKey(apiKey.name)}
                    >
                      {isVisible ? (
                        <EyeOff className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                    </Button>
                  </div>

                  <Button
                    onClick={() => saveKey(apiKey.name, keys[apiKey.name] || '')}
                    disabled={!keys[apiKey.name] || isLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                  </Button>

                  <Button
                    onClick={() => testKey(apiKey.name)}
                    disabled={!keys[apiKey.name] || isTestLoading}
                    variant="outline"
                    className="border-gray-600"
                  >
                    {isTestLoading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                    ) : (
                      'Тест'
                    )}
                  </Button>
                </div>
              </div>

              {index < API_KEYS.length - 1 && (
                <Separator className="bg-gray-600 mt-6" />
              )}
            </div>
          );
        })}

        {/* Статус подключения */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Статус подключения
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Готовых ключей:</span>
              <span className="text-green-400 ml-2">
                {Object.values(keys).filter(key => key.length > 0).length}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Обязательных:</span>
              <span className="text-orange-400 ml-2">
                {API_KEYS.filter(k => k.required).length}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
