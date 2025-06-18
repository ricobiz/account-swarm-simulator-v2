
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRPAService } from '@/hooks/useRPAService';
import { useToast } from '@/hooks/use-toast';
import { PlayCircle, Loader2 } from 'lucide-react';
import type { RPATask } from '@/types/rpa';

export const TestRPAButton: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const { submitRPATask, waitForRPACompletion } = useRPAService();
  const { toast } = useToast();

  const runTestRPA = async () => {
    setIsRunning(true);
    
    try {
      // Создаем простую тестовую задачу
      const testTask: RPATask = {
        taskId: `test_${Date.now()}`,
        url: 'https://httpbin.org/get',
        actions: [
          {
            type: 'navigate',
            url: 'https://httpbin.org/get'
          },
          {
            type: 'wait',
            duration: 2000
          },
          {
            type: 'scroll',
            x: 0,
            y: 100
          },
          {
            type: 'wait',
            duration: 1000
          }
        ],
        accountId: 'test-account',
        scenarioId: 'test-scenario',
        blockId: 'test-block',
        timeout: 30000
      };

      toast({
        title: "Запуск тестовой RPA задачи",
        description: "Отправляем задачу RPA-боту..."
      });

      // Отправляем задачу
      const submitResult = await submitRPATask(testTask);
      
      if (!submitResult.success) {
        throw new Error(submitResult.error || 'Ошибка отправки задачи');
      }

      toast({
        title: "Задача отправлена",
        description: "Ожидаем выполнения RPA-ботом..."
      });

      // Ждем результат
      const result = await waitForRPACompletion(testTask.taskId, 30000);

      if (result?.success) {
        toast({
          title: "✅ RPA тест прошел успешно!",
          description: result.message || 'Задача выполнена'
        });
      } else {
        toast({
          title: "❌ RPA тест завершился с ошибкой",
          description: result?.error || 'Неизвестная ошибка',
          variant: "destructive"
        });
      }

    } catch (error: any) {
      toast({
        title: "Ошибка выполнения теста",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card className="bg-gradient-to-r from-purple-800/50 to-blue-800/50 border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <PlayCircle className="h-5 w-5" />
          Тест RPA системы
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-300 text-sm">
          Запустить простую тестовую RPA задачу для проверки работы бота
        </p>
        
        <Button
          onClick={runTestRPA}
          disabled={isRunning}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {isRunning ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Выполняется...
            </>
          ) : (
            <>
              <PlayCircle className="h-4 w-4 mr-2" />
              Запустить тест RPA
            </>
          )}
        </Button>
        
        <div className="text-xs text-gray-400">
          <p>Тестовая задача:</p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li>Переход на httpbin.org/get</li>
            <li>Ожидание 2 секунды</li>
            <li>Прокрутка страницы</li>
            <li>Ожидание 1 секунда</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
