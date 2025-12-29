
-- Revogar permissões de SELECT direto na tabela profiles para usuários anônimos
-- A função check_user_duplicates já tem SECURITY DEFINER e pode acessar a tabela
-- Não precisamos expor a tabela profiles diretamente para anon
REVOKE SELECT ON public.profiles FROM anon;

-- A função check_user_duplicates com SECURITY DEFINER já tem as permissões necessárias
-- Apenas mantemos as permissões de execução da função
