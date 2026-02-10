-- M8.4: Maintenance Scripts
-- Prune old logs and rate limits to prevent bloat

-- 1. Prune Rate Limits (> 24h old)
DELETE FROM rate_limits
WHERE created_at < NOW() - INTERVAL '24 hours';

-- 2. Prune old audit logs (optional, e.g. > 1 year)
-- DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '1 year';

-- 3. Prune old webhook events (e.g. > 30 days)
-- DELETE FROM stripe_events WHERE created_at < NOW() - INTERVAL '30 days';

VACUUM (ANALYZE) rate_limits;
