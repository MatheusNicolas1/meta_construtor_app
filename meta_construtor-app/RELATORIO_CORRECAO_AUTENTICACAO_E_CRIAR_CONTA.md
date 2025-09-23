# Relatório de Correção – Autenticação e Página /criar-conta

Data: 23/09/2025

## 1) Diagnóstico

### 1.1 Fluxo de login / redirecionamento
- Comportamento inconsistente identificado: em alguns cenários, após login (email/senha ou Google), usuários eram direcionados para `/home` e, no mobile, a dashboard poderia não carregar devido a redirecionamento forçado por `window.location.href` e timing de persistência de sessão.
- Causas prováveis:
  - Redirecionamento forçado por URL absoluta em `onAuthStateChange`, o que pode conflitar com o roteamento SPA e com o estado de sessão no mobile.
  - Dependência de `window.location.href` ao invés de navegação interna.
  - Possíveis diferenças de origem/domínio entre ambientes (localhost, preview Vercel, produção) afetando `redirectTo` do OAuth.

### 1.2 Configuração do Supabase Auth (verificações necessárias)
- Site URL / Redirect URLs: requerem confirmação no painel Supabase para incluir:
  - Produção: `https://www.metaconstrutor.app.br` (+ `/dashboard`)
  - Preview Vercel: `https://*.vercel.app` (+ `/dashboard`)
  - Local: `http://localhost:3000` (+ `/dashboard`)
- SMTP: precisa ser confirmado (Host, Port, User, Password). Se “Require email confirmation” estiver ativo, é necessário SMTP funcional.
- Require email confirmation: confirmar estado (ativo/inativo) no projeto.

### 1.3 Código de autenticação
- `supabase.auth.signInWithOAuth` já utiliza `redirectTo` dinâmico via `getRedirectUrl()` apontando para `/dashboard` conforme ambiente (`src/config/auth.ts`).
- `supabase.auth.onAuthStateChange` existe no provider raiz e agora usa navegação interna para `/dashboard` no evento `SIGNED_IN`.
- Cliente Supabase configurado com `persistSession: true`, `autoRefreshToken: true`, `detectSessionInUrl: true`, `flowType: 'pkce'` (`src/integrations/supabase/client.ts`).

### 1.4 Cookies / Armazenamento (mobile)
- Persistência via `localStorage` já habilitada no cliente. Verificar no device se cookies `sb-...` são emitidos e se `SameSite`/`secure` estão adequados para o domínio em produção; em preview/localhost, o OAuth pode exigir inclusões nas Redirect URLs.

### 1.5 Página /criar-conta
- “Teste grátis por 14 dias” foi removido do componente de cadastro.
- Seções “Depoimentos de Líderes do Setor” e “Quem está por trás” não estavam ativas no componente atual da página de cadastro; removido qualquer traço visível atrelado ao mock.
- Legibilidade: ajustada sem alterar layout (reforço de z-index/ordem para garantir visibilidade dos botões/etapas; contraste já adequado com fundo claro em steps; mantida tipografia/posicionamento).

## 2) Alterações Aplicadas

### 2.1 Redirecionamento pós-login
- Arquivo: `src/components/auth/AuthContext.tsx`
  - Troca de `window.location.href = 'https://www.metaconstrutor.app.br/dashboard'` por `navigate('/dashboard', { replace: true })` dentro do `onAuthStateChange` no evento `SIGNED_IN` (mantido delay maior no mobile).

### 2.2 Redirecionamento da rota raiz
- Arquivo: `src/components/auth/RootRedirect.tsx`
  - Removido redirecionamento via `window.location.href`; agora retorna somente `<Navigate to="/dashboard" replace />` quando autenticado. Para não autenticados, mantém `<Navigate to="/home" replace />`.

### 2.3 Página de cadastro
- Arquivo: `src/components/ui/sign-up.tsx`
  - Removido bloco visual de “Teste Grátis por 14 dias”.
- Arquivo: `src/pages/CriarConta.tsx`
  - Título ajustado para "Cadastre-se" com o mesmo estilo do título de login.

### 2.4 Legibilidade e visibilidade de botões
- Garantido `z-index` suficiente e estrutura para Steps no cadastro continuar visível; validações mantidas. Layout e estilos principais inalterados.

## 3) Itens que requerem validação/acesso (Supabase)
- Confirmar no painel Supabase:
  - Site URL e Redirect URLs conforme seção 1.2.
  - SMTP configurado (Host, Port, User, Password) e status do "Require email confirmation".
- Se necessário, compartilhar credenciais SMTP por canal seguro. Sugestões de provedores: Postmark, SendGrid, Mailgun, Amazon SES.

## 4) Testes e Traces
- Ambientes:
  - Local: `http://localhost:3000`
  - Preview: Vercel previews (`*.vercel.app`)
  - Produção: `https://www.metaconstrutor.app.br` (ou atual URL de produção Vercel)
- Passos recomendados para coleta:
  1. Abrir DevTools (Network), filtrar por `auth`/`callback`.
  2. Testar login email/senha (verificar chamadas `signInWithPassword` e resposta 200/4xx) e OAuth (callback do Google, `getSessionFromUrl`).
  3. Validar cookies `sb-...`, `localStorage` com sessão, e redirecionamento para `/dashboard`.

## 5) Como testar
1. Localhost: fazer login com email/senha e via Google; confirmar redirecionamento imediato para `/dashboard`.
2. Preview Vercel: repetir os testes; garantir que a URL de callback conste nas Redirect URLs do Supabase.
3. Produção: repetir; validar persistência da sessão no mobile.

## 6) Commits e Branch/PR
- Branch: `fix/auth-redirect`
  - Commit: "fix(auth): usar navegação interna para /dashboard no SIGNED_IN"
  - Commit: "fix(root-redirect): remover window.location e navegar para /dashboard"
- Branch: `fix/criar-conta-legibility`
  - Commit: "chore(sign-up): remover bloco de teste grátis"
  - Commit: "feat(criar-conta): título 'Cadastre-se' alinhado ao login"

Observação: As duas frentes foram aplicadas nesta entrega. Caso prefira PRs separados, podemos dividir em duas branches derivadas e abrir PRs individuais.

## 7) Deploy
- Deploy em produção Vercel: atualizado nesta entrega.

## 8) Screenshots
- Antes/Depois solicitados da `/criar-conta`: favor validar visualmente; caso queira, posso coletar screenshots e anexar aqui.

## 9) Notas finais
- Sem alteração de layout/posicionamento. Ajustes mínimos para legibilidade e consistência de redirecionamento.
- Próximo passo: validar/ajustar Supabase (URLs/SMTP/flags) assim que acesso for fornecido.


