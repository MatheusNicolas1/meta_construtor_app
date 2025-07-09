-- Migração 009: Criar sistema de checklist diário de obra
-- Permite criar checklists específicos para cada obra e dia

-- Tabela principal de checklists
CREATE TABLE IF NOT EXISTS public.checklist_obra (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
    data_checklist DATE NOT NULL,
    responsavel TEXT NOT NULL,
    turno TEXT NOT NULL DEFAULT 'matutino' CHECK (turno IN ('matutino', 'vespertino', 'noturno')),
    
    -- Seções do checklist
    seguranca_trabalho JSONB NOT NULL DEFAULT '{}',
    equipamentos_ferramentas JSONB NOT NULL DEFAULT '{}',
    materiais_suprimentos JSONB NOT NULL DEFAULT '{}',
    qualidade_servicos JSONB NOT NULL DEFAULT '{}',
    meio_ambiente JSONB NOT NULL DEFAULT '{}',
    organizacao_limpeza JSONB NOT NULL DEFAULT '{}',
    
    -- Observações gerais
    observacoes TEXT,
    pontos_atencao TEXT,
    acao_corretiva TEXT,
    
    -- Status e controle
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluido')),
    percentual_conclusao INTEGER DEFAULT 0 CHECK (percentual_conclusao >= 0 AND percentual_conclusao <= 100),
    aprovado_por TEXT,
    data_aprovacao TIMESTAMP WITH TIME ZONE,
    
    -- Auditoria
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    empresa_id UUID REFERENCES public.empresas(id),
    
    -- Constraint para evitar duplicação por obra/data/turno
    CONSTRAINT unique_checklist_obra_data_turno UNIQUE(obra_id, data_checklist, turno)
);

-- Tabela de templates de checklist (para reutilização)
CREATE TABLE IF NOT EXISTS public.checklist_template (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome TEXT NOT NULL,
    descricao TEXT,
    categoria TEXT NOT NULL DEFAULT 'geral',
    
    -- Estrutura do template
    seguranca_trabalho JSONB NOT NULL DEFAULT '{}',
    equipamentos_ferramentas JSONB NOT NULL DEFAULT '{}',
    materiais_suprimentos JSONB NOT NULL DEFAULT '{}',
    qualidade_servicos JSONB NOT NULL DEFAULT '{}',
    meio_ambiente JSONB NOT NULL DEFAULT '{}',
    organizacao_limpeza JSONB NOT NULL DEFAULT '{}',
    
    -- Controle
    ativo BOOLEAN DEFAULT true,
    empresa_id UUID REFERENCES public.empresas(id),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS checklist_obra_obra_id_idx ON public.checklist_obra(obra_id);
CREATE INDEX IF NOT EXISTS checklist_obra_data_checklist_idx ON public.checklist_obra(data_checklist);
CREATE INDEX IF NOT EXISTS checklist_obra_status_idx ON public.checklist_obra(status);
CREATE INDEX IF NOT EXISTS checklist_obra_empresa_id_idx ON public.checklist_obra(empresa_id);
CREATE INDEX IF NOT EXISTS checklist_obra_responsavel_idx ON public.checklist_obra(responsavel);

CREATE INDEX IF NOT EXISTS checklist_template_categoria_idx ON public.checklist_template(categoria);
CREATE INDEX IF NOT EXISTS checklist_template_empresa_id_idx ON public.checklist_template(empresa_id);
CREATE INDEX IF NOT EXISTS checklist_template_ativo_idx ON public.checklist_template(ativo);

-- Função para calcular percentual de conclusão
CREATE OR REPLACE FUNCTION public.calcular_percentual_checklist(checklist_data JSONB)
RETURNS INTEGER AS $$
DECLARE
    total_items INTEGER := 0;
    items_concluidos INTEGER := 0;
    secao_key TEXT;
    item_key TEXT;
    item_value JSONB;
BEGIN
    -- Contar itens em cada seção
    FOR secao_key IN SELECT * FROM jsonb_object_keys(checklist_data)
    LOOP
        FOR item_key IN SELECT * FROM jsonb_object_keys(checklist_data->secao_key)
        LOOP
            item_value := checklist_data->secao_key->item_key;
            total_items := total_items + 1;
            
            -- Verificar se o item está marcado como concluído
            IF (item_value->>'status')::TEXT = 'ok' OR (item_value->>'checked')::BOOLEAN = true THEN
                items_concluidos := items_concluidos + 1;
            END IF;
        END LOOP;
    END LOOP;
    
    -- Calcular percentual
    IF total_items = 0 THEN
        RETURN 0;
    END IF;
    
    RETURN ROUND((items_concluidos::DECIMAL / total_items::DECIMAL) * 100);
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar percentual automaticamente
CREATE OR REPLACE FUNCTION public.atualizar_percentual_checklist()
RETURNS TRIGGER AS $$
BEGIN
    NEW.percentual_conclusao := public.calcular_percentual_checklist(
        NEW.seguranca_trabalho || 
        NEW.equipamentos_ferramentas || 
        NEW.materiais_suprimentos || 
        NEW.qualidade_servicos || 
        NEW.meio_ambiente || 
        NEW.organizacao_limpeza
    );
    
    -- Atualizar status baseado no percentual
    IF NEW.percentual_conclusao = 100 THEN
        NEW.status := 'concluido';
    ELSIF NEW.percentual_conclusao > 0 THEN
        NEW.status := 'em_andamento';
    ELSE
        NEW.status := 'pendente';
    END IF;
    
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_percentual_checklist
    BEFORE UPDATE ON public.checklist_obra
    FOR EACH ROW
    EXECUTE FUNCTION public.atualizar_percentual_checklist();

-- RLS Policies
ALTER TABLE public.checklist_obra ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_template ENABLE ROW LEVEL SECURITY;

-- Políticas para checklist_obra
CREATE POLICY "Usuários podem ver checklists da sua empresa" ON public.checklist_obra
    FOR SELECT TO authenticated
    USING (
        empresa_id IN (
            SELECT empresa_id FROM public.profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem criar checklists" ON public.checklist_obra
    FOR INSERT TO authenticated
    WITH CHECK (
        empresa_id IN (
            SELECT empresa_id FROM public.profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem atualizar checklists da sua empresa" ON public.checklist_obra
    FOR UPDATE TO authenticated
    USING (
        empresa_id IN (
            SELECT empresa_id FROM public.profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem deletar checklists da sua empresa" ON public.checklist_obra
    FOR DELETE TO authenticated
    USING (
        empresa_id IN (
            SELECT empresa_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- Políticas para checklist_template
CREATE POLICY "Usuários podem ver templates da sua empresa" ON public.checklist_template
    FOR SELECT TO authenticated
    USING (
        empresa_id IN (
            SELECT empresa_id FROM public.profiles WHERE id = auth.uid()
        ) OR empresa_id IS NULL
    );

CREATE POLICY "Usuários podem criar templates" ON public.checklist_template
    FOR INSERT TO authenticated
    WITH CHECK (
        empresa_id IN (
            SELECT empresa_id FROM public.profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem atualizar templates da sua empresa" ON public.checklist_template
    FOR UPDATE TO authenticated
    USING (
        empresa_id IN (
            SELECT empresa_id FROM public.profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem deletar templates da sua empresa" ON public.checklist_template
    FOR DELETE TO authenticated
    USING (
        empresa_id IN (
            SELECT empresa_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- Inserir template padrão
INSERT INTO public.checklist_template (nome, descricao, categoria, seguranca_trabalho, equipamentos_ferramentas, materiais_suprimentos, qualidade_servicos, meio_ambiente, organizacao_limpeza)
VALUES (
    'Checklist Padrão de Obra',
    'Template básico para checklist diário de obra',
    'geral',
    '{"epi_uso": {"label": "Uso correto de EPIs", "required": true}, "sinalizacao": {"label": "Sinalização adequada", "required": true}, "primeiros_socorros": {"label": "Kit primeiros socorros disponível", "required": true}}',
    '{"ferramentas_estado": {"label": "Ferramentas em bom estado", "required": true}, "equipamentos_calibrados": {"label": "Equipamentos calibrados", "required": false}, "manutencao_preventiva": {"label": "Manutenção preventiva em dia", "required": true}}',
    '{"materiais_qualidade": {"label": "Materiais com qualidade adequada", "required": true}, "estoque_suficiente": {"label": "Estoque suficiente", "required": false}, "armazenamento_correto": {"label": "Armazenamento correto", "required": true}}',
    '{"especificacoes_tecnicas": {"label": "Conforme especificações técnicas", "required": true}, "controle_qualidade": {"label": "Controle de qualidade executado", "required": true}}',
    '{"residuos_segregados": {"label": "Resíduos segregados corretamente", "required": true}, "impacto_ambiental": {"label": "Sem impacto ambiental", "required": true}}',
    '{"area_organizada": {"label": "Área de trabalho organizada", "required": true}, "limpeza_final": {"label": "Limpeza final executada", "required": false}}'
) ON CONFLICT DO NOTHING;

-- Comentários nas tabelas
COMMENT ON TABLE public.checklist_obra IS 'Checklists diários de obra com controle de qualidade e segurança';
COMMENT ON TABLE public.checklist_template IS 'Templates reutilizáveis para checklists de obra';

COMMENT ON COLUMN public.checklist_obra.seguranca_trabalho IS 'Itens de segurança do trabalho em formato JSON';
COMMENT ON COLUMN public.checklist_obra.equipamentos_ferramentas IS 'Verificação de equipamentos e ferramentas em formato JSON';
COMMENT ON COLUMN public.checklist_obra.percentual_conclusao IS 'Percentual de conclusão do checklist (0-100)'; 