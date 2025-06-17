
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';

const EmptyState: React.FC = () => {
  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardContent className="py-8">
        <div className="text-center text-gray-400">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-white mb-2">Нет шаблонов сценариев</h3>
          <p>Создайте шаблон сценария на вкладке "Шаблоны", чтобы начать запуск автоматизации</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyState;
