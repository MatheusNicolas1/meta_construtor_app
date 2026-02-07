-- Política de segurança para profiles: restringir dados sensíveis em perfis públicos
-- Drop políticas existentes que permitem acesso público irrestrito
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view only their own profile or public profiles" ON public.profiles;

-- Criar política segura para visualização de perfis
-- Usuários autenticados veem todos os campos de perfis públicos
-- Usuários não autenticados NÃO podem ver dados sensíveis
CREATE POLICY "Authenticated users can view public profiles"
  ON public.profiles FOR SELECT
  USING (
    (id = auth.uid()) OR  -- Próprio usuário vê tudo
    (is_public = true AND auth.uid() IS NOT NULL)  -- Usuários autenticados veem perfis públicos
  );

-- Criar view segura para perfis públicos (sem dados sensíveis)
CREATE OR REPLACE VIEW public.public_profiles_safe AS
SELECT 
  id, 
  name, 
  username, 
  slug, 
  avatar_url, 
  bio, 
  position, 
  website,
  followers_count, 
  following_count, 
  posts_count,
  created_at
FROM profiles
WHERE is_public = true;

-- Permitir acesso público apenas à view segura
GRANT SELECT ON public.public_profiles_safe TO anon;

-- Restringir assinaturas em checklists: apenas responsável e assinante podem ver
-- Criar função para verificar se usuário é o assinante
CREATE OR REPLACE FUNCTION public.is_checklist_signer(checklist_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM checklists
    WHERE id = checklist_id
      AND signature_email = (SELECT email FROM profiles WHERE id = auth.uid())
  );
$$;

-- Atualizar política de checklists para proteger assinaturas
DROP POLICY IF EXISTS "Usuários podem ver apenas seus próprios checklists" ON public.checklists;

CREATE POLICY "Users can view checklists with signature protection"
  ON public.checklists FOR SELECT
  USING (
    (responsavel_id = auth.uid()) OR  -- Responsável vê tudo
    (has_any_role(auth.uid(), ARRAY['Administrador'::app_role, 'Gerente'::app_role]) AND signed_at IS NULL) OR  -- Admin/Gerente vê não assinados
    (is_checklist_signer(id))  -- Assinante vê suas assinaturas
  );;
