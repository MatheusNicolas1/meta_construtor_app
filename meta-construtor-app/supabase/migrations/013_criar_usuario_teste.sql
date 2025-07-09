-- ===================================================================
-- Migração 013: Criar usuário de teste e dados iniciais
-- ===================================================================

-- 1. Inserir empresa de teste
INSERT INTO empresas (id, nome, cnpj, telefone, email, responsavel, plano, status, data_contratacao)
VALUES (
  'ea8f1e5c-2b4d-4e91-9f0a-123456789abc',
  'MetaConstrutor Ltda',
  '12.345.678/0001-90',
  '(11) 99999-9999',
  'contato@metaconstrutor.com',
  'João Silva',
  'profissional',
  'ativa',
  CURRENT_DATE
)
ON CONFLICT (id) DO NOTHING;

-- 2. Equipamentos de teste
INSERT INTO equipamentos (id, nome, categoria, tipo, valor_diario, status, data_aquisicao, empresa_id) VALUES
('eq1', 'Escavadeira CAT 320', 'Pesado', 'proprio', 800.00, 'disponivel', '2024-01-01', 'ea8f1e5c-2b4d-4e91-9f0a-123456789abc'),
('eq2', 'Betoneira 400L', 'Concreto', 'proprio', 150.00, 'disponivel', '2024-01-01', 'ea8f1e5c-2b4d-4e91-9f0a-123456789abc'),
('eq3', 'Guindaste 15t', 'Içamento', 'alugado', 1200.00, 'disponivel', '2024-01-01', 'ea8f1e5c-2b4d-4e91-9f0a-123456789abc'),
('eq4', 'Retroescavadeira JCB', 'Pesado', 'proprio', 650.00, 'disponivel', '2024-01-01', 'ea8f1e5c-2b4d-4e91-9f0a-123456789abc'),
('eq5', 'Compactador de Solo', 'Compactação', 'proprio', 250.00, 'disponivel', '2024-01-01', 'ea8f1e5c-2b4d-4e91-9f0a-123456789abc'),
('eq6', 'Serra Circular', 'Ferramenta', 'proprio', 80.00, 'disponivel', '2024-01-01', 'ea8f1e5c-2b4d-4e91-9f0a-123456789abc'),
('eq7', 'Furadeira Industrial', 'Ferramenta', 'proprio', 60.00, 'disponivel', '2024-01-01', 'ea8f1e5c-2b4d-4e91-9f0a-123456789abc'),
('eq8', 'Andaime Metálico', 'Estrutura', 'proprio', 40.00, 'disponivel', '2024-01-01', 'ea8f1e5c-2b4d-4e91-9f0a-123456789abc')
ON CONFLICT (id) DO NOTHING;

-- 3. Equipes de teste
INSERT INTO equipes (id, nome, lider, status, empresa_id) VALUES
('eq-001', 'Equipe Alpha', 'João Silva', 'disponivel', 'ea8f1e5c-2b4d-4e91-9f0a-123456789abc'),
('eq-002', 'Equipe Beta', 'Maria Santos', 'disponivel', 'ea8f1e5c-2b4d-4e91-9f0a-123456789abc'),
('eq-003', 'Equipe Gamma', 'Pedro Costa', 'disponivel', 'ea8f1e5c-2b4d-4e91-9f0a-123456789abc')
ON CONFLICT (id) DO NOTHING;

-- 4. Colaboradores de teste
INSERT INTO colaboradores (id, nome, funcao, telefone, email, equipe_id, status) VALUES
('col-001', 'João Silva', 'Engenheiro Civil', '(11) 99999-1111', 'joao@metaconstrutor.com', 'eq-001', 'ativo'),
('col-002', 'Maria Santos', 'Mestre de Obras', '(11) 99999-2222', 'maria@metaconstrutor.com', 'eq-002', 'ativo'),
('col-003', 'Pedro Costa', 'Pedreiro', '(11) 99999-3333', 'pedro@metaconstrutor.com', 'eq-003', 'ativo'),
('col-004', 'Ana Lima', 'Eletricista', '(11) 99999-4444', 'ana@metaconstrutor.com', 'eq-001', 'ativo'),
('col-005', 'Carlos Oliveira', 'Encanador', '(11) 99999-5555', 'carlos@metaconstrutor.com', 'eq-002', 'ativo')
ON CONFLICT (id) DO NOTHING;

-- 5. Atividades padrão
INSERT INTO atividades (id, nome, categoria, unidade, descricao, duracao_estimada, status) VALUES
('ativ-001', 'Escavação', 'Terraplanagem', 'm³', 'Escavação de terra para fundação', 8, 'ativa'),
('ativ-002', 'Concretagem', 'Estrutura', 'm³', 'Concretagem de lajes e pilares', 6, 'ativa'),
('ativ-003', 'Alvenaria', 'Vedação', 'm²', 'Execução de paredes de alvenaria', 4, 'ativa'),
('ativ-004', 'Revestimento', 'Acabamento', 'm²', 'Aplicação de revestimento cerâmico', 5, 'ativa'),
('ativ-005', 'Pintura', 'Acabamento', 'm²', 'Pintura de paredes internas e externas', 3, 'ativa')
ON CONFLICT (id) DO NOTHING;

-- 6. Fornecedores de teste
INSERT INTO fornecedores (id, nome, cnpj, telefone, email, endereco, categoria, status, empresa_id) VALUES
('forn-001', 'Cimento Brasil S.A.', '11.222.333/0001-44', '(11) 3333-1111', 'vendas@cimentobrasil.com', 'São Paulo, SP', 'Materiais', 'ativo', 'ea8f1e5c-2b4d-4e91-9f0a-123456789abc'),
('forn-002', 'Ferro & Aço Ltda', '22.333.444/0001-55', '(11) 3333-2222', 'comercial@ferroaco.com', 'São Paulo, SP', 'Materiais', 'ativo', 'ea8f1e5c-2b4d-4e91-9f0a-123456789abc'),
('forn-003', 'Máquinas e Equipamentos XYZ', '33.444.555/0001-66', '(11) 3333-3333', 'locacao@maquinasxyz.com', 'São Paulo, SP', 'Equipamentos', 'ativo', 'ea8f1e5c-2b4d-4e91-9f0a-123456789abc')
ON CONFLICT (id) DO NOTHING;

-- 7. Materiais de teste
INSERT INTO materiais (id, nome, categoria, unidade, preco_unitario, fornecedor_id, status) VALUES
('mat-001', 'Cimento CP-II 50kg', 'Cimento', 'sc', 35.90, 'forn-001', 'ativo'),
('mat-002', 'Brita 1', 'Agregado', 'm³', 65.00, 'forn-001', 'ativo'),
('mat-003', 'Areia Média', 'Agregado', 'm³', 45.00, 'forn-001', 'ativo'),
('mat-004', 'Ferro 10mm', 'Estrutura', 'kg', 7.50, 'forn-002', 'ativo'),
('mat-005', 'Bloco Cerâmico 14x19x39', 'Alvenaria', 'un', 1.85, 'forn-001', 'ativo')
ON CONFLICT (id) DO NOTHING;

-- ===================================================================
-- Função para criar usuário de teste no auth.users se não existir
-- ===================================================================

-- Criar função para inserir usuário de teste
CREATE OR REPLACE FUNCTION criar_usuario_teste()
RETURNS VOID AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Verificar se o usuário já existe
  SELECT id INTO user_id FROM auth.users WHERE email = 'admin@metaconstrutor.com';
  
  -- Se não existir, criar o usuário
  IF user_id IS NULL THEN
    -- Gerar UUID fixo para o usuário teste
    user_id := 'a1b2c3d4-e5f6-7890-abcd-123456789012'::UUID;
    
    -- Inserir usuário na tabela auth.users
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'admin@metaconstrutor.com',
      '$2a$10$hqDzjFUD5x4ZE6LVNZ.LMeA5F8Wumy.cJrOVWx.nqNOp8xsVqC0d.', -- senha: 123456
      NOW(),
      NOW(),
      NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"nome": "Admin MetaConstrutor"}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );
    
    -- Inserir identidade na tabela auth.identities  
    INSERT INTO auth.identities (
      provider_id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      'admin@metaconstrutor.com',
      user_id,
      '{"sub": "' || user_id::text || '", "email": "admin@metaconstrutor.com"}',
      'email',
      NOW(),
      NOW(),
      NOW()
    );
  END IF;
  
  -- Inserir ou atualizar perfil do usuário
  INSERT INTO public.profiles (
    id,
    nome,
    cargo,
    empresa,
    telefone,
    nivel_acesso,
    empresa_id,
    status,
    onboarding_concluido,
    created_at,
    updated_at
  ) VALUES (
    user_id,
    'Admin MetaConstrutor',
    'Diretor',
    'MetaConstrutor Ltda',
    '(11) 99999-0000',
    'diretor',
    'ea8f1e5c-2b4d-4e91-9f0a-123456789abc',
    'ativo',
    true,
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    cargo = EXCLUDED.cargo,
    empresa = EXCLUDED.empresa,
    telefone = EXCLUDED.telefone,
    nivel_acesso = EXCLUDED.nivel_acesso,
    empresa_id = EXCLUDED.empresa_id,
    status = EXCLUDED.status,
    onboarding_concluido = EXCLUDED.onboarding_concluido,
    updated_at = NOW();
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Executar a função para criar o usuário teste
SELECT criar_usuario_teste();

-- Remover a função após o uso
DROP FUNCTION IF EXISTS criar_usuario_teste(); 