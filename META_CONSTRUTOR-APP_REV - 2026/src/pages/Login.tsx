import { SignInPage } from "@/components/ui/sign-in";
import { authTestimonials } from "@/data/auth-testimonials";

import { useAuth } from "@/components/auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/LoadingSpinner";




const Login = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const rememberedEmail = localStorage.getItem('rememberedEmail') || "";

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const emailOrPhone = formData.get('email') as string;
      const password = formData.get('password') as string;
      const rememberMe = formData.get('rememberMe') === 'on';

      if (!emailOrPhone || !password) {
        toast({
          title: "Campos obrigatórios",
          description: "Por favor, preencha e-mail/celular e senha.",
          variant: "destructive",
        });
        return;
      }

      await signIn(emailOrPhone, password);

      // Lógica do Manter-me conectado
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', emailOrPhone);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta ao Meta Construtor.",
      });

      // Redirecionar para dashboard
      setTimeout(() => {
        window.location.replace("/dashboard");
      }, 500);

    } catch (error: any) {
      // Erro já é tratado no AuthContext com toast
      console.error("Erro no login:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;

    } catch (error: any) {
      toast({
        title: "Erro ao fazer login com Google",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleResetPassword = () => {
    navigate("/recuperar-senha");
  };

  const handleCreateAccount = () => {
    navigate("/criar-conta");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" text="Autenticando..." />
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Login | Meta Construtor"
        description="Acesse sua conta no Meta Construtor e gerencie suas obras com facilidade."
        canonical={window.location.href}
      />
      <SignInPage
        title={<span className="font-light text-foreground tracking-tighter">Bem-vindo</span>}
        description="Acesse sua conta usando e-mail ou celular cadastrado"
        heroImageSrc="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&h=800&fit=crop"
        testimonials={authTestimonials}
        onSignIn={handleSignIn}
        onGoogleSignIn={handleGoogleSignIn}
        onResetPassword={handleResetPassword}
        onCreateAccount={handleCreateAccount}
        isLoading={isLoading}
        initialEmail={rememberedEmail}
      />
    </>
  );
};

export default Login;
