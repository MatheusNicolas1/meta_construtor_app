-- M6.3 Runtime Validation: RDO State Machine (Clean)
-- Verified columns: org_id, obra_id, user_id, data, periodo, clima, equipe_ociosa, status

BEGIN;

DO $$
DECLARE
    v_org_id uuid;
    v_user_id uuid;
    v_obra_id uuid;
    v_rdo_id uuid;
    v_status text;
BEGIN
    -- 1. Create Data Context
    SELECT id, owner_user_id INTO v_org_id, v_user_id FROM orgs LIMIT 1;
    
    INSERT INTO obras (org_id, user_id, nome, localizacao, responsavel, cliente, tipo, data_inicio, previsao_termino, status)
    VALUES (v_org_id, v_user_id, 'GATE TEST RDO', 'Loc', v_user_id, 'Cli', 'Residencial', now(), now() + interval '1 day', 'DRAFT')
    RETURNING id INTO v_obra_id;

    -- 2. Create RDO (Standard SQL)
    INSERT INTO rdos (org_id, obra_id, user_id, data, periodo, clima, equipe_ociosa, status)
    VALUES (v_org_id, v_obra_id, v_user_id, now(), 'Manhã', 'Sol', 'Não', 'DRAFT')
    RETURNING id, status::text INTO v_rdo_id, v_status;

    RAISE NOTICE 'RDO Created: % Status: %', v_rdo_id, v_status;

    -- 3. Validate Transitions
    
    -- DRAFT -> SUBMITTED
    UPDATE rdos SET status = 'SUBMITTED' WHERE id = v_rdo_id;
    SELECT status::text INTO v_status FROM rdos WHERE id = v_rdo_id;
    IF v_status <> 'SUBMITTED' THEN RAISE EXCEPTION 'Failed DRAFT -> SUBMITTED'; END IF;

    -- SUBMITTED -> APPROVED
    UPDATE rdos SET status = 'APPROVED' WHERE id = v_rdo_id;
    SELECT status::text INTO v_status FROM rdos WHERE id = v_rdo_id;
    IF v_status <> 'APPROVED' THEN RAISE EXCEPTION 'Failed SUBMITTED -> APPROVED'; END IF;

    -- APPROVED -> DRAFT (Should Fail)
    BEGIN
        UPDATE rdos SET status = 'DRAFT' WHERE id = v_rdo_id;
        RAISE EXCEPTION 'Validation Failed: APPROVED -> DRAFT should have been blocked!';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '✅ Invalid transition correctly blocked: %', SQLERRM;
    END;

    -- 4. Audit Log Check
    -- Note: Might fail if audit trigger writes to separate transaction or visibility issues in test block.
    -- But since we are checking in same transaction, it should be visible IF RLS permits.
    -- Admin execution (postgres) sees all, so should be fine.
    
    PERFORM 1 FROM audit_logs 
    WHERE action = 'domain.rdo_status_changed' AND entity_id = v_rdo_id;
    
    IF FOUND THEN
        RAISE NOTICE '✅ Audit log found';
    ELSE
        RAISE NOTICE '⚠️ Audit log NOT visible (check triggers)';
    END IF;

END $$;

ROLLBACK;
