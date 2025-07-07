-- Configuração do Supabase Storage para o MetaConstrutor

-- Criar buckets de storage
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('obras-anexos', 'obras-anexos', false),
  ('rdo-imagens', 'rdo-imagens', false),
  ('documentos', 'documentos', false),
  ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas para o bucket 'obras-anexos'
CREATE POLICY "Usuários autenticados podem fazer upload de anexos de obras" 
ON storage.objects FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'obras-anexos');

CREATE POLICY "Usuários autenticados podem ver anexos de obras" 
ON storage.objects FOR SELECT TO authenticated 
USING (bucket_id = 'obras-anexos');

CREATE POLICY "Usuários autenticados podem atualizar anexos de obras" 
ON storage.objects FOR UPDATE TO authenticated 
USING (bucket_id = 'obras-anexos');

CREATE POLICY "Usuários autenticados podem deletar anexos de obras" 
ON storage.objects FOR DELETE TO authenticated 
USING (bucket_id = 'obras-anexos');

-- Políticas para o bucket 'rdo-imagens'
CREATE POLICY "Usuários autenticados podem fazer upload de imagens de RDO" 
ON storage.objects FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'rdo-imagens');

CREATE POLICY "Usuários autenticados podem ver imagens de RDO" 
ON storage.objects FOR SELECT TO authenticated 
USING (bucket_id = 'rdo-imagens');

CREATE POLICY "Usuários autenticados podem atualizar imagens de RDO" 
ON storage.objects FOR UPDATE TO authenticated 
USING (bucket_id = 'rdo-imagens');

CREATE POLICY "Usuários autenticados podem deletar imagens de RDO" 
ON storage.objects FOR DELETE TO authenticated 
USING (bucket_id = 'rdo-imagens');

-- Políticas para o bucket 'documentos'
CREATE POLICY "Usuários autenticados podem fazer upload de documentos" 
ON storage.objects FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'documentos');

CREATE POLICY "Usuários autenticados podem ver documentos" 
ON storage.objects FOR SELECT TO authenticated 
USING (bucket_id = 'documentos');

CREATE POLICY "Usuários autenticados podem atualizar documentos" 
ON storage.objects FOR UPDATE TO authenticated 
USING (bucket_id = 'documentos');

CREATE POLICY "Usuários autenticados podem deletar documentos" 
ON storage.objects FOR DELETE TO authenticated 
USING (bucket_id = 'documentos');

-- Políticas para o bucket 'avatars' (público)
CREATE POLICY "Qualquer um pode ver avatars" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Usuários autenticados podem fazer upload de avatars" 
ON storage.objects FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Usuários podem atualizar seus próprios avatars" 
ON storage.objects FOR UPDATE TO authenticated 
USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Usuários podem deletar seus próprios avatars" 
ON storage.objects FOR DELETE TO authenticated 
USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Função para organizar arquivos por estrutura hierárquica
CREATE OR REPLACE FUNCTION public.validate_file_structure()
RETURNS TRIGGER AS $$
BEGIN
  -- Validar estrutura para obras-anexos: obra_id/categoria/arquivo
  IF NEW.bucket_id = 'obras-anexos' THEN
    IF array_length(string_to_array(NEW.name, '/'), 1) < 3 THEN
      RAISE EXCEPTION 'Estrutura inválida para obras-anexos. Use: obra_id/categoria/arquivo';
    END IF;
  END IF;

  -- Validar estrutura para rdo-imagens: rdo_id/arquivo
  IF NEW.bucket_id = 'rdo-imagens' THEN
    IF array_length(string_to_array(NEW.name, '/'), 1) < 2 THEN
      RAISE EXCEPTION 'Estrutura inválida para rdo-imagens. Use: rdo_id/arquivo';
    END IF;
  END IF;

  -- Validar estrutura para documentos: obra_id/categoria/arquivo
  IF NEW.bucket_id = 'documentos' THEN
    IF array_length(string_to_array(NEW.name, '/'), 1) < 3 THEN
      RAISE EXCEPTION 'Estrutura inválida para documentos. Use: obra_id/categoria/arquivo';
    END IF;
  END IF;

  -- Validar estrutura para avatars: user_id/arquivo
  IF NEW.bucket_id = 'avatars' THEN
    IF array_length(string_to_array(NEW.name, '/'), 1) < 2 THEN
      RAISE EXCEPTION 'Estrutura inválida para avatars. Use: user_id/arquivo';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar estrutura de arquivos
CREATE TRIGGER validate_file_structure_trigger
  BEFORE INSERT ON storage.objects
  FOR EACH ROW EXECUTE FUNCTION public.validate_file_structure();

-- Função para limpar arquivos órfãos
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_files()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
  file_record RECORD;
BEGIN
  -- Limpar arquivos de obras que não existem mais
  FOR file_record IN 
    SELECT DISTINCT (string_to_array(name, '/'))[1] as obra_id
    FROM storage.objects 
    WHERE bucket_id IN ('obras-anexos', 'documentos')
  LOOP
    IF NOT EXISTS (SELECT 1 FROM public.obras WHERE id::text = file_record.obra_id) THEN
      DELETE FROM storage.objects 
      WHERE bucket_id IN ('obras-anexos', 'documentos') 
      AND name LIKE file_record.obra_id || '/%';
      GET DIAGNOSTICS deleted_count = ROW_COUNT;
    END IF;
  END LOOP;

  -- Limpar arquivos de RDOs que não existem mais
  FOR file_record IN 
    SELECT DISTINCT (string_to_array(name, '/'))[1] as rdo_id
    FROM storage.objects 
    WHERE bucket_id = 'rdo-imagens'
  LOOP
    IF NOT EXISTS (SELECT 1 FROM public.rdos WHERE id::text = file_record.rdo_id) THEN
      DELETE FROM storage.objects 
      WHERE bucket_id = 'rdo-imagens' 
      AND name LIKE file_record.rdo_id || '/%';
      GET DIAGNOSTICS deleted_count = deleted_count + ROW_COUNT;
    END IF;
  END LOOP;

  -- Limpar avatars de usuários que não existem mais
  FOR file_record IN 
    SELECT DISTINCT (string_to_array(name, '/'))[1] as user_id
    FROM storage.objects 
    WHERE bucket_id = 'avatars'
  LOOP
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id::text = file_record.user_id) THEN
      DELETE FROM storage.objects 
      WHERE bucket_id = 'avatars' 
      AND name LIKE file_record.user_id || '/%';
      GET DIAGNOSTICS deleted_count = deleted_count + ROW_COUNT;
    END IF;
  END LOOP;

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Configurar MIME types permitidos
CREATE OR REPLACE FUNCTION public.validate_file_type()
RETURNS TRIGGER AS $$
DECLARE
  allowed_types TEXT[];
  file_extension TEXT;
BEGIN
  -- Obter extensão do arquivo
  file_extension := lower(substring(NEW.name from '\.([^.]*)$'));
  
  -- Definir tipos permitidos por bucket
  CASE NEW.bucket_id
    WHEN 'obras-anexos' THEN
      allowed_types := ARRAY['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'gif', 'dwg', 'zip', 'rar'];
    WHEN 'rdo-imagens' THEN
      allowed_types := ARRAY['jpg', 'jpeg', 'png', 'gif', 'webp'];
    WHEN 'documentos' THEN
      allowed_types := ARRAY['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'rtf'];
    WHEN 'avatars' THEN
      allowed_types := ARRAY['jpg', 'jpeg', 'png', 'gif', 'webp'];
    ELSE
      allowed_types := ARRAY['pdf', 'jpg', 'jpeg', 'png'];
  END CASE;

  -- Verificar se a extensão é permitida
  IF file_extension IS NULL OR NOT (file_extension = ANY(allowed_types)) THEN
    RAISE EXCEPTION 'Tipo de arquivo não permitido: %. Tipos permitidos: %', 
      file_extension, array_to_string(allowed_types, ', ');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar tipo de arquivo
CREATE TRIGGER validate_file_type_trigger
  BEFORE INSERT ON storage.objects
  FOR EACH ROW EXECUTE FUNCTION public.validate_file_type();

-- Função para obter informações de uso do storage
CREATE OR REPLACE FUNCTION public.get_storage_usage(empresa_id_param UUID DEFAULT NULL)
RETURNS TABLE (
  bucket_id TEXT,
  total_files BIGINT,
  total_size BIGINT,
  average_size NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.bucket_id,
    COUNT(*)::BIGINT as total_files,
    COALESCE(SUM(o.metadata->>'size')::BIGINT, 0) as total_size,
    COALESCE(AVG((o.metadata->>'size')::BIGINT), 0) as average_size
  FROM storage.objects o
  WHERE 
    CASE 
      WHEN empresa_id_param IS NOT NULL AND o.bucket_id IN ('obras-anexos', 'documentos') THEN
        EXISTS (
          SELECT 1 FROM public.obras ob 
          WHERE ob.id::text = (string_to_array(o.name, '/'))[1] 
          AND ob.empresa_id = empresa_id_param
        )
      ELSE TRUE
    END
  GROUP BY o.bucket_id
  ORDER BY o.bucket_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentários para documentação
COMMENT ON FUNCTION public.validate_file_structure() IS 'Valida a estrutura hierárquica dos arquivos no storage';
COMMENT ON FUNCTION public.cleanup_orphaned_files() IS 'Remove arquivos órfãos que não possuem mais registros relacionados';
COMMENT ON FUNCTION public.validate_file_type() IS 'Valida os tipos de arquivo permitidos por bucket';
COMMENT ON FUNCTION public.get_storage_usage(UUID) IS 'Retorna estatísticas de uso do storage por bucket'; 