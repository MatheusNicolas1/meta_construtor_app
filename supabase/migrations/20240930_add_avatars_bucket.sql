-- Criar um bucket de storage para avatares de usuários, se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Adicionar política para permitir que usuários autenticados façam upload de avatares
CREATE POLICY "Usuários autenticados podem fazer upload de avatares"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Adicionar política para permitir que usuários autenticados atualizem seus próprios avatares
CREATE POLICY "Usuários autenticados podem atualizar seus avatares"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Adicionar política para permitir que usuários autenticados excluam seus próprios avatares
CREATE POLICY "Usuários autenticados podem excluir seus avatares"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Adicionar política para permitir que todos visualizem avatares
CREATE POLICY "Todos podem visualizar avatares"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Verificar se a coluna avatar_url já existe na tabela profiles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_schema = 'public' 
                    AND table_name = 'profiles' 
                    AND column_name = 'avatar_url') THEN
        ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_schema = 'public' 
                    AND table_name = 'profiles' 
                    AND column_name = 'full_name') THEN
        ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
    END IF;
END
$$; 