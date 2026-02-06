-- ============================================================================
-- SEED DATA FOR LOCAL DEVELOPMENT
-- ============================================================================
-- Creates a minimal reproducible environment with:
-- 1 Admin User (admin@local.test)
-- 1 Organization (Dev Corp)
-- 1 Project (Obra Exemplo)
-- 1 RDO, 1 Activity, 1 Expense linked to the org
-- ============================================================================

-- Disable triggers to insert into auth.users and bypass some auto-logic
SET session_replication_role = 'replica';

-- 1. Create Dev User (Idempotent)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000001',
  'authenticated',
  'authenticated',
  'admin@local.test',
  '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEF', -- Log in might fail without real hash, but ID exists
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Dev Admin"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- 2. Create Profile (Manual insert since triggers are off)
INSERT INTO public.profiles (
  id,
  name,
  email,
  plan_type,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Dev Admin',
  'admin@local.test',
  'enterprise',
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET plan_type = 'enterprise';

-- 3. Create Organization
INSERT INTO public.orgs (
  id,
  name,
  slug,
  owner_user_id,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  'Dev Corp',
  'dev-corp',
  '00000000-0000-0000-0000-000000000001',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- 4. Create Org Member (Admin)
INSERT INTO public.org_members (
  id,
  org_id,
  user_id,
  role,
  status,
  created_at,
  updated_at,
  joined_at
) VALUES (
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'Administrador'::app_role,
  'active',
  now(),
  now(),
  now()
) ON CONFLICT (org_id, user_id) DO NOTHING;

-- 5. Create Obra
INSERT INTO public.obras (
  id,
  name,
  slug,
  org_id,
  user_id,
  status,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000003',
  'Obra Exemplo',
  'obra-exemplo',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'Em andamento',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- 6. Create RDO
INSERT INTO public.rdos (
  id,
  obra_id,
  org_id,
  data,
  status,
  criado_por_id,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000002',
  now(),
  'Em elaboração',
  '00000000-0000-0000-0000-000000000001',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- 7. Create Atividade
INSERT INTO public.atividades (
  id,
  obra_id,
  org_id,
  titulo,
  status,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000006',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000002',
  'Atividade Seed',
  'Pendente',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- 8. Create Expense
INSERT INTO public.expenses (
  id,
  obra_id,
  org_id,
  description,
  amount,
  status,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000007',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000002',
  'Despesa Seed',
  150.00,
  'Pendente',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- Restore triggers
SET session_replication_role = 'origin';

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Seed data applied successfully: Admin % | Org % | Obra %', 
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003';
END $$;
