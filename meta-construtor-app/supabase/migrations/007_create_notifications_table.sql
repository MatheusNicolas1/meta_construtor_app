-- Criar tabela de notificações
CREATE TABLE IF NOT EXISTS notificacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('atraso', 'pendencia', 'manutencao', 'aprovacao', 'info', 'criacao', 'finalizacao')),
    categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('rdo', 'obra', 'equipe', 'equipamento', 'sistema', 'usuario')),
    prioridade VARCHAR(20) DEFAULT 'media' CHECK (prioridade IN ('alta', 'media', 'baixa')),
    lida BOOLEAN DEFAULT false,
    data_evento TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    obra_id UUID REFERENCES obras(id) ON DELETE SET NULL,
    equipe_id UUID REFERENCES equipes(id) ON DELETE SET NULL,
    equipamento_id UUID REFERENCES equipamentos(id) ON DELETE SET NULL,
    rdo_id UUID REFERENCES rdos(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_notificacoes_empresa_id ON notificacoes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_user_id ON notificacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_tipo ON notificacoes(tipo);
CREATE INDEX IF NOT EXISTS idx_notificacoes_categoria ON notificacoes(categoria);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON notificacoes(lida);
CREATE INDEX IF NOT EXISTS idx_notificacoes_data_evento ON notificacoes(data_evento);
CREATE INDEX IF NOT EXISTS idx_notificacoes_created_at ON notificacoes(created_at);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp_notificacoes ON notificacoes;
CREATE TRIGGER set_timestamp_notificacoes
    BEFORE UPDATE ON notificacoes
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- Habilitar RLS
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam apenas notificações da sua empresa
CREATE POLICY "Users can view notifications from their company" ON notificacoes
    FOR SELECT USING (
        empresa_id IN (
            SELECT empresa_id FROM profiles 
            WHERE id = auth.uid()
        )
    );

-- Política para permitir que usuários atualizem apenas suas próprias notificações
CREATE POLICY "Users can update their own notifications" ON notificacoes
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Política para permitir que o sistema crie notificações
CREATE POLICY "System can create notifications" ON notificacoes
    FOR INSERT WITH CHECK (
        empresa_id IN (
            SELECT empresa_id FROM profiles 
            WHERE id = auth.uid()
        )
    );

-- Política para permitir que administradores gerenciem notificações
CREATE POLICY "Admins can manage all notifications" ON notificacoes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'diretor')
            AND empresa_id = notificacoes.empresa_id
        )
    );

-- Função para criar notificação automática
CREATE OR REPLACE FUNCTION criar_notificacao(
    p_empresa_id UUID,
    p_user_id UUID,
    p_titulo VARCHAR(255),
    p_descricao TEXT,
    p_tipo VARCHAR(50),
    p_categoria VARCHAR(50),
    p_prioridade VARCHAR(20) DEFAULT 'media',
    p_obra_id UUID DEFAULT NULL,
    p_equipe_id UUID DEFAULT NULL,
    p_equipamento_id UUID DEFAULT NULL,
    p_rdo_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO notificacoes (
        empresa_id, user_id, titulo, descricao, tipo, categoria, prioridade,
        obra_id, equipe_id, equipamento_id, rdo_id, metadata
    ) VALUES (
        p_empresa_id, p_user_id, p_titulo, p_descricao, p_tipo, p_categoria, p_prioridade,
        p_obra_id, p_equipe_id, p_equipamento_id, p_rdo_id, p_metadata
    ) RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para marcar notificação como lida
CREATE OR REPLACE FUNCTION marcar_notificacao_lida(p_notification_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE notificacoes 
    SET lida = true, updated_at = NOW()
    WHERE id = p_notification_id 
    AND user_id = auth.uid();
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter estatísticas de notificações
CREATE OR REPLACE FUNCTION obter_stats_notificacoes(p_empresa_id UUID DEFAULT NULL)
RETURNS TABLE (
    total_notificacoes INTEGER,
    nao_lidas INTEGER,
    lidas INTEGER,
    por_tipo JSONB,
    por_prioridade JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_notificacoes,
        COUNT(CASE WHEN NOT n.lida THEN 1 END)::INTEGER as nao_lidas,
        COUNT(CASE WHEN n.lida THEN 1 END)::INTEGER as lidas,
        json_build_object(
            'atraso', COUNT(CASE WHEN n.tipo = 'atraso' THEN 1 END),
            'pendencia', COUNT(CASE WHEN n.tipo = 'pendencia' THEN 1 END),
            'manutencao', COUNT(CASE WHEN n.tipo = 'manutencao' THEN 1 END),
            'aprovacao', COUNT(CASE WHEN n.tipo = 'aprovacao' THEN 1 END),
            'info', COUNT(CASE WHEN n.tipo = 'info' THEN 1 END),
            'criacao', COUNT(CASE WHEN n.tipo = 'criacao' THEN 1 END),
            'finalizacao', COUNT(CASE WHEN n.tipo = 'finalizacao' THEN 1 END)
        )::jsonb as por_tipo,
        json_build_object(
            'alta', COUNT(CASE WHEN n.prioridade = 'alta' THEN 1 END),
            'media', COUNT(CASE WHEN n.prioridade = 'media' THEN 1 END),
            'baixa', COUNT(CASE WHEN n.prioridade = 'baixa' THEN 1 END)
        )::jsonb as por_prioridade
    FROM notificacoes n
    WHERE (p_empresa_id IS NULL OR n.empresa_id = p_empresa_id)
    AND n.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar notificação quando RDO é criado
CREATE OR REPLACE FUNCTION trigger_notificacao_rdo_criado()
RETURNS TRIGGER AS $$
DECLARE
    empresa_id_var UUID;
    obra_nome VARCHAR(255);
    equipe_nome VARCHAR(255);
BEGIN
    -- Obter empresa_id da obra
    SELECT o.empresa_id, o.nome INTO empresa_id_var, obra_nome 
    FROM obras o 
    WHERE o.id = NEW.obra_id;
    
    -- Obter nome da equipe
    SELECT e.nome INTO equipe_nome 
    FROM equipes e 
    WHERE e.id = NEW.equipe_id;
    
    -- Criar notificação para gestores
    INSERT INTO notificacoes (
        empresa_id, user_id, titulo, descricao, tipo, categoria, prioridade,
        obra_id, equipe_id, rdo_id, metadata
    )
    SELECT 
        empresa_id_var,
        p.id,
        'Novo RDO Criado',
        'RDO criado por ' || NEW.responsavel || ' na obra ' || obra_nome || ' pela equipe ' || equipe_nome,
        'criacao',
        'rdo',
        CASE WHEN NEW.status = 'enviado' THEN 'alta' ELSE 'media' END,
        NEW.obra_id,
        NEW.equipe_id,
        NEW.id,
        json_build_object(
            'responsavel', NEW.responsavel,
            'obra_nome', obra_nome,
            'equipe_nome', equipe_nome,
            'data_rdo', NEW.data
        )::jsonb
    FROM profiles p
    WHERE p.empresa_id = empresa_id_var
    AND p.role IN ('diretor', 'gerente', 'engenheiro')
    AND p.id != NEW.created_by;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_rdo_criado ON rdos;
CREATE TRIGGER trigger_rdo_criado
    AFTER INSERT ON rdos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_notificacao_rdo_criado();

-- Trigger para criar notificação quando RDO é aprovado/rejeitado
CREATE OR REPLACE FUNCTION trigger_notificacao_rdo_aprovacao()
RETURNS TRIGGER AS $$
DECLARE
    empresa_id_var UUID;
    obra_nome VARCHAR(255);
    action_text VARCHAR(50);
    priority_level VARCHAR(20);
BEGIN
    -- Só executa se status mudou para aprovado ou rejeitado
    IF (OLD.status != NEW.status) AND (NEW.status IN ('aprovado', 'rejeitado')) THEN
        -- Obter empresa_id da obra
        SELECT o.empresa_id, o.nome INTO empresa_id_var, obra_nome 
        FROM obras o 
        WHERE o.id = NEW.obra_id;
        
        -- Definir textos baseado no status
        IF NEW.status = 'aprovado' THEN
            action_text := 'aprovado';
            priority_level := 'media';
        ELSE
            action_text := 'rejeitado';
            priority_level := 'alta';
        END IF;
        
        -- Criar notificação para o criador do RDO
        INSERT INTO notificacoes (
            empresa_id, user_id, titulo, descricao, tipo, categoria, prioridade,
            obra_id, equipe_id, rdo_id, metadata
        ) VALUES (
            empresa_id_var,
            NEW.created_by,
            'RDO ' || UPPER(action_text),
            'Seu RDO da obra ' || obra_nome || ' foi ' || action_text || 
            CASE WHEN NEW.motivo_rejeicao IS NOT NULL THEN '. Motivo: ' || NEW.motivo_rejeicao ELSE '' END,
            'aprovacao',
            'rdo',
            priority_level,
            NEW.obra_id,
            NEW.equipe_id,
            NEW.id,
            json_build_object(
                'status', NEW.status,
                'aprovado_por', COALESCE(NEW.aprovado_por, NEW.rejeitado_por),
                'obra_nome', obra_nome,
                'data_rdo', NEW.data,
                'motivo_rejeicao', NEW.motivo_rejeicao
            )::jsonb
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_rdo_aprovacao ON rdos;
CREATE TRIGGER trigger_rdo_aprovacao
    AFTER UPDATE ON rdos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_notificacao_rdo_aprovacao();

-- Inserir notificações de exemplo
INSERT INTO notificacoes (empresa_id, user_id, titulo, descricao, tipo, categoria, prioridade, obra_id, lida, data_evento)
SELECT 
    e.id,
    u.id,
    'Sistema MetaConstrutor Atualizado',
    'Nova versão do sistema foi implementada com melhorias no sistema de RDOs e notificações.',
    'info',
    'sistema',
    'media',
    NULL,
    false,
    NOW() - INTERVAL '2 hours'
FROM empresas e
CROSS JOIN auth.users u
JOIN profiles p ON p.id = u.id
WHERE p.empresa_id = e.id
LIMIT 5;

-- Inserir notificação de boas-vindas
INSERT INTO notificacoes (empresa_id, user_id, titulo, descricao, tipo, categoria, prioridade, lida, data_evento)
SELECT 
    e.id,
    u.id,
    'Bem-vindo ao MetaConstrutor',
    'Sua conta foi configurada com sucesso. Explore o sistema e comece a gerenciar suas obras de forma eficiente.',
    'info',
    'usuario',
    'baixa',
    false,
    NOW() - INTERVAL '1 day'
FROM empresas e
CROSS JOIN auth.users u
JOIN profiles p ON p.id = u.id
WHERE p.empresa_id = e.id
AND p.role = 'diretor'
LIMIT 3; 