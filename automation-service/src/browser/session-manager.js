
export class SessionManager {
  constructor() {
    this.sessionData = new Map();
  }

  getStorageState(accountId) {
    return this.sessionData.get(accountId) || null;
  }

  async saveSessionState(accountId, context) {
    try {
      const state = await context.storageState();
      this.sessionData.set(accountId, state);
      console.log(`Сессия сохранена для аккаунта ${accountId}`);
    } catch (error) {
      console.error(`Ошибка сохранения сессии для аккаунта ${accountId}:`, error);
    }
  }

  clearSession(accountId) {
    this.sessionData.delete(accountId);
  }

  getAllSessions() {
    return Array.from(this.sessionData.keys());
  }
}
