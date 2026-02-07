-- Corrigir view para não usar SECURITY DEFINER (que não é permitido em views)
-- Dropar view antiga e recriar sem SECURITY DEFINER
DROP VIEW IF EXISTS public.public_profiles_safe CASCADE;

-- Criar view segura sem SECURITY DEFINER
-- Views herdam automaticamente as políticas RLS das tabelas subjacentes
CREATE VIEW public.public_profiles_safe AS
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

-- Garantir que a view é acessível
GRANT SELECT ON public.public_profiles_safe TO anon;
GRANT SELECT ON public.public_profiles_safe TO authenticated;;
