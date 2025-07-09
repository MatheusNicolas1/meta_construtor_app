# 🔧 **GUIA DE RESTAURAÇÃO DO BACKEND META CONSTRUTOR**

## 🚨 **PROBLEMA IDENTIFICADO**
- **Erro 42P01**: "relation does not exist" (tabelas não existem)
- **Telas brancas**: Frontend não consegue carregar dados
- **Relações quebradas**: Foreign keys e views desatualizadas

## ✅ **SOLUÇÃO IMPLEMENTADA**

### **1. Migrações Criadas:**
- `011_restauracao_completa_backend.sql` - Restaura tabelas e estrutura
- `012_dados_iniciais.sql` - Insere dados de exemplo

### **2. Como Executar as Migrações:**

#### **OPÇÃO A: Via Dashboard do Supabase (Recomendado)**

1. **Acesse o Dashboard:**
   - Vá para [https://app.supabase.com](https://app.supabase.com)
   - Selecione seu projeto Meta Construtor

2. **Vá para o SQL Editor:**
   - Clique em "SQL Editor" no menu lateral
   - Clique em "New Query"

3. **Execute a Migração 011 (Restauração):**
   ```sql
   -- Copie e cole o conteúdo do arquivo:
   -- supabase/migrations/011_restauracao_completa_backend.sql
   ```

4. **Execute a Migração 012 (Dados Iniciais):**
   ```sql
   -- Copie e cole o conteúdo do arquivo:
   -- supabase/migrations/012_dados_iniciais.sql
   ```

#### **OPÇÃO B: Via CLI do Supabase**

1. **Instalar CLI:**
   ```bash
   npm install -g supabase
   ```

2. **Fazer Login:**
   ```bash
   supabase login
   ```

3. **Executar Migrações:**
   ```bash
   supabase db push
   ```

### **3. Verificar se Funcionou:**

1. **Testar no SQL Editor:**
   ```sql
   -- Verificar se as tabelas foram criadas
   SELECT COUNT(*) FROM public.obras;
   SELECT COUNT(*) FROM public.rdos;
   SELECT COUNT(*) FROM public.checklists;
   SELECT COUNT(*) FROM public.notificacoes;
   
   -- Testar as views
   SELECT * FROM public.view_obras LIMIT 3;
   SELECT * FROM public.view_rdos LIMIT 3;
   
   -- Testar a função de estatísticas
   SELECT * FROM public.obterEstatisticas();
   ```

2. **Testar na Aplicação:**
   - Recarregue a página da aplicação
   - Verifique se as telas não estão mais brancas
   - Teste navegação entre páginas

### **4. Estrutura Restaurada:**

#### **📋 Tabelas Principais:**
- ✅ `obras` - Projetos de construção
- ✅ `rdos` - Relatórios diários
- ✅ `checklists` - Listas de verificação
- ✅ `notificacoes` - Alertas e avisos

#### **🔗 Relacionamentos:**
- ✅ `rdos` → `obras` (Foreign Key)
- ✅ `checklists` → `obras` (Foreign Key)
- ✅ `notificacoes` → `obras` (Foreign Key)

#### **👁️ Views para Frontend:**
- ✅ `view_obras` - Lista obras com estatísticas
- ✅ `view_rdos` - RDOs com dados da obra
- ✅ `view_checklists` - Checklists por obra

#### **🔧 Funções Utilitárias:**
- ✅ `obterEstatisticas()` - Dados para dashboard

### **5. Dados de Exemplo Inseridos:**

#### **🏗️ Obras:**
- Shopping Center Norte (ativa)
- Residencial Jardins (ativa)
- Escritório Corporativo (pausada)
- Condomínio Vila Rica (concluída)

#### **📊 RDOs:**
- 6 relatórios distribuídos entre as obras
- Diferentes condições climáticas
- Variação de equipe (6-15 pessoas)

#### **✅ Checklists:**
- 5 checklists com percentuais variados
- Diferentes responsáveis
- Observações realistas

#### **🔔 Notificações:**
- 5 notificações distribuídas
- Mix de lidas/não lidas
- Diferentes tipos de alerta

## 🚨 **SOLUÇÃO DE PROBLEMAS**

### **Se ainda aparecer erro 42P01:**
1. Verifique se as migrações foram executadas com sucesso
2. Confirme que está no projeto correto do Supabase
3. Verifique as permissões de usuário

### **Se as telas continuarem brancas:**
1. Verifique o console do navegador (F12)
2. Confirme as variáveis de ambiente da Vercel
3. Teste a conexão com o Supabase

### **Se houver erro de permissão:**
1. Verifique se as políticas RLS estão configuradas
2. Confirme os GRANTS das views
3. Teste com usuário autenticado

## 🎯 **PRÓXIMOS PASSOS**

1. **Execute as migrações** (passos acima)
2. **Teste a aplicação** na URL da Vercel
3. **Verifique os dados** no dashboard Supabase
4. **Configure variáveis de ambiente** se necessário

## 📞 **SUPORTE**

Se precisar de ajuda adicional:
- Verifique os logs do Supabase
- Teste as queries SQL manualmente
- Confirme a estrutura das tabelas criadas

---

**✅ Esta restauração foi projetada para ser SEGURA e NÃO AFETAR o frontend existente.** 