
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Server, Play, Square } from 'lucide-react';

interface ServerBasedRPARecorderProps {
  onSaveScenario: (actions: any[]) => void;
}

export const ServerBasedRPARecorder: React.FC<ServerBasedRPARecorderProps> = ({
  onSaveScenario
}) => {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Server className="h-5 w-5 text-purple-400" />
          Серверный рекордер действий
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center py-8">
          <Server className="h-16 w-16 text-purple-400 mx-auto mb-4" />
          <p className="text-gray-300 mb-6">
            Запишите действия пользователя на реальном браузере сервера
          </p>
          <div className="flex gap-4 justify-center">
            <Button className="bg-green-600 hover:bg-green-700">
              <Play className="h-4 w-4 mr-2" />
              Начать запись
            </Button>
            <Button variant="outline">
              <Square className="h-4 w-4 mr-2" />
              Остановить
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
