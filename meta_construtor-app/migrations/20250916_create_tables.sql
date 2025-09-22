-- Create core tables for Meta Construtor backend
-- Safe-guards
create extension if not exists "uuid-ossp";

-- obras
create table if not exists public.obras (
  id uuid primary key default uuid_generate_v4(),
  titulo text not null,
  descricao text,
  endereco jsonb,
  cliente_id uuid,
  status text default 'ativo',
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create index if not exists idx_obras_status on public.obras (status);

-- rdo
create table if not exists public.rdo (
  id uuid primary key default uuid_generate_v4(),
  obra_id uuid not null references public.obras(id) on delete cascade,
  titulo text not null,
  descricao text,
  data_rdo date not null default current_date,
  status text default 'aberto',
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create index if not exists idx_rdo_obra on public.rdo (obra_id);
create index if not exists idx_rdo_status on public.rdo (status);

-- rdo_itens
create table if not exists public.rdo_itens (
  id uuid primary key default uuid_generate_v4(),
  rdo_id uuid not null references public.rdo(id) on delete cascade,
  descricao text not null,
  quantidade numeric,
  unidade text,
  criado_em timestamptz not null default now()
);
create index if not exists idx_rdo_itens_rdo on public.rdo_itens (rdo_id);

-- equipes
create table if not exists public.equipes (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  membros jsonb,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- ferramentas
create table if not exists public.ferramentas (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  patrimonio text,
  obra_id uuid references public.obras(id) on delete set null,
  status text default 'disponivel',
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create index if not exists idx_ferramentas_obra on public.ferramentas (obra_id);

-- attachments (generic registry, storage in Supabase Storage)
create table if not exists public.attachments (
  id uuid primary key default uuid_generate_v4(),
  parent_table text not null,
  parent_id uuid not null,
  bucket_path text not null,
  filename text not null,
  content_type text,
  size integer,
  url text,
  criado_em timestamptz not null default now()
);
create index if not exists idx_attachments_parent on public.attachments (parent_table, parent_id);

-- triggers to auto-update atualizado_em
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$ language plpgsql;

do $$ begin
  if not exists (
    select 1 from pg_trigger where tgname = 'tg_obras_updated_at') then
    create trigger tg_obras_updated_at before update on public.obras
    for each row execute procedure public.set_updated_at();
  end if;
  if not exists (
    select 1 from pg_trigger where tgname = 'tg_rdo_updated_at') then
    create trigger tg_rdo_updated_at before update on public.rdo
    for each row execute procedure public.set_updated_at();
  end if;
  if not exists (
    select 1 from pg_trigger where tgname = 'tg_equipes_updated_at') then
    create trigger tg_equipes_updated_at before update on public.equipes
    for each row execute procedure public.set_updated_at();
  end if;
  if not exists (
    select 1 from pg_trigger where tgname = 'tg_ferramentas_updated_at') then
    create trigger tg_ferramentas_updated_at before update on public.ferramentas
    for each row execute procedure public.set_updated_at();
  end if;
end $$;




