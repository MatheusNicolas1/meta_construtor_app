-- Bootstrap + compatibility bridge for referrals
-- Safe: creates table if missing, adds compat columns if missing, and backfills.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  -- current columns (your bootstrap)
  referrer_user_id uuid REFERENCES auth.users(id),
  referred_user_id uuid REFERENCES auth.users(id),
  code text,
  status text
);

-- old columns expected by legacy policy/migration
ALTER TABLE public.referrals
  ADD COLUMN IF NOT EXISTS referrer_id uuid,
  ADD COLUMN IF NOT EXISTS new_user_id uuid;

-- Backfill old columns from new columns (safe even if null)
UPDATE public.referrals
  SET referrer_id = referrer_user_id
WHERE referrer_id IS NULL;

UPDATE public.referrals
  SET new_user_id = referred_user_id
WHERE new_user_id IS NULL;
