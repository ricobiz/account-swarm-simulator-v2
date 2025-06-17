
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

    const { taskId } = await req.json();

    const { data: task, error } = await supabase
      .from('rpa_tasks')
      .select('*')
      .eq('task_id', taskId)
      .single();

    if (error) {
      console.error('Ошибка получения RPA задачи:', error);
      throw error;
    }

    const taskInfo = {
      id: task.id,
      taskId: task.task_id,
      status: task.status,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
      task: task.task_data,
      result: task.result_data
    };

    return new Response(
      JSON.stringify(taskInfo),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Ошибка в RPA status функции:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
})
