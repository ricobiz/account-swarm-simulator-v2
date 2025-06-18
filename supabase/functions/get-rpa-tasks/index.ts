
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    if (req.method === 'GET') {
      console.log('Получение RPA задач...');
      
      // Получаем все RPA задачи с результатами
      const { data: tasks, error } = await supabase
        .from('rpa_tasks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Ошибка получения RPA задач:', error);
        return new Response(
          JSON.stringify({ error: 'Ошибка получения задач', details: error.message }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        );
      }

      console.log(`Получено ${tasks?.length || 0} RPA задач`);

      // Преобразуем данные в нужный формат
      const formattedTasks = (tasks || []).map(task => ({
        id: task.id,
        taskId: task.task_id,
        status: task.status,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
        result: task.result_data,
        task: task.task_data
      }));

      return new Response(
        JSON.stringify(formattedTasks),
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
    console.error('Критическая ошибка в get-rpa-tasks функции:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Внутренняя ошибка сервера', 
        details: error.message,
        stack: error.stack 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
})
