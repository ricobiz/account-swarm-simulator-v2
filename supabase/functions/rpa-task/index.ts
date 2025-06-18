
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

      // Проверяем что задача уже сохранена в базе данных
      const { data: existingTask, error: checkError } = await supabase
        .from('rpa_tasks')
        .select('id')
        .eq('task_id', task.taskId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Ошибка проверки существующей задачи:', checkError);
        throw checkError;
      }

      // Отправляем задачу внешнему RPA-боту
      const rpaEndpoint = Deno.env.get('RPA_BOT_ENDPOINT');
      if (rpaEndpoint) {
        try {
          console.log('Отправка задачи внешнему RPA-боту...');
          const response = await fetch(`${rpaEndpoint}/execute`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(task),
          });

          if (!response.ok) {
            console.error('RPA-бот недоступен:', response.status);
          } else {
            console.log('Задача успешно отправлена RPA-боту');
          }
        } catch (error) {
          console.error('Ошибка отправки задачи RPA-боту:', error);
        }
      } else {
        console.log('RPA_BOT_ENDPOINT не настроен, имитируем выполнение задачи...');
        
        // Имитируем выполнение задачи для демонстрации
        setTimeout(async () => {
          try {
            const mockResult = {
              success: true,
              message: 'Имитация проверки аккаунта выполнена успешно',
              executionTime: 5000,
              completedActions: task.actions.length,
              data: {
                accountChecked: true,
                loginAttempted: true,
                status: 'working'
              }
            };

            console.log('Обновление результата имитации задачи:', task.taskId);

            const { error: updateError } = await supabase
              .from('rpa_tasks')
              .update({
                status: 'completed',
                result_data: mockResult,
                updated_at: new Date().toISOString()
              })
              .eq('task_id', task.taskId);

            if (updateError) {
              console.error('Ошибка обновления результата имитации:', updateError);
            } else {
              console.log('Результат имитации успешно сохранен');
            }

            // Логируем результат
            await supabase
              .from('logs')
              .insert({
                user_id: null,
                account_id: task.accountId,
                scenario_id: task.scenarioId,
                action: 'RPA задача выполнена (имитация)',
                details: mockResult.message,
                status: 'success'
              });

          } catch (error) {
            console.error('Ошибка при имитации выполнения:', error);
          }
        }, 3000); // Имитируем задержку в 3 секунды
      }

      // Логируем отправку задачи
      await supabase
        .from('logs')
        .insert({
          user_id: null,
          account_id: task.accountId,
          scenario_id: task.scenarioId,
          action: 'RPA задача отправлена',
          details: `Задача ${task.taskId} принята в обработку`,
          status: 'info'
        });

      return new Response(
        JSON.stringify({ 
          success: true, 
          taskId: task.taskId,
          message: 'Задача принята в обработку'
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
