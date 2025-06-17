
import { ProxyManager } from '../proxy-manager.js';
import { DatabaseService } from '../supabase.js';

async function testAllProxies() {
  console.log('🔄 Запуск тестирования всех прокси...');
  
  const db = new DatabaseService();
  const proxyManager = new ProxyManager();
  
  const { data: proxies, error } = await db.supabase
    .from('proxies')
    .select('*');

  if (error) {
    console.error('Ошибка получения прокси:', error);
    return;
  }

  if (!proxies || proxies.length === 0) {
    console.log('Прокси не найдены');
    return;
  }

  console.log(`Найдено ${proxies.length} прокси для тестирования`);

  for (const proxy of proxies) {
    console.log(`\nТестирование прокси ${proxy.ip}:${proxy.port}...`);
    
    const result = await proxyManager.testProxy(proxy);
    await proxyManager.updateProxyStats(proxy.id, result);
    
    if (result.success) {
      console.log(`✅ Прокси работает (${result.responseTime}ms, IP: ${result.ip})`);
    } else {
      console.log(`❌ Прокси не работает (${result.error})`);
    }
  }

  console.log('\n✅ Тестирование завершено');
  process.exit(0);
}

testAllProxies().catch(console.error);
