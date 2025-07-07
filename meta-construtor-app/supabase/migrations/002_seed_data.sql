-- Inserir dados de exemplo
-- IMPORTANTE: Este arquivo contém dados de exemplo para demonstração

-- Inserir obras de exemplo
INSERT INTO public.obras (id, nome, endereco, orcamento, data_inicio, data_previsao, status, responsavel) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Shopping Center Norte', 'Av. Paulista, 1000 - São Paulo, SP', 2500000.00, '2024-01-15', '2024-12-15', 'ativa', 'João Silva'),
('550e8400-e29b-41d4-a716-446655440002', 'Residencial Jardins', 'Rua das Flores, 500 - São Paulo, SP', 1800000.00, '2024-02-01', '2025-01-30', 'ativa', 'Maria Santos'),
('550e8400-e29b-41d4-a716-446655440003', 'Torre Empresarial', 'Av. Faria Lima, 2000 - São Paulo, SP', 3200000.00, '2023-10-01', '2024-11-10', 'ativa', 'Carlos Oliveira'),
('550e8400-e29b-41d4-a716-446655440004', 'Condomínio Residencial Vista Verde', 'Rua dos Pinheiros, 800 - Campinas, SP', 5000000.00, '2024-03-15', '2025-08-20', 'ativa', 'Ana Costa');

-- Inserir equipes de exemplo
INSERT INTO public.equipes (id, nome, lider, obra_id, status) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Equipe Alpha', 'João Silva', '550e8400-e29b-41d4-a716-446655440001', 'ativa'),
('660e8400-e29b-41d4-a716-446655440002', 'Equipe Beta', 'Carlos Lima', '550e8400-e29b-41d4-a716-446655440002', 'ativa'),
('660e8400-e29b-41d4-a716-446655440003', 'Equipe Charlie', 'Ana Costa', '550e8400-e29b-41d4-a716-446655440003', 'ativa'),
('660e8400-e29b-41d4-a716-446655440004', 'Equipe Delta', 'Roberto Santos', NULL, 'disponivel'),
('660e8400-e29b-41d4-a716-446655440005', 'Equipe Echo', 'Diego Silva', '550e8400-e29b-41d4-a716-446655440004', 'ativa');

-- Inserir colaboradores de exemplo
INSERT INTO public.colaboradores (id, nome, funcao, telefone, email, equipe_id, status) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'João Silva', 'Pedreiro', '(11) 99999-0001', 'joao@email.com', '660e8400-e29b-41d4-a716-446655440001', 'ativo'),
('770e8400-e29b-41d4-a716-446655440002', 'Maria Santos', 'Servente', '(11) 99999-0002', 'maria@email.com', '660e8400-e29b-41d4-a716-446655440001', 'ativo'),
('770e8400-e29b-41d4-a716-446655440003', 'Carlos Lima', 'Eletricista', '(11) 99999-0003', 'carlos@email.com', '660e8400-e29b-41d4-a716-446655440002', 'ativo'),
('770e8400-e29b-41d4-a716-446655440004', 'Ana Costa', 'Engenheira', '(11) 99999-0004', 'ana@email.com', '660e8400-e29b-41d4-a716-446655440003', 'ativo'),
('770e8400-e29b-41d4-a716-446655440005', 'Roberto Santos', 'Mestre de Obras', '(11) 99999-0005', 'roberto@email.com', '660e8400-e29b-41d4-a716-446655440004', 'ativo'),
('770e8400-e29b-41d4-a716-446655440006', 'Pedro Oliveira', 'Pedreiro', '(11) 99999-0006', 'pedro@email.com', '660e8400-e29b-41d4-a716-446655440002', 'ativo'),
('770e8400-e29b-41d4-a716-446655440007', 'Lucia Ferreira', 'Pintora', '(11) 99999-0007', 'lucia@email.com', '660e8400-e29b-41d4-a716-446655440003', 'ativo'),
('770e8400-e29b-41d4-a716-446655440008', 'Diego Silva', 'Encanador', '(11) 99999-0008', 'diego@email.com', '660e8400-e29b-41d4-a716-446655440005', 'ativo'),
('770e8400-e29b-41d4-a716-446655440009', 'Camila Rocha', 'Soldadora', '(11) 99999-0009', 'camila@email.com', NULL, 'ativo'),
('770e8400-e29b-41d4-a716-446655440010', 'Fernando Costa', 'Operador de Máquinas', '(11) 99999-0010', 'fernando@email.com', NULL, 'ativo');

-- Inserir equipamentos de exemplo
INSERT INTO public.equipamentos (id, nome, categoria, tipo, valor_diario, status, obra_atual, data_aquisicao, proxima_manutencao, observacoes) VALUES
('880e8400-e29b-41d4-a716-446655440001', 'Betoneira 400L', 'Concreto', 'proprio', 80.00, 'em-uso', '550e8400-e29b-41d4-a716-446655440001', '2023-06-15', '2024-06-15', 'Equipamento em bom estado'),
('880e8400-e29b-41d4-a716-446655440002', 'Guindaste 20t', 'Elevação', 'alugado', 350.00, 'em-uso', '550e8400-e29b-41d4-a716-446655440003', '2024-01-10', NULL, NULL),
('880e8400-e29b-41d4-a716-446655440003', 'Escavadeira Caterpillar', 'Terraplenagem', 'proprio', 450.00, 'manutencao', NULL, '2022-03-20', '2024-03-20', 'Manutenção preventiva programada'),
('880e8400-e29b-41d4-a716-446655440004', 'Compressor 10HP', 'Pneumático', 'proprio', 120.00, 'disponivel', NULL, '2023-09-12', '2024-09-12', NULL),
('880e8400-e29b-41d4-a716-446655440005', 'Retroescavadeira JCB', 'Terraplenagem', 'alugado', 380.00, 'em-uso', '550e8400-e29b-41d4-a716-446655440002', '2024-02-01', NULL, NULL),
('880e8400-e29b-41d4-a716-446655440006', 'Gerador 15KVA', 'Energia', 'proprio', 150.00, 'disponivel', NULL, '2023-11-20', '2024-11-20', NULL),
('880e8400-e29b-41d4-a716-446655440007', 'Serra Circular', 'Corte', 'proprio', 45.00, 'em-uso', '550e8400-e29b-41d4-a716-446655440001', '2023-08-10', '2024-08-10', NULL),
('880e8400-e29b-41d4-a716-446655440008', 'Andaime Tubular', 'Estrutura', 'alugado', 25.00, 'em-uso', '550e8400-e29b-41d4-a716-446655440003', '2024-01-15', NULL, NULL);

-- Inserir atividades de exemplo
INSERT INTO public.atividades (id, nome, categoria, unidade, descricao, duracao_estimada, status, obra_vinculada) VALUES
('990e8400-e29b-41d4-a716-446655440001', 'Fundação', 'Estrutural', 'm³', 'Escavação e concretagem da fundação', 7, 'ativa', '550e8400-e29b-41d4-a716-446655440001'),
('990e8400-e29b-41d4-a716-446655440002', 'Alvenaria', 'Vedação', 'm²', 'Execução de paredes em blocos cerâmicos', 14, 'ativa', '550e8400-e29b-41d4-a716-446655440002'),
('990e8400-e29b-41d4-a716-446655440003', 'Instalações Elétricas', 'Instalações', 'ponto', 'Execução de pontos elétricos e passagem de fiação', 10, 'ativa', NULL),
('990e8400-e29b-41d4-a716-446655440004', 'Cobertura', 'Estrutural', 'm²', 'Execução da estrutura e telhas da cobertura', 12, 'ativa', '550e8400-e29b-41d4-a716-446655440003'),
('990e8400-e29b-41d4-a716-446655440005', 'Pintura Externa', 'Acabamento', 'm²', 'Aplicação de tinta nas fachadas externas', 8, 'ativa', NULL),
('990e8400-e29b-41d4-a716-446655440006', 'Instalações Hidráulicas', 'Instalações', 'ponto', 'Execução de pontos hidráulicos e tubulações', 15, 'ativa', NULL),
('990e8400-e29b-41d4-a716-446655440007', 'Piso Cerâmico', 'Acabamento', 'm²', 'Assentamento de pisos cerâmicos', 6, 'ativa', NULL),
('990e8400-e29b-41d4-a716-446655440008', 'Estrutura Metálica', 'Estrutural', 'kg', 'Montagem de estruturas metálicas', 20, 'ativa', '550e8400-e29b-41d4-a716-446655440004');

-- Inserir RDOs de exemplo
INSERT INTO public.rdos (id, obra_id, equipe_id, data, atividades_executadas, atividades_planejadas, materiais_utilizados, clima, responsavel, localizacao, horas_ociosas, motivo_ociosidade, acidentes, observacoes, status) VALUES
('aa0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '2024-01-15', 'Escavação da fundação - 15m³ executados', 'Continuar escavação e iniciar armadura', 'Aço CA-50, Concreto C25', 'ensolarado', 'João Silva', 'São Paulo, SP - Av. Paulista, 1000', 0, NULL, NULL, 'Trabalho dentro do cronograma', 'enviado'),
('aa0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', '2024-02-01', 'Início da alvenaria do térreo - 25m² executados', 'Continuar alvenaria do térreo', 'Blocos cerâmicos, Argamassa', 'parcialmente_nublado', 'Carlos Lima', 'São Paulo, SP - Rua das Flores, 500', 2, 'Entrega de material atrasada', NULL, 'Pequeno atraso na entrega de blocos', 'aprovado'),
('aa0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003', '2024-01-20', 'Instalação elétrica 1º andar - 18 pontos', 'Finalizar instalação elétrica 1º andar', 'Fios, Eletrodutos, Caixas elétricas', 'chuvoso', 'Ana Costa', 'São Paulo, SP - Av. Faria Lima, 2000', 4, 'Chuva forte impediu trabalho externo', NULL, 'Produtividade reduzida devido ao clima', 'enviado'),
('aa0e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '2024-01-16', 'Continuação da fundação - 20m³ executados', 'Finalizar escavação e iniciar concretagem', 'Aço CA-50, Concreto C25, Madeira para forma', 'ensolarado', 'João Silva', 'São Paulo, SP - Av. Paulista, 1000', 0, NULL, NULL, 'Bom rendimento da equipe', 'aprovado'),
('aa0e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440005', '2024-03-15', 'Terraplenagem inicial - 150m³ movimentados', 'Continuar terraplenagem e nivelamento', 'Combustível para máquinas', 'ensolarado', 'Diego Silva', 'Campinas, SP - Rua dos Pinheiros, 800', 1, 'Parada para manutenção de equipamento', NULL, 'Excelente produtividade', 'enviado');

-- Inserir fornecedores de exemplo
INSERT INTO public.fornecedores (id, nome, cnpj, telefone, email, endereco, categoria, status, observacoes) VALUES
('bb0e8400-e29b-41d4-a716-446655440001', 'Construtora São Paulo Ltda', '12.345.678/0001-90', '(11) 3333-1111', 'contato@construtora-sp.com.br', 'Rua Industrial, 100 - São Paulo, SP', 'Materiais de Construção', 'ativo', 'Fornecedor principal de materiais'),
('bb0e8400-e29b-41d4-a716-446655440002', 'Ferragens Central', '98.765.432/0001-10', '(11) 3333-2222', 'vendas@ferragens-central.com.br', 'Av. Marginal, 500 - São Paulo, SP', 'Ferramentas e Ferragens', 'ativo', 'Ótimo atendimento e preços competitivos'),
('bb0e8400-e29b-41d4-a716-446655440003', 'Aço Brasil S.A.', '11.222.333/0001-44', '(11) 3333-3333', 'comercial@aco-brasil.com.br', 'Rodovia dos Bandeirantes, KM 25', 'Estruturas Metálicas', 'ativo', 'Especialista em estruturas metálicas'),
('bb0e8400-e29b-41d4-a716-446655440004', 'Elétrica Total', '55.666.777/0001-88', '(11) 3333-4444', 'eletrica@total.com.br', 'Rua dos Eletricistas, 200 - São Paulo, SP', 'Materiais Elétricos', 'ativo', 'Grande variedade de materiais elétricos'),
('bb0e8400-e29b-41d4-a716-446655440005', 'Hidráulica Express', '99.888.777/0001-66', '(11) 3333-5555', 'hidraulica@express.com.br', 'Av. das Águas, 300 - São Paulo, SP', 'Materiais Hidráulicos', 'ativo', 'Entrega rápida e qualidade garantida');

-- Inserir materiais de exemplo
INSERT INTO public.materiais (id, nome, categoria, unidade, preco_unitario, fornecedor_id, status) VALUES
('cc0e8400-e29b-41d4-a716-446655440001', 'Cimento CP-II 50kg', 'Aglomerantes', 'saco', 28.50, 'bb0e8400-e29b-41d4-a716-446655440001', 'ativo'),
('cc0e8400-e29b-41d4-a716-446655440002', 'Areia Média', 'Agregados', 'm³', 45.00, 'bb0e8400-e29b-41d4-a716-446655440001', 'ativo'),
('cc0e8400-e29b-41d4-a716-446655440003', 'Brita 1', 'Agregados', 'm³', 65.00, 'bb0e8400-e29b-41d4-a716-446655440001', 'ativo'),
('cc0e8400-e29b-41d4-a716-446655440004', 'Aço CA-50 8mm', 'Ferragens', 'kg', 6.80, 'bb0e8400-e29b-41d4-a716-446655440002', 'ativo'),
('cc0e8400-e29b-41d4-a716-446655440005', 'Aço CA-50 10mm', 'Ferragens', 'kg', 6.80, 'bb0e8400-e29b-41d4-a716-446655440002', 'ativo'),
('cc0e8400-e29b-41d4-a716-446655440006', 'Bloco Cerâmico 14x19x39', 'Alvenaria', 'un', 1.85, 'bb0e8400-e29b-41d4-a716-446655440001', 'ativo'),
('cc0e8400-e29b-41d4-a716-446655440007', 'Fio 2,5mm² (rolo 100m)', 'Elétrica', 'rolo', 185.00, 'bb0e8400-e29b-41d4-a716-446655440004', 'ativo'),
('cc0e8400-e29b-41d4-a716-446655440008', 'Tubo PVC 100mm', 'Hidráulica', 'm', 25.50, 'bb0e8400-e29b-41d4-a716-446655440005', 'ativo'),
('cc0e8400-e29b-41d4-a716-446655440009', 'Tinta Acrílica 18L', 'Pintura', 'galão', 95.00, 'bb0e8400-e29b-41d4-a716-446655440001', 'ativo'),
('cc0e8400-e29b-41d4-a716-446655440010', 'Cerâmica 45x45cm', 'Revestimentos', 'm²', 35.80, 'bb0e8400-e29b-41d4-a716-446655440001', 'ativo');

-- Inserir anexos/fotos de exemplo (URLs fictícias para demonstração)
INSERT INTO public.anexos (id, nome, tipo, url, tamanho, rdo_id, obra_id) VALUES
('dd0e8400-e29b-41d4-a716-446655440001', 'foto_fundacao_01.jpg', 'image/jpeg', '/uploads/rdos/foto_fundacao_01.jpg', 1024000, 'aa0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001'),
('dd0e8400-e29b-41d4-a716-446655440002', 'foto_alvenaria_01.jpg', 'image/jpeg', '/uploads/rdos/foto_alvenaria_01.jpg', 856000, 'aa0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002'),
('dd0e8400-e29b-41d4-a716-446655440003', 'foto_eletrica_01.jpg', 'image/jpeg', '/uploads/rdos/foto_eletrica_01.jpg', 742000, 'aa0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003'),
('dd0e8400-e29b-41d4-a716-446655440004', 'projeto_estrutural.pdf', 'application/pdf', '/uploads/obras/projeto_estrutural.pdf', 2048000, NULL, '550e8400-e29b-41d4-a716-446655440001'),
('dd0e8400-e29b-41d4-a716-446655440005', 'memorial_descritivo.pdf', 'application/pdf', '/uploads/obras/memorial_descritivo.pdf', 1536000, NULL, '550e8400-e29b-41d4-a716-446655440002'); 