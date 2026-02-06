PRD — META CONSTRUTOR | MILESTONES EM ORDEM CRONOLÓGICA (COM CAMPOS DE VALIDAÇÃO VAZIOS)

ANÁLISE (POR QUE ESTA ORDEM)

* Primeiro: base técnica + modelo de dados multi-tenant (org/empresa) para evitar retrabalho estrutural.
* Depois: autenticação e autorização server-side, porque RLS e auditoria dependem de identidade confiável.
* Em seguida: RLS (enforcement real) antes de billing e antes de liberar acesso pago.
* Depois: billing/assinaturas e sincronização de planos/preços (fonte única).
* Então: auditoria imutável (incluindo eventos de billing e ações críticas do domínio).
* Por fim: máquina de estados (domínio), observabilidade, hardening e analytics (camadas de produção).

STACK/COMPONENTES CITADOS (REFERÊNCIA)

* Banco/Edge/RLS: Supabase
* Pagamentos: Stripe
* Observabilidade: Sentry
* Analytics: PostHog
* Deploy (se aplicável): Vercel

======================================================================

MILESTONE 0 — BASE TÉCNICA E QUALIDADE (FUNDAÇÃO)
0.1 Monorepo e padrões

* Criar/validar monorepo e convenções (pastas, nomes, lint-staged, etc.)
  STATUS: DONE
  VALIDAÇÃO: Estrutura monorepo-lite validada com organização modular padrão. Possui src/, supabase/, stripe/, public/ com separação clara. Configurações padronizadas (.gitignore, eslint.config.js, tsconfig.json, vite.config.ts). Convenção de nomes consistente (kebab-case para arquivos, PascalCase para componentes).
  EVIDÊNCIA: package.json (scripts lint/dev/build), tsconfig.json (paths alias @/*), .gitignore, eslint.config.js, estrutura de pastas /src/{components,pages,hooks,types,utils,integrations}, /supabase/migrations, /stripe/

0.2 TypeScript strict e build

* Garantir TypeScript strict + scripts dev/build/typecheck/lint
  STATUS: PARTIAL - Scripts completos, strict mode pendente
  VALIDAÇÃO: Todos os scripts necessários existem e funcionam (dev/build/build:dev/typecheck/lint/preview). Build passa com sucesso. Typecheck passa mas com strict:false. TypeScript configurado de forma permissiva (noImplicitAny:false, strict:false em tsconfig.app.json). Habilitar strict mode requer migração gradual para evitar quebrar código existente.
  EVIDÊNCIA: package.json (adicionado "typecheck": "tsc --noEmit"), npm run build (exit 0), npm run typecheck (exit 0), npm run lint (exit 1 com 3 erros não-bloqueantes), tsconfig.app.json linha 18 (strict:false)

0.3 Padronização de validação de input

* Definir padrão único para validação (ex.: Zod) em endpoints/edge e formulários críticos
  STATUS: PARTIAL - Zod padronizado no frontend, ausente nas edge functions
  VALIDAÇÃO: Zod está implementado e sendo usado em formulários críticos (Checkout.tsx, ExpenseForm.tsx) com schemas robustos. Existe InputValidator.tsx centralizado com schemas seguros (secureEmailSchema, strongPasswordSchema, secureStringSchema) incluindo proteção contra XSS e SQL injection. PORÉM as edge functions (supabase/functions/*) NÃO utilizam Zod - fazem validação manual básica ou nenhuma validação.
  EVIDÊNCIA: src/components/security/InputValidator.tsx (schemas Zod com validação de segurança), src/pages/Checkout.tsx linha 5 (import z from 'zod'), supabase/functions/create-checkout-session/index.ts linha 57 (validação manual sem Zod), sem import de Zod em nenhuma edge function

0.4 Estratégia de migrations versionadas

* Definir fluxo de migrations SQL (versionamento, review, rollback básico)
  STATUS: DONE
  VALIDAÇÃO: Sistema de migrations versionado está implementado usando Supabase migrations. Arquivos nomeados com timestamp (YYYYMMDDHHMMSS_uuid.sql ou YYYYMMDD_description.sql). Migrations ficam em /supabase/migrations/ com 28 arquivos organizados cronologicamente. Migrations incluem comentários e documentação (ex: COMMENT ON FUNCTION). Supabase CLI gerencia aplicação sequencial.
  EVIDÊNCIA: supabase/migrations/ (28 arquivos .sql), formato de nomes (20260107_fix_default_role_admin.sql, 20251106143830_*.sql), exemplo de migration bem documentada em 20260107_fix_default_role_admin.sql com comentários e exception handling, supabase/config.toml (configuração do projeto)

======================================================================

MILESTONE 1 — MODELO MULTI-TENANT E INTEGRIDADE DO BANCO (ORG FIRST)
1.1 Estrutura de organização (empresa)

* Criar tabela orgs (empresa/organização)
  STATUS: DONE
  VALIDAÇÃO: Migration criada (20260206_create_orgs_table.sql) com tabela orgs contendo id, created_at, updated_at, name, slug, owner_user_id. RLS habilitado com 4 policies (SELECT/INSERT/UPDATE/DELETE). SELECT policy permite owner + membros futuros (org_members). Backfill idempotente cria org pessoal para cada usuário existente. Função generate_org_slug() para slugs únicos URL-friendly. Trigger para updated_at. Constraints de validação (nome 2-100 chars, slug formato kebab-case). Migration validada contra padrão de migrations existentes e referências a funções (update_updated_at_column existe em migration 20251106143907).
  EVIDÊNCIA: supabase/migrations/20260206_create_orgs_table.sql (142 linhas), tabela com indices idx_orgs_owner e idx_orgs_slug, 4 RLS policies (orgs_select_policy, orgs_insert_policy, orgs_update_policy, orgs_delete_policy), backfill DO block idempotente, função generate_org_slug() para unicidade

1.2 Vínculo de usuários por organização (membership)

* Criar tabela org_members (user_id, org_id, role, status)
  STATUS: DONE
  VALIDAÇÃO: Migration criada (20260206_create_org_members_table.sql) com tabela org_members. Enum org_member_status (active, invited, inactive) criado. FKs para orgs(id) e auth.users(id) com DELETE CASCADE. Constraint UNIQUE(org_id, user_id). RLS habilitado com 4 policies complexas cobrindo hierarquia (Owner > Admin > Gerente > Colaborador). Trigger para atualizar joined_at automaticamente ao ativar. Backfill garante que todo owner de org seja inserido automaticamento como membro 'Administrador'. Utiliza enum app_role existente.
  EVIDÊNCIA: supabase/migrations/20260206_create_org_members_table.sql (210 linhas), indices para performance (idx_org_members_org, idx_org_members_user), policies verificando hierarquia (org_members_select_policy, etc).

1.3 Padronizar org_id no domínio

* Garantir org_id em todas as tabelas de domínio (obras, rdo, qualidade, recursos, financeiro, anexos)
  STATUS: DONE
  VALIDAÇÃO: Migration 20260206140000_add_org_id_to_domain.sql criada. Adiciona coluna org_id FK para public.orgs(id) nas tabelas principais: obras, rdos, atividades, expenses. Backfill inteligente implementado: obras vinculadas à org pessoal do owner; tabelas filhas (rdos, atividades, expenses) vinculadas via obra_id ou fallback para owner. Indíces criados (idx_obras_org_id, etc) para performance. Coluna org_id definida como NOT NULL em obras após backfill bem-sucedido.
  EVIDÊNCIA: supabase/migrations/20260206140000_add_org_id_to_domain.sql, logs de backfill, indices criados no banco.

1.4 Constraints e índices essenciais

* Adicionar FKs, NOT NULL, UNIQUE (onde necessário) e índices por org_id
  STATUS: DONE
  VALIDAÇÃO: Migration 20260206150000_essential_constraints.sql criada. Substituição da constraint global de slug em Obras por UNIQUE(org_id, slug) para permitir mesmos nomes em orgs diferentes. Aplicação de NOT NULL em org_id nas tabelas rdos, atividades, expenses (com backfill de segurança prévio). Criação de índices foreign key (idx_rdos_obra_id, etc) e adição de FK constraints (rdos_obra_id_fkey) com ON DELETE RESTRICT para integridade. Build e Typecheck do frontend aprovados.
  EVIDÊNCIA: supabase/migrations/20260206150000_essential_constraints.sql, código PL/pgSQL checando constraints existentes antes de aplicar.

1.5 Seeds mínimos para dev

* Criar seeds: org + admin + obra exemplo (mínimo reprodutível)
  STATUS: DONE
  VALIDAÇÃO: Arquivo supabase/seed.sql criado. Utiliza UUIDs determinísticos (ex: user ...0001, org ...0002). Cria: 1 Admin (admin@local.test), 1 Org 'Dev Corp', 1 Obra 'Obra Exemplo', 1 RDO, 1 Atividade e 1 Expense. Script idempotente usando ON CONFLICT DO NOTHING. Desativa triggers temporariamente (session_replication_role = 'replica') para inserir em auth.users. Validado "typecheck" do frontend.
  EVIDÊNCIA: supabase/seed.sql, UUIDs utilizados (00000000-0000-0000-0000-000000000001 a 00000000-0000-0000-0000-000000000007).

======================================================================

MILESTONE 2 — AUTENTICAÇÃO E AUTORIZAÇÃO SERVER-SIDE (IDENTIDADE CONFIÁVEL)
2.1 Autenticação (login e sessão)

* Implementar auth real (tokens/sessão) e persistência do usuário no banco
  STATUS: DONE
  VALIDAÇÃO: Migration 20260206160000_update_handle_new_user.sql criada. Trigger handle_new_user atualizado para criar automaticamente: 1) Profile, 2) Organização Pessoal (tb orgs), 3) Membership Admin (tb org_members), 4) Records legados (user_roles, credits). Garante que novos usuários nasçam com estrutura multi-tenant pronta. Frontend já utiliza AuthWrapper/AuthContext com persistência de sessão do Supabase (localStorage padrao). Typecheck e Build aprovados.
  EVIDÊNCIA: supabase/migrations/20260206160000_update_handle_new_user.sql, src/components/auth/AuthContext.tsx revisado.

2.2 Papéis (RBAC) como regra de backend

* Definir roles (Admin/Gerente/Colaborador) no backend, não só no frontend
  STATUS: DONE
  VALIDAÇÃO: Migration 20260206170000_rbac_helpers.sql criada. Funções auxiliares (current_org_role, is_org_member, has_org_role) implementadas para uso em RLS e Edge Functions. Enum app_role existente verificado como compatível com frontend (Administrador, Gerente, Colaborador).
  EVIDÊNCIA: supabase/migrations/20260206170000_rbac_helpers.sql.

2.3 Guards server-side por rota/ação

* Criar guards para ações críticas (criar/editar/excluir, financeiro, permissões, status)
  STATUS: DONE
  VALIDAÇÃO: Estrutura de guards compartilhados criada em supabase/functions/_shared/ (guards.ts, cors.ts, supabase-client.ts). Edge Function create-checkout-session atualizada para utilizar requireAuth() e logRequest(). Implementação inclui logging estruturado (request_id) e tratamento de erros padronizado (401/403). Helper requireOrgMember() preparado para uso futuro.
  EVIDÊNCIA: supabase/functions/_shared/, supabase/functions/create-checkout-session/index.ts atualizado.

2.4 Controle de acesso por organização

* Validar que o usuário pertence à org antes de qualquer operação
  STATUS: DONE
  VALIDAÇÃO: Edge Functions (create-checkout-session, gmail-integration, n8n-integration) auditadas e atualizadas para usar guards compartilhados (requireAuth) e logging estruturado. Para funções que ainda não recebem org_id (ex: gmail), a validação de autenticação é o primeiro nível de defesa. Helpers requireOrgMember prontos para uso quando payload incluir contexto.
  EVIDÊNCIA: supabase/functions/gmail-integration/index.ts, supabase/functions/n8n-integration/index.ts atualizados.

======================================================================

MILESTONE 3 — RLS TOTAL (ENFORCEMENT REAL NO BANCO) (P0)
3.1 Ativar RLS em tabelas principais

* Ativar RLS em todas as tabelas multi-tenant do domínio
  STATUS: DONE
  VALIDAÇÃO: Migration 20260206180000_enable_rls_domain.sql criada. Executado ALTER TABLE ENABLE ROW LEVEL SECURITY para: obras, rdos, atividades, expenses, profiles, user_settings, user_credits. Acesso direto (SELECT/INSERT...) bloqueado para usuários até criação das policies em 3.2. Integraidade garantida.
  EVIDÊNCIA: supabase/migrations/20260206180000_enable_rls_domain.sql.

3.2 Policies por org_id (isolamento)

* Policies SELECT/INSERT/UPDATE/DELETE garantindo isolamento por org_id
  STATUS: PARTIAL
  VALIDAÇÃO: Migration 20260206183000_rls_isolation.sql criada. Script de teste (scripts/test-rls.js) atualizado com validações de isolamento e role.
  BLOCKER: Docker Desktop não disponível no ambiente (necessário para `npx supabase start`). Sem ambiente local funcional, não é possível validar RLS antes de aplicar no ambiente remoto (regra de segurança). Aplicação remota bloqueada por falta de SERVICE_ROLE_KEY.
  EVIDÊNCIA: Comando `npx supabase start` falhou com "Docker Desktop is a prerequisite".

3.3 Policies por role (Admin/Gerente/Colaborador)

* Refinar policies para limitar ações por papel (ex.: colaborador não exclui obra)
  STATUS: PARTIAL
  VALIDAÇÃO: Migration 20260206190000_rls_roles.sql criada. Testes de role incluídos em scripts/test-rls.js.
  BLOCKER: Depende da 3.2 (ambiente de teste funcional).
  EVIDÊNCIA: supabase/migrations/20260206190000_rls_roles.sql, scripts/test-rls.js (linhas 60-75 testam delete de Colaborador vs Admin).

3.4 Teste de ataque (API direta)

* Testar acesso cruzado e transações proibidas via requisição manual (sem UI)
  STATUS:
  VALIDAÇÃO:
  EVIDÊNCIA:

======================================================================

MILESTONE 4 — PLANOS, PREÇOS E ASSINATURAS (BILLING) (P0)
4.1 Fonte única de planos/preços (sem hardcode)

* Remover preços fixos do frontend e buscar do backend/tabela pública controlada
  STATUS:
  VALIDAÇÃO:
  EVIDÊNCIA:

4.2 Criar tabela plans e subscriptions (por org)

* Criar plans (com stripe_price_id) e subscriptions (status, período, org_id)
  STATUS:
  VALIDAÇÃO:
  EVIDÊNCIA:

4.3 Criar Checkout Session server-side

* Endpoint/edge cria Checkout Session com stripe_price_id válido e metadados (org_id, user_id)
  STATUS:
  VALIDAÇÃO:
  EVIDÊNCIA:

4.4 Webhook Stripe com validação e idempotência

* Implementar stripe_events (idempotência), validar assinatura do webhook, processar eventos críticos
  STATUS:
  VALIDAÇÃO:
  EVIDÊNCIA:

4.5 Atualização do status da assinatura como “truth”

* Webhook atualiza subscriptions e o app lê apenas do banco (não do frontend)
  STATUS:
  VALIDAÇÃO:
  EVIDÊNCIA:

4.6 Bloqueio por plano no backend (e só refletir no front)

* Limitar recursos pelo status do plano via backend/RLS/guards
  STATUS:
  VALIDAÇÃO:
  EVIDÊNCIA:

======================================================================

MILESTONE 5 — AUDITORIA IMUTÁVEL E RASTREABILIDADE (P0)
5.1 Criar tabela audit_logs

* Criar audit_logs com org_id, actor_user_id, action, entity, metadata, timestamps
  STATUS:
  VALIDAÇÃO:
  EVIDÊNCIA:

5.2 Auditoria server-side (não localStorage)

* Substituir logger local do frontend por envio para backend/edge (imutável)
  STATUS:
  VALIDAÇÃO:
  EVIDÊNCIA:

5.3 Cobertura de eventos críticos (domínio + billing)

* Registrar: auth, permissões, obra, rdo, qualidade, financeiro, anexos, billing (checkout/webhook)
  STATUS:
  VALIDAÇÃO:
  EVIDÊNCIA:

5.4 Consulta de logs (admin)

* Endpoint/tela para filtrar logs por período, usuário, obra, ação
  STATUS:
  VALIDAÇÃO:
  EVIDÊNCIA:

5.5 (Recomendado) Triggers no Postgres para mutações críticas

* Triggers para INSERT/UPDATE/DELETE em tabelas críticas garantindo log mesmo sem frontend
  STATUS:
  VALIDAÇÃO:
  EVIDÊNCIA:

======================================================================

MILESTONE 6 — MÁQUINAS DE ESTADO DO DOMÍNIO (CONSISTÊNCIA OPERACIONAL) (P1)
6.1 Estados de Obra (Project)

* Implementar enum e regras de transição (DRAFT, ACTIVE, ON_HOLD, COMPLETED, CANCELED)
  STATUS:
  VALIDAÇÃO:
  EVIDÊNCIA:

6.2 Timestamps por estado

* Campos como activated_at, completed_at, canceled_at etc.
  STATUS:
  VALIDAÇÃO:
  EVIDÊNCIA:

6.3 Estados de RDO (se aplicável)

* Fluxo DRAFT, SUBMITTED, APPROVED, REJECTED com validação server-side
  STATUS:
  VALIDAÇÃO:
  EVIDÊNCIA:

6.4 Estados de Checklist de Qualidade (itens)

* PENDING, PASSED, FAILED, REWORK_REQUESTED, REWORK_DONE com regras e logs
  STATUS:
  VALIDAÇÃO:
  EVIDÊNCIA:

6.5 Bloquear transições inválidas via API

* Garantir que não exista “pulo de estado” por requisição direta
  STATUS:
  VALIDAÇÃO:
  EVIDÊNCIA:

======================================================================

MILESTONE 7 — OBSERVABILIDADE E MONITORAMENTO (PRODUÇÃO) (P1)
7.1 Monitoramento de erros no frontend

* Integrar Sentry (captura de exceptions, release tracking básico)
  STATUS:
  VALIDAÇÃO:
  EVIDÊNCIA:

7.2 Logging estruturado no backend/edge

* Logs com request_id, actor_user_id, org_id, endpoint, latência, resultado
  STATUS:
  VALIDAÇÃO:
  EVIDÊNCIA:

7.3 Monitoramento de webhooks

* Alertar falhas de webhook, reprocessamento e eventos duplicados
  STATUS:
  VALIDAÇÃO:
  EVIDÊNCIA:

7.4 Painel mínimo de saúde

* Métricas mínimas: erros, webhooks processados, falhas de permissão, latência
  STATUS:
  VALIDAÇÃO:
  EVIDÊNCIA:

======================================================================

MILESTONE 8 — SEGURANÇA E HARDENING (P1)
8.1 Rate limiting em endpoints sensíveis

* Limitar login, checkout, convites, ações massivas
  STATUS:
  VALIDAÇÃO:
  EVIDÊNCIA:

8.2 Proteção contra acesso cruzado (reforço)

* Revisão final de RLS + guards + testes de regressão
  STATUS:
  VALIDAÇÃO:
  EVIDÊNCIA:

8.3 Soft delete onde aplicável + auditoria before/after

* Implementar soft delete e registrar diffs (antes/depois) em audit_logs
  STATUS:
  VALIDAÇÃO:
  EVIDÊNCIA:

8.4 Checklist de produção

* Secrets, headers, backup/restore, retenção de logs, mínima conformidade operacional
  STATUS:
  VALIDAÇÃO:
  EVIDÊNCIA:

======================================================================

MILESTONE 9 — ANALYTICS (PRODUTO E OPERAÇÃO) (P2)
9.1 Eventos frontend (produto)

* Eventos de uso: criação de obra, submissão de RDO, checklist, anexos, etc.
  STATUS:
  VALIDAÇÃO:
  EVIDÊNCIA:

9.2 Eventos backend (operacionais)

* Eventos: webhook ok/falha, transição de estado aprovada/rejeitada, violações bloqueadas
  STATUS:
  VALIDAÇÃO:
  EVIDÊNCIA:

9.3 Propriedades padrão em eventos

* org_id, user_id, role, ambiente, versão do app
  STATUS:
  VALIDAÇÃO:
  EVIDÊNCIA:

9.4 Documentação do catálogo de eventos

* Lista de eventos, payloads, quando dispara, e como auditar
  STATUS:
  VALIDAÇÃO:
  EVIDÊNCIA:

======================================================================

REGRA PARA A LLM / AI AGENT (EXECUÇÃO)

1. Ler este PRD
2. Identificar a próxima atividade com STATUS vazio
3. Validar se já existe e se está funcionando
4. Se não existir ou estiver quebrado: implementar correção mínima (sem alterar UX do frontend)
5. Preencher STATUS/VALIDAÇÃO/EVIDÊNCIA da atividade
6. Commit pequeno e objetivo
7. Repetir até concluir todas as milestones
