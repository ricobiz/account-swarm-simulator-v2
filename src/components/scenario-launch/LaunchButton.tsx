
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Loader2 } from 'lucide-react';

interface LaunchButtonProps {
  selectedAccounts: string[];
  isLaunching: boolean;
  onLaunch: () => void;
}

const LaunchButton: React.FC<LaunchButtonProps> = ({
  selectedAccounts,
  isLaunching,
  onLaunch
}) => {
  if (selectedAccounts.length === 0) {
    return null;
  }

  return (
    <Button 
      onClick={onLaunch}
      disabled={isLaunching}
      className="w-full bg-green-600 hover:bg-green-700"
    >
      {isLaunching ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Запуск...
        </>
      ) : (
        <>
          <Play className="mr-2 h-4 w-4" />
          Запустить сценарий ({selectedAccounts.length} аккаунтов)
        </>
      )}
    </Button>
  );
};

export default LaunchButton;
