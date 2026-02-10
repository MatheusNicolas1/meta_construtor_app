-- Verify Audit Logs
SELECT created_at, action, entity, entity_id, metadata
FROM public.audit_logs
WHERE action IN ('domain.rdo_status_changed','domain.quality_item_status_changed')
ORDER BY created_at DESC
LIMIT 5;
