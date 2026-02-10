import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

export interface RateLimitContext {
    key: string;
    windowSeconds: number;
    maxRequests: number;
}

export class RateLimitError extends Error {
    public readonly resetAt: string;

    constructor(resetAt: string) {
        super(`Too Many Requests. Reset at ${resetAt}`);
        this.name = 'RateLimitError';
        this.resetAt = resetAt;
    }
}

// Non-throwing version
export async function checkRateLimit(
    supabaseClient: SupabaseClient,
    context: RateLimitContext
) {
    const { data, error } = await supabaseClient.rpc('check_rate_limit', {
        p_key: context.key,
        p_window_seconds: context.windowSeconds,
        p_max_requests: context.maxRequests
    });

    if (error) {
        console.error('Rate limit check failed (fail open):', error);
        return { allowed: true, resetAt: new Date().toISOString() };
    }

    if (data && data.length > 0) {
        const { allowed, reset_at } = data[0];
        return { allowed, resetAt: reset_at };
    }

    return { allowed: true, resetAt: new Date().toISOString() };
}

export async function rateLimitOrThrow(
    supabaseClient: SupabaseClient,
    context: RateLimitContext
) {
    const { allowed, resetAt } = await checkRateLimit(supabaseClient, context);
    if (!allowed) {
        throw new RateLimitError(resetAt);
    }
}
