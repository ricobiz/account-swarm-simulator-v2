
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
    console.log('Обработка запроса get-rpa-tasks...');
    
    // Используем service role ключ для полного доступа к данным
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    // Создаем клиент с service role ключом
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (req.method === 'GET') {
      console.log('Получение RPA задач...');
      
      // Получаем пользователя из заголовка Authorization
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        console.error('Отсутствует заголовок Authorization');
        return new Response(
          JSON.stringify({ error: 'Authorization required' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 401 
          }
        );
      }

      // Используем анонимный клиент для проверки пользователя
      const anonClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
        global: {
          headers: { Authorization: authHeader },
        },
      });

      const { data: { user }, error: userError } = await anonClient.auth.getUser();
      
      if (userError || !user) {
        console.error('Ошибка аутентификации:', userError);
        return new Response(
          JSON.stringify({ error: 'Не авторизован', details: userError?.message }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 401 
          }
        );
      }

      console.log('Пользователь аутентифицирован:', user.id);

      // Получаем RPA задачи пользователя с использованием service role
      const { data: tasks, error } = await supabase
        .from('rpa_tasks')
        .select('*')
        .eq('user_id', user.id)
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

      console.log(`Получено ${tasks?.length || 0} RPA задач для пользователя ${user.id}`);

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
