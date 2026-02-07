CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  referrer_user_id uuid REFERENCES auth.users(id),
  referred_user_id uuid REFERENCES auth.users(id),
  code text,
  status text
);
