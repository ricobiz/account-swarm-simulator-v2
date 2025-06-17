
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Check API key
    const apiKey = req.headers.get('x-api-key')
    if (!apiKey || apiKey !== Deno.env.get('API_KEY')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const url = new URL(req.url)
    const minutes = parseInt(url.searchParams.get('minutes') || '10')
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const sinceTime = new Date(Date.now() - minutes * 60 * 1000).toISOString()

    const { data: logs, error } = await supabase
      .from('logs')
      .select(`
        id,
        action,
        details,
        status,
        created_at,
        account_id,
        scenario_id,
        accounts (username, platform),
        scenarios (name)
      `)
      .gte('created_at', sinceTime)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    const response = {
      timestamp: new Date().toISOString(),
      timeRange: {
        minutes,
        since: sinceTime
      },
      totalLogs: logs?.length || 0,
      logs: logs?.map(log => ({
        id: log.id,
        action: log.action,
        details: log.details,
        status: log.status,
        createdAt: log.created_at,
        accountId: log.account_id,
        scenarioId: log.scenario_id,
        account: log.accounts ? {
          username: log.accounts.username,
          platform: log.accounts.platform
        } : null,
        scenario: log.scenarios ? {
          name: log.scenarios.name
        } : null
      })) || [],
      summary: {
        errorCount: logs?.filter(l => l.status === 'error').length || 0,
        warningCount: logs?.filter(l => l.status === 'warning').length || 0,
        successCount: logs?.filter(l => l.status === 'success').length || 0,
        infoCount: logs?.filter(l => l.status === 'info').length || 0
      }
    }

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('API Logs Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
