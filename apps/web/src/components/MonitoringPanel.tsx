import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLogs } from '@/hooks/useLogs';
import { useAccounts } from '@/hooks/useAccounts';
import { useScenarios } from '@/hooks/useScenarios';
import MonitoringStats from './monitoring/MonitoringStats';
import LogsTab from './monitoring/LogsTab';
import StatusTab from './monitoring/StatusTab';

const MonitoringPanel = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAccount, setFilterAccount] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  
  const { logs, loading: logsLoading, refetch: refetchLogs } = useLogs();
  const { accounts } = useAccounts();
  const { scenarios } = useScenarios();

  // Автообновление каждые 10 секунд если включено
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      refetchLogs();
    }, 10000);

    return () => clearInterval(interval);
  }, [autoRefresh, refetchLogs]);

  // Статистика
  const stats = {
    total: logs.length,
    success: logs.filter(l => l.status === 'success').length,
    error: logs.filter(l => l.status === 'error').length,
    warning: logs.filter(l => l.status === 'warning').length,
    info: logs.filter(l => l.status === 'info').length
  };

  // Активные сценарии
  const activeScenarios = scenarios.filter(s => s.status === 'running' || s.status === 'waiting');
  
  // Аккаунты по статусам
  const accountStats = {
    idle: accounts.filter(a => a.status === 'idle').length,
    working: accounts.filter(a => a.status === 'working').length,
    error: accounts.filter(a => a.status === 'error').length
  };

  return (
    <div className="space-y-6">
      <MonitoringStats
        activeScenarios={activeScenarios.length}
        workingAccounts={accountStats.working}
        errorCount={stats.error}
        totalLogs={stats.total}
      />

      <Tabs defaultValue="logs" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-800/50">
          <TabsTrigger value="logs" className="text-white">Логи активности</TabsTrigger>
          <TabsTrigger value="status" className="text-white">Статус системы</TabsTrigger>
        </TabsList>

        <TabsContent value="logs">
          <LogsTab
            logs={logs}
            loading={logsLoading}
            accounts={accounts}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterAccount={filterAccount}
            setFilterAccount={setFilterAccount}
            autoRefresh={autoRefresh}
            setAutoRefresh={setAutoRefresh}
            onRefresh={() => refetchLogs()}
          />
        </TabsContent>

        <TabsContent value="status">
          <StatusTab
            accountStats={accountStats}
            activeScenarios={activeScenarios}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MonitoringPanel;
