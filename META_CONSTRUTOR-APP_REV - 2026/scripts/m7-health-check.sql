-- M7.4: Painel Mínimo de Saúde (Health Check Queries)

-- 1. Webhooks Pendentes ou com Erro (Últimas 24h)
SELECT 
    COUNT(*) as failed_pending_24h
FROM public.stripe_events
WHERE 
    (processed = false OR error IS NOT NULL)
    AND created_at > now() - interval '24 hours';

-- 2. Taxa de Erro em Webhooks (Geral)
SELECT 
    ROUND((COUNT(CASE WHEN error IS NOT NULL THEN 1 END)::numeric / COUNT(*)::numeric) * 100, 2) as webhook_error_rate_pct
FROM public.stripe_events;

-- 3. Últimos 5 Erros Críticos de Webhook
SELECT 
    stripe_event_id, 
    event_type, 
    error, 
    created_at 
FROM public.stripe_events 
WHERE error IS NOT NULL 
ORDER BY created_at DESC 
LIMIT 5;

-- 4. Latência Média de Processamento (Últimas 100 reqs)
SELECT 
    ROUND(AVG(EXTRACT(EPOCH FROM (processed_at - created_at)) * 1000)::numeric, 2) as avg_latency_ms
FROM public.stripe_events
WHERE processed = true
ORDER BY created_at DESC
LIMIT 100;

-- 5. Checar Assinaturas Recentes (Últimas 24h)
SELECT COUNT(*) as new_subs_24h 
FROM public.subscriptions 
WHERE created_at > now() - interval '24 hours';
