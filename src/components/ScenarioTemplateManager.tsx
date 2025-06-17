
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Play, Copy, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ScenarioTemplate {
  id: string;
  name: string;
  platform: string;
  description: string;
  steps: any[];
  settings: any;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface StepForm {
  type: string;
  name: string;
  description: string;
  selector?: string;
  url?: string;
  text?: string;
  minTime?: number;
  maxTime?: number;
}

const PLATFORMS = [
  { value: 'telegram', label: 'Telegram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'twitter', label: 'Twitter' },
  { value: 'reddit', label: 'Reddit' }
];

const STEP_TYPES = [
  { value: 'navigate', label: 'Переход на страницу', fields: ['url'] },
  { value: 'click', label: 'Клик по элементу', fields: ['selector'] },
  { value: 'type', label: 'Ввод текста', fields: ['selector', 'text'] },
  { value: 'scroll', label: 'Скроллинг', fields: [] },
  { value: 'wait', label: 'Ожидание', fields: ['minTime', 'maxTime'] },
  { value: 'random_interaction', label: 'Случайное взаимодействие', fields: [] }
];

const ScenarioTemplateManager = () => {
  const [templates, setTemplates] = useState<ScenarioTemplate[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ScenarioTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Форма создания/редактирования
  const [formData, setFormData] = useState({
    name: '',
    platform: '',
    description: '',
    steps: [] as StepForm[],
    settings: {
      minDelay: 1000,
      maxDelay: 3000,
      retryAttempts: 2
    }
  });

  const [currentStep, setCurrentStep] = useState<StepForm>({
    type: '',
    name: '',
    description: ''
  });

  useEffect(() => {
    if (user) {
      fetchTemplates();
    }
  }, [user]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('scenario_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить шаблоны сценариев",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('scenario_templates')
        .insert({
          user_id: user.id,
          name: formData.name,
          platform: formData.platform,
          description: formData.description,
          steps: formData.steps,
          settings: formData.settings,
          active: true
        })
        .select()
        .single();

      if (error) throw error;

      setTemplates(prev => [data, ...prev]);
      setIsCreateOpen(false);
      resetForm();

      toast({
        title: "Успешно",
        description: "Шаблон сценария создан"
      });
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать шаблон сценария",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('scenario_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      setTemplates(prev => prev.filter(t => t.id !== templateId));

      toast({
        title: "Успешно",
        description: "Шаблон сценария удален"
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить шаблон сценария",
        variant: "destructive"
      });
    }
  };

  const addStep = () => {
    if (!currentStep.type || !currentStep.name) {
      toast({
        title: "Ошибка",
        description: "Заполните тип и название шага",
        variant: "destructive"
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, { ...currentStep }]
    }));

    setCurrentStep({
      type: '',
      name: '',
      description: ''
    });
  };

  const removeStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      platform: '',
      description: '',
      steps: [],
      settings: {
        minDelay: 1000,
        maxDelay: 3000,
        retryAttempts: 2
      }
    });
    setCurrentStep({
      type: '',
      name: '',
      description: ''
    });
  };

  const getCurrentStepFields = () => {
    const stepType = STEP_TYPES.find(t => t.value === currentStep.type);
    return stepType?.fields || [];
  };

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      telegram: 'bg-blue-500',
      tiktok: 'bg-black',
      youtube: 'bg-red-500',
      instagram: 'bg-pink-500',
      twitter: 'bg-blue-400',
      reddit: 'bg-orange-500'
    };
    return colors[platform] || 'bg-gray-500';
  };

  if (loading) {
    return <div className="text-white">Загрузка шаблонов сценариев...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white">Шаблоны сценариев</h3>
          <p className="text-gray-400">Создание и управление JSON-конфигурациями сценариев</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-500 hover:bg-purple-600" onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Создать шаблон
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Создание шаблона сценария</DialogTitle>
              <DialogDescription className="text-gray-400">
                Настройте шаги автоматизации для выбранной платформы
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Основная информация */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300">Название</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Например: Лайки Instagram"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Платформа</label>
                  <Select value={formData.platform} onValueChange={(value) => setFormData(prev => ({ ...prev, platform: value }))}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Выберите платформу" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {PLATFORMS.map((platform) => (
                        <SelectItem key={platform.value} value={platform.value}>
                          {platform.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300">Описание</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Краткое описание сценария"
                />
              </div>

              {/* Добавление шагов */}
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Добавить шаг</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-300">Тип шага</label>
                      <Select value={currentStep.type} onValueChange={(value) => setCurrentStep(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder="Выберите тип" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          {STEP_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-300">Название</label>
                      <Input
                        value={currentStep.name}
                        onChange={(e) => setCurrentStep(prev => ({ ...prev, name: e.target.value }))}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="Название шага"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-300">Описание</label>
                      <Input
                        value={currentStep.description}
                        onChange={(e) => setCurrentStep(prev => ({ ...prev, description: e.target.value }))}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="Описание"
                      />
                    </div>
                  </div>

                  {/* Динамические поля в зависимости от типа шага */}
                  {getCurrentStepFields().length > 0 && (
                    <div className="grid grid-cols-2 gap-4">
                      {getCurrentStepFields().map((field) => (
                        <div key={field}>
                          <label className="text-sm font-medium text-gray-300 capitalize">{field}</label>
                          {field === 'minTime' || field === 'maxTime' ? (
                            <Input
                              type="number"
                              value={currentStep[field as keyof StepForm] || ''}
                              onChange={(e) => setCurrentStep(prev => ({ ...prev, [field]: parseInt(e.target.value) }))}
                              className="bg-gray-700 border-gray-600 text-white"
                              placeholder={field === 'minTime' ? 'Мин. время (мс)' : 'Макс. время (мс)'}
                            />
                          ) : (
                            <Input
                              value={currentStep[field as keyof StepForm] || ''}
                              onChange={(e) => setCurrentStep(prev => ({ ...prev, [field]: e.target.value }))}
                              className="bg-gray-700 border-gray-600 text-white"
                              placeholder={field === 'selector' ? 'CSS селектор' : field === 'url' ? 'https://...' : 'Текст для ввода'}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <Button onClick={addStep} className="bg-blue-500 hover:bg-blue-600">
                    Добавить шаг
                  </Button>
                </CardContent>
              </Card>

              {/* Список добавленных шагов */}
              {formData.steps.length > 0 && (
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Шаги сценария ({formData.steps.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {formData.steps.map((step, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-800 p-3 rounded">
                          <div>
                            <span className="text-white font-medium">{index + 1}. {step.name}</span>
                            <p className="text-sm text-gray-400">{step.type} - {step.description}</p>
                          </div>
                          <Button
                            onClick={() => removeStep(index)}
                            size="sm"
                            variant="outline"
                            className="border-red-600 text-red-400 hover:bg-red-900"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={handleCreateTemplate} 
                  className="bg-green-600 hover:bg-green-700"
                  disabled={!formData.name || !formData.platform || formData.steps.length === 0}
                >
                  Создать шаблон
                </Button>
                <Button onClick={() => setIsCreateOpen(false)} variant="outline" className="border-gray-600 text-gray-400">
                  Отмена
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Таблица шаблонов */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-300">Название</TableHead>
                <TableHead className="text-gray-300">Платформа</TableHead>
                <TableHead className="text-gray-300">Шагов</TableHead>
                <TableHead className="text-gray-300">Статус</TableHead>
                <TableHead className="text-gray-300">Создан</TableHead>
                <TableHead className="text-gray-300">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id} className="border-gray-700">
                  <TableCell>
                    <div>
                      <div className="text-white font-medium">{template.name}</div>
                      <div className="text-sm text-gray-400">{template.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getPlatformColor(template.platform)} text-white`}>
                      {template.platform}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-300">{template.steps.length}</TableCell>
                  <TableCell>
                    <Badge variant={template.active ? 'default' : 'secondary'}>
                      {template.active ? 'Активен' : 'Неактивен'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {new Date(template.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blue-600 text-blue-400 hover:bg-blue-500/20"
                        onClick={() => {
                          setSelectedTemplate(template);
                          setIsViewOpen(true);
                        }}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-600 text-red-400 hover:bg-red-900"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Диалог просмотра шаблона */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              {selectedTemplate?.name}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Просмотр конфигурации шаблона сценария
            </DialogDescription>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-300">Платформа:</span>
                  <Badge className={`ml-2 ${getPlatformColor(selectedTemplate.platform)} text-white`}>
                    {selectedTemplate.platform}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-300">Шагов:</span>
                  <span className="ml-2 text-white">{selectedTemplate.steps.length}</span>
                </div>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-300">Описание:</span>
                <p className="text-white mt-1">{selectedTemplate.description}</p>
              </div>

              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">JSON конфигурация</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs text-gray-300 bg-gray-800 p-4 rounded overflow-x-auto">
                    {JSON.stringify(selectedTemplate, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScenarioTemplateManager;
