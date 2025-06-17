
import { createClient } from '@supabase/supabase-js';
import { CONFIG } from './config.js';

export const supabase = createClient(
  CONFIG.supabase.url,
  CONFIG.supabase.serviceKey
);

export class DatabaseService {
  async getPendingScenarios() {
    const { data, error } = await supabase
      .from('scenarios')
      .select(`
        *,
        accounts!inner(id, username, password, platform, proxy_id),
        accounts.proxies(ip, port, username, password, country)
      `)
      .eq('status', 'waiting')
      .limit(10);

    if (error) {
      console.error('Error fetching scenarios:', error);
      return [];
    }

    return data || [];
  }

  async updateScenarioStatus(scenarioId, status, progress = null) {
    const updates = { status, updated_at: new Date().toISOString() };
    if (progress !== null) {
      updates.progress = progress;
    }

    const { error } = await supabase
      .from('scenarios')
      .update(updates)
      .eq('id', scenarioId);

    if (error) {
      console.error('Error updating scenario:', error);
    }
  }

  async updateAccountStatus(accountId, status, lastAction = null) {
    const updates = { status, updated_at: new Date().toISOString() };
    if (lastAction) {
      updates.last_action = lastAction;
    }

    const { error } = await supabase
      .from('accounts')
      .update(updates)
      .eq('id', accountId);

    if (error) {
      console.error('Error updating account:', error);
    }
  }

  async createLog(userId, accountId, scenarioId, action, details, status = 'info') {
    const { error } = await supabase
      .from('logs')
      .insert({
        user_id: userId,
        account_id: accountId,
        scenario_id: scenarioId,
        action,
        details,
        status
      });

    if (error) {
      console.error('Error creating log:', error);
    }
  }
}
