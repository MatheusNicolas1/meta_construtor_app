-- Query to check table existence
SELECT 
  to_regclass('public.profiles') as profiles_exists,
  to_regclass('public.orgs') as orgs_exists,
  to_regclass('public.org_members') as org_members_exists,
  to_regclass('public.user_roles') as user_roles_exists,
  to_regclass('public.user_settings') as user_settings_exists,
  to_regclass('public.user_credits') as user_credits_exists;

-- Alternative: List all public tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema='public' 
  AND table_name IN ('profiles','orgs','org_members','user_roles','user_settings','user_credits')
ORDER BY table_name;
