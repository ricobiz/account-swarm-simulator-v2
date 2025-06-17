
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
      const { task }: { task: RPATask } = await req.json();

      console.log('Получена RPA задача:', task);

      // Сохраняем задачу в базу данных
      const { data: savedTask, error: saveError } = await supabase
        .from('rpa_tasks')
        .insert({
          task_id: task.taskId,
          status: 'pending',
          task_data: task,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (saveError) {
        console.error('Ошибка сохранения RPA задачи:', saveError);
        throw saveError;
      }

      // Отправляем задачу внешнему RPA-боту
      const rpaEndpoint = Deno.env.get('RPA_BOT_ENDPOINT');
      if (rpaEndpoint) {
        try {
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
      }

      // Логируем отправку задачи
      await supabase
        .from('logs')
        .insert({
          user_id: (task as any).userId || null,
          account_id: task.accountId,
          scenario_id: task.scenarioId,
          action: 'RPA задача отправлена',
          details: `Задача ${task.taskId} отправлена RPA-боту для выполнения`,
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
