
import React from 'react';
import AccountsPanel from '@/components/AccountsPanel';

const Accounts = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Управление аккаунтами</h1>
          <p className="text-gray-300">Добавляйте и управляйте аккаунтами для автоматизации</p>
        </div>
        <AccountsPanel />
      </div>
    </div>
  );
};

export default Accounts;
