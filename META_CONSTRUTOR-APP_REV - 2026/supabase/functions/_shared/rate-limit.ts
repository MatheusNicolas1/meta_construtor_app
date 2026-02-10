import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

export interface RateLimitContext {
    key: string;
    windowSeconds: number;
    maxRequests: number;
}

export async function rateLimitOrThrow(
    supabaseClient: SupabaseClient,
    context: RateLimitContext
) {
    const { data, error } = await supabaseClient.rpc('check_rate_limit', {
        p_key: context.key,
        p_window_seconds: context.windowSeconds,
        p_max_requests: context.maxRequests
    });

    if (error) {
        console.error('Rate limit check failed:', error);
        // Fail open if DB error, or closed? Let's fail open to not block users on infra error, but log it.
        // Actually, for security, usually fail closed, but this is a soft limit.
        // Let's return allowed for now if error, to avoid outage.
        return;
    }

    if (data && data.length > 0) {
        const { allowed, remaining, reset_at } = data[0];

        if (!allowed) {
            throw new Error(`Too Many Requests. Reset at ${reset_at}`);
        }
    }
}
