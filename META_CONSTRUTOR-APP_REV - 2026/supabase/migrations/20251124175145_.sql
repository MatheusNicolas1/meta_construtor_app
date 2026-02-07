-- 1. Criar tabela de cupons
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_percentage INTEGER NOT NULL CHECK (discount_percentage > 0 AND discount_percentage <= 100),
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  usage_limit INTEGER,
  times_used INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Habilitar RLS na tabela de cupons
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- 3. Políticas RLS para cupons
-- Administradores podem ver todos os cupons
CREATE POLICY "Administradores podem ver cupons"
ON public.coupons
FOR SELECT
USING (has_role(auth.uid(), 'Administrador'::app_role));

-- Administradores podem criar cupons
CREATE POLICY "Administradores podem criar cupons"
ON public.coupons
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'Administrador'::app_role));

-- Administradores podem atualizar cupons
CREATE POLICY "Administradores podem atualizar cupons"
ON public.coupons
FOR UPDATE
USING (has_role(auth.uid(), 'Administrador'::app_role));

-- Administradores podem deletar cupons
CREATE POLICY "Administradores podem deletar cupons"
ON public.coupons
FOR DELETE
USING (has_role(auth.uid(), 'Administrador'::app_role));

-- 4. Trigger para updated_at
CREATE TRIGGER update_coupons_updated_at
BEFORE UPDATE ON public.coupons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Adicionar role de Administrador ao usuário principal
-- Primeiro, verificar se o usuário existe e buscar seu ID
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Buscar o ID do usuário pelo email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'matheusnicolas.org@gmail.com';
  
  -- Se o usuário existir, adicionar role de Administrador
  IF v_user_id IS NOT NULL THEN
    -- Remover role existente se houver
    DELETE FROM public.user_roles WHERE user_id = v_user_id;
    
    -- Inserir role de Administrador
    INSERT INTO public.user_roles (user_id, role, created_at, updated_at)
    VALUES (v_user_id, 'Administrador'::app_role, now(), now());
    
    RAISE NOTICE 'Role de Administrador atribuído ao usuário %', v_user_id;
  ELSE
    RAISE NOTICE 'Usuário matheusnicolas.org@gmail.com não encontrado';
  END IF;
END $$;

-- 6. Criar tabela de logs de auditoria para ações administrativas
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL,
  target_user_id UUID REFERENCES auth.users(id),
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Administradores podem ver logs de auditoria"
ON public.admin_audit_logs
FOR SELECT
USING (has_role(auth.uid(), 'Administrador'::app_role));

CREATE POLICY "Sistema pode criar logs de auditoria"
ON public.admin_audit_logs
FOR INSERT
WITH CHECK (true);

-- 7. Criar view para métricas de usuários
CREATE OR REPLACE VIEW public.user_metrics AS
SELECT 
  COUNT(DISTINCT p.id) as total_users,
  COUNT(DISTINCT CASE WHEN p.plan_type = 'free' THEN p.id END) as free_users,
  COUNT(DISTINCT CASE WHEN p.plan_type = 'pro' THEN p.id END) as pro_users,
  COUNT(DISTINCT CASE WHEN p.plan_type = 'enterprise' THEN p.id END) as enterprise_users,
  COUNT(DISTINCT CASE WHEN p.created_at > now() - interval '7 days' THEN p.id END) as new_users_week,
  COUNT(DISTINCT CASE WHEN p.created_at > now() - interval '30 days' THEN p.id END) as new_users_month
FROM public.profiles p;

-- 8. Criar view para métricas de RDOs
CREATE OR REPLACE VIEW public.rdo_metrics AS
SELECT 
  COUNT(*) as total_rdos,
  COUNT(CASE WHEN status = 'Aprovado' THEN 1 END) as approved_rdos,
  COUNT(CASE WHEN status = 'Em elaboração' THEN 1 END) as draft_rdos,
  COUNT(CASE WHEN created_at > now() - interval '7 days' THEN 1 END) as rdos_week,
  COUNT(CASE WHEN created_at > now() - interval '30 days' THEN 1 END) as rdos_month
FROM public.rdos;

-- 9. Políticas para views
GRANT SELECT ON public.user_metrics TO authenticated;
GRANT SELECT ON public.rdo_metrics TO authenticated;;
