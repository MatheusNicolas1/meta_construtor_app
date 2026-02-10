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

        // M8.1: Rate Limit (TEST: 2 req/60s per IP)
        const ip = req.headers.get('x-forwarded-for') || 'unknown'
        const { checkRateLimit } = await import('../_shared/rate-limit.ts')

        const { allowed, resetAt } = await checkRateLimit(supabaseClient, {
            key: `ip:${ip}|fn:health-check`,
            windowSeconds: 60,
            maxRequests: 2
        })

        if (!allowed) {
            return new Response(JSON.stringify({
                error: 'rate_limited',
                message: 'Too Many Requests',
                reset_at: resetAt,
                request_id: requestId,
                retry_after_seconds: 60
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '60' },
                status: 429,
            })
        }

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
        // Handle Rate Limit (Name check or Message check fallback)
        if (error.name === 'RateLimitError' || error.message?.includes('Too Many Requests')) {
            const resetAt = error.resetAt || new Date(Date.now() + 60000).toISOString();
            return new Response(JSON.stringify({
                error: 'rate_limited',
                message: error.message || 'Too Many Requests',
                reset_at: resetAt,
                request_id: requestId,
                retry_after_seconds: 60
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '60' },
                status: 429,
            })
        }

        return new Response(JSON.stringify({
            status: 'error',
            message: error.message,
            error_name: error.name // Debug info
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
