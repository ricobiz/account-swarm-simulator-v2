
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Key } from 'lucide-react';

export const APIKeysManager: React.FC = () => {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Settings className="h-5 w-5 text-orange-400" />
          Управление API ключами
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="server-api" className="text-gray-300">
              API ключ серверного RPA
            </Label>
            <Input
              id="server-api"
              type="password"
              placeholder="Введите API ключ"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          <div>
            <Label htmlFor="browser-endpoint" className="text-gray-300">
              Endpoint браузерного сервиса
            </Label>
            <Input
              id="browser-endpoint"
              placeholder="https://api.example.com/browser"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
        </div>
        
        <Button className="w-full bg-orange-600 hover:bg-orange-700">
          <Key className="h-4 w-4 mr-2" />
          Сохранить настройки
        </Button>
      </CardContent>
    </Card>
  );
};
