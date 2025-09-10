
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Loader2 } from 'lucide-react';

interface LaunchButtonProps {
  selectedAccounts: string[];
  isLaunching: boolean;
  onLaunch: () => void;
  buttonText?: string;
}

const LaunchButton: React.FC<LaunchButtonProps> = ({
  selectedAccounts,
  isLaunching,
  onLaunch,
  buttonText = "Запустить сценарии"
}) => {
  return (
    <Button
      onClick={onLaunch}
      disabled={selectedAccounts.length === 0 || isLaunching}
      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600"
      size="lg"
    >
      {isLaunching ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Запуск...
        </>
      ) : (
        <>
          <Play className="mr-2 h-4 w-4" />
          {buttonText} ({selectedAccounts.length} аккаунтов)
        </>
      )}
    </Button>
  );
};

export default LaunchButton;
