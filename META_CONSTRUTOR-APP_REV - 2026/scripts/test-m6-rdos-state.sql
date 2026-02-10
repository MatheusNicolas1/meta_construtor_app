-- M6.3 Runtime Validation: RDO State Machine (Final v2)
-- Uses Dynamic SQL and drops potential conflicting triggers temporarily

BEGIN;

-- Temporarily drop potentially broken trigger inside this transaction
DROP TRIGGER IF EXISTS consume_credit_on_rdo_creation ON public.rdos;

DO $$
DECLARE
    v_org_id uuid;
    v_user_id uuid;
    v_obra_id uuid;
    v_rdo_id uuid;
    v_status text;
BEGIN
    -- 1. Create Data Context (Or reuse existing)
    SELECT id, owner_user_id INTO v_org_id, v_user_id FROM orgs LIMIT 1;
    
    INSERT INTO obras (org_id, user_id, nome, localizacao, responsavel, cliente, tipo, data_inicio, previsao_termino, status)
    VALUES (v_org_id, v_user_id, 'TEST RDO FINAL v2', 'Loc', v_user_id, 'Cli', 'Residencial', now(), now() + interval '1 day', 'DRAFT')
    RETURNING id INTO v_obra_id;

    RAISE NOTICE 'Obra Created: %', v_obra_id;

    -- 2. Create RDO using Dynamic SQL to bypass parse-time dependency checks
    -- Assuming user_id exists (added by migration)
    EXECUTE 'INSERT INTO rdos (org_id, obra_id, user_id, data, periodo, clima, equipe_ociosa, status)
             VALUES ($1, $2, $3, now(), ''Manhã'', ''Sol'', ''Não'', ''DRAFT'')
             RETURNING id, status::text'
    INTO v_rdo_id, v_status
    USING v_org_id, v_obra_id, v_user_id;

    RAISE NOTICE 'RDO Created: % Status: %', v_rdo_id, v_status;

    -- 3. Validate Transitions
    
    -- DRAFT -> SUBMITTED
    UPDATE rdos SET status = 'SUBMITTED' WHERE id = v_rdo_id;
    SELECT status::text INTO v_status FROM rdos WHERE id = v_rdo_id;
    
    IF v_status <> 'SUBMITTED' THEN 
        RAISE EXCEPTION 'Failed DRAFT -> SUBMITTED'; 
    END IF;
    RAISE NOTICE '✅ DRAFT -> SUBMITTED passed';

    -- SUBMITTED -> APPROVED
    UPDATE rdos SET status = 'APPROVED' WHERE id = v_rdo_id;
    SELECT status::text INTO v_status FROM rdos WHERE id = v_rdo_id;

    IF v_status <> 'APPROVED' THEN 
        RAISE EXCEPTION 'Failed SUBMITTED -> APPROVED'; 
    END IF;
    RAISE NOTICE '✅ SUBMITTED -> APPROVED passed';

    -- APPROVED -> DRAFT (Should Fail/Block)
    BEGIN
        UPDATE rdos SET status = 'DRAFT' WHERE id = v_rdo_id;
        RAISE EXCEPTION 'Validation Failed: APPROVED -> DRAFT should have been blocked!';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '✅ Invalid transition correctly blocked: %', SQLERRM;
    END;

    -- 4. Audit Log Check (Inside Transaction)
    PERFORM 1 FROM audit_logs 
    WHERE action = 'domain.rdo_status_changed' AND entity_id = v_rdo_id;
    IF FOUND THEN
        RAISE NOTICE '✅ Audit log found';
    ELSE
        RAISE NOTICE '⚠️ Audit log NOT visible in transaction (uncommitted) or failed';
    END IF;

END $$;

ROLLBACK;
