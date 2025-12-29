import { SignInPage, Testimonial } from "@/components/ui/sign-in";
import { useAuth } from "@/components/auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/LoadingSpinner";

// EXATAMENTE OS MESMOS testimonials da página Criar Conta
const loginTestimonials: Testimonial[] = [
  {
    avatarSrc: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=160&h=160&fit=crop&crop=face&auto=format&q=90",
    name: "Maria Oliveira",
    handle: "@mariaoliveira",
    text: "Com o teste grátis de 14 dias consegui avaliar todas as funcionalidades antes de decidir. Excelente plataforma!"
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&h=160&fit=crop&crop=face&auto=format&q=90",
    name: "João Costa",
    handle: "@joaocosta",
    text: "O processo de cadastro é muito simples e intuitivo. Em minutos já estava usando o sistema completo."
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&h=160&fit=crop&crop=face&auto=format&q=90",
    name: "Pedro Almeida",
    handle: "@pedroalmeida",
    text: "A integração com outras ferramentas que já usávamos foi perfeita. Não perdemos nenhum dado importante."
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=160&h=160&fit=crop&crop=face&auto=format&q=90",
    name: "Lucas Ferreira",
    handle: "@lucasferreira",
    text: "O suporte durante o período de teste foi excepcional. Tiraram todas as nossas dúvidas rapidamente."
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=160&h=160&fit=crop&crop=face&auto=format&q=90",
    name: "Ana Souza",
    handle: "@anasouza",
    text: "A experiência foi excelente! O processo é simples e rápido, adorei a plataforma."
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&h=160&fit=crop&crop=face&auto=format&q=90",
    name: "Rafael Lima",
    handle: "@rafaellima",
    text: "Em poucos minutos já estava com tudo configurado, interface muito intuitiva!"
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&h=160&fit=crop&crop=face&auto=format&q=90",
    name: "Beatriz Santos",
    handle: "@beatrizsantos",
    text: "Plataforma muito intuitiva, ideal para nosso dia a dia na obra. Recomendo!"
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=160&h=160&fit=crop&crop=face&auto=format&q=90",
    name: "Carlos Mendes",
    handle: "@carlosmendes",
    text: "O suporte foi incrível, resolveram minhas dúvidas em minutos. Equipe nota 10!"
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&h=160&fit=crop&crop=face&auto=format&q=90",
    name: "Juliana Rocha",
    handle: "@julianarocha",
    text: "Sistema completo e fácil de usar. Melhorou muito nossa gestão de projetos."
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=160&h=160&fit=crop&crop=face&auto=format&q=90",
    name: "Eduardo Nogueira",
    handle: "@eduardonogueira",
    text: "Implementação rápida e sem complicações. Em uma semana já estávamos operando 100%."
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=160&h=160&fit=crop&crop=face&auto=format&q=90",
    name: "Roberto Silva",
    handle: "@robertosilva",
    text: "Cadastro simples e rápido. Comecei a usar no mesmo dia sem nenhuma dificuldade."
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=160&h=160&fit=crop&crop=face&auto=format&q=90",
    name: "Marcos Vieira",
    handle: "@marcosvieira",
    text: "O período de teste gratuito foi fundamental para conhecer todos os recursos. Fechei o plano logo depois!"
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&h=160&fit=crop&crop=face&auto=format&q=90",
    name: "André Carvalho",
    handle: "@andrecarvalho",
    text: "Ferramenta moderna e completa. O cadastro leva apenas alguns minutos para fazer."
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=160&h=160&fit=crop&crop=face&auto=format&q=90",
    name: "Larissa Martins",
    handle: "@larissamartins",
    text: "Processo de onboarding muito bem feito. Não tive nenhuma dúvida ao começar a usar."
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=160&h=160&fit=crop&crop=face&auto=format&q=90",
    name: "Gustavo Pereira",
    handle: "@gustavopereira",
    text: "Criar a conta foi super fácil. Interface amigável desde o primeiro acesso."
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=160&h=160&fit=crop&crop=face&auto=format&q=90",
    name: "Daniel Santos",
    handle: "@danielsantos",
    text: "Em 5 minutos já estava usando o sistema. Processo de cadastro muito eficiente!"
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=160&h=160&fit=crop&crop=face&auto=format&q=90",
    name: "Paula Ribeiro",
    handle: "@paularibeiro",
    text: "A simplicidade do cadastro me surpreendeu positivamente. Tudo muito bem organizado."
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=160&h=160&fit=crop&crop=face&auto=format&q=90",
    name: "Rodrigo Alves",
    handle: "@rodrigoalves",
    text: "Teste grátis sem burocracia e sem pedir cartão de crédito. Isso mostra confiança no produto!"
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&h=160&fit=crop&crop=face&auto=format&q=90",
    name: "Isabela Freitas",
    handle: "@isabelafreitas",
    text: "Começar a usar foi muito fácil. O sistema já vem configurado com templates prontos."
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1507081323647-4d250478b919?w=160&h=160&fit=crop&crop=face&auto=format&q=90",
    name: "Fabio Costa",
    handle: "@fabiocosta",
    text: "Cadastro intuitivo e rápido. Gostei muito da experiência desde o primeiro momento!"
  }
];

const Login = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    
    try {
      const formData = new FormData(event.currentTarget);
      const emailOrPhone = formData.get('email') as string;
      const password = formData.get('password') as string;

      if (!emailOrPhone || !password) {
        toast({
          title: "Campos obrigatórios",
          description: "Por favor, preencha e-mail/celular e senha.",
          variant: "destructive",
        });
        return;
      }

      await signIn(emailOrPhone, password);
      
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
        testimonials={loginTestimonials}
        onSignIn={handleSignIn}
        onGoogleSignIn={handleGoogleSignIn}
        onResetPassword={handleResetPassword}
        onCreateAccount={handleCreateAccount}
        isLoading={isLoading}
      />
    </>
  );
};

export default Login;
