-- Migração complementar - Estrutura completa do banco

-- Tabela de Orçamento Analítico
CREATE TABLE IF NOT EXISTS public.orcamento_analitico (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
    nome_atividade TEXT NOT NULL,
    categoria TEXT NOT NULL,
    unidade TEXT NOT NULL DEFAULT 'm²',
    quantitativo DECIMAL(12,3) NOT NULL DEFAULT 0,
    valor_unitario DECIMAL(10,2) NOT NULL DEFAULT 0,
    valor_total DECIMAL(15,2) GENERATED ALWAYS AS (quantitativo * valor_unitario) STORED,
    status TEXT NOT NULL DEFAULT 'planejada' CHECK (status IN ('planejada', 'em-andamento', 'concluida', 'cancelada')),
    data_inicio DATE,
    data_conclusao DATE,
    responsavel TEXT,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de vínculos entre Obras e Equipes
CREATE TABLE IF NOT EXISTS public.obras_equipes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
    equipe_id UUID NOT NULL REFERENCES public.equipes(id) ON DELETE CASCADE,
    data_alocacao DATE NOT NULL DEFAULT CURRENT_DATE,
    data_liberacao DATE,
    status TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'liberada', 'transferida')),
    funcao_na_obra TEXT,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(obra_id, equipe_id)
);

-- Tabela de vínculos entre Obras e Equipamentos
CREATE TABLE IF NOT EXISTS public.obras_equipamentos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
    equipamento_id UUID NOT NULL REFERENCES public.equipamentos(id) ON DELETE CASCADE,
    data_alocacao DATE NOT NULL DEFAULT CURRENT_DATE,
    data_liberacao DATE,
    quantidade INTEGER NOT NULL DEFAULT 1,
    horas_utilizadas DECIMAL(8,2) DEFAULT 0,
    custo_total DECIMAL(10,2) DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'alocado' CHECK (status IN ('alocado', 'em-uso', 'liberado', 'manutencao')),
    responsavel TEXT,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela para controle de materiais por atividade
CREATE TABLE IF NOT EXISTS public.materiais_atividades (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    orcamento_id UUID NOT NULL REFERENCES public.orcamento_analitico(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES public.materiais(id) ON DELETE CASCADE,
    quantidade_planejada DECIMAL(12,3) NOT NULL DEFAULT 0,
    quantidade_utilizada DECIMAL(12,3) DEFAULT 0,
    finalidade TEXT NOT NULL CHECK (finalidade IN ('compra', 'aluguel', 'consumo')),
    status TEXT NOT NULL DEFAULT 'planejado' CHECK (status IN ('planejado', 'solicitado', 'entregue', 'utilizado')),
    custo_unitario DECIMAL(10,2),
    custo_total DECIMAL(15,2) GENERATED ALWAYS AS (quantidade_planejada * custo_unitario) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela para documentos categorizados
CREATE TABLE IF NOT EXISTS public.documentos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    categoria TEXT NOT NULL CHECK (categoria IN ('projeto', 'licenca', 'memorial', 'contrato', 'rdo', 'foto', 'relatorio', 'outros')),
    descricao TEXT,
    arquivo_url TEXT NOT NULL,
    tamanho_bytes INTEGER,
    tipo_mime TEXT,
    versao INTEGER DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'arquivado', 'obsoleto')),
    data_vencimento DATE,
    usuario_upload UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW') NOT NULL
);

-- Atualizar tabela de usuários com níveis de acesso e empresa
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nivel_acesso TEXT DEFAULT 'colaborador' CHECK (nivel_acesso IN ('diretor', 'gerente', 'colaborador'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS empresa_id UUID;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS permissoes JSONB DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'suspenso'));

-- Tabela para empresas (multicliente)
CREATE TABLE IF NOT EXISTS public.empresas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome TEXT NOT NULL,
    cnpj TEXT UNIQUE,
    endereco TEXT,
    telefone TEXT,
    email TEXT,
    responsavel TEXT,
    plano TEXT NOT NULL DEFAULT 'basico' CHECK (plano IN ('basico', 'profissional', 'empresarial')),
    status TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'inativa', 'suspensa')),
    data_contratacao DATE DEFAULT CURRENT_DATE,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Adicionar empresa_id às tabelas principais para isolamento de dados
ALTER TABLE public.obras ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empresas(id);
ALTER TABLE public.equipes ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empresas(id);
ALTER TABLE public.equipamentos ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empresas(id);
ALTER TABLE public.fornecedores ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empresas(id);

-- Função para verificar permissões financeiras
CREATE OR REPLACE FUNCTION public.pode_ver_dados_financeiros(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_nivel TEXT;
BEGIN
    SELECT nivel_acesso INTO user_nivel 
    FROM public.profiles 
    WHERE id = user_id;
    
    RETURN user_nivel IN ('diretor', 'gerente');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Índices para performance
CREATE INDEX IF NOT EXISTS orcamento_analitico_obra_id_idx ON public.orcamento_analitico(obra_id);
CREATE INDEX IF NOT EXISTS orcamento_analitico_status_idx ON public.orcamento_analitico(status);
CREATE INDEX IF NOT EXISTS obras_equipes_obra_id_idx ON public.obras_equipes(obra_id);
CREATE INDEX IF NOT EXISTS obras_equipes_equipe_id_idx ON public.obras_equipes(equipe_id);
CREATE INDEX IF NOT EXISTS obras_equipamentos_obra_id_idx ON public.obras_equipamentos(obra_id);
CREATE INDEX IF NOT EXISTS obras_equipamentos_equipamento_id_idx ON public.obras_equipamentos(equipamento_id);
CREATE INDEX IF NOT EXISTS documentos_obra_id_idx ON public.documentos(obra_id);
CREATE INDEX IF NOT EXISTS documentos_categoria_idx ON public.documentos(categoria);
CREATE INDEX IF NOT EXISTS profiles_nivel_acesso_idx ON public.profiles(nivel_acesso);
CREATE INDEX IF NOT EXISTS profiles_empresa_id_idx ON public.profiles(empresa_id);
CREATE INDEX IF NOT EXISTS obras_empresa_id_idx ON public.obras(empresa_id);

-- Triggers para as novas tabelas
CREATE TRIGGER orcamento_analitico_updated_at BEFORE UPDATE ON public.orcamento_analitico FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER obras_equipes_updated_at BEFORE UPDATE ON public.obras_equipes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER obras_equipamentos_updated_at BEFORE UPDATE ON public.obras_equipamentos FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER materiais_atividades_updated_at BEFORE UPDATE ON public.materiais_atividades FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER documentos_updated_at BEFORE UPDATE ON public.documentos FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER empresas_updated_at BEFORE UPDATE ON public.empresas FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- RLS para as novas tabelas
ALTER TABLE public.orcamento_analitico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obras_equipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obras_equipamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materiais_atividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas
CREATE POLICY "Usuários autenticados podem ver orçamento analítico" ON public.orcamento_analitico FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuários autenticados podem inserir orçamento analítico" ON public.orcamento_analitico FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuários autenticados podem atualizar orçamento analítico" ON public.orcamento_analitico FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Usuários autenticados podem deletar orçamento analítico" ON public.orcamento_analitico FOR DELETE TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem ver obras_equipes" ON public.obras_equipes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuários autenticados podem inserir obras_equipes" ON public.obras_equipes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuários autenticados podem atualizar obras_equipes" ON public.obras_equipes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Usuários autenticados podem deletar obras_equipes" ON public.obras_equipes FOR DELETE TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem ver obras_equipamentos" ON public.obras_equipamentos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuários autenticados podem inserir obras_equipamentos" ON public.obras_equipamentos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuários autenticados podem atualizar obras_equipamentos" ON public.obras_equipamentos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Usuários autenticados podem deletar obras_equipamentos" ON public.obras_equipamentos FOR DELETE TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem ver documentos" ON public.documentos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuários autenticados podem inserir documentos" ON public.documentos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuários autenticados podem atualizar documentos" ON public.documentos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Usuários autenticados podem deletar documentos" ON public.documentos FOR DELETE TO authenticated USING (true);

-- Políticas para dados financeiros (apenas diretores e gerentes)
CREATE POLICY "Apenas diretores e gerentes podem ver dados financeiros detalhados" ON public.orcamento_analitico 
FOR SELECT TO authenticated USING (
    pode_ver_dados_financeiros(auth.uid()) OR 
    valor_total = 0 OR 
    valor_unitario = 0
);

-- Função para atualizar automaticamente empresa_id do usuário
CREATE OR REPLACE FUNCTION public.handle_new_user_empresa()
RETURNS TRIGGER AS $$
BEGIN
  -- Se não foi especificada empresa, associa à empresa padrão (primeira empresa ativa)
  IF NEW.empresa_id IS NULL THEN
    SELECT id INTO NEW.empresa_id 
    FROM public.empresas 
    WHERE status = 'ativa' 
    ORDER BY created_at ASC 
    LIMIT 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_empresa_check
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_empresa();

-- Views para relatórios e análises
CREATE OR REPLACE VIEW public.obra_resumo AS
SELECT 
    o.id,
    o.nome,
    o.endereco,
    o.orcamento,
    o.status,
    o.responsavel,
    o.data_inicio,
    o.data_previsao,
    o.empresa_id,
    COUNT(DISTINCT oe.equipe_id) as total_equipes,
    COUNT(DISTINCT oq.equipamento_id) as total_equipamentos,
    COUNT(DISTINCT r.id) as total_rdos,
    COALESCE(SUM(oa.valor_total), 0) as orcamento_analitico_total,
    COALESCE(AVG(oa.valor_total), 0) as valor_medio_atividade
FROM public.obras o
LEFT JOIN public.obras_equipes oe ON o.id = oe.obra_id AND oe.status = 'ativa'
LEFT JOIN public.obras_equipamentos oq ON o.id = oq.obra_id AND oq.status = 'alocado'
LEFT JOIN public.rdos r ON o.id = r.obra_id
LEFT JOIN public.orcamento_analitico oa ON o.id = oa.obra_id
GROUP BY o.id, o.nome, o.endereco, o.orcamento, o.status, o.responsavel, o.data_inicio, o.data_previsao, o.empresa_id;

-- Comentários para documentação
COMMENT ON TABLE public.orcamento_analitico IS 'Orçamento detalhado por atividade de cada obra';
COMMENT ON TABLE public.obras_equipes IS 'Vínculo entre obras e equipes alocadas';
COMMENT ON TABLE public.obras_equipamentos IS 'Vínculo entre obras e equipamentos utilizados';
COMMENT ON TABLE public.materiais_atividades IS 'Materiais necessários para cada atividade do orçamento';
COMMENT ON TABLE public.documentos IS 'Documentos categorizados por obra';
COMMENT ON TABLE public.empresas IS 'Empresas clientes do sistema (multicliente)';
COMMENT ON VIEW public.obra_resumo IS 'Visão resumida de cada obra com métricas agregadas'; 