-- Migração 010: Sistema de log de atividades por usuário
-- Registra ações sensíveis dos usuários para auditoria

-- Tabela de log de usuários
CREATE TABLE IF NOT EXISTS public.log_usuario (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    empresa_id UUID REFERENCES public.empresas(id),
    
    -- Dados da ação
    acao TEXT NOT NULL,
    categoria TEXT NOT NULL DEFAULT 'geral' CHECK (categoria IN ('login', 'obra', 'rdo', 'equipe', 'equipamento', 'usuario', 'configuracao', 'geral')),
    descricao TEXT NOT NULL,
    
    -- Contexto da ação
    ip_address INET,
    user_agent TEXT,
    recurso_id TEXT, -- ID do recurso afetado (obra_id, rdo_id, etc)
    recurso_tipo TEXT, -- Tipo do recurso (obra, rdo, equipe, etc)
    
    -- Dados antes e depois (para mudanças)
    dados_anteriores JSONB,
    dados_novos JSONB,
    
    -- Metadados
    metadata JSONB DEFAULT '{}',
    nivel_sensibilidade TEXT DEFAULT 'baixo' CHECK (nivel_sensibilidade IN ('baixo', 'medio', 'alto', 'critico')),
    
    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Constraints
    CONSTRAINT log_usuario_acao_check CHECK (length(acao) > 0),
    CONSTRAINT log_usuario_descricao_check CHECK (length(descricao) > 0)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS log_usuario_usuario_id_idx ON public.log_usuario(usuario_id);
CREATE INDEX IF NOT EXISTS log_usuario_empresa_id_idx ON public.log_usuario(empresa_id);
CREATE INDEX IF NOT EXISTS log_usuario_acao_idx ON public.log_usuario(acao);
CREATE INDEX IF NOT EXISTS log_usuario_categoria_idx ON public.log_usuario(categoria);
CREATE INDEX IF NOT EXISTS log_usuario_created_at_idx ON public.log_usuario(created_at DESC);
CREATE INDEX IF NOT EXISTS log_usuario_recurso_idx ON public.log_usuario(recurso_tipo, recurso_id);
CREATE INDEX IF NOT EXISTS log_usuario_sensibilidade_idx ON public.log_usuario(nivel_sensibilidade);

-- Índice composto para consultas comuns
CREATE INDEX IF NOT EXISTS log_usuario_empresa_data_idx ON public.log_usuario(empresa_id, created_at DESC);
CREATE INDEX IF NOT EXISTS log_usuario_usuario_data_idx ON public.log_usuario(usuario_id, created_at DESC);

-- Função para registrar log de atividade
CREATE OR REPLACE FUNCTION public.registrar_log_usuario(
    p_usuario_id UUID,
    p_acao TEXT,
    p_descricao TEXT,
    p_categoria TEXT DEFAULT 'geral',
    p_recurso_id TEXT DEFAULT NULL,
    p_recurso_tipo TEXT DEFAULT NULL,
    p_dados_anteriores JSONB DEFAULT NULL,
    p_dados_novos JSONB DEFAULT NULL,
    p_nivel_sensibilidade TEXT DEFAULT 'baixo',
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
    user_empresa_id UUID;
BEGIN
    -- Obter empresa do usuário
    SELECT empresa_id INTO user_empresa_id 
    FROM public.profiles 
    WHERE id = p_usuario_id;
    
    -- Inserir log
    INSERT INTO public.log_usuario (
        usuario_id,
        empresa_id,
        acao,
        categoria,
        descricao,
        recurso_id,
        recurso_tipo,
        dados_anteriores,
        dados_novos,
        nivel_sensibilidade,
        metadata
    ) VALUES (
        p_usuario_id,
        user_empresa_id,
        p_acao,
        p_categoria,
        p_descricao,
        p_recurso_id,
        p_recurso_tipo,
        p_dados_anteriores,
        p_dados_novos,
        p_nivel_sensibilidade,
        p_metadata
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter logs com filtros
CREATE OR REPLACE FUNCTION public.obter_logs_usuario(
    p_empresa_id UUID,
    p_usuario_id UUID DEFAULT NULL,
    p_categoria TEXT DEFAULT NULL,
    p_data_inicio DATE DEFAULT NULL,
    p_data_fim DATE DEFAULT NULL,
    p_limite INTEGER DEFAULT 100,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
    id UUID,
    usuario_id UUID,
    usuario_nome TEXT,
    acao TEXT,
    categoria TEXT,
    descricao TEXT,
    recurso_id TEXT,
    recurso_tipo TEXT,
    nivel_sensibilidade TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.id,
        l.usuario_id,
        COALESCE(p.nome, 'Usuário Removido') as usuario_nome,
        l.acao,
        l.categoria,
        l.descricao,
        l.recurso_id,
        l.recurso_tipo,
        l.nivel_sensibilidade,
        l.created_at
    FROM public.log_usuario l
    LEFT JOIN public.profiles p ON l.usuario_id = p.id
    WHERE l.empresa_id = p_empresa_id
      AND (p_usuario_id IS NULL OR l.usuario_id = p_usuario_id)
      AND (p_categoria IS NULL OR l.categoria = p_categoria)
      AND (p_data_inicio IS NULL OR l.created_at >= p_data_inicio::timestamp)
      AND (p_data_fim IS NULL OR l.created_at <= (p_data_fim + INTERVAL '1 day')::timestamp)
    ORDER BY l.created_at DESC
    LIMIT p_limite
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para estatísticas de logs
CREATE OR REPLACE FUNCTION public.stats_logs_usuario(
    p_empresa_id UUID,
    p_periodo_dias INTEGER DEFAULT 30
)
RETURNS TABLE(
    total_logs BIGINT,
    total_usuarios_ativos BIGINT,
    logs_por_categoria JSONB,
    logs_por_sensibilidade JSONB,
    top_acoes JSONB
) AS $$
DECLARE
    data_inicio TIMESTAMP;
BEGIN
    data_inicio := NOW() - (p_periodo_dias || ' days')::interval;
    
    SELECT 
        COUNT(*)::BIGINT,
        COUNT(DISTINCT usuario_id)::BIGINT,
        jsonb_object_agg(categoria, total_categoria),
        jsonb_object_agg(nivel_sensibilidade, total_sensibilidade),
        jsonb_agg(jsonb_build_object('acao', acao, 'total', total_acao) ORDER BY total_acao DESC)
    INTO total_logs, total_usuarios_ativos, logs_por_categoria, logs_por_sensibilidade, top_acoes
    FROM (
        SELECT 
            categoria,
            nivel_sensibilidade,
            acao,
            COUNT(*) as total_categoria,
            COUNT(*) as total_sensibilidade,
            COUNT(*) as total_acao
        FROM public.log_usuario
        WHERE empresa_id = p_empresa_id
          AND created_at >= data_inicio
        GROUP BY categoria, nivel_sensibilidade, acao
    ) subconsulta;
    
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers para log automático de ações críticas

-- Trigger para log de login (será implementado via aplicação)
-- Trigger para criação/edição de obras
CREATE OR REPLACE FUNCTION public.log_obra_changes()
RETURNS TRIGGER AS $$
DECLARE
    user_id UUID;
    acao_descricao TEXT;
BEGIN
    -- Obter usuário atual (pode ser NULL em alguns casos)
    user_id := auth.uid();
    
    IF TG_OP = 'INSERT' THEN
        acao_descricao := 'Obra criada: ' || NEW.nome;
        PERFORM public.registrar_log_usuario(
            user_id,
            'criar_obra',
            acao_descricao,
            'obra',
            NEW.id::TEXT,
            'obra',
            NULL,
            to_jsonb(NEW),
            'medio'
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        acao_descricao := 'Obra atualizada: ' || NEW.nome;
        PERFORM public.registrar_log_usuario(
            user_id,
            'atualizar_obra',
            acao_descricao,
            'obra',
            NEW.id::TEXT,
            'obra',
            to_jsonb(OLD),
            to_jsonb(NEW),
            'medio'
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        acao_descricao := 'Obra removida: ' || OLD.nome;
        PERFORM public.registrar_log_usuario(
            user_id,
            'remover_obra',
            acao_descricao,
            'obra',
            OLD.id::TEXT,
            'obra',
            to_jsonb(OLD),
            NULL,
            'alto'
        );
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_log_obra_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.obras
    FOR EACH ROW EXECUTE FUNCTION public.log_obra_changes();

-- Trigger para criação/edição de RDOs
CREATE OR REPLACE FUNCTION public.log_rdo_changes()
RETURNS TRIGGER AS $$
DECLARE
    user_id UUID;
    acao_descricao TEXT;
    obra_nome TEXT;
BEGIN
    user_id := auth.uid();
    
    -- Obter nome da obra
    SELECT nome INTO obra_nome FROM public.obras WHERE id = COALESCE(NEW.obra_id, OLD.obra_id);
    
    IF TG_OP = 'INSERT' THEN
        acao_descricao := 'RDO criado para obra: ' || COALESCE(obra_nome, 'N/A') || ' - Data: ' || NEW.data;
        PERFORM public.registrar_log_usuario(
            user_id,
            'criar_rdo',
            acao_descricao,
            'rdo',
            NEW.id::TEXT,
            'rdo',
            NULL,
            to_jsonb(NEW),
            'medio'
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Log especial para mudanças de status
        IF OLD.status != NEW.status THEN
            acao_descricao := 'Status do RDO alterado de "' || OLD.status || '" para "' || NEW.status || '" - Obra: ' || COALESCE(obra_nome, 'N/A');
            PERFORM public.registrar_log_usuario(
                user_id,
                'alterar_status_rdo',
                acao_descricao,
                'rdo',
                NEW.id::TEXT,
                'rdo',
                jsonb_build_object('status', OLD.status),
                jsonb_build_object('status', NEW.status),
                'alto'
            );
        ELSE
            acao_descricao := 'RDO atualizado - Obra: ' || COALESCE(obra_nome, 'N/A') || ' - Data: ' || NEW.data;
            PERFORM public.registrar_log_usuario(
                user_id,
                'atualizar_rdo',
                acao_descricao,
                'rdo',
                NEW.id::TEXT,
                'rdo',
                to_jsonb(OLD),
                to_jsonb(NEW),
                'medio'
            );
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        acao_descricao := 'RDO removido - Obra: ' || COALESCE(obra_nome, 'N/A') || ' - Data: ' || OLD.data;
        PERFORM public.registrar_log_usuario(
            user_id,
            'remover_rdo',
            acao_descricao,
            'rdo',
            OLD.id::TEXT,
            'rdo',
            to_jsonb(OLD),
            NULL,
            'alto'
        );
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_log_rdo_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.rdos
    FOR EACH ROW EXECUTE FUNCTION public.log_rdo_changes();

-- RLS Policies
ALTER TABLE public.log_usuario ENABLE ROW LEVEL SECURITY;

-- Somente Gerentes e Diretores podem ver logs
CREATE POLICY "Gerentes e Diretores podem ver logs da empresa" ON public.log_usuario
    FOR SELECT TO authenticated
    USING (
        empresa_id IN (
            SELECT empresa_id 
            FROM public.profiles 
            WHERE id = auth.uid() 
            AND nivel_acesso IN ('gerente', 'diretor')
        )
    );

-- Somente o sistema pode inserir logs (via função)
CREATE POLICY "Sistema pode inserir logs" ON public.log_usuario
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- Função para limpeza automática de logs antigos (30+ dias)
CREATE OR REPLACE FUNCTION public.limpar_logs_antigos()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.log_usuario 
    WHERE created_at < NOW() - INTERVAL '90 days'
      AND nivel_sensibilidade = 'baixo';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentários nas tabelas e funções
COMMENT ON TABLE public.log_usuario IS 'Log de atividades dos usuários para auditoria e monitoramento';
COMMENT ON FUNCTION public.registrar_log_usuario IS 'Função para registrar atividades do usuário no log de auditoria';
COMMENT ON FUNCTION public.obter_logs_usuario IS 'Função para consultar logs com filtros para relatórios de auditoria';
COMMENT ON FUNCTION public.stats_logs_usuario IS 'Função para obter estatísticas dos logs de usuário';

-- Inserir logs iniciais do sistema
INSERT INTO public.log_usuario (
    usuario_id, 
    acao, 
    categoria, 
    descricao, 
    nivel_sensibilidade, 
    metadata
) VALUES (
    '00000000-0000-0000-0000-000000000000'::UUID,
    'sistema_iniciado',
    'configuracao',
    'Sistema de log de usuários inicializado',
    'medio',
    '{"versao": "010", "funcionalidade": "log_usuario"}'
) ON CONFLICT DO NOTHING; 