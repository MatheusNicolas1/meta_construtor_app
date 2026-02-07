-- Garantir que todas as políticas RLS estejam corretas e tabelas adequadas

-- Função para verificar duplicidade antes do cadastro
CREATE OR REPLACE FUNCTION check_user_duplicates(
  p_email TEXT,
  p_phone TEXT,
  p_cpf_cnpj TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSON;
  v_duplicate_field TEXT := NULL;
BEGIN
  -- Verificar email
  IF EXISTS (SELECT 1 FROM profiles WHERE email = p_email) THEN
    v_duplicate_field := 'email';
  -- Verificar telefone
  ELSIF EXISTS (SELECT 1 FROM profiles WHERE phone = p_phone) THEN
    v_duplicate_field := 'phone';
  -- Verificar CPF/CNPJ
  ELSIF EXISTS (SELECT 1 FROM profiles WHERE cpf_cnpj = p_cpf_cnpj) THEN
    v_duplicate_field := 'cpf_cnpj';
  END IF;
  
  v_result := json_build_object(
    'has_duplicate', v_duplicate_field IS NOT NULL,
    'duplicate_field', v_duplicate_field
  );
  
  RETURN v_result;
END;
$$;

-- Garantir índices únicos para evitar duplicação
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_unique ON profiles(email);
CREATE UNIQUE INDEX IF NOT EXISTS profiles_phone_unique ON profiles(phone) WHERE phone IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_cpf_cnpj_unique ON profiles(cpf_cnpj) WHERE cpf_cnpj IS NOT NULL;

-- Atualizar RLS para garantir isolamento total de dados
-- Obras: apenas dono pode ver suas obras
DROP POLICY IF EXISTS "Usuários autenticados podem ver todas as obras" ON obras;
CREATE POLICY "Usuários podem ver apenas suas próprias obras"
ON obras FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- RDOs: apenas dono ou gerente/admin podem ver
DROP POLICY IF EXISTS "Usuários autenticados podem ver RDOs" ON rdos;
CREATE POLICY "Usuários podem ver apenas seus próprios RDOs"
ON rdos FOR SELECT
TO authenticated
USING (
  criado_por_id = auth.uid() OR
  has_any_role(auth.uid(), ARRAY['Administrador'::app_role, 'Gerente'::app_role])
);

-- Equipamentos: apenas dono pode ver
DROP POLICY IF EXISTS "Usuários autenticados podem ver equipamentos" ON equipamentos;
CREATE POLICY "Usuários podem ver apenas seus próprios equipamentos"
ON equipamentos FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Equipes: apenas dono pode ver
DROP POLICY IF EXISTS "Usuários autenticados podem ver equipes" ON equipes;
CREATE POLICY "Usuários podem ver apenas suas próprias equipes"
ON equipes FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Fornecedores: apenas dono pode ver
DROP POLICY IF EXISTS "Usuários autenticados podem ver fornecedores" ON fornecedores;
CREATE POLICY "Usuários podem ver apenas seus próprios fornecedores"
ON fornecedores FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Documentos: apenas dono pode ver
DROP POLICY IF EXISTS "Usuários autenticados podem ver documentos" ON documentos;
CREATE POLICY "Usuários podem ver apenas seus próprios documentos"
ON documentos FOR SELECT
TO authenticated
USING (
  uploaded_by = auth.uid() OR
  has_role(auth.uid(), 'Administrador'::app_role)
);

-- Checklists: apenas responsável ou admin pode ver
DROP POLICY IF EXISTS "Usuários autenticados podem ver checklists" ON checklists;
CREATE POLICY "Usuários podem ver apenas seus próprios checklists"
ON checklists FOR SELECT
TO authenticated
USING (
  responsavel_id = auth.uid() OR
  has_any_role(auth.uid(), ARRAY['Administrador'::app_role, 'Gerente'::app_role])
);

-- Limpar dados de exemplo (comentado para evitar perda acidental)
-- Descomentar e executar manualmente se necessário
-- DELETE FROM rdos WHERE criado_por_id NOT IN (SELECT id FROM auth.users WHERE email = 'matheusnicolas.org@gmail.com');
-- DELETE FROM obras WHERE user_id NOT IN (SELECT id FROM auth.users WHERE email = 'matheusnicolas.org@gmail.com');
-- DELETE FROM equipamentos WHERE user_id NOT IN (SELECT id FROM auth.users WHERE email = 'matheusnicolas.org@gmail.com');
-- DELETE FROM equipes WHERE user_id NOT IN (SELECT id FROM auth.users WHERE email = 'matheusnicolas.org@gmail.com');
-- DELETE FROM fornecedores WHERE user_id NOT IN (SELECT id FROM auth.users WHERE email = 'matheusnicolas.org@gmail.com');;
