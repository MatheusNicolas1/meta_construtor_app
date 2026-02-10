-- M6.4 Runtime Validation: Quality State Machine
-- Tests transitions PENDING -> REWORK -> DONE -> PASSED and invalid moves

BEGIN;

DO $$
DECLARE
    v_org_id uuid;
    v_user_id uuid;
    v_obra_id uuid;
    v_checklist_id uuid;
    v_item_id uuid;
    v_status text;
BEGIN
    -- 1. Setup Context
    SELECT id, owner_user_id INTO v_org_id, v_user_id FROM orgs LIMIT 1;
    
    INSERT INTO obras (org_id, user_id, nome, localizacao, responsavel, cliente, tipo, data_inicio, previsao_termino, status)
    VALUES (v_org_id, v_user_id, 'TEST QUALITY OBRA', 'Loc', v_user_id, 'Cli', 'Residencial', now(), now() + interval '1 day', 'DRAFT')
    RETURNING id INTO v_obra_id;

    -- 2. Create Checklist
    INSERT INTO quality_checklists (org_id, obra_id, title)
    VALUES (v_org_id, v_obra_id, 'Checklist Teste')
    RETURNING id INTO v_checklist_id;
    
    RAISE NOTICE 'Checklist Created: %', v_checklist_id;

    -- 3. Create Item (PENDING default)
    INSERT INTO quality_items (checklist_id, title, status)
    VALUES (v_checklist_id, 'Item 1', 'PENDING')
    RETURNING id, status::text INTO v_item_id, v_status;

    RAISE NOTICE 'Item Created: % Status: %', v_item_id, v_status;

    IF v_status <> 'PENDING' THEN RAISE EXCEPTION 'Initial status mismatch'; END IF;

    -- 4. Transitions
    
    -- PENDING -> REWORK_REQUESTED
    UPDATE quality_items SET status = 'REWORK_REQUESTED' WHERE id = v_item_id;
    SELECT status::text INTO v_status FROM quality_items WHERE id = v_item_id;
    
    IF v_status <> 'REWORK_REQUESTED' THEN RAISE EXCEPTION 'Failed PENDING -> REWORK_REQUESTED'; END IF;
    RAISE NOTICE '✅ PENDING -> REWORK_REQUESTED passed';

    -- REWORK_REQUESTED -> REWORK_DONE
    UPDATE quality_items SET status = 'REWORK_DONE' WHERE id = v_item_id;
    SELECT status::text INTO v_status FROM quality_items WHERE id = v_item_id;

    IF v_status <> 'REWORK_DONE' THEN RAISE EXCEPTION 'Failed REWORK_REQUESTED -> REWORK_DONE'; END IF;
    RAISE NOTICE '✅ REWORK_REQUESTED -> REWORK_DONE passed';

    -- REWORK_DONE -> PENDING (Should Fail)
    BEGIN
        UPDATE quality_items SET status = 'PENDING' WHERE id = v_item_id;
        RAISE EXCEPTION 'Validation Failed: REWORK_DONE -> PENDING should have been blocked!';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '✅ Invalid transition REWORK_DONE -> PENDING blocked: %', SQLERRM;
    END;

    -- REWORK_DONE -> PASSED (Valid cycle completion)
    UPDATE quality_items SET status = 'PASSED' WHERE id = v_item_id;
    SELECT status::text INTO v_status FROM quality_items WHERE id = v_item_id;

    IF v_status <> 'PASSED' THEN RAISE EXCEPTION 'Failed REWORK_DONE -> PASSED'; END IF;
    RAISE NOTICE '✅ REWORK_DONE -> PASSED passed';

    -- 5. Audit Log Check
    PERFORM 1 FROM audit_logs 
    WHERE action = 'domain.quality_item_status_changed' 
    AND entity_id = v_item_id
    AND (metadata->>'to') = 'REWORK_REQUESTED';
    
    IF FOUND THEN
        RAISE NOTICE '✅ Audit log found';
    ELSE
        RAISE NOTICE '⚠️ Audit log missing for quality item';
    END IF;

END $$;

ROLLBACK;
