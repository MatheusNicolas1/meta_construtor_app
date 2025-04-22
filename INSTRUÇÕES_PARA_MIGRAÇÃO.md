# Instruções para Migração do Supabase

Para resolver o problema de upload de avatar no Meta Construtor, é necessário executar a seguinte migração manualmente no console do Supabase:

1. Acesse o painel do Supabase: https://app.supabase.io
2. Navegue até o seu projeto (URL: https://jchnjeihrutgmfjwnfyo.supabase.co)
3. Clique em "SQL Editor" no menu lateral
4. Crie uma nova consulta e cole o seguinte SQL:

```sql
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
```

5. Clique em "Run" para executar a consulta
6. Verifique se não há erros na execução

## Verificação

Após executar a migração, verifique se:

1. O bucket "avatars" foi criado na seção "Storage" do Supabase
2. As políticas foram adicionadas ao bucket (você pode verificar na seção "Policies" do bucket)
3. A tabela "profiles" possui as colunas "avatar_url" e "full_name" (você pode verificar na seção "Table Editor") 