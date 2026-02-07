-- Criar tabela para rastreamento de atividades dos usuários
CREATE TABLE IF NOT EXISTS public.user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  event_name TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON public.user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_event_name ON public.user_activity(event_name);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON public.user_activity(created_at DESC);

-- Habilitar RLS
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Usuários podem inserir suas próprias atividades"
ON public.user_activity
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Administradores podem ver todas as atividades"
ON public.user_activity
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'Administrador'::app_role));

-- View para métricas de engajamento (menus mais acessados)
CREATE OR REPLACE VIEW public.menu_engagement_metrics AS
SELECT 
  event_name,
  COUNT(*) as total_views,
  COUNT(DISTINCT user_id) as unique_users,
  DATE_TRUNC('day', created_at) as date
FROM public.user_activity
WHERE event_name LIKE 'view_%'
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY event_name, DATE_TRUNC('day', created_at);

GRANT SELECT ON public.menu_engagement_metrics TO authenticated;;
