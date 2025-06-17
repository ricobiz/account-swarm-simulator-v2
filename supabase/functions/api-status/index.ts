
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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get accounts status
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .select(`
        id,
        username,
        platform,
        status,
        last_action,
        created_at,
        updated_at,
        proxy_id
      `)

    if (accountsError) {
      throw accountsError
    }

    // Get active scenarios
    const { data: scenarios, error: scenariosError } = await supabase
      .from('scenarios')
      .select(`
        id,
        name,
        platform,
        status,
        progress,
        accounts_count,
        created_at,
        updated_at
      `)
      .in('status', ['running', 'waiting', 'failed'])

    if (scenariosError) {
      throw scenariosError
    }

    // Get recent errors
    const { data: recentErrors, error: errorsError } = await supabase
      .from('logs')
      .select('*')
      .eq('status', 'error')
      .gte('created_at', new Date(Date.now() - 30 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(50)

    if (errorsError) {
      throw errorsError
    }

    const response = {
      timestamp: new Date().toISOString(),
      accounts: accounts?.map(account => ({
        id: account.id,
        username: account.username,
        platform: account.platform,
        status: account.status,
        lastAction: account.last_action,
        proxyId: account.proxy_id,
        createdAt: account.created_at,
        updatedAt: account.updated_at
      })) || [],
      scenarios: scenarios?.map(scenario => ({
        id: scenario.id,
        name: scenario.name,
        platform: scenario.platform,
        status: scenario.status,
        progress: scenario.progress,
        accountsCount: scenario.accounts_count,
        createdAt: scenario.created_at,
        updatedAt: scenario.updated_at
      })) || [],
      recentErrors: recentErrors?.length || 0,
      summary: {
        totalAccounts: accounts?.length || 0,
        activeAccounts: accounts?.filter(a => a.status === 'working').length || 0,
        idleAccounts: accounts?.filter(a => a.status === 'idle').length || 0,
        errorAccounts: accounts?.filter(a => a.status === 'error').length || 0,
        totalScenarios: scenarios?.length || 0,
        runningScenarios: scenarios?.filter(s => s.status === 'running').length || 0
      }
    }

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('API Status Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
