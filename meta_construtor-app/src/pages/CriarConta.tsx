import { SignUpPage, Testimonial } from "@/components/ui/sign-up";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthContext";
import SEO from "@/components/SEO";

// Testimonials específicos para criar conta com imagens diferentes e funcionais
const createAccountTestimonials: Testimonial[] = [
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
  }
];

const CriarConta = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (data: any) => {
    setIsLoading(true);
    
    try {
      // Simulação de criação de conta com dados das etapas
      console.log('Dados do cadastro:', data);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Conta criada com sucesso!",
        description: "Bem-vindo ao Meta Construtor. Você será redirecionado para o login.",
      });

      // Redirecionar para login após sucesso
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (error: any) {
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      toast({
        title: "Erro no cadastro com Google",
        description: error.message || "Erro ao fazer cadastro com Google. Tente novamente.",
        variant: "destructive",
      });
    }
  };
  
  const handleSignIn = () => {
    navigate("/login");
  };

  return (
    <>
      <SEO
        title="Criar conta | Meta Construtor" 
        description="Cadastre-se no Meta Construtor e gerencie suas obras com facilidade." 
        canonical={window.location.href} 
      />
      <div className="min-h-screen bg-background">
        <SignUpPage
          heroImageSrc="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&h=800&fit=crop"
          testimonials={createAccountTestimonials}
          onSignUp={handleSignUp}
          onGoogleSignIn={handleGoogleSignIn}
          onSignIn={handleSignIn}
        />
      </div>
    </>
  );
};

export default CriarConta;