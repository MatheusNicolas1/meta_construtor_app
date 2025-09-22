import { SignInPage, Testimonial } from "@/components/ui/sign-in";
import { useAuth } from "@/components/auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import shortTestimonials from "@/data/short-testimonials.json";

// Usar diferentes testimunials para login (diferentes dos do cadastro) com imagens funcionais
const loginTestimonials: Testimonial[] = [
  {
    avatarSrc: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=160&h=160&fit=crop&crop=face&auto=format&q=90",
    name: "Roberto Mendes",
    handle: "@robertomendes",
    text: "O MetaConstrutor transformou nossa gestão de obras. Reduzimos 40% do retrabalho e aumentamos nossa produtividade significativamente."
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&h=160&fit=crop&crop=face&auto=format&q=90",
    name: "Fernanda Lima",
    handle: "@fernandalima",
    text: "A plataforma é intuitiva e o suporte é excepcional. Nossa equipe se adaptou rapidamente e os resultados apareceram em poucas semanas."
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=160&h=160&fit=crop&crop=face&auto=format&q=90",
    name: "André Silva",
    handle: "@andresilva",
    text: "Finalmente uma solução brasileira que entende as necessidades reais do nosso setor. Recomendo para qualquer construtora séria."
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=160&h=160&fit=crop&crop=face&auto=format&q=90",
    name: "Carlos Santos",
    handle: "@carlossantos",
    text: "Com o Meta Construtor conseguimos organizar melhor nossos projetos e ter visibilidade completa do andamento das obras."
  }
];

const Login = () => {
  const { signIn, signInWithGoogle, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    try {
      await signIn(email, password);
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message || "Erro ao fazer login. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      toast({
        title: "Erro no login com Google",
        description: error.message || "Erro ao fazer login com Google. Tente novamente.",
        variant: "destructive",
      });
    }
  };
  
  const handleResetPassword = () => {
    navigate("/recuperar-senha");
  };

  const handleCreateAccount = () => {
    navigate("/criar-conta");
  };

  return (
    <>
      <SEO 
        title="Login | Meta Construtor" 
        description="Acesse sua conta no Meta Construtor e gerencie suas obras com facilidade." 
        canonical={window.location.href} 
      />
      <SignInPage
        title={<span className="font-light text-foreground tracking-tighter">Bem-vindo</span>}
        description="Acesse sua conta no Meta Construtor"
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
