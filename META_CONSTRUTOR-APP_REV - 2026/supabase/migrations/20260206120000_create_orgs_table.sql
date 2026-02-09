-- ============================================================================
-- MILESTONE 1.1: Estrutura de organização (empresa/workspace)
-- ============================================================================
-- Criar tabela orgs para suportar multi-tenancy
-- Cada organização pode ter múltiplos usuários (implementado em 1.2)
-- ============================================================================

-- Criar tabela orgs
CREATE TABLE IF NOT EXISTS public.orgs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  owner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Constraints
  CONSTRAINT orgs_name_length CHECK (char_length(name) >= 2 AND char_length(name) <= 100),
  CONSTRAINT orgs_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_orgs_owner ON public.orgs(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_orgs_slug ON public.orgs(slug);

-- Habilitar RLS
ALTER TABLE public.orgs ENABLE ROW LEVEL SECURITY;

-- Limpar policies (idempotente)
DROP POLICY IF EXISTS "orgs_select_policy" ON public.orgs;
DROP POLICY IF EXISTS "orgs_insert_policy" ON public.orgs;
DROP POLICY IF EXISTS "orgs_update_policy" ON public.orgs;
DROP POLICY IF EXISTS "orgs_delete_policy" ON public.orgs;

-- SELECT: por enquanto, só o owner (org_members ainda não existe neste ponto do deploy)
CREATE POLICY "orgs_select_policy"
  ON public.orgs FOR SELECT
  USING (owner_user_id = auth.uid());

-- INSERT: apenas o owner pode criar (e deve ser o dono)
CREATE POLICY "orgs_insert_policy"
  ON public.orgs FOR INSERT
  WITH CHECK (owner_user_id = auth.uid());

-- UPDATE: apenas o owner
CREATE POLICY "orgs_update_policy"
  ON public.orgs FOR UPDATE
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

-- DELETE: apenas o owner
CREATE POLICY "orgs_delete_policy"
  ON public.orgs FOR DELETE
  USING (owner_user_id = auth.uid());


-- Função para gerar slug único a partir do nome
CREATE OR REPLACE FUNCTION public.generate_org_slug(org_name text, user_id uuid)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  -- Gerar slug base: lowercase, remover acentos, substituir espaços por hífens
  base_slug := lower(trim(org_name));
  base_slug := regexp_replace(base_slug, '[^a-z0-9\s-]', '', 'g');
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  
  -- Se slug vazio, usar ID do usuário
  IF base_slug = '' THEN
    base_slug := substring(user_id::text from 1 for 8);
  END IF;
  
  final_slug := base_slug;
  
  -- Verificar unicidade e adicionar sufixo se necessário
  WHILE EXISTS (SELECT 1 FROM public.orgs WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_orgs_updated_at
  BEFORE UPDATE ON public.orgs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- BACKFILL: Criar org pessoal para cada usuário existente
-- ============================================================================
-- Executado de forma idempotente (não cria duplicatas)

DO $$
DECLARE
  user_record RECORD;
  user_name text;
  org_slug text;
BEGIN
  -- Para cada usuário que ainda não tem org
  FOR user_record IN 
    SELECT DISTINCT u.id, u.email, p.name
    FROM auth.users u
    LEFT JOIN public.profiles p ON p.id = u.id
    WHERE NOT EXISTS (
      SELECT 1 FROM public.orgs o WHERE o.owner_user_id = u.id
    )
  LOOP
    -- Determinar nome da organização
    IF user_record.name IS NOT NULL AND user_record.name != '' THEN
      user_name := user_record.name;
    ELSE
      user_name := split_part(user_record.email, '@', 1);
    END IF;
    
    -- Gerar slug único
    org_slug := public.generate_org_slug(user_name, user_record.id);
    
    -- Criar organização pessoal
    INSERT INTO public.orgs (owner_user_id, name, slug)
    VALUES (
      user_record.id,
      user_name || '''s Organization',
      org_slug
    );
    
    RAISE NOTICE 'Created org for user %: slug=%', user_record.email, org_slug;
  END LOOP;
END $$;

-- Adicionar comentários para documentação
COMMENT ON TABLE public.orgs IS 'Organizações/workspaces. Cada org pode ter múltiplos usuários colaborando.';
COMMENT ON COLUMN public.orgs.owner_user_id IS 'Usuário proprietário da organização (criador).';
COMMENT ON COLUMN public.orgs.slug IS 'Identificador único URL-friendly para a organização.';
