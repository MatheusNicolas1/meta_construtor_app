-- Fix the security definer view warning by recreating it properly
DROP VIEW IF EXISTS public_profiles;

-- Recreate as a simple view (not security definer)
-- This is safe because the profiles table RLS will handle access control
CREATE VIEW public_profiles 
WITH (security_invoker = true)
AS
SELECT 
  id, 
  name, 
  username, 
  avatar_url, 
  bio, 
  company, 
  position, 
  website,
  slug,
  posts_count,
  followers_count,
  following_count
FROM profiles
WHERE is_public = true;

-- Grant access to the view
GRANT SELECT ON public_profiles TO authenticated, anon;;
