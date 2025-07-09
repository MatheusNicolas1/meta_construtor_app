-- ================================================
-- DADOS INICIAIS PARA TESTE - META CONSTRUTOR
-- ================================================
-- Objetivo: Inserir dados de exemplo para testar funcionamento
-- Evita telas brancas e permite validação das funcionalidades
-- ================================================

-- 1. INSERIR OBRAS DE EXEMPLO
INSERT INTO public.obras (id, nome, endereco, status, empresa_id) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Shopping Center Norte', 'Av. Principal, 1000 - Centro, São Paulo/SP', 'ativa', '550e8400-e29b-41d4-a716-446655440000'),
    ('550e8400-e29b-41d4-a716-446655440002', 'Residencial Jardins', 'Rua das Flores, 200 - Jardins, São Paulo/SP', 'ativa', '550e8400-e29b-41d4-a716-446655440000'),
    ('550e8400-e29b-41d4-a716-446655440003', 'Escritório Corporativo', 'Av. Paulista, 500 - Bela Vista, São Paulo/SP', 'pausada', '550e8400-e29b-41d4-a716-446655440000'),
    ('550e8400-e29b-41d4-a716-446655440004', 'Condomínio Vila Rica', 'Rua das Palmeiras, 300 - Vila Rica, São Paulo/SP', 'concluida', '550e8400-e29b-41d4-a716-446655440000')
ON CONFLICT (id) DO NOTHING;

-- 2. INSERIR RDOs DE EXEMPLO
INSERT INTO public.rdos (id, obra_id, data, clima, observacoes, equipe) VALUES
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '2024-01-20', 'Ensolarado', 'Escavação da fundação iniciada. Progresso conforme cronograma.', '8 pessoas'),
    ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '2024-01-21', 'Nublado', 'Concretagem da fundação - Bloco A. Equipe trabalhando em ritmo normal.', '10 pessoas'),
    ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '2024-01-22', 'Chuvoso', 'Atividades suspensas devido à chuva. Revisão dos materiais.', '6 pessoas'),
    ('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', '2024-01-20', 'Ensolarado', 'Início da alvenaria do primeiro pavimento. Bom rendimento.', '12 pessoas'),
    ('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', '2024-01-21', 'Parcialmente nublado', 'Continuação da alvenaria. Instalação elétrica em andamento.', '15 pessoas'),
    ('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440003', '2024-01-19', 'Ensolarado', 'Acabamento interno em andamento. Pintura dos escritórios.', '8 pessoas')
ON CONFLICT (id) DO NOTHING;

-- 3. INSERIR CHECKLISTS DE EXEMPLO
INSERT INTO public.checklists (id, obra_id, data, percentual_conclusao, responsavel, observacoes) VALUES
    ('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '2024-01-20', 85.5, 'João Silva', 'Segurança: OK. Equipamentos: OK. Materiais: Pendente entrega areia.'),
    ('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '2024-01-21', 92.0, 'João Silva', 'Todos os itens verificados e aprovados. Obra em conformidade.'),
    ('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', '2024-01-20', 78.5, 'Maria Santos', 'Qualidade: OK. Meio ambiente: Atenção ao descarte. Organização: Melhorar.'),
    ('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', '2024-01-21', 88.0, 'Maria Santos', 'Melhorias implementadas. Descarte organizado. Equipamentos revisados.'),
    ('770e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003', '2024-01-19', 95.0, 'Carlos Lima', 'Excelente conformidade. Todos os itens de segurança atendidos.')
ON CONFLICT (id) DO NOTHING;

-- 4. INSERIR NOTIFICAÇÕES DE EXEMPLO
INSERT INTO public.notificacoes (id, obra_id, titulo, mensagem, lida) VALUES
    ('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'RDO Pendente', 'RDO do dia 22/01/2024 ainda não foi preenchido.', false),
    ('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Entrega de Material', 'Entrega de areia agendada para amanhã às 08:00.', true),
    ('880e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Inspeção Programada', 'Inspeção da CIPA agendada para sexta-feira.', false),
    ('880e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', 'Obra Pausada', 'Obra pausada temporariamente. Aguardando liberação.', true),
    ('880e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440004', 'Obra Concluída', 'Parabéns! Obra finalizada com sucesso.', true)
ON CONFLICT (id) DO NOTHING;

-- ================================================
-- 5. ATUALIZAR ESTATÍSTICAS E VERIFICAR INTEGRIDADE
-- ================================================

-- Atualizar estatísticas das tabelas
ANALYZE public.obras;
ANALYZE public.rdos;
ANALYZE public.checklists;
ANALYZE public.notificacoes;

-- ================================================
-- ✅ FIM DOS DADOS INICIAIS
-- ================================================ 