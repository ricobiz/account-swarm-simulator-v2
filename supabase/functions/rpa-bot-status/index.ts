
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Получаем URL RPA бота из переменных окружения
    const rpaEndpoint = Deno.env.get('RPA_BOT_ENDPOINT')
    console.log('RPA_BOT_ENDPOINT из переменных окружения:', rpaEndpoint)
    
    if (!rpaEndpoint) {
      console.error('RPA_BOT_ENDPOINT не установлен')
      return new Response(
        JSON.stringify({ 
          error: 'RPA_BOT_ENDPOINT не настроен',
          status: 'configuration_error',
          online: false,
          lastCheck: new Date().toISOString()
        }),
        { 
          status: 200, // Возвращаем 200 чтобы фронтенд получил ответ
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // Проверяем статус health
    console.log('Проверяем статус бота по URL:', `${rpaEndpoint}/health`)
    
    const healthController = new AbortController()
    const healthTimeout = setTimeout(() => healthController.abort(), 10000) // 10 секунд timeout
    
    let healthResponse
    try {
      healthResponse = await fetch(`${rpaEndpoint}/health`, {
        method: 'GET',
        signal: healthController.signal,
        headers: {
          'User-Agent': 'Supabase-Edge-Function/1.0'
        }
      })
      clearTimeout(healthTimeout)
    } catch (error) {
      clearTimeout(healthTimeout)
      console.error('Ошибка подключения к /health:', error.message)
      
      return new Response(
        JSON.stringify({
          error: `Не удается подключиться к RPA боту: ${error.message}`,
          status: 'connection_error',
          online: false,
          url: rpaEndpoint,
          lastCheck: new Date().toISOString()
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    console.log('Ответ от /health:', healthResponse.status)

    let healthData = {}
    try {
      if (healthResponse.ok) {
        healthData = await healthResponse.json()
        console.log('Данные от /health:', healthData)
      }
    } catch (error) {
      console.warn('Не удалось распарсить JSON от /health:', error.message)
    }

    // Проверяем дополнительную информацию от /status
    let statusData = {}
    try {
      const statusController = new AbortController()
      const statusTimeout = setTimeout(() => statusController.abort(), 5000) // 5 секунд timeout
      
      const statusResponse = await fetch(`${rpaEndpoint}/status`, {
        method: 'GET',
        signal: statusController.signal,
        headers: {
          'User-Agent': 'Supabase-Edge-Function/1.0'
        }
      })
      clearTimeout(statusTimeout)
      
      if (statusResponse.ok) {
        statusData = await statusResponse.json()
        console.log('Данные от /status:', statusData)
      }
    } catch (error) {
      console.warn('Не удалось получить /status:', error.message)
    }

    // Объединяем результаты
    const result = {
      ...healthData,
      ...statusData,
      url: rpaEndpoint,
      online: healthResponse?.ok || false,
      lastCheck: new Date().toISOString()
    }

    console.log('Финальный результат:', result)

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )

  } catch (error) {
    console.error('Критическая ошибка Edge Function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        status: 'edge_function_error',
        online: false,
        lastCheck: new Date().toISOString()
      }),
      { 
        status: 200, // Все равно возвращаем 200
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
