-- M8 Rate Limit Evidence
-- 1. Check Table Existence
SELECT to_regclass('public.rate_limits') as rate_limits_table;

-- 2. Check RPC Function Existence
SELECT proname FROM pg_proc WHERE proname ILIKE '%rate%' ORDER BY 1;

-- 3. Execute RPC logic test (Simulate 3 requests, limit 2)
-- Using m8:test key

-- Request 1 (Allowed)
SELECT * FROM public.check_rate_limit('m8:test', 60, 2);

-- Request 2 (Allowed)
SELECT * FROM public.check_rate_limit('m8:test', 60, 2);

-- Request 3 (Blocked)
SELECT * FROM public.check_rate_limit('m8:test', 60, 2);
