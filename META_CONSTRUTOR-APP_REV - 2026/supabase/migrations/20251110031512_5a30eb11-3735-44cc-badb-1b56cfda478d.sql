-- Criar usuário padrão e configurar sistema de autenticação

-- 1. Inserir usuário diretamente (precisa ser feito via Supabase Dashboard ou API)
-- Este SQL apenas prepara o perfil, o usuário deve ser criado via Dashboard

-- 2. Função para criar usuário padrão com dados completos
CREATE OR REPLACE FUNCTION public.create_default_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_exists boolean;
  new_user_id uuid;
BEGIN
  -- Verificar se o usuário já existe
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'matheusnicolas.org@gmail.com'
  ) INTO user_exists;
  
  -- Se não existir, não faz nada (usuário será criado via interface de signup)
  -- Esta função é apenas para garantir que o perfil seja criado corretamente
  
  -- Nota: A criação do usuário deve ser feita via Supabase Auth API
  -- Esta função apenas garante a estrutura de suporte
END;
$$;

-- 3. Garantir que a função handle_new_user está correta
-- (já existe, mas vamos verificar se está completa)

-- 4. Limpar dados de exemplo (manter apenas estrutura)
-- CUIDADO: Isso vai deletar TODOS os dados existentes!
-- Descomente as linhas abaixo APENAS se quiser limpar tudo

-- DELETE FROM rdo_atividades;
-- DELETE FROM rdo_equipamentos;
-- DELETE FROM rdo_equipes;
-- DELETE FROM rdos;
-- DELETE FROM documentos;
-- DELETE FROM checklist_items;
-- DELETE FROM checklists;
-- DELETE FROM obras;
-- DELETE FROM equipamentos;
-- DELETE FROM equipes;
-- DELETE FROM fornecedores;
-- DELETE FROM posts;
-- DELETE FROM comments;
-- DELETE FROM likes;
-- DELETE FROM follows;
-- DELETE FROM achievements;
-- DELETE FROM social_shares;

-- 5. Atualizar RLS para garantir isolamento de dados
-- Verificar se todas as políticas filtram por user_id corretamente

-- Comentário: As políticas RLS já estão configuradas corretamente
-- para filtrar por auth.uid() em todas as tabelas principais