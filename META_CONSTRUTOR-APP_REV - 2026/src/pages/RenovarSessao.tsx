import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import { useAuth } from "@/components/auth/AuthContext";

const RenovarSessao = () => {
  const { refreshSession } = useAuth();

  return (
    <main className="min-h-screen w-full flex items-center justify-center">
      <SEO title="Renovar sessão | Meta Construtor" description="Mantenha sua sessão ativa com segurança." canonical={window.location.href} />
      <section className="max-w-md text-center space-y-4">
        <h1 className="text-3xl font-semibold">Renovar sessão</h1>
        <p>Sua sessão expirou ou está prestes a expirar.</p>
        <Button onClick={refreshSession} className="mt-2">Renovar agora</Button>
      </section>
    </main>
  );
};

export default RenovarSessao;
