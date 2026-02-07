-- Criar tabela de atividades do calendário
CREATE TABLE public.atividades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  obra_id UUID REFERENCES public.obras(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  data DATE NOT NULL,
  hora TIME NOT NULL DEFAULT '09:00',
  status TEXT NOT NULL DEFAULT 'agendada' CHECK (status IN ('agendada', 'em_andamento', 'concluida', 'cancelada')),
  prioridade TEXT NOT NULL DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta')),
  categoria TEXT,
  unidade_medida TEXT,
  quantidade_prevista NUMERIC,
  responsavel TEXT,
  notificado BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.atividades ENABLE ROW LEVEL SECURITY;

-- RLS Policies for atividades
CREATE POLICY "Usuários podem ver suas próprias atividades" 
ON public.atividades 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Usuários podem criar atividades" 
ON public.atividades 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuários podem atualizar suas atividades" 
ON public.atividades 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Usuários podem deletar suas atividades" 
ON public.atividades 
FOR DELETE 
USING (user_id = auth.uid());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_atividades_updated_at
BEFORE UPDATE ON public.atividades
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_atividades_user_id ON public.atividades(user_id);
CREATE INDEX idx_atividades_data ON public.atividades(data);
CREATE INDEX idx_atividades_obra_id ON public.atividades(obra_id);
CREATE INDEX idx_atividades_status ON public.atividades(status);;
