
import { TestRPAButton } from "@/components/TestRPAButton";
import { ProcessMonitorProvider } from "@/components/ProcessMonitorProvider";

const Index = () => {
  return (
    <ProcessMonitorProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Social Media Automation
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Автоматизируйте ваши социальные сети с помощью RPA технологий
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <TestRPAButton />
            
            {/* Существующие карточки */}
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 hover:border-purple-500 transition-colors">
              <h3 className="text-xl font-semibold text-white mb-3">🚀 Запуск сценариев</h3>
              <p className="text-gray-300 mb-4">
                Выберите шаблоны и аккаунты для автоматического выполнения задач
              </p>
              <a 
                href="/launch" 
                className="inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
              >
                Запустить
              </a>
            </div>

            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors">
              <h3 className="text-xl font-semibold text-white mb-3">📊 Мониторинг</h3>
              <p className="text-gray-300 mb-4">
                Отслеживайте выполнение задач и просматривайте логи активности
              </p>
              <a 
                href="/monitoring" 
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Мониторинг
              </a>
            </div>

            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 hover:border-green-500 transition-colors">
              <h3 className="text-xl font-semibold text-white mb-3">⚙️ Управление</h3>
              <p className="text-gray-300 mb-4">
                Настройте аккаунты, прокси и создайте шаблоны сценариев
              </p>
              <a 
                href="/accounts" 
                className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
              >
                Настроить
              </a>
            </div>

            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 hover:border-orange-500 transition-colors">
              <h3 className="text-xl font-semibold text-white mb-3">🤖 RPA Dashboard</h3>
              <p className="text-gray-300 mb-4">
                Управление и мониторинг RPA задач в реальном времени
              </p>
              <a 
                href="/rpa" 
                className="inline-block bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition-colors"
              >
                RPA Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    </ProcessMonitorProvider>
  );
};

export default Index;
