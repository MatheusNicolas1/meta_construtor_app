-- ====================================================
-- SECURITY FIX #1: Restrict profiles table access
-- ====================================================

-- Drop overly permissive policy that allows all authenticated users to view all profiles
DROP POLICY IF EXISTS "Perfis são visíveis para usuários autenticados" ON profiles;

-- Create restrictive policy: users can only view their own profile or public profiles
CREATE POLICY "Users can view only their own profile or public profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  auth.uid() = id OR 
  (is_public = true)
);

-- Create a view with only non-sensitive fields for public profiles
CREATE OR REPLACE VIEW public_profiles AS
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
GRANT SELECT ON public_profiles TO authenticated;

-- ====================================================
-- SECURITY FIX #2: Protect digital signatures in checklists
-- ====================================================

-- Create a security definer function to get checklist data with masked signatures
CREATE OR REPLACE FUNCTION public.get_checklist_safe(p_checklist_id UUID)
RETURNS TABLE (
  id UUID,
  titulo TEXT,
  descricao TEXT,
  categoria TEXT,
  status TEXT,
  obra_id UUID,
  responsavel_id UUID,
  data_vencimento DATE,
  template_id UUID,
  progresso_total INTEGER,
  progresso_completo INTEGER,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  -- Signature fields - only visible to owner
  signature_data TEXT,
  signature_name TEXT,
  signature_email TEXT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.titulo,
    c.descricao,
    c.categoria,
    c.status,
    c.obra_id,
    c.responsavel_id,
    c.data_vencimento,
    c.template_id,
    c.progresso_total,
    c.progresso_completo,
    c.started_at,
    c.completed_at,
    c.signed_at,
    c.created_at,
    c.updated_at,
    -- Mask signature data for non-owners
    CASE 
      WHEN c.responsavel_id = auth.uid() THEN c.signature_data
      ELSE NULL
    END as signature_data,
    CASE 
      WHEN c.responsavel_id = auth.uid() THEN c.signature_name
      ELSE '[Assinado]'::TEXT
    END as signature_name,
    CASE 
      WHEN c.responsavel_id = auth.uid() THEN c.signature_email
      ELSE NULL
    END as signature_email
  FROM checklists c
  WHERE c.id = p_checklist_id
    AND (
      c.responsavel_id = auth.uid() 
      OR has_any_role(auth.uid(), ARRAY['Administrador'::app_role, 'Gerente'::app_role])
    );
END;
$$;

-- Create audit log table for signature access
CREATE TABLE IF NOT EXISTS signature_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id UUID REFERENCES checklists(id) ON DELETE CASCADE,
  accessed_by UUID NOT NULL,
  access_type TEXT NOT NULL CHECK (access_type IN ('view', 'verify', 'export')),
  accessed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Enable RLS on signature access log
ALTER TABLE signature_access_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view signature access logs
CREATE POLICY "Only admins can view signature access logs"
ON signature_access_log FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'Administrador'::app_role));

-- System can insert signature access logs
CREATE POLICY "System can insert signature access logs"
ON signature_access_log FOR INSERT
TO authenticated
WITH CHECK (accessed_by = auth.uid());