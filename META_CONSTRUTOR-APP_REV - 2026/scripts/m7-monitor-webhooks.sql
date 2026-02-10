-- M7.3: Monitoramento de Webhooks (View)

-- View para listar falhas e pendências
CREATE OR REPLACE VIEW public.stripe_events_monitor AS
SELECT 
    id,
    stripe_event_id,
    event_type,
    created_at,
    processed_at,
    processed,
    error,
    -- Extract org_id from payload if possible, or just raw
    payload -> 'data' -> 'object' -> 'metadata' ->> 'org_id' as org_id,
    ROUND((EXTRACT(EPOCH FROM (COALESCE(processed_at, now()) - created_at)) * 1000)::numeric, 2) as latency_ms
FROM 
    public.stripe_events
WHERE 
    processed = false 
    OR error IS NOT NULL
ORDER BY 
    created_at DESC;

-- Query de validação rápida
-- SELECT * FROM public.stripe_events_monitor LIMIT 20;

-- Resumo por tipo de erro
-- SELECT event_type, COUNT(*) as failures FROM public.stripe_events_monitor GROUP BY event_type;
