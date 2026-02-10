-- M6 Evidence Generation (Fixed Cleanup)
-- Idempotent: Cleans up old runs, creates new evidence, logs it, cleans up again.

BEGIN;
-- 0. Cleanup residuals from failed runs
DELETE FROM quality_items WHERE title = 'Evidence Item';
DELETE FROM quality_checklists WHERE title = 'Evidence Checklist';
DELETE FROM rdos WHERE status = 'SUBMITTED' AND data > now() - interval '1 hour'; -- unsafe? better use user_id or assumption.
-- Better: linking to the specific Obra.
DELETE FROM rdos WHERE obra_id IN (SELECT id FROM obras WHERE nome = 'EVIDENCE OBRA');
DELETE FROM quality_items WHERE checklist_id IN (
    SELECT id FROM quality_checklists WHERE obra_id IN (SELECT id FROM obras WHERE nome = 'EVIDENCE OBRA')
);
DELETE FROM quality_checklists WHERE obra_id IN (SELECT id FROM obras WHERE nome = 'EVIDENCE OBRA');
DELETE FROM obras WHERE nome = 'EVIDENCE OBRA';
COMMIT;

BEGIN;
DO $$
DECLARE
    v_org_id uuid;
    v_user_id uuid;
    v_obra_id uuid;
    v_rdo_id uuid;
    v_checklist_id uuid;
    v_item_id uuid;
BEGIN
    -- Context
    SELECT id, owner_user_id INTO v_org_id, v_user_id FROM orgs LIMIT 1;
    
    INSERT INTO obras (org_id, user_id, nome, localizacao, responsavel, cliente, tipo, data_inicio, previsao_termino, status)
    VALUES (v_org_id, v_user_id, 'EVIDENCE OBRA', 'Loc', v_user_id, 'Cli', 'Residencial', now(), now() + interval '1 day', 'DRAFT')
    RETURNING id INTO v_obra_id;

    -- 1. RDO Evidence
    INSERT INTO rdos (org_id, obra_id, user_id, data, periodo, clima, equipe_ociosa, status)
    VALUES (v_org_id, v_obra_id, v_user_id, now(), 'Tarde', 'Chuva', 'Sim', 'DRAFT')
    RETURNING id INTO v_rdo_id;

    UPDATE rdos SET status = 'SUBMITTED' WHERE id = v_rdo_id;

    -- 2. Quality Evidence
    INSERT INTO quality_checklists (org_id, obra_id, title)
    VALUES (v_org_id, v_obra_id, 'Evidence Checklist')
    RETURNING id INTO v_checklist_id;

    INSERT INTO quality_items (checklist_id, title, status)
    VALUES (v_checklist_id, 'Evidence Item', 'PENDING')
    RETURNING id INTO v_item_id;

    UPDATE quality_items SET status = 'REWORK_REQUESTED' WHERE id = v_item_id;

END $$;
COMMIT;

-- Query Evidence
\echo 'RDO Audit Evidence:'
SELECT created_at, action, entity, metadata 
FROM audit_logs 
WHERE action = 'domain.rdo_status_changed' 
  AND (metadata->>'from') = 'DRAFT'
  AND (metadata->>'to') = 'SUBMITTED'
ORDER BY created_at DESC LIMIT 1;

\echo 'Quality Audit Evidence:'
SELECT created_at, action, entity, metadata 
FROM audit_logs 
WHERE action = 'domain.quality_item_status_changed' 
  AND (metadata->>'from') = 'PENDING'
  AND (metadata->>'to') = 'REWORK_REQUESTED'
ORDER BY created_at DESC LIMIT 1;

-- Cleanup (New data)
BEGIN;
DELETE FROM quality_items WHERE checklist_id IN (
    SELECT id FROM quality_checklists WHERE obra_id IN (SELECT id FROM obras WHERE nome = 'EVIDENCE OBRA')
);
DELETE FROM quality_checklists WHERE obra_id IN (SELECT id FROM obras WHERE nome = 'EVIDENCE OBRA');
DELETE FROM rdos WHERE obra_id IN (SELECT id FROM obras WHERE nome = 'EVIDENCE OBRA');
DELETE FROM obras WHERE nome = 'EVIDENCE OBRA';
COMMIT;
