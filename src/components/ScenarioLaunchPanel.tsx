
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play } from 'lucide-react';
import { useAccounts } from '@/hooks/useAccounts';
import { useScenarios } from '@/hooks/useScenarios';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useAutomationService } from '@/hooks/useAutomationService';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import TemplateSelector from './scenario-launch/TemplateSelector';
import AccountSelector from './scenario-launch/AccountSelector';
import ActiveScenarios from './scenario-launch/ActiveScenarios';
import LaunchButton from './scenario-launch/LaunchButton';
import EmptyState from './scenario-launch/EmptyState';

type ScenarioRow = Database['public']['Tables']['scenarios']['Row'];

interface ScenarioTemplate {
  id: string;
  name: string;
  platform: string;
  config?: {
    steps: any[];
    settings: any;
  } | null;
}

const ScenarioLaunchPanel = () => {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [templates, setTemplates] = useState<ScenarioTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  
  const { accounts } = useAccounts();
  const { scenarios, refetch: refetchScenarios } = useScenarios();
  const { user } = useAuth();
  const { toast } = useToast();
  const { launchScenario, stopScenario, isLaunching } = useAutomationService();

  // Load scenario templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoadingTemplates(true);
        const { data, error } = await supabase
          .from('scenarios')
          .select('*')
          .eq('status', 'template')
          .not('config', 'is', null)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        const templatesData: ScenarioTemplate[] = (data || []).map((row: ScenarioRow) => ({
          id: row.id,
          name: row.name,
          platform: row.platform,
          config: row.config && typeof row.config === 'object' ? row.config as { steps: any[]; settings: any; } : null
        }));
        
        setTemplates(templatesData);
      } catch (error) {
        console.error('Ошибка загрузки шаблонов:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить шаблоны сценариев",
          variant: "destructive"
        });
      } finally {
        setLoadingTemplates(false);
      }
    };

    fetchTemplates();
  }, [toast]);

  // Filter accounts by selected template platform
  const getAvailableAccounts = () => {
    if (!selectedTemplate) return accounts;
    
    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) return accounts;
    
    return accounts.filter(account => 
      account.platform === template.platform && 
      (account.status === 'idle' || account.status === 'working')
    );
  };

  const handleAccountSelection = (accountId: string, checked: boolean) => {
    if (checked) {
      setSelectedAccounts(prev => [...prev, accountId]);
    } else {
      setSelectedAccounts(prev => prev.filter(id => id !== accountId));
    }
  };

  const selectAllAccounts = () => {
    const availableAccounts = getAvailableAccounts();
    setSelectedAccounts(availableAccounts.map(acc => acc.id));
  };

  const clearSelection = () => {
    setSelectedAccounts([]);
  };

  const handleLaunchScenario = async () => {
    if (!selectedTemplate || selectedAccounts.length === 0 || !user) return;

    try {
      const result = await launchScenario({
        templateId: selectedTemplate,
        accountIds: selectedAccounts,
        userId: user.id
      });

      if (result.success) {
        toast({
          title: "Сценарии запущены",
          description: result.message,
        });
        refetchScenarios();
        setSelectedAccounts([]);
        setSelectedTemplate('');
      } else {
        toast({
          title: "Ошибка запуска",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Ошибка при запуске сценариев:', error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при запуске сценариев",
        variant: "destructive"
      });
    }
  };

  const handleStopScenario = async (scenarioId: string) => {
    const success = await stopScenario(scenarioId);
    if (success) {
      refetchScenarios();
    }
  };

  const availableAccounts = getAvailableAccounts();
  const runningScenarios = scenarios.filter(s => s.status === 'running' || s.status === 'waiting');

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Play className="h-5 w-5" />
            Запуск сценариев
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <TemplateSelector
            templates={templates}
            selectedTemplate={selectedTemplate}
            onTemplateChange={setSelectedTemplate}
            loading={loadingTemplates}
          />

          {selectedTemplate && (
            <div className="space-y-4">
              <AccountSelector
                accounts={availableAccounts}
                selectedAccounts={selectedAccounts}
                onAccountSelection={handleAccountSelection}
                onSelectAll={selectAllAccounts}
                onClearSelection={clearSelection}
              />

              <LaunchButton
                selectedAccounts={selectedAccounts}
                isLaunching={isLaunching}
                onLaunch={handleLaunchScenario}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <ActiveScenarios
        scenarios={runningScenarios}
        onStopScenario={handleStopScenario}
      />

      {templates.length === 0 && !loadingTemplates && <EmptyState />}
    </div>
  );
};

export default ScenarioLaunchPanel;
