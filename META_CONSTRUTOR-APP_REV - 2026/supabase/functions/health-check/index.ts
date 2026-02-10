import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
    const start = performance.now()
    const requestId = crypto.randomUUID()

    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // M8.1: Rate Limit (60 req/60s per IP)
        const ip = req.headers.get('x-forwarded-for') || 'unknown'
        const { rateLimitOrThrow } = await import('../_shared/rate-limit.ts')
        await rateLimitOrThrow(supabaseClient, {
            key: `ip:${ip}|fn:health-check`,
            windowSeconds: 60,
            maxRequests: 60
        })

        // 1. Check DB Connection
        const { error: dbError } = await supabaseClient.from('orgs').select('id').limit(1).single()
        const dbOk = !dbError

        // 2. Check Stripe Event Queue (Pending)
        const { count: pendingCount, error: pendingError } = await supabaseClient
            .from('stripe_events')
            .select('*', { count: 'exact', head: true })
            .eq('processed', false)

        // 3. Check Stripe Event Failures
        const { count: errorCount, error: errorError } = await supabaseClient
            .from('stripe_events')
            .select('*', { count: 'exact', head: true })
            .not('error', 'is', null)

        const latency = performance.now() - start

        const healthData = {
            status: dbOk ? 'ok' : 'degraded',
            time: new Date().toISOString(),
            request_id: requestId,
            checks: {
                database: dbOk,
                stripe_events_pending: pendingCount ?? -1,
                stripe_events_errors: errorCount ?? -1,
            },
            latency_ms: latency
        }

        return new Response(JSON.stringify(healthData), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: dbOk ? 200 : 503,
        })

    } catch (error: any) {
        return new Response(JSON.stringify({ status: 'error', message: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
