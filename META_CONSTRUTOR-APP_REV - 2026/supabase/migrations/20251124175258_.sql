-- Corrigir issues de segurança das views

-- 1. Recriar view user_metrics sem SECURITY DEFINER
DROP VIEW IF EXISTS public.user_metrics;
CREATE VIEW public.user_metrics 
WITH (security_invoker = true)
AS
SELECT 
  COUNT(DISTINCT p.id) as total_users,
  COUNT(DISTINCT CASE WHEN p.plan_type = 'free' THEN p.id END) as free_users,
  COUNT(DISTINCT CASE WHEN p.plan_type = 'pro' THEN p.id END) as pro_users,
  COUNT(DISTINCT CASE WHEN p.plan_type = 'enterprise' THEN p.id END) as enterprise_users,
  COUNT(DISTINCT CASE WHEN p.created_at > now() - interval '7 days' THEN p.id END) as new_users_week,
  COUNT(DISTINCT CASE WHEN p.created_at > now() - interval '30 days' THEN p.id END) as new_users_month
FROM public.profiles p;

-- 2. Recriar view rdo_metrics sem SECURITY DEFINER
DROP VIEW IF EXISTS public.rdo_metrics;
CREATE VIEW public.rdo_metrics 
WITH (security_invoker = true)
AS
SELECT 
  COUNT(*) as total_rdos,
  COUNT(CASE WHEN status = 'Aprovado' THEN 1 END) as approved_rdos,
  COUNT(CASE WHEN status = 'Em elaboração' THEN 1 END) as draft_rdos,
  COUNT(CASE WHEN created_at > now() - interval '7 days' THEN 1 END) as rdos_week,
  COUNT(CASE WHEN created_at > now() - interval '30 days' THEN 1 END) as rdos_month
FROM public.rdos;

-- 3. Recriar views públicas sem SECURITY DEFINER
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles 
WITH (security_invoker = true)
AS
SELECT 
  id,
  name,
  username,
  avatar_url,
  bio,
  company,
  position,
  website,
  slug,
  followers_count,
  following_count,
  posts_count
FROM public.profiles
WHERE is_public = true;

DROP VIEW IF EXISTS public.public_profiles_safe;
CREATE VIEW public.public_profiles_safe 
WITH (security_invoker = true)
AS
SELECT 
  id,
  name,
  username,
  avatar_url,
  bio,
  position,
  website,
  slug,
  followers_count,
  following_count,
  posts_count,
  created_at
FROM public.profiles
WHERE is_public = true;

-- 4. Garantir permissões corretas
GRANT SELECT ON public.user_metrics TO authenticated;
GRANT SELECT ON public.rdo_metrics TO authenticated;
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles_safe TO authenticated;;
