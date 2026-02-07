-- Bridge migration: prepare public.obras for migration 20251106143830
-- This migration expects obras to have: nome, is_public, slug, cover_image_url
-- Safe: only ADD COLUMN if missing

-- Add nome column (required for slug generation in next migration)
ALTER TABLE public.obras
  ADD COLUMN IF NOT EXISTS nome text;

-- Add other columns expected by 20251106143830
ALTER TABLE public.obras
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS cover_image_url text;

-- Backfill nome for existing rows (so slug generation won't fail)
UPDATE public.obras
SET nome = 'Obra ' || SUBSTRING(id::text FROM 1 FOR 8)
WHERE nome IS NULL;

-- Create unique index for slug (matches what 20251106143830 expects)
CREATE UNIQUE INDEX IF NOT EXISTS obras_slug_unique_idx ON public.obras (slug);
