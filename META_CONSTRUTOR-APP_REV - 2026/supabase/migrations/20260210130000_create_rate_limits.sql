-- M8.1: Rate Limiting
-- Table and function for simple DB-backed rate limiting

CREATE TABLE IF NOT EXISTS public.rate_limits (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    key text NOT NULL,
    window_seconds int NOT NULL,
    max_requests int NOT NULL,
    count int NOT NULL DEFAULT 0,
    window_start timestamptz NOT NULL DEFAULT now(),
    last_request_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT rate_limits_pkey PRIMARY KEY (id),
    CONSTRAINT rate_limits_key_window_unique UNIQUE (key, window_seconds)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_key_window_start ON public.rate_limits (key, window_start DESC);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service role can manage rate limits directly
CREATE POLICY "Service role can manage rate limits" ON public.rate_limits
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Function to check and update rate limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_key text,
    p_window_seconds int,
    p_max_requests int
)
RETURNS TABLE(allowed boolean, remaining int, reset_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    r_window_start timestamptz;
    r_count int;
    is_allowed boolean;
    val_remaining int;
    val_reset_at timestamptz;
BEGIN
    -- Upsert logic
    INSERT INTO public.rate_limits (key, window_seconds, max_requests, count, window_start, last_request_at)
    VALUES (p_key, p_window_seconds, p_max_requests, 1, now(), now())
    ON CONFLICT (key, window_seconds)
    DO UPDATE SET
        -- Reset window if expired
        count = CASE 
            WHEN now() > (rate_limits.window_start + (rate_limits.window_seconds || ' seconds')::interval) THEN 1
            ELSE rate_limits.count + 1
        END,
        window_start = CASE 
            WHEN now() > (rate_limits.window_start + (rate_limits.window_seconds || ' seconds')::interval) THEN now()
            ELSE rate_limits.window_start
        END,
        last_request_at = now()
    RETURNING count, window_start INTO r_count, r_window_start;

    val_reset_at := r_window_start + (p_window_seconds || ' seconds')::interval;
    
    IF r_count <= p_max_requests THEN
        is_allowed := true;
        val_remaining := p_max_requests - r_count;
    ELSE
        is_allowed := false;
        val_remaining := 0;
    END IF;

    RETURN QUERY SELECT is_allowed, val_remaining, val_reset_at;
END;
$$;

-- Grant execute to anon/authenticated so edge functions can call it
GRANT EXECUTE ON FUNCTION public.check_rate_limit(text, int, int) TO anon, authenticated, service_role;
