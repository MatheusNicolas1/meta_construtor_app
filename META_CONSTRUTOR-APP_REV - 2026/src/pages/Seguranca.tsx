import SEO from "@/components/SEO";

const Seguranca = () => {
  return (
    <>
      <SEO title="Segurança | Meta Construtor" description="Dashboard de segurança: auditoria, monitoramento e políticas." canonical={window.location.href} />
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Segurança</h1>
        <p className="text-sm mt-1">Visão geral de auditoria, monitoramento e políticas (placeholder para integração futura).</p>
      </header>
      <main className="space-y-6">
        <section>
          <h2 className="text-lg font-medium">Monitoramento</h2>
          <p className="text-sm">Gráficos e alertas de tentativas de login, bloqueios e eventos suspeitos.</p>
        </section>
        <section>
          <h2 className="text-lg font-medium">Auditoria</h2>
          <p className="text-sm">Logs de acesso, alterações de dados e integrações.</p>
        </section>
        <section>
          <h2 className="text-lg font-medium">Políticas</h2>
          <p className="text-sm">Configuração de MFA, regras de senha, RBAC/ABAC.</p>
        </section>
      </main>
    </>
  );
};

export default Seguranca;
