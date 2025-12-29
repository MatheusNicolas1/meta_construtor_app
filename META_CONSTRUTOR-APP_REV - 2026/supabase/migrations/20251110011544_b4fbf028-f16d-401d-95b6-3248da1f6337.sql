-- Criar tabela para armazenar preferências de configuração do usuário
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'light',
  primary_color TEXT NOT NULL DEFAULT 'orange',
  font_size TEXT NOT NULL DEFAULT 'medium',
  language TEXT NOT NULL DEFAULT 'pt-BR',
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  push_notifications BOOLEAN NOT NULL DEFAULT true,
  weekly_reports BOOLEAN NOT NULL DEFAULT true,
  deadline_alerts BOOLEAN NOT NULL DEFAULT true,
  budget_notifications BOOLEAN NOT NULL DEFAULT false,
  notification_start_time TEXT NOT NULL DEFAULT '08:00',
  notification_end_time TEXT NOT NULL DEFAULT '18:00',
  two_factor_enabled BOOLEAN NOT NULL DEFAULT false,
  biometric_login BOOLEAN NOT NULL DEFAULT false,
  session_timeout BOOLEAN NOT NULL DEFAULT true,
  min_password_length INTEGER NOT NULL DEFAULT 8,
  password_expiry_days INTEGER NOT NULL DEFAULT 90,
  backup_frequency TEXT NOT NULL DEFAULT 'daily',
  auto_backup BOOLEAN NOT NULL DEFAULT true,
  cloud_sync BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Habilitar RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver suas próprias configurações
CREATE POLICY "Usuários podem ver suas próprias configurações"
ON public.user_settings
FOR SELECT
USING (auth.uid() = user_id);

-- Política: Usuários podem inserir suas próprias configurações
CREATE POLICY "Usuários podem inserir suas próprias configurações"
ON public.user_settings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem atualizar suas próprias configurações
CREATE POLICY "Usuários podem atualizar suas próprias configurações"
ON public.user_settings
FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON public.user_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Comentários
COMMENT ON TABLE public.user_settings IS 'Armazena preferências de configuração do usuário';
COMMENT ON COLUMN public.user_settings.language IS 'Idioma preferido: pt-BR, en-US, es-ES, fr-FR, pt-PT, de-DE, it-IT, ja-JP, zh-CN, ar-SA';