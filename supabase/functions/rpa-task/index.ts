
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RPATask {
  taskId: string;
  url: string;
  actions: any[];
  accountId: string;
  scenarioId: string;
  blockId: string;
  timeout?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method === 'POST') {
      const body = await req.json();
      const task: RPATask = body.task;

      console.log('Получена RPA задача:', JSON.stringify(task, null, 2));

      if (!task || !task.taskId) {
        console.error('Недопустимые данные задачи:', JSON.stringify(body, null, 2));
        return new Response(
          JSON.stringify({ error: 'Недопустимые данные задачи' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        );
      }

      // Обновляем статус на processing
      await supabase
        .from('rpa_tasks')
        .update({
          status: 'processing',
          updated_at: new Date().toISOString()
        })
        .eq('task_id', task.taskId);

      console.log('Статус задачи обновлен на processing');

      // Получаем RPA_BOT_ENDPOINT из переменных окружения
      const rpaEndpoint = Deno.env.get('RPA_BOT_ENDPOINT');
      
      if (!rpaEndpoint) {
        console.error('RPA_BOT_ENDPOINT не настроен');
        
        await supabase
          .from('rpa_tasks')
          .update({
            status: 'failed',
            result_data: { 
              success: false, 
              error: 'RPA_BOT_ENDPOINT не настроен', 
              message: 'Настройте RPA_BOT_ENDPOINT в секретах Supabase' 
            },
            updated_at: new Date().toISOString()
          })
          .eq('task_id', task.taskId);

        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'RPA_BOT_ENDPOINT не настроен',
            message: 'Настройте RPA_BOT_ENDPOINT=http://localhost:5000 в секретах Supabase'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        );
      }

      // Убираем лишние слеши и формируем правильный URL
      const botUrl = rpaEndpoint.replace(/\/+$/, ''); // убираем слеши в конце
      const executeUrl = `${botUrl}/execute`;

      console.log('Отправка задачи RPA-боту:', executeUrl);

      // Проверяем доступность RPA-бота сначала
      try {
        const healthResponse = await fetch(`${botUrl}/health`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!healthResponse.ok) {
          throw new Error(`RPA-бот недоступен: ${healthResponse.status}`);
        }

        console.log('RPA-бот доступен, отправляем задачу');
      } catch (healthError) {
        console.error('RPA-бот недоступен:', healthError);
        
        await supabase
          .from('rpa_tasks')
          .update({
            status: 'failed',
            result_data: { 
              success: false, 
              error: 'RPA-бот недоступен', 
              message: `Убедитесь что RPA-бот запущен на ${botUrl}. Запустите: cd rpa-bot && python rpa_bot.py` 
            },
            updated_at: new Date().toISOString()
          })
          .eq('task_id', task.taskId);

        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'RPA-бот недоступен',
            message: `Запустите RPA-бота: cd rpa-bot && python rpa_bot.py`
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        );
      }

      // Отправляем задачу внешнему RPA-боту
      try {
        const response = await fetch(executeUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(task),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`RPA-бот вернул ошибку: ${response.status} - ${errorText}`);
        }

        const responseData = await response.json();
        console.log('Данные от RPA-бота:', responseData);
        console.log('Задача успешно отправлена RPA-боту');

      } catch (error) {
        console.error('Ошибка отправки задачи RPA-боту:', error);
        
        await supabase
          .from('rpa_tasks')
          .update({
            status: 'failed',
            result_data: { 
              success: false, 
              error: error.message, 
              message: 'Не удалось отправить задачу RPA-боту' 
            },
            updated_at: new Date().toISOString()
          })
          .eq('task_id', task.taskId);

        return new Response(
          JSON.stringify({ 
            success: false, 
            error: error.message,
            message: 'Не удалось отправить задачу RPA-боту'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        );
      }

      // Логируем отправку задачи
      try {
        await supabase
          .from('logs')
          .insert({
            user_id: null,
            account_id: task.accountId,
            scenario_id: task.scenarioId,
            action: 'RPA задача отправлена',
            details: `Задача ${task.taskId} отправлена RPA-боту`,
            status: 'info'
          });
      } catch (logError) {
        console.error('Ошибка логирования (игнорируем):', logError);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          taskId: task.taskId,
          message: 'Задача отправлена RPA-боту для выполнения'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    if (req.method === 'PUT') {
      // Обновление результата от RPA-бота
      const { taskId, result } = await req.json();

      console.log('Получен результат RPA задачи:', taskId, result);

      const { error: updateError } = await supabase
        .from('rpa_tasks')
        .update({
          status: result.success ? 'completed' : 'failed',
          result_data: result,
          updated_at: new Date().toISOString()
        })
        .eq('task_id', taskId);

      if (updateError) {
        console.error('Ошибка обновления результата RPA:', updateError);
        throw updateError;
      }

      // Логируем результат
      try {
        await supabase
          .from('logs')
          .insert({
            user_id: null,
            account_id: result.accountId,
            scenario_id: result.scenarioId,
            action: result.success ? 'RPA задача выполнена' : 'RPA задача завершилась с ошибкой',
            details: result.message || result.error || 'Нет деталей',
            status: result.success ? 'success' : 'error'
          });
      } catch (logError) {
        console.error('Ошибка логирования (игнорируем):', logError);
      }

      return new Response(
        JSON.stringify({ success: true }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405 
      }
    );

  } catch (error) {
    console.error('Ошибка в RPA функции:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
})
