import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SEO from "@/components/SEO";

const MFA = () => {
  const [code, setCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Futuro: validar código e concluir login
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center">
      <SEO title="Verificação em duas etapas | Meta Construtor" description="Confirme seu acesso com MFA/2FA." canonical={window.location.href} />
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Verificação em duas etapas</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1" htmlFor="code">Código de 6 dígitos</label>
              <Input id="code" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full">Verificar</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
};

export default MFA;
