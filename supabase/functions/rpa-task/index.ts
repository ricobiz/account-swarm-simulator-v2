
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method === 'POST') {
      // Получение RPA задачи для выполнения
      const { task } = await req.json()
      console.log('Получена RPA задача:', JSON.stringify(task, null, 2))

      if (!task || !task.taskId) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Отсутствует taskId в задаче'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Обновляем статус задачи на processing
      await supabase
        .from('rpa_tasks')
        .update({ status: 'processing' })
        .eq('task_id', task.taskId)

      console.log('Статус задачи обновлен на processing')

      // Получаем endpoint RPA-бота из секретов или используем дефолтный облачный
      const rpaEndpoint = Deno.env.get('RPA_BOT_ENDPOINT') || 'https://rpa-bot-cloud-production.up.railway.app'
      
      console.log('Отправка задачи RPA-боту:', rpaEndpoint + '/execute')

      try {
        // Сначала проверяем доступность RPA-бота
        const healthResponse = await fetch(rpaEndpoint + '/health', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(10000) // 10 секунд таймаут
        })

        if (!healthResponse.ok) {
          throw new Error(`RPA-бот недоступен: ${healthResponse.status}`)
        }

        // Отправляем задачу на выполнение
        const executeResponse = await fetch(rpaEndpoint + '/execute', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(task),
          signal: AbortSignal.timeout(30000) // 30 секунд таймаут
        })

        console.log('Ответ RPA-бота:', executeResponse.status)

        if (executeResponse.ok) {
          const result = await executeResponse.json()
          console.log('RPA задача принята:', result)

          return new Response(JSON.stringify({
            success: true,
            message: 'RPA задача отправлена на выполнение',
            taskId: task.taskId,
            result
          }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        } else {
          const errorText = await executeResponse.text()
          throw new Error(`Ошибка RPA-бота: ${executeResponse.status} - ${errorText}`)
        }

      } catch (error) {
        console.error('RPA-бот недоступен:', error)

        // Обновляем статус задачи на failed
        await supabase
          .from('rpa_tasks')
          .update({ 
            status: 'failed',
            result_data: { 
              error: error.message,
              message: 'RPA-бот недоступен'
            }
          })
          .eq('task_id', task.taskId)

        return new Response(JSON.stringify({
          success: false,
          error: 'RPA-бот недоступен',
          message: 'Проверьте статус облачного RPA-бота или настройте RPA_BOT_ENDPOINT',
          details: error.message
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    if (req.method === 'PUT') {
      // Обновление результата выполнения RPA задачи
      const { taskId, result } = await req.json()
      console.log('Обновление результата RPA задачи:', taskId)

      if (!taskId || !result) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Отсутствует taskId или result'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Обновляем результат в базе данных
      const status = result.success ? 'completed' : 'failed'
      const { error } = await supabase
        .from('rpa_tasks')
        .update({ 
          status,
          result_data: result
        })
        .eq('task_id', taskId)

      if (error) {
        console.error('Ошибка обновления результата:', error)
        return new Response(JSON.stringify({
          success: false,
          error: 'Не удалось обновить результат'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      console.log('Результат RPA задачи обновлен')

      return new Response(JSON.stringify({
        success: true,
        message: 'Результат обновлен'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({
      success: false,
      error: 'Метод не поддерживается'
    }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Общая ошибка RPA функции:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Внутренняя ошибка сервера',
      message: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
