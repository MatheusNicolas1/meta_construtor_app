# Meta Construtor App

## Sobre o Projeto

O Meta Construtor é um aplicativo web para gerenciamento de obras e projetos de construção civil. Permite o acompanhamento de obras, geração de relatórios diários (RDOs), análise de progresso e gestão de equipes.

## Funcionalidades

- Autenticação e registro de usuários
- Gerenciamento de obras e projetos
- Relatórios Diários de Obra (RDOs)
- Análise de progresso com visualizações gráficas
- Gestão de equipes e recursos
- Suporte a múltiplos idiomas
- Tema claro/escuro

## Tecnologias Utilizadas

Este projeto é construído com:

- Vite
- TypeScript
- React
- Shadcn UI
- Tailwind CSS
- Supabase (autenticação e banco de dados)
- React Router
- React Query

## Como Executar o Projeto

Siga estes passos para executar o projeto localmente:

```sh
# Passo 1: Clone o repositório
git clone https://github.com/MatheusNicolas1/meta_construtor_app.git

# Passo 2: Navegue até o diretório do projeto
cd meta_construtor_app

# Passo 3: Instale as dependências
npm install

# Passo 4: Inicie o servidor de desenvolvimento
npm run dev
```

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto e defina as seguintes variáveis:

```
VITE_SUPABASE_URL=sua-url-do-supabase
VITE_SUPABASE_KEY=sua-chave-anon-do-supabase
VITE_API_KEY=sua-api-key
```

## Deploy

O projeto está hospedado na Vercel: [Meta Construtor App](https://meta-construtor-app.vercel.app)
