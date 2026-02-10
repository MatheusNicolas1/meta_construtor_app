-- M6.5 Security Validation: State Skip Attack
-- Attempt to bypass state machines via direct SQL updates

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
    -- Setup
    SELECT id, owner_user_id INTO v_org_id, v_user_id FROM orgs LIMIT 1;
    
    INSERT INTO obras (org_id, user_id, nome, localizacao, responsavel, cliente, tipo, data_inicio, previsao_termino, status)
    VALUES (v_org_id, v_user_id, 'ATTACK TEST OBRA', 'Loc', v_user_id, 'Cli', 'Residencial', now(), now() + interval '1 day', 'DRAFT')
    RETURNING id INTO v_obra_id;

    -- 1. Attack RDO: DRAFT -> APPROVED (Skip SUBMITTED)
    -- Create DRAFT
    INSERT INTO rdos (org_id, obra_id, user_id, data, periodo, clima, equipe_ociosa, status)
    VALUES (v_org_id, v_obra_id, v_user_id, now(), 'Manha', 'Sol', 'Nao', 'DRAFT')
    RETURNING id INTO v_rdo_id;

    RAISE NOTICE 'Attacking RDO % ...', v_rdo_id;
    
    BEGIN
        UPDATE rdos SET status = 'APPROVED' WHERE id = v_rdo_id;
        RAISE EXCEPTION 'ALARM: RDO state skip SUCCEEDED (Vulnerability!)';
    EXCEPTION WHEN OTHERS THEN
        IF SQLERRM LIKE '%Invalid RDO status transition%' THEN
            RAISE NOTICE '✅ RDO Attack Blocked: %', SQLERRM;
        ELSE
            RAISE NOTICE '⚠️ RDO Blocked with unexpected error: %', SQLERRM;
        END IF;
    END;

    -- 2. Attack Quality Item: PENDING -> PASSED (Valid?)
    -- Wait, PENDING -> PASSED IS valid in my logic?
    -- Logic: PENDING -> PASSED | FAILED | REWORK_REQUESTED.
    -- So PENDING -> PASSED is valid.
    -- Let's try PENDING -> REWORK_DONE (Skip REWORK_REQUESTED).
    
    -- Create Checklist & Item
    INSERT INTO quality_checklists (org_id, obra_id, title) VALUES (v_org_id, v_obra_id, 'Attack List') RETURNING id INTO v_checklist_id;
    INSERT INTO quality_items (checklist_id, title, status) VALUES (v_checklist_id, 'Attack Item', 'PENDING') RETURNING id INTO v_item_id;

    RAISE NOTICE 'Attacking Quality Item % ...', v_item_id;

    BEGIN
        UPDATE quality_items SET status = 'REWORK_DONE' WHERE id = v_item_id;
        RAISE EXCEPTION 'ALARM: Quality Item state skip SUCCEEDED (Vulnerability!)';
    EXCEPTION WHEN OTHERS THEN
        IF SQLERRM LIKE '%Invalid Quality Item status transition%' THEN
             RAISE NOTICE '✅ Quality Attack Blocked: %', SQLERRM;
        ELSE
             RAISE NOTICE '⚠️ Quality Blocked with unexpected error: %', SQLERRM;
        END IF;
    END;

END $$;

ROLLBACK;
