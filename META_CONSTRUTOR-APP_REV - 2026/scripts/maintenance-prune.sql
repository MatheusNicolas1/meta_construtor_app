-- M8.4 Maintenance Script
-- Prune old rate limit records (older than 24 hours)
-- Run this weekly via pg_cron or scheduled job

BEGIN;

-- 1. Prune rate_limits
DELETE FROM public.rate_limits
WHERE window_start < now() - interval '24 hours';

-- 2. Prune stripe_events (Optional - keep for 30 days)
-- DELETE FROM public.stripe_events
-- WHERE created_at < now() - interval '30 days'
-- AND processed = true;

COMMIT;
