-- ============================================================================
-- FIX: Add unique constraint to user_roles.user_id for handle_new_user trigger
-- ============================================================================
-- ERROR: "no unique or exclusion constraint matching the ON CONFLICT specification"
-- Root cause: user_roles INSERT uses ON CONFLICT (user_id) but no unique constraint exists
-- ============================================================================

-- Add unique constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_roles_user_id_key' 
    AND conrelid = 'public.user_roles'::regclass
  ) THEN
    ALTER TABLE public.user_roles 
    ADD CONSTRAINT user_roles_user_id_key UNIQUE (user_id);
    RAISE NOTICE 'Added unique constraint user_roles_user_id_key';
  ELSE
    RAISE NOTICE 'Constraint user_roles_user_id_key already exists';
  END IF;
END $$;

COMMENT ON CONSTRAINT user_roles_user_id_key ON public.user_roles IS 'Ensures one role per user (required for ON CONFLICT in handle_new_user trigger)';
