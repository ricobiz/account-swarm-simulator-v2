
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, CheckCircle, XCircle } from 'lucide-react';
import { useAccounts } from '@/hooks/useAccounts';
import { toast } from 'sonner';

const ImportAccountsPanel: React.FC = () => {
  const [importText, setImportText] = useState('');
  const [validationResults, setValidationResults] = useState<{
    valid: string[];
    invalid: string[];
  }>({ valid: [], invalid: [] });
  const [importing, setImporting] = useState(false);

  const { addAccount } = useAccounts();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setImportText(content);
        validateAccounts(content);
      };
      reader.readAsText(file);
    }
  };

  const validateAccounts = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    const valid: string[] = [];
    const invalid: string[] = [];

    lines.forEach(line => {
      const parts = line.trim().split(':');
      if (parts.length >= 2 && parts[0].includes('@') && parts[1].length > 0) {
        valid.push(line.trim());
      } else {
        invalid.push(line.trim());
      }
    });

    setValidationResults({ valid, invalid });
  };

  const handleTextChange = (text: string) => {
    setImportText(text);
    validateAccounts(text);
  };

  const handleImportAccounts = async () => {
    if (validationResults.valid.length === 0) {
      toast.error('Нет валидных аккаунтов для импорта');
      return;
    }

    setImporting(true);
    let successCount = 0;

    try {
      for (const accountLine of validationResults.valid) {
        const parts = accountLine.split(':');
        const username = parts[0];
        const password = parts[1];
        
        // Определяем платформу по username
        let platform = 'Other';
        if (username.includes('@')) {
          if (username.includes('instagram') || username.includes('ig')) {
            platform = 'Instagram';
          } else if (username.includes('twitter') || username.includes('tw')) {
            platform = 'Twitter';
          } else if (username.includes('tiktok') || username.includes('tt')) {
            platform = 'TikTok';
          } else if (username.includes('facebook') || username.includes('fb')) {
            platform = 'Facebook';
          }
        }

        const { error } = await addAccount({
          username,
          password,
          platform,
          status: 'idle',
          proxy_id: null,
          last_action: new Date().toISOString(),
        });

        if (!error) {
          successCount++;
        }
      }

      toast.success(`Импортировано ${successCount} аккаунтов`);
      setImportText('');
      setValidationResults({ valid: [], invalid: [] });
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Ошибка при импорте аккаунтов');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-white">Импорт аккаунтов</h3>
        <p className="text-gray-400">Загрузите аккаунты из файла или введите вручную</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Загрузка файла</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept=".txt,.csv"
                onChange={handleFileUpload}
                className="bg-gray-700 border-gray-600 text-white"
              />
              <Button className="bg-blue-500 hover:bg-blue-600">
                <Upload className="mr-2 h-4 w-4" />
                Загрузить
              </Button>
            </div>
            <div className="text-sm text-gray-400">
              Поддерживаемые форматы: .txt, .csv<br/>
              Формат: username:password или email:password
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Статистика</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{validationResults.valid.length}</div>
                <div className="text-sm text-gray-400">Валидных</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{validationResults.invalid.length}</div>
                <div className="text-sm text-gray-400">Ошибочных</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Ввод вручную</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="username:password&#10;email:password&#10;..."
            value={importText}
            onChange={(e) => handleTextChange(e.target.value)}
            className="min-h-[150px] bg-gray-700 border-gray-600 text-white"
          />
          <Button 
            onClick={handleImportAccounts}
            disabled={validationResults.valid.length === 0 || importing}
            className="mt-4 bg-green-500 hover:bg-green-600 disabled:bg-gray-600"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            {importing ? 'Импорт...' : `Импортировать аккаунты (${validationResults.valid.length})`}
          </Button>
        </CardContent>
      </Card>

      {(validationResults.valid.length > 0 || validationResults.invalid.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {validationResults.valid.length > 0 && (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Валидные аккаунты ({validationResults.valid.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {validationResults.valid.map((account, index) => (
                    <div key={index} className="text-sm text-gray-300 font-mono">
                      {account}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {validationResults.invalid.length > 0 && (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-red-400 flex items-center gap-2">
                  <XCircle className="h-5 w-5" />
                  Ошибочные строки ({validationResults.invalid.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {validationResults.invalid.map((account, index) => (
                    <div key={index} className="text-sm text-red-300 font-mono">
                      {account}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default ImportAccountsPanel;
