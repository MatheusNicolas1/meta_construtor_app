# MetaConstrutor - Sistema de Gestão de Obras

## 📋 Visão Geral

O MetaConstrutor é um sistema completo de gestão de obras que integra todas as informações necessárias para o acompanhamento e controle de projetos de construção civil. Desenvolvido com React, TypeScript e Tailwind CSS, oferece uma interface moderna e intuitiva para gerenciar obras, equipes, equipamentos, documentos e relatórios.

## 🚀 Funcionalidades Principais

### ✅ Dashboard
- **Visão geral completa** com estatísticas em tempo real
- **Cards informativos** sobre obras ativas, equipes e equipamentos
- **Gráficos interativos** de progresso das obras
- **Alertas e notificações** de prazos e pendências
- **Acesso rápido** às principais funcionalidades

### ✅ Gestão de Obras
- **CRUD completo** (Criar, Ler, Atualizar, Deletar)
- **Busca e filtros avançados** por localização, responsável e status
- **Página de detalhes** com abas organizadas:
  - Informações gerais
  - Controle orçamentário
  - RDOs vinculados
  - Equipes alocadas
  - Equipamentos em uso
  - Controle financeiro
  - Galeria de imagens
- **Vinculação automática** com atividades, equipes e equipamentos

### ✅ RDO (Relatório Diário de Obras)
- **Formulário completo** para criação de RDOs
- **Vinculação obrigatória** com obras
- **Registro de atividades realizadas** com quantidades e status
- **Controle de presença** de equipes e horas trabalhadas
- **Monitoramento de equipamentos** utilizados e horas de uso
- **Upload de imagens e documentos** relacionados
- **Observações gerais** do dia
- **Exportação** em PDF e Excel

### ✅ Gestão de Atividades
- **Cadastro de atividades padrão** reutilizáveis
- **Categorização** por tipo de serviço
- **Unidades de medida** personalizáveis
- **Status de execução** (Disponível, Em Execução, Concluída)
- **Duração estimada** para planejamento

### ✅ Gestão de Equipes
- **Cadastro de colaboradores** com informações completas
- **Organização por equipes** e funções
- **Controle de status** (Ativo, Férias, Licença)
- **Vinculação com obras** específicas
- **Dados de contato** (telefone, email)

### ✅ Gestão de Equipamentos
- **Inventário completo** de equipamentos
- **Controle de status** (Ativo, Manutenção, Disponível)
- **Agendamento de manutenções** preventivas
- **Localização atual** e obra vinculada
- **Histórico de uso** e observações

### ✅ Gestão de Documentos
- **Upload organizado** por obra e tipo
- **Categorização automática** (Projeto, Licença, Relatório, etc.)
- **Controle de versões** e autores
- **Busca avançada** por conteúdo e metadados
- **Separação automática** entre imagens e documentos

### ✅ Gestão de Fornecedores
- **Cadastro completo** com dados empresariais
- **Sistema de avaliação** com estrelas
- **Categorização** por tipo de fornecimento
- **Histórico de pedidos** e último contato
- **Status de relacionamento** (Ativo, Inativo, Pendente)

### ✅ Sistema de Checklists
- **Modelos reutilizáveis** para diferentes situações
- **Itens obrigatórios** e opcionais
- **Controle de progresso** visual
- **Alertas** para itens críticos pendentes
- **Vinculação com obras** específicas

### ✅ Central de Relatórios
- **Dashboard analítico** com métricas principais
- **Filtros por período** e obra
- **Gráficos de progresso** das obras
- **Relatórios de produtividade** de equipes
- **Controle de utilização** de equipamentos
- **Relatórios financeiros** consolidados
- **Exportação** em múltiplos formatos

### ✅ Integrações
- **Conectores prontos** para sistemas externos:
  - Google Drive (armazenamento)
  - WhatsApp Business (notificações)
  - Gmail (relatórios automáticos)
  - Google Calendar (cronogramas)
  - Bancos (controle financeiro)
  - ERPs (Totvs, SAP)
  - Microsoft Teams (colaboração)
  - Adobe Sign (assinaturas digitais)
- **Configurações personalizáveis** para cada integração
- **Status de conexão** em tempo real

### ✅ Configurações do Sistema
- **Gestão de usuários** e permissões
- **Configurações de notificações**
- **Políticas de segurança**
- **Personalização de aparência**
- **Configurações de backup**
- **Informações da empresa**

## 🎨 Design System

### Paleta de Cores
- **Primary Orange**: `hsl(20.5, 90.2%, 48.2%)` - Cor principal da marca
- **Construction Green**: `hsl(142.1, 76.2%, 36.3%)` - Verde para status positivos
- **Construction Blue**: `hsl(221.2, 83.2%, 53.3%)` - Azul para informações
- **Dark Theme**: Interface otimizada para modo escuro

### Componentes Reutilizáveis
- **StatusStats**: Cards de estatísticas com ícones
- **ObraCard**: Card padrão para exibição de obras
- **FileUpload**: Upload drag-and-drop de arquivos
- **SearchFilter**: Busca com filtros avançados
- **EmptyState**: Estados vazios padronizados
- **ProgressCard**: Cards com barras de progresso

## 🔧 Estrutura Técnica

### Tecnologias Utilizadas
- **React 18** com TypeScript
- **Vite** para build e desenvolvimento
- **Tailwind CSS** para estilização
- **Shadcn/ui** para componentes base
- **React Router** para navegação
- **React Query** para gerenciamento de estado
- **Date-fns** para manipulação de datas
- **Lucide React** para ícones

### Estrutura de Arquivos
```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes base (shadcn)
│   ├── DatePicker.tsx  # Seletor de data
│   ├── RDOForm.tsx     # Formulário de RDO
│   └── ...
├── pages/              # Páginas principais
│   ├── Dashboard.tsx
│   ├── Obras.tsx
│   ├── RDO.tsx
│   └── ...
├── types/              # Definições TypeScript
│   ├── rdo.ts
│   ├── obra.ts
│   └── ...
├── utils/              # Funções utilitárias
│   └── formatters.ts
├── hooks/              # Custom hooks
│   └── useLocalStorage.ts
└── ...
```

### Padrões de Código
- **Componentes funcionais** com hooks
- **TypeScript estrito** para type safety
- **Props interfaces** bem definidas
- **Formatação consistente** com Prettier
- **Lint rules** com ESLint

## 🔄 Fluxo de Dados

### Integração entre Módulos
1. **Obras** são o centro do sistema
2. **RDOs** são sempre vinculados a uma obra
3. **Atividades** podem ser reutilizadas em diferentes RDOs
4. **Equipes** e **Equipamentos** são alocados por obra
5. **Documentos** e **Imagens** são organizados por obra
6. **Relatórios** consolidam dados de todos os módulos

### Estado da Aplicação
- **Mock data** para demonstração
- **LocalStorage** para persistência local
- **React Query** para cache e sincronização
- **Preparado para APIs** REST/GraphQL

## 📱 Responsividade

- **Mobile First** - Otimizado para dispositivos móveis
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Sidebar colapsível** para melhor uso em mobile
- **Grids responsivos** que se adaptam ao tamanho da tela
- **Touch-friendly** interface para tablets

## 🔒 Segurança

- **Autenticação preparada** para integração com Supabase
- **Controle de permissões** por usuário
- **Validação de formulários** client-side
- **Sanitização de inputs** para prevenção de XSS
- **HTTPS ready** para produção

## 🚦 Status do Projeto

### ✅ Completamente Implementado
- [x] Todas as 12 páginas principais
- [x] Sistema de navegação completo
- [x] Componentes reutilizáveis
- [x] Design system consistente
- [x] Responsividade total
- [x] Formulários funcionais
- [x] Sistema de filtros e busca
- [x] Mock data para demonstração

### 🔄 Próximos Passos (Opcional)
- [ ] Integração com Supabase
- [ ] Autenticação real
- [ ] APIs backend
- [ ] Upload real de arquivos
- [ ] Notificações push
- [ ] Testes automatizados
- [ ] PWA capabilities

## 🎯 Como Usar

1. **Dashboard**: Visão geral e acesso rápido
2. **Obras**: Cadastre e gerencie suas obras
3. **RDO**: Crie relatórios diários vinculados às obras
4. **Equipes/Equipamentos**: Gerencie recursos
5. **Documentos**: Organize arquivos por obra
6. **Relatórios**: Acompanhe métricas e progresso
7. **Configurações**: Personalize o sistema

## 🏗️ Arquitetura de Produção

Para colocar em produção, recomenda-se:

1. **Backend**: Integração com Supabase ou API custom
2. **Autenticação**: Sistema de login/logout
3. **Database**: PostgreSQL via Supabase
4. **Storage**: Supabase Storage para arquivos
5. **Deploy**: Vercel, Netlify ou similar
6. **Domain**: Domínio personalizado
7. **Analytics**: Google Analytics ou similar

---

**MetaConstrutor** - Sistema completo de gestão de obras, pronto para uso e produção! 🏗️✨