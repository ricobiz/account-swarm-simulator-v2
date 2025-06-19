
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Получаем URL облачного RPA-бота из переменных окружения
    const rpaEndpoint = Deno.env.get('RPA_BOT_ENDPOINT');
    
    console.log('RPA_BOT_ENDPOINT из переменных окружения:', rpaEndpoint);
    
    if (!rpaEndpoint) {
      return new Response(
        JSON.stringify({ 
          online: false,
          error: 'RPA_BOT_ENDPOINT не настроен',
          message: 'Настройте RPA_BOT_ENDPOINT в секретах Supabase'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Убираем trailing slash и добавляем https:// если нужно
    let botUrl = rpaEndpoint.replace(/\/+$/, '');
    if (!botUrl.startsWith('http://') && !botUrl.startsWith('https://')) {
      botUrl = `https://${botUrl}`;
    }

    console.log('Проверяем статус бота по URL:', `${botUrl}/health`);

    // Проверяем статус бота
    const healthResponse = await fetch(`${botUrl}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(10000) // 10 секунд таймаут
    });

    console.log('Ответ от /health:', healthResponse.status);

    if (!healthResponse.ok) {
      throw new Error(`Бот недоступен: ${healthResponse.status}`);
    }

    const healthData = await healthResponse.json();
    console.log('Данные от /health:', healthData);

    // Получаем дополнительную информацию о статусе
    let statusData = {};
    try {
      const statusResponse = await fetch(`${botUrl}/status`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000)
      });
      
      if (statusResponse.ok) {
        statusData = await statusResponse.json();
        console.log('Данные от /status:', statusData);
      }
    } catch (error) {
      console.log('Не удалось получить расширенный статус:', error.message);
    }

    const result = {
      ...healthData,
      ...statusData,
      url: botUrl,
      online: true,
      lastCheck: new Date().toISOString()
    };

    console.log('Финальный результат:', result);

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Ошибка проверки статуса RPA-бота:', error);
    
    return new Response(
      JSON.stringify({ 
        online: false,
        error: error.message,
        lastCheck: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  }
})
