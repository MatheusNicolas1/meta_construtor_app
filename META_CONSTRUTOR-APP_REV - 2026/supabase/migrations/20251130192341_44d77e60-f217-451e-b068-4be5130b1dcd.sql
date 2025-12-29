-- Criar tabela de despesas
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_submitting_id UUID NOT NULL,
  obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  cost_category TEXT NOT NULL CHECK (cost_category IN ('Material', 'Mão de Obra', 'Equipamento', 'Frete', 'Serviços', 'Outros')),
  invoice_number TEXT NOT NULL,
  supplier_name TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  date_of_expense DATE NOT NULL,
  invoice_file_url TEXT,
  component_id UUID,
  team_member_id UUID,
  approval_status TEXT NOT NULL DEFAULT 'Pending Manager' CHECK (approval_status IN ('Pending Manager', 'Pending General Manager', 'Approved', 'Rejected')),
  manager_approver_id UUID,
  manager_approved_at TIMESTAMP WITH TIME ZONE,
  general_manager_approver_id UUID,
  general_manager_approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX idx_expenses_obra_id ON public.expenses(obra_id);
CREATE INDEX idx_expenses_user_submitting_id ON public.expenses(user_submitting_id);
CREATE INDEX idx_expenses_approval_status ON public.expenses(approval_status);
CREATE INDEX idx_expenses_date ON public.expenses(date_of_expense);

-- Habilitar RLS
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
-- Usuários podem ver despesas de suas obras
CREATE POLICY "Usuários podem ver despesas de suas obras"
ON public.expenses
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.obras
    WHERE obras.id = expenses.obra_id
    AND obras.user_id = auth.uid()
  )
  OR has_any_role(auth.uid(), ARRAY['Administrador'::app_role, 'Gerente'::app_role])
);

-- Usuários podem criar despesas
CREATE POLICY "Usuários podem criar despesas"
ON public.expenses
FOR INSERT
WITH CHECK (user_submitting_id = auth.uid());

-- Gestores podem aprovar/rejeitar no primeiro nível
CREATE POLICY "Gestores podem aprovar primeiro nível"
ON public.expenses
FOR UPDATE
USING (
  (approval_status = 'Pending Manager' AND has_role(auth.uid(), 'Gerente'::app_role))
  OR (approval_status = 'Pending General Manager' AND has_role(auth.uid(), 'Administrador'::app_role))
  OR (user_submitting_id = auth.uid() AND approval_status = 'Pending Manager')
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_expenses_updated_at
BEFORE UPDATE ON public.expenses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Criar bucket de storage para notas fiscais (se não existir)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'invoices',
  'invoices',
  false,
  20971520, -- 20MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para notas fiscais
CREATE POLICY "Usuários podem fazer upload de notas fiscais"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'invoices'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Usuários podem ver suas notas fiscais"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'invoices'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR has_any_role(auth.uid(), ARRAY['Administrador'::app_role, 'Gerente'::app_role])
  )
);

CREATE POLICY "Usuários podem deletar suas notas fiscais"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'invoices'
  AND auth.uid()::text = (storage.foldername(name))[1]
);