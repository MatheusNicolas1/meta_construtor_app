-- Dados de exemplo completos para o sistema MetaConstrutor

-- Inserir empresa de exemplo
INSERT INTO public.empresas (id, nome, cnpj, endereco, telefone, email, responsavel, plano, status, data_contratacao, observacoes) 
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'MetaConstrutor Ltda', '12.345.678/0001-90', 'Av. Construção, 1000 - São Paulo/SP', '(11) 99999-9999', 'contato@metaconstrutor.com', 'João Silva', 'empresarial', 'ativa', CURRENT_DATE, 'Empresa demonstração do sistema')
ON CONFLICT (id) DO NOTHING;

-- Atualizar dados das obras existentes para incluir empresa_id
UPDATE public.obras 
SET empresa_id = '550e8400-e29b-41d4-a716-446655440000'
WHERE empresa_id IS NULL;

-- Atualizar dados das equipes existentes para incluir empresa_id
UPDATE public.equipes 
SET empresa_id = '550e8400-e29b-41d4-a716-446655440000'
WHERE empresa_id IS NULL;

-- Atualizar dados dos equipamentos existentes para incluir empresa_id
UPDATE public.equipamentos 
SET empresa_id = '550e8400-e29b-41d4-a716-446655440000'
WHERE empresa_id IS NULL;

-- Atualizar dados dos fornecedores existentes para incluir empresa_id
UPDATE public.fornecedores 
SET empresa_id = '550e8400-e29b-41d4-a716-446655440000'
WHERE empresa_id IS NULL;

-- Inserir orçamento analítico para as obras existentes
INSERT INTO public.orcamento_analitico (obra_id, nome_atividade, categoria, unidade, quantitativo, valor_unitario, status, responsavel) 
SELECT 
  o.id,
  atividade.nome,
  'Construção Civil',
  atividade.unidade,
  atividade.quantitativo,
  atividade.valor_unitario,
  'planejada',
  o.responsavel
FROM public.obras o
CROSS JOIN (
  VALUES 
    ('Fundação e Estrutura', 'm²', 120.0, 450.00),
    ('Alvenaria e Vedação', 'm²', 300.0, 85.00),
    ('Cobertura e Telhado', 'm²', 150.0, 125.00),
    ('Instalações Elétricas', 'un', 1.0, 8500.00),
    ('Instalações Hidráulicas', 'un', 1.0, 6200.00),
    ('Revestimentos e Acabamentos', 'm²', 280.0, 95.00),
    ('Pintura', 'm²', 350.0, 35.00),
    ('Pisos e Cerâmicas', 'm²', 180.0, 125.00)
) AS atividade(nome, unidade, quantitativo, valor_unitario)
WHERE NOT EXISTS (
  SELECT 1 FROM public.orcamento_analitico oa WHERE oa.obra_id = o.id
);

-- Inserir vínculos entre obras e equipes
INSERT INTO public.obras_equipes (obra_id, equipe_id, data_alocacao, status, funcao_na_obra)
SELECT 
  o.id,
  e.id,
  o.data_inicio,
  'ativa',
  CASE 
    WHEN e.nome LIKE '%Alpha%' THEN 'Estrutura e Fundação'
    WHEN e.nome LIKE '%Beta%' THEN 'Acabamentos'
    WHEN e.nome LIKE '%Charlie%' THEN 'Instalações'
    ELSE 'Serviços Gerais'
  END
FROM public.obras o
CROSS JOIN public.equipes e
WHERE o.status = 'ativa' 
  AND e.status = 'disponivel'
  AND NOT EXISTS (
    SELECT 1 FROM public.obras_equipes oe 
    WHERE oe.obra_id = o.id AND oe.equipe_id = e.id
  )
LIMIT 10; -- Limitar para não sobrecarregar

-- Inserir vínculos entre obras e equipamentos
INSERT INTO public.obras_equipamentos (obra_id, equipamento_id, data_alocacao, quantidade, status, responsavel)
SELECT 
  o.id,
  eq.id,
  o.data_inicio,
  1,
  'alocado',
  o.responsavel
FROM public.obras o
CROSS JOIN public.equipamentos eq
WHERE o.status = 'ativa' 
  AND eq.status = 'disponivel'
  AND NOT EXISTS (
    SELECT 1 FROM public.obras_equipamentos oeq 
    WHERE oeq.obra_id = o.id AND oeq.equipamento_id = eq.id
  )
LIMIT 15; -- Limitar para não sobrecarregar

-- Atualizar status dos equipamentos para 'em-uso'
UPDATE public.equipamentos 
SET 
  status = 'em-uso',
  obra_atual = (
    SELECT obra_id FROM public.obras_equipamentos oe 
    WHERE oe.equipamento_id = equipamentos.id 
    AND oe.status = 'alocado'
    LIMIT 1
  )
WHERE id IN (
  SELECT DISTINCT equipamento_id 
  FROM public.obras_equipamentos 
  WHERE status = 'alocado'
);

-- Inserir documentos de exemplo
INSERT INTO public.documentos (obra_id, nome, categoria, descricao, arquivo_url, tamanho_bytes, tipo_mime, status, usuario_upload)
SELECT 
  o.id,
  doc.nome,
  doc.categoria,
  doc.descricao,
  o.id || '/' || doc.categoria || '/' || doc.arquivo,
  doc.tamanho,
  doc.tipo_mime,
  'ativo',
  (SELECT id FROM auth.users LIMIT 1) -- Usar o primeiro usuário disponível
FROM public.obras o
CROSS JOIN (
  VALUES 
    ('Projeto Arquitetônico.pdf', 'projeto', 'Plantas baixas e elevações do projeto', 'projeto_arquitetonico.pdf', 2456789, 'application/pdf'),
    ('Memorial Descritivo.docx', 'memorial', 'Especificações técnicas da obra', 'memorial_descritivo.docx', 1234567, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
    ('Licença de Construção.pdf', 'licenca', 'Alvará de construção aprovado', 'licenca_construcao.pdf', 987654, 'application/pdf'),
    ('Orçamento Detalhado.xlsx', 'outros', 'Planilha com orçamento detalhado', 'orcamento_detalhado.xlsx', 1876543, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
) AS doc(nome, categoria, descricao, arquivo, tamanho, tipo_mime)
WHERE NOT EXISTS (
  SELECT 1 FROM public.documentos d WHERE d.obra_id = o.id
)
LIMIT 20; -- Limitar para não sobrecarregar

-- Inserir materiais vinculados às atividades do orçamento
INSERT INTO public.materiais_atividades (orcamento_id, material_id, quantidade_planejada, finalidade, status, custo_unitario)
SELECT 
  oa.id,
  m.id,
  CASE 
    WHEN m.categoria = 'Cimento e Argamassa' THEN 25.0
    WHEN m.categoria = 'Ferro e Aço' THEN 15.0
    WHEN m.categoria = 'Madeira' THEN 8.0
    WHEN m.categoria = 'Elétrico' THEN 20.0
    ELSE 10.0
  END,
  'compra',
  'planejado',
  m.preco_unitario
FROM public.orcamento_analitico oa
CROSS JOIN public.materiais m
WHERE oa.categoria = 'Construção Civil'
  AND NOT EXISTS (
    SELECT 1 FROM public.materiais_atividades ma 
    WHERE ma.orcamento_id = oa.id AND ma.material_id = m.id
  )
LIMIT 50; -- Limitar para não sobrecarregar

-- Atualizar custos dos equipamentos nas obras
UPDATE public.obras_equipamentos oe
SET 
  horas_utilizadas = 40.0,
  custo_total = eq.valor_diario * 5 -- 5 dias de uso
FROM public.equipamentos eq
WHERE oe.equipamento_id = eq.id
  AND oe.horas_utilizadas = 0;

-- Inserir atividades padrão para uso nas obras
INSERT INTO public.atividades (nome, categoria, unidade, descricao, duracao_estimada, status) 
VALUES 
  ('Escavação Manual', 'Movimentação de Terra', 'm³', 'Escavação manual para fundações e valas', 1, 'ativa'),
  ('Concretagem de Fundação', 'Estrutura', 'm³', 'Concretagem de sapatas e vigas baldrame', 1, 'ativa'),
  ('Montagem de Armadura', 'Estrutura', 'kg', 'Corte, dobra e montagem de armaduras', 2, 'ativa'),
  ('Elevação de Alvenaria', 'Alvenaria', 'm²', 'Assentamento de blocos cerâmicos ou tijolos', 1, 'ativa'),
  ('Instalação Elétrica', 'Instalações', 'm', 'Passagem de fiação e instalação de componentes', 1, 'ativa'),
  ('Instalação Hidráulica', 'Instalações', 'm', 'Instalação de tubulações água e esgoto', 1, 'ativa'),
  ('Aplicação de Reboco', 'Revestimento', 'm²', 'Aplicação de argamassa de revestimento', 1, 'ativa'),
  ('Assentamento de Pisos', 'Acabamento', 'm²', 'Assentamento de cerâmicas ou porcelanatos', 1, 'ativa'),
  ('Pintura de Paredes', 'Acabamento', 'm²', 'Aplicação de tinta acrílica ou latex', 1, 'ativa'),
  ('Instalação de Esquadrias', 'Acabamento', 'un', 'Instalação de portas e janelas', 1, 'ativa')
ON CONFLICT (nome) DO NOTHING;

-- Criar função para estatísticas em tempo real
CREATE OR REPLACE FUNCTION public.get_dashboard_stats(empresa_id_param UUID DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
  stats JSON;
BEGIN
  SELECT json_build_object(
    'obras_ativas', (
      SELECT COUNT(*) FROM public.obras 
      WHERE status = 'ativa' 
      AND (empresa_id_param IS NULL OR empresa_id = empresa_id_param)
    ),
    'total_obras', (
      SELECT COUNT(*) FROM public.obras 
      WHERE (empresa_id_param IS NULL OR empresa_id = empresa_id_param)
    ),
    'equipes_ocupadas', (
      SELECT COUNT(DISTINCT e.id) 
      FROM public.equipes e 
      JOIN public.obras_equipes oe ON e.id = oe.equipe_id 
      WHERE oe.status = 'ativa'
      AND (empresa_id_param IS NULL OR e.empresa_id = empresa_id_param)
    ),
    'equipamentos_em_uso', (
      SELECT COUNT(*) FROM public.equipamentos 
      WHERE status = 'em-uso'
      AND (empresa_id_param IS NULL OR empresa_id = empresa_id_param)
    ),
    'orcamento_total', (
      SELECT COALESCE(SUM(orcamento), 0) FROM public.obras 
      WHERE status = 'ativa'
      AND (empresa_id_param IS NULL OR empresa_id = empresa_id_param)
    ),
    'rdos_mes_atual', (
      SELECT COUNT(*) FROM public.rdos 
      WHERE DATE_TRUNC('month', data::date) = DATE_TRUNC('month', CURRENT_DATE)
    )
  ) INTO stats;

  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atualizar RLS policies para melhor performance com empresa_id
DROP POLICY IF EXISTS "Usuários autenticados podem ver obras" ON public.obras;
CREATE POLICY "Usuários podem ver obras de sua empresa" ON public.obras 
FOR SELECT TO authenticated 
USING (
  empresa_id = (
    SELECT empresa_id FROM public.profiles 
    WHERE id = auth.uid()
  )
  OR 
  (
    SELECT nivel_acesso FROM public.profiles 
    WHERE id = auth.uid()
  ) = 'diretor'
);

DROP POLICY IF EXISTS "Usuários autenticados podem inserir obras" ON public.obras;
CREATE POLICY "Usuários podem inserir obras em sua empresa" ON public.obras 
FOR INSERT TO authenticated 
WITH CHECK (
  empresa_id = (
    SELECT empresa_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- Comentários para documentação
COMMENT ON FUNCTION public.get_dashboard_stats(UUID) IS 'Retorna estatísticas em tempo real para o dashboard';

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE 'Dados de exemplo inseridos com sucesso!';
  RAISE NOTICE 'Sistema pronto para uso com:';
  RAISE NOTICE '- Empresa: MetaConstrutor Ltda';
  RAISE NOTICE '- Obras com orçamento analítico';
  RAISE NOTICE '- Equipamentos e equipes alocados';
  RAISE NOTICE '- Documentos de exemplo';
  RAISE NOTICE '- Atividades padrão configuradas';
END $$; 