
-- Conceder permissões de execução para a função check_user_duplicates
-- Isso permite que usuários não autenticados (anon) possam verificar duplicidades durante o signup
GRANT EXECUTE ON FUNCTION public.check_user_duplicates(text, text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.check_user_duplicates(text, text, text) TO authenticated;

-- Garantir que a função possa acessar a tabela profiles
-- A função já usa SECURITY DEFINER, mas vamos garantir as permissões
GRANT SELECT ON public.profiles TO anon;
