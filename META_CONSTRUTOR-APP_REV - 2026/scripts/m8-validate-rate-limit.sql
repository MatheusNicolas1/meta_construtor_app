-- Validação M8.1: Rate Limits

-- 1. Verificar tabela e função
SELECT to_regclass('public.rate_limits');
SELECT proname FROM pg_proc WHERE proname='check_rate_limit';

-- 2. Teste direto SQL (Simular 3 calls, limite 2)
SELECT * FROM public.check_rate_limit('test:sql-validation', 60, 2);
SELECT * FROM public.check_rate_limit('test:sql-validation', 60, 2);
SELECT * FROM public.check_rate_limit('test:sql-validation', 60, 2); -- Deve retornar allowed=false
