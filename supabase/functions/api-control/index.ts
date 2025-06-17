
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

    const url = new URL(req.url)
    const action = url.pathname.split('/').pop()
    
    if (!req.body) {
      return new Response(
        JSON.stringify({ error: 'Request body required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const body = await req.json()

    switch (action) {
      case 'stop-account': {
        const { accountId } = body
        if (!accountId) {
          return new Response(
            JSON.stringify({ error: 'accountId is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
          )
        }

        // Update account status
        const { error: accountError } = await supabase
          .from('accounts')
          .update({ 
            status: 'idle',
            updated_at: new Date().toISOString()
          })
          .eq('id', accountId)

        if (accountError) throw accountError

        // Stop related scenarios
        const { error: scenarioError } = await supabase
          .from('scenarios')
          .update({ status: 'stopped' })
          .eq('config->account_id', accountId)
          .in('status', ['running', 'waiting'])

        if (scenarioError) throw scenarioError

        // Create log
        await supabase
          .from('logs')
          .insert({
            account_id: accountId,
            action: 'Аккаунт остановлен через API',
            details: 'Остановлен внешним контроллером',
            status: 'info',
            user_id: '00000000-0000-0000-0000-000000000000' // System user
          })

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Account stopped successfully',
            accountId 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
        )
      }

      case 'restart-account': {
        const { accountId } = body
        if (!accountId) {
          return new Response(
            JSON.stringify({ error: 'accountId is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
          )
        }

        // Reset account status
        const { error: accountError } = await supabase
          .from('accounts')
          .update({ 
            status: 'idle',
            updated_at: new Date().toISOString()
          })
          .eq('id', accountId)

        if (accountError) throw accountError

        // Reset scenarios to waiting
        const { error: scenarioError } = await supabase
          .from('scenarios')
          .update({ 
            status: 'waiting',
            progress: 0
          })
          .eq('config->account_id', accountId)
          .in('status', ['failed', 'stopped'])

        if (scenarioError) throw scenarioError

        // Create log
        await supabase
          .from('logs')
          .insert({
            account_id: accountId,
            action: 'Аккаунт перезапущен через API',
            details: 'Перезапущен внешним контроллером',
            status: 'info',
            user_id: '00000000-0000-0000-0000-000000000000'
          })

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Account restarted successfully',
            accountId 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
        )
      }

      case 'change-proxy': {
        const { accountId, proxyId } = body
        if (!accountId || !proxyId) {
          return new Response(
            JSON.stringify({ error: 'accountId and proxyId are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
          )
        }

        // Update account proxy
        const { error: accountError } = await supabase
          .from('accounts')
          .update({ 
            proxy_id: proxyId,
            status: 'idle',
            updated_at: new Date().toISOString()
          })
          .eq('id', accountId)

        if (accountError) throw accountError

        // Stop current scenarios to force restart with new proxy
        const { error: scenarioError } = await supabase
          .from('scenarios')
          .update({ status: 'waiting' })
          .eq('config->account_id', accountId)
          .eq('status', 'running')

        if (scenarioError) throw scenarioError

        // Create log
        await supabase
          .from('logs')
          .insert({
            account_id: accountId,
            action: 'Прокси изменен через API',
            details: `Новый прокси: ${proxyId}`,
            status: 'info',
            user_id: '00000000-0000-0000-0000-000000000000'
          })

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Proxy changed successfully',
            accountId,
            proxyId
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
        )
      }

      case 'update-settings': {
        const { settings } = body
        if (!settings) {
          return new Response(
            JSON.stringify({ error: 'settings object is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
          )
        }

        // In a real implementation, this would update the automation service config
        // For now, we'll log the settings update
        await supabase
          .from('logs')
          .insert({
            action: 'Настройки обновлены через API',
            details: JSON.stringify(settings),
            status: 'info',
            user_id: '00000000-0000-0000-0000-000000000000'
          })

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Settings updated successfully',
            settings
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
        )
    }

  } catch (error) {
    console.error('API Control Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
