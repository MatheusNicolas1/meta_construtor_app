-- ================================================
-- RESTAURAÇÃO COMPLETA DO BACKEND META CONSTRUTOR
-- ================================================
-- Corrige: Erros 42P01, relações quebradas e telas brancas
-- Objetivo: Restaurar tabelas, views, permissões e integridade
-- Cautela: Não altera estrutura visual nem afeta layout do frontend
-- ================================================

-- 1. TABELAS BASE

-- 1.1. Obras
CREATE TABLE IF NOT EXISTS public.obras (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome text NOT NULL,
    endereco text,
    status text,
    empresa_id uuid,
    created_at timestamp DEFAULT now()
);

-- 1.2. RDOs (Relatório Diário de Obra)
CREATE TABLE IF NOT EXISTS public.rdos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    obra_id uuid NOT NULL,
    data date NOT NULL,
    clima text,
    observacoes text,
    equipe text,
    created_at timestamp DEFAULT now()
);

-- 1.3. Checklists
CREATE TABLE IF NOT EXISTS public.checklists (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    obra_id uuid NOT NULL,
    data date NOT NULL,
    percentual_conclusao numeric,
    responsavel text,
    observacoes text,
    created_at timestamp DEFAULT now()
);

-- 1.4. Notificações
CREATE TABLE IF NOT EXISTS public.notificacoes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    obra_id uuid NOT NULL,
    titulo text,
    mensagem text,
    lida boolean DEFAULT false,
    created_at timestamp DEFAULT now()
);

-- ================================================
-- 2. RELACIONAMENTOS ENTRE TABELAS (FOREIGN KEYS)
-- ================================================

ALTER TABLE public.rdos
ADD CONSTRAINT IF NOT EXISTS fk_rdos_obras
FOREIGN KEY (obra_id) REFERENCES public.obras(id) ON DELETE CASCADE;

ALTER TABLE public.checklists
ADD CONSTRAINT IF NOT EXISTS fk_checklists_obras
FOREIGN KEY (obra_id) REFERENCES public.obras(id) ON DELETE CASCADE;

ALTER TABLE public.notificacoes
ADD CONSTRAINT IF NOT EXISTS fk_notificacoes_obras
FOREIGN KEY (obra_id) REFERENCES public.obras(id) ON DELETE CASCADE;

-- ================================================
-- 3. VIEWS PARA CONSUMO NO FRONTEND (PADRÃO ATUAL)
-- ================================================

-- 3.1. View: Lista de RDOs
CREATE OR REPLACE VIEW public.view_rdos AS
SELECT
    r.id,
    r.data,
    r.clima,
    r.observacoes,
    r.equipe,
    o.nome AS nome_obra,
    o.status AS status_obra
FROM public.rdos r
JOIN public.obras o ON o.id = r.obra_id;

-- 3.2. View: Lista de Obras com status
CREATE OR REPLACE VIEW public.view_obras AS
SELECT
    o.id,
    o.nome,
    o.endereco,
    o.status,
    o.created_at,
    COUNT(r.id) AS total_rdos
FROM public.obras o
LEFT JOIN public.rdos r ON r.obra_id = o.id
GROUP BY o.id;

-- 3.3. View: Lista de Checklists por obra
CREATE OR REPLACE VIEW public.view_checklists AS
SELECT
    c.id,
    c.data,
    c.percentual_conclusao,
    c.responsavel,
    c.observacoes,
    o.nome AS nome_obra
FROM public.checklists c
JOIN public.obras o ON o.id = c.obra_id;

-- ================================================
-- 4. PERMISSÕES DE LEITURA (para usuários do app)
-- ================================================

GRANT SELECT ON public.view_rdos TO authenticated;
GRANT SELECT ON public.view_obras TO authenticated;
GRANT SELECT ON public.view_checklists TO authenticated;

-- ================================================
-- 5. AJUSTES OPCIONAIS: FUNÇÃO DE ESTATÍSTICAS
-- ================================================

CREATE OR REPLACE FUNCTION public.obterEstatisticas()
RETURNS TABLE (
    total_rdos integer,
    total_obras integer,
    obras_ativas integer
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*)::integer FROM public.rdos),
        (SELECT COUNT(*)::integer FROM public.obras),
        (SELECT COUNT(*)::integer FROM public.obras WHERE status ILIKE 'ativa');
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- 6. RLS (Row Level Security) - SE UTILIZADO
-- ================================================

-- Exemplo: Permitir apenas acesso à própria empresa (se você tiver esse controle)
-- ALTER TABLE obras ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Acesso empresa" ON obras
-- FOR SELECT USING (empresa_id = auth.uid());

-- ================================================
-- ✅ FIM DO SCRIPT DE RESTAURAÇÃO
-- ================================================ 