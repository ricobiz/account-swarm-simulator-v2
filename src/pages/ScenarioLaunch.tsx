
import React from 'react';
import ScenarioLaunchPanel from '@/components/ScenarioLaunchPanel';

const ScenarioLaunch = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Запуск сценариев</h1>
          <p className="text-gray-300">Выберите шаблон и аккаунты для запуска автоматизации</p>
        </div>
        <ScenarioLaunchPanel />
      </div>
    </div>
  );
};

export default ScenarioLaunch;
