-- ============================================================================
-- MILESTONE 1.2: Vínculo de usuários por organização (membership)
-- ============================================================================
-- Criar tabela org_members para associar usuários a organizações com roles
-- Suporta múltiplos usuários colaborando na mesma org
-- ============================================================================

-- Criar enum para status de membership se não existir
DO $$ BEGIN
  CREATE TYPE public.org_member_status AS ENUM ('active', 'invited', 'inactive');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Criar tabela org_members
CREATE TABLE IF NOT EXISTS public.org_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  -- Relacionamentos
  org_id uuid NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Autorização e status
  role app_role NOT NULL DEFAULT 'Colaborador'::app_role,
  status public.org_member_status NOT NULL DEFAULT 'active',
  
  -- Metadados
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  invited_at timestamptz,
  joined_at timestamptz,
  
  -- Constraints
  CONSTRAINT org_members_unique_user_per_org UNIQUE (org_id, user_id)
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_org_members_org ON public.org_members(org_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON public.org_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_status ON public.org_members(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_org_members_role ON public.org_members(role);

-- Habilitar RLS
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
-- SELECT: membros da org podem ver outros membros
CREATE POLICY "org_members_select_policy"
  ON public.org_members FOR SELECT
  USING (
    -- É membro ativo da mesma org
    org_id IN (
      SELECT org_id FROM public.org_members
      WHERE user_id = auth.uid()
      AND status = 'active'
    )
    -- Ou é owner da org
    OR org_id IN (
      SELECT id FROM public.orgs
      WHERE owner_user_id = auth.uid()
    )
  );

-- INSERT: apenas Admin/Gerente da org pode adicionar membros
CREATE POLICY "org_members_insert_policy"
  ON public.org_members FOR INSERT
  WITH CHECK (
    -- Owner da org pode adicionar
    org_id IN (
      SELECT id FROM public.orgs
      WHERE owner_user_id = auth.uid()
    )
    -- Ou Admin/Gerente da org pode adicionar
    OR (
      org_id IN (
        SELECT org_id FROM public.org_members
        WHERE user_id = auth.uid()
        AND status = 'active'
        AND role IN ('Administrador'::app_role, 'Gerente'::app_role)
      )
    )
  );

-- UPDATE: apenas Admin/Gerente pode alterar membros (exceto auto-update de status)
CREATE POLICY "org_members_update_policy"
  ON public.org_members FOR UPDATE
  USING (
    -- Owner da org
    org_id IN (
      SELECT id FROM public.orgs
      WHERE owner_user_id = auth.uid()
    )
    -- Ou Admin/Gerente da org
    OR org_id IN (
      SELECT org_id FROM public.org_members
      WHERE user_id = auth.uid()
      AND status = 'active'
      AND role IN ('Administrador'::app_role, 'Gerente'::app_role)
    )
    -- Ou o próprio usuário atualizando seu próprio status (ex: aceitar convite)
    OR user_id = auth.uid()
  )
  WITH CHECK (
    -- Owner da org
    org_id IN (
      SELECT id FROM public.orgs
      WHERE owner_user_id = auth.uid()
    )
    -- Ou Admin/Gerente da org
    OR org_id IN (
      SELECT org_id FROM public.org_members
      WHERE user_id = auth.uid()
      AND status = 'active'
      AND role IN ('Administrador'::app_role, 'Gerente'::app_role)
    )
    -- Ou o próprio usuário (mas não pode mudar role)
    OR user_id = auth.uid()
  );

-- DELETE: apenas owner ou Admin da org podem remover membros
CREATE POLICY "org_members_delete_policy"
  ON public.org_members FOR DELETE
  USING (
    -- Owner da org
    org_id IN (
      SELECT id FROM public.orgs
      WHERE owner_user_id = auth.uid()
    )
    -- Ou Admin da org
    OR org_id IN (
      SELECT org_id FROM public.org_members
      WHERE user_id = auth.uid()
      AND status = 'active'
      AND role = 'Administrador'::app_role
    )
    -- Ou o próprio usuário se removendo
    OR user_id = auth.uid()
  );

-- Trigger para atualizar updated_at
CREATE TRIGGER update_org_members_updated_at
  BEFORE UPDATE ON public.org_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para definir joined_at quando status muda para active
CREATE OR REPLACE FUNCTION public.set_org_member_joined_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'active' AND OLD.status != 'active' AND NEW.joined_at IS NULL THEN
    NEW.joined_at := now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_joined_at_trigger
  BEFORE UPDATE ON public.org_members
  FOR EACH ROW
  EXECUTE FUNCTION public.set_org_member_joined_at();

-- ============================================================================
-- BACKFILL: Criar membership para cada org owner como Administrador
-- ============================================================================
-- Executado de forma idempotente (não cria duplicatas)

DO $$
DECLARE
  org_record RECORD;
BEGIN
  -- Para cada org que ainda não tem o owner como membro
  FOR org_record IN 
    SELECT o.id as org_id, o.owner_user_id, o.created_at
    FROM public.orgs o
    WHERE NOT EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id = o.id
      AND om.user_id = o.owner_user_id
    )
  LOOP
    -- Criar membership para o owner como Administrador
    INSERT INTO public.org_members (
      org_id,
      user_id,
      role,
      status,
      joined_at,
      created_at,
      updated_at
    )
    VALUES (
      org_record.org_id,
      org_record.owner_user_id,
      'Administrador'::app_role,
      'active',
      org_record.created_at,  -- joined_at = org creation time
      org_record.created_at,
      org_record.created_at
    );
    
    RAISE NOTICE 'Created admin membership for org %', org_record.org_id;
  END LOOP;
END $$;

-- Adicionar comentários para documentação
COMMENT ON TABLE public.org_members IS 'Membros de organizações. Associa usuários a orgs com role e status específicos.';
COMMENT ON COLUMN public.org_members.role IS 'Role do membro na organização (Administrador, Gerente, Colaborador).';
COMMENT ON COLUMN public.org_members.status IS 'Status do membership: active (ativo), invited (convidado pendente), inactive (removido).';
COMMENT ON COLUMN public.org_members.invited_by IS 'Usuário que convidou este membro para a organização.';
COMMENT ON COLUMN public.org_members.joined_at IS 'Timestamp quando o usuário aceitou o convite e se tornou membro ativo.';
