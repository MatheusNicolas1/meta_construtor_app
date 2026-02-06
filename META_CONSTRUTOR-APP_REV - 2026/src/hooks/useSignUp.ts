import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SignUpData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface UseSignUpReturn {
  signUp: (data: SignUpData) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

export const useSignUp = (): UseSignUpReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signUp = async (data: SignUpData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Validações básicas
      if (!data.name || data.name.length < 2) {
        throw new Error('Nome deve ter pelo menos 2 caracteres');
      }

      if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        throw new Error('Email inválido');
      }

      if (data.password !== data.confirmPassword) {
        throw new Error('As senhas não coincidem');
      }

      if (data.password.length < 10) {
        throw new Error('A senha deve ter pelo menos 10 caracteres');
      }

      if (!data.phone || data.phone.length < 10) {
        throw new Error('Telefone inválido');
      }

      // Verificar duplicidade usando função do banco
      const cleanPhone = data.phone.replace(/\D/g, '');

      console.log('[DEBUG] Verificando duplicidade para:', {
        email: data.email,
        phone: cleanPhone
      });

      const { data: checkResult, error: checkError } = await supabase
        .rpc('check_user_duplicates', {
          p_email: data.email,
          p_phone: cleanPhone,
          p_cpf_cnpj: ''
        });

      console.log('[DEBUG] Resultado da verificação:', { checkResult, checkError });

      if (checkError) {
        console.error('[ERROR] Erro na verificação de duplicidade (continuando):', checkError);
        // Continuamos mesmo com erro
      } else {
        const result = checkResult as { has_duplicate: boolean; duplicate_field: string | null };

        if (result?.has_duplicate) {
          const field = result.duplicate_field;
          let errorMessage = '';

          if (field === 'email') {
            errorMessage = 'Este e-mail já está cadastrado. Faça login para acessar sua conta.';
          } else if (field === 'phone') {
            errorMessage = 'Este telefone já está cadastrado em outra conta. Faça login ou use outro número.';
          } else {
            errorMessage = 'Já existe um usuário cadastrado com algumas das informações fornecidas. Por favor, utilize a função de Login.';
          }

          toast.error(errorMessage, {
            duration: 6000,
            action: {
              label: 'Ir para Login',
              onClick: () => window.location.href = '/login'
            }
          });

          throw new Error(errorMessage);
        }
      }

      console.log('[DEBUG] Iniciando criação de usuário no Supabase Auth...');

      // Criar usuário no Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            name: data.name,
            phone: cleanPhone,
            plan_type: 'free',
          },
        },
      });

      console.log('[DEBUG] Resposta do signUp:', {
        user: authData?.user?.id,
        session: !!authData?.session,
        error: signUpError
      });

      if (signUpError) {
        console.error('[ERROR] Erro no signUp:', signUpError);

        if (signUpError.message.includes('already registered') ||
          signUpError.message.includes('User already registered')) {
          toast.error('Este e-mail já está cadastrado. Faça login ou use outro e-mail.', {
            duration: 5000,
            action: {
              label: 'Ir para Login',
              onClick: () => window.location.href = '/login'
            }
          });
          throw new Error('Este e-mail já está cadastrado. Faça login ou use outro e-mail.');
        }

        if (signUpError.message.includes('Invalid email')) {
          throw new Error('E-mail inválido. Verifique e tente novamente.');
        }

        if (signUpError.message.includes('Password')) {
          throw new Error('Senha inválida. Use no mínimo 10 caracteres com letras, números e símbolos.');
        }

        throw new Error(`Erro ao criar conta: ${signUpError.message}`);
      }

      if (!authData.user) {
        throw new Error('Erro ao criar usuário. Tente novamente em alguns segundos.');
      }

      console.log('[DEBUG] Usuário criado com sucesso. Aguardando criação do perfil...');

      // Aguardar a criação do perfil via trigger
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Verificar se o perfil foi criado
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', authData.user.id)
        .maybeSingle();

      console.log('[DEBUG] Verificação do perfil:', { profile, profileError });

      if (profileError || !profile) {
        console.error('[ERROR] Erro ao verificar perfil:', profileError);
        throw new Error('Conta criada, mas houve um problema ao configurar o perfil. Entre em contato com o suporte.');
      }

      console.log('[DEBUG] Perfil criado. Fazendo login automático...');

      // Fazer login automático após cadastro
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      console.log('[DEBUG] Resultado do login automático:', { signInError });

      if (signInError) {
        console.warn('[WARN] Login automático falhou, mas conta foi criada:', signInError);
        toast.success('Conta criada com sucesso! Faça login para continuar.');
        return true;
      }

      console.log('[SUCCESS] Cadastro completo com sucesso!');
      toast.success('Conta criada com sucesso! Redirecionando...');
      return true;

    } catch (err: any) {
      console.error('[ERROR] Erro completo no cadastro:', err);
      const errorMessage = err.message || 'Erro inesperado ao criar conta. Tente novamente.';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { signUp, isLoading, error };
};
