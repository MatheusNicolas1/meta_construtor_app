-- Validação Reprodutível - Milestone 7

-- 1. Verificar conexão DB
SELECT 1 as db_ok;

-- 2. Verificar Webhooks Pendentes (deve ser 0 idealmente)
SELECT COUNT(*) as pending_webhooks FROM public.stripe_events WHERE processed=false;

-- 3. Verificar Webhooks com Erro (deve ser tratado)
SELECT COUNT(*) as error_webhooks FROM public.stripe_events WHERE error IS NOT NULL;

-- 4. Verificar Existência da View de Monitoramento
SELECT to_regclass('public.stripe_events_monitor') as view_exists;

-- 5. Amostra da View (Top 5 recentes)
SELECT * FROM public.stripe_events_monitor ORDER BY created_at DESC LIMIT 5;
