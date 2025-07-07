-- Criar tabela de RDOs
CREATE TABLE IF NOT EXISTS rdos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    obra_id UUID NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
    equipe_id UUID NOT NULL REFERENCES equipes(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    atividades_executadas TEXT NOT NULL,
    atividades_planejadas TEXT DEFAULT '',
    materiais_utilizados TEXT DEFAULT '',
    clima VARCHAR(50) DEFAULT 'ensolarado',
    responsavel VARCHAR(255) NOT NULL,
    localizacao TEXT DEFAULT '',
    horas_ociosas INTEGER DEFAULT 0,
    motivo_ociosidade TEXT DEFAULT '',
    acidentes TEXT DEFAULT '',
    status VARCHAR(20) DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'enviado', 'aprovado', 'rejeitado')),
    observacoes TEXT DEFAULT '',
    progresso_atividades JSONB DEFAULT '[]',
    equipamentos_utilizados JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    aprovado_por UUID REFERENCES auth.users(id),
    aprovado_em TIMESTAMP WITH TIME ZONE,
    rejeitado_por UUID REFERENCES auth.users(id),
    rejeitado_em TIMESTAMP WITH TIME ZONE,
    motivo_rejeicao TEXT
);

-- Criar tabela de imagens dos RDOs
CREATE TABLE IF NOT EXISTS rdo_imagens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rdo_id UUID NOT NULL REFERENCES rdos(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    nome_arquivo TEXT NOT NULL,
    caption TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_rdos_obra_id ON rdos(obra_id);
CREATE INDEX IF NOT EXISTS idx_rdos_equipe_id ON rdos(equipe_id);
CREATE INDEX IF NOT EXISTS idx_rdos_data ON rdos(data);
CREATE INDEX IF NOT EXISTS idx_rdos_status ON rdos(status);
CREATE INDEX IF NOT EXISTS idx_rdos_created_at ON rdos(created_at);
CREATE INDEX IF NOT EXISTS idx_rdo_imagens_rdo_id ON rdo_imagens(rdo_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE rdos ENABLE ROW LEVEL SECURITY;
ALTER TABLE rdo_imagens ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para RDOs
CREATE POLICY "Users can view RDOs of their company" ON rdos FOR SELECT
    USING (
        obra_id IN (
            SELECT id FROM obras 
            WHERE empresa_id = get_user_empresa_id()
        )
    );

CREATE POLICY "Users can insert RDOs for their company" ON rdos FOR INSERT
    WITH CHECK (
        obra_id IN (
            SELECT id FROM obras 
            WHERE empresa_id = get_user_empresa_id()
        )
    );

CREATE POLICY "Users can update RDOs of their company" ON rdos FOR UPDATE
    USING (
        obra_id IN (
            SELECT id FROM obras 
            WHERE empresa_id = get_user_empresa_id()
        )
    );

CREATE POLICY "Users can delete RDOs of their company" ON rdos FOR DELETE
    USING (
        obra_id IN (
            SELECT id FROM obras 
            WHERE empresa_id = get_user_empresa_id()
        )
    );

-- Políticas de segurança para imagens dos RDOs
CREATE POLICY "Users can view RDO images of their company" ON rdo_imagens FOR SELECT
    USING (
        rdo_id IN (
            SELECT id FROM rdos 
            WHERE obra_id IN (
                SELECT id FROM obras 
                WHERE empresa_id = get_user_empresa_id()
            )
        )
    );

CREATE POLICY "Users can insert RDO images for their company" ON rdo_imagens FOR INSERT
    WITH CHECK (
        rdo_id IN (
            SELECT id FROM rdos 
            WHERE obra_id IN (
                SELECT id FROM obras 
                WHERE empresa_id = get_user_empresa_id()
            )
        )
    );

CREATE POLICY "Users can update RDO images of their company" ON rdo_imagens FOR UPDATE
    USING (
        rdo_id IN (
            SELECT id FROM rdos 
            WHERE obra_id IN (
                SELECT id FROM obras 
                WHERE empresa_id = get_user_empresa_id()
            )
        )
    );

CREATE POLICY "Users can delete RDO images of their company" ON rdo_imagens FOR DELETE
    USING (
        rdo_id IN (
            SELECT id FROM rdos 
            WHERE obra_id IN (
                SELECT id FROM obras 
                WHERE empresa_id = get_user_empresa_id()
            )
        )
    );

-- Função para atualizar o timestamp de updated_at
CREATE OR REPLACE FUNCTION update_rdos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_rdos_updated_at
    BEFORE UPDATE ON rdos
    FOR EACH ROW
    EXECUTE FUNCTION update_rdos_updated_at();

-- Função para obter estatísticas de RDOs
CREATE OR REPLACE FUNCTION get_rdo_stats(empresa_id_param UUID DEFAULT NULL)
RETURNS TABLE (
    total_rdos INTEGER,
    rdos_rascunho INTEGER,
    rdos_enviados INTEGER,
    rdos_aprovados INTEGER,
    rdos_rejeitados INTEGER,
    rdos_este_mes INTEGER,
    rdos_esta_semana INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_rdos,
        COUNT(CASE WHEN r.status = 'rascunho' THEN 1 END)::INTEGER as rdos_rascunho,
        COUNT(CASE WHEN r.status = 'enviado' THEN 1 END)::INTEGER as rdos_enviados,
        COUNT(CASE WHEN r.status = 'aprovado' THEN 1 END)::INTEGER as rdos_aprovados,
        COUNT(CASE WHEN r.status = 'rejeitado' THEN 1 END)::INTEGER as rdos_rejeitados,
        COUNT(CASE WHEN r.data >= date_trunc('month', CURRENT_DATE) THEN 1 END)::INTEGER as rdos_este_mes,
        COUNT(CASE WHEN r.data >= date_trunc('week', CURRENT_DATE) THEN 1 END)::INTEGER as rdos_esta_semana
    FROM rdos r
    JOIN obras o ON r.obra_id = o.id
    WHERE (empresa_id_param IS NULL OR o.empresa_id = empresa_id_param);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Inserir dados de exemplo de RDOs
INSERT INTO rdos (obra_id, equipe_id, data, atividades_executadas, atividades_planejadas, materiais_utilizados, clima, responsavel, localizacao, horas_ociosas, motivo_ociosidade, acidentes, status, observacoes, progresso_atividades, equipamentos_utilizados) 
SELECT 
    o.id,
    e.id,
    CURRENT_DATE - INTERVAL '1 day',
    'Execução de concretagem da laje do 1º pavimento. Vibração adequada do concreto e controle de qualidade realizado.',
    'Finalização da concretagem e início da cura do concreto',
    'Concreto C25 - 15m³, Aço CA-50 - 500kg, Madeira para forma - 50m²',
    'ensolarado',
    'João Silva',
    'Rua das Palmeiras, 123 - São Paulo, SP',
    0,
    '',
    '',
    'enviado',
    'Execução dentro do prazo previsto',
    '[{"nome": "Concretagem", "progresso": 100, "observacoes": "Concluído com sucesso"}]',
    '[{"nome": "Betoneira", "status": "funcionando", "observacoes": "Equipamento em perfeito estado"}]'
FROM obras o
JOIN equipes e ON e.obra_id = o.id
WHERE o.nome = 'Edifício Residencial Sunset'
LIMIT 1;

INSERT INTO rdos (obra_id, equipe_id, data, atividades_executadas, atividades_planejadas, materiais_utilizados, clima, responsavel, localizacao, horas_ociosas, motivo_ociosidade, acidentes, status, observacoes, progresso_atividades, equipamentos_utilizados) 
SELECT 
    o.id,
    e.id,
    CURRENT_DATE,
    'Execução de alvenaria estrutural - 1º pavimento. Assentamento de blocos e verificação de prumo.',
    'Continuação da alvenaria e início das instalações elétricas',
    'Blocos estruturais - 500 unidades, Argamassa - 2m³, Vergalhões - 100kg',
    'nublado',
    'Maria Santos',
    'Av. Paulista, 1000 - São Paulo, SP',
    2,
    'Chuva leve que interrompeu as atividades por 2 horas',
    '',
    'aprovado',
    'Progresso conforme cronograma',
    '[{"nome": "Alvenaria", "progresso": 65, "observacoes": "Em andamento"}]',
    '[{"nome": "Guincho", "status": "funcionando", "observacoes": "Utilizado para transporte de materiais"}]'
FROM obras o
JOIN equipes e ON e.obra_id = o.id
WHERE o.nome = 'Shopping Center Premium'
LIMIT 1;

INSERT INTO rdos (obra_id, equipe_id, data, atividades_executadas, atividades_planejadas, materiais_utilizados, clima, responsavel, localizacao, horas_ociosas, motivo_ociosidade, acidentes, status, observacoes, progresso_atividades, equipamentos_utilizados) 
SELECT 
    o.id,
    e.id,
    CURRENT_DATE - INTERVAL '2 days',
    'Preparação do terreno para fundação. Escavação e nivelamento do solo.',
    'Início da armação da fundação',
    'Combustível para escavadeira - 200L, Brita - 10m³',
    'ensolarado',
    'Pedro Oliveira',
    'Rua dos Jardins, 456 - São Paulo, SP',
    0,
    '',
    '',
    'rascunho',
    'Necessário verificar projeto estrutural',
    '[{"nome": "Escavação", "progresso": 90, "observacoes": "Quase finalizada"}]',
    '[{"nome": "Escavadeira", "status": "funcionando", "observacoes": "Manutenção preventiva realizada"}]'
FROM obras o
JOIN equipes e ON e.obra_id = o.id
WHERE o.nome = 'Condomínio Residencial Vista Verde'
LIMIT 1; 