-- Adicionar índices únicos para garantir unicidade de dados
-- Nota: email já é único via auth.users, mas vamos garantir em profiles também

-- Criar índice único para email (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_unique_idx 
ON public.profiles (LOWER(email));

-- Criar índice único para telefone (apenas números)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_phone_unique_idx 
ON public.profiles (phone) 
WHERE phone IS NOT NULL;

-- Criar índice único para CPF/CNPJ (apenas números)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_cpf_cnpj_unique_idx 
ON public.profiles (cpf_cnpj) 
WHERE cpf_cnpj IS NOT NULL;

-- Atualizar função de verificação de duplicidade
CREATE OR REPLACE FUNCTION public.check_user_duplicates(
  p_email text, 
  p_phone text, 
  p_cpf_cnpj text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_result JSON;
  v_duplicate_field TEXT := NULL;
  v_exists BOOLEAN;
BEGIN
  -- Verificar email (case-insensitive)
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE LOWER(email) = LOWER(p_email)
  ) INTO v_exists;
  
  IF v_exists THEN
    v_duplicate_field := 'email';
  ELSE
    -- Verificar telefone
    SELECT EXISTS (
      SELECT 1 FROM profiles WHERE phone = p_phone AND phone IS NOT NULL
    ) INTO v_exists;
    
    IF v_exists THEN
      v_duplicate_field := 'phone';
    ELSE
      -- Verificar CPF/CNPJ
      SELECT EXISTS (
        SELECT 1 FROM profiles WHERE cpf_cnpj = p_cpf_cnpj AND cpf_cnpj IS NOT NULL
      ) INTO v_exists;
      
      IF v_exists THEN
        v_duplicate_field := 'cpf_cnpj';
      END IF;
    END IF;
  END IF;
  
  v_result := json_build_object(
    'has_duplicate', v_duplicate_field IS NOT NULL,
    'duplicate_field', v_duplicate_field
  );
  
  RETURN v_result;
END;
$function$;