import React from 'react';
import { FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import SEO from '@/components/SEO';

const TermsOfService = () => {
  return (
    <>
      <SEO 
        title="Termos de Uso - Meta Construtor"
        description="Termos e condições de uso da plataforma Meta Construtor"
      />
      
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-8">
            <FileText className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Termos de Uso</h1>
          </div>

          <Card>
            <CardContent className="p-8 space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Aceitação dos Termos</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Ao acessar e usar a plataforma Meta Construtor, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deve usar nossos serviços.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Descrição do Serviço</h2>
                <p className="text-muted-foreground leading-relaxed">
                  O Meta Construtor é uma plataforma SaaS de gestão de obras que oferece ferramentas para gerenciamento de projetos, RDOs, checklists, equipes, equipamentos e relatórios para profissionais da construção civil.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. Cadastro e Conta</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p className="font-medium">3.1. Responsabilidades do Usuário:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Fornecer informações precisas e atualizadas</li>
                    <li>Manter a confidencialidade de suas credenciais</li>
                    <li>Notificar imediatamente sobre uso não autorizado</li>
                    <li>Ser responsável por todas as atividades em sua conta</li>
                  </ul>
                  
                  <p className="font-medium mt-4">3.2. Restrições:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Ter pelo menos 18 anos de idade</li>
                    <li>Uma pessoa ou empresa pode ter apenas uma conta</li>
                    <li>Não compartilhar credenciais com terceiros</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Planos e Pagamentos</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>4.1. Oferecemos diferentes planos de assinatura (Free, Profissional, Empresarial).</p>
                  <p>4.2. Os valores e condições estão descritos em nossa página de preços.</p>
                  <p>4.3. O pagamento é processado através de provedores terceiros seguros.</p>
                  <p>4.4. Renovação automática, salvo cancelamento prévio.</p>
                  <p>4.5. Reembolsos conforme nossa política de cancelamento.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Uso Aceitável</h2>
                <p className="text-muted-foreground mb-3">Você concorda em NÃO:</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Violar leis ou regulamentos aplicáveis</li>
                  <li>Infringir direitos de propriedade intelectual</li>
                  <li>Transmitir vírus ou código malicioso</li>
                  <li>Fazer engenharia reversa da plataforma</li>
                  <li>Usar para fins fraudulentos ou ilegais</li>
                  <li>Sobrecarregar nossa infraestrutura</li>
                  <li>Coletar dados de outros usuários sem consentimento</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Propriedade Intelectual</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Todo o conteúdo, design, funcionalidades e código da plataforma são propriedade da Meta Construtor e protegidos por leis de direitos autorais. Você mantém a propriedade dos dados que insere na plataforma.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Privacidade e Dados</h2>
                <p className="text-muted-foreground leading-relaxed">
                  O tratamento de seus dados pessoais é regido por nossa Política de Privacidade, que é parte integrante destes Termos.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">8. Limitação de Responsabilidade</h2>
                <p className="text-muted-foreground leading-relaxed">
                  A plataforma é fornecida "como está". Não garantimos que o serviço será ininterrupto ou livre de erros. Não nos responsabilizamos por danos indiretos, incidentais ou consequenciais resultantes do uso da plataforma.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">9. Modificações do Serviço</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Reservamos o direito de modificar, suspender ou descontinuar qualquer parte da plataforma a qualquer momento, com aviso prévio quando possível.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">10. Rescisão</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Você pode cancelar sua conta a qualquer momento. Podemos suspender ou encerrar sua conta por violação destes termos, com aviso prévio quando apropriado.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">11. Lei Aplicável</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Estes termos são regidos pelas leis da República Federativa do Brasil. Quaisquer disputas serão resolvidas nos tribunais competentes do Brasil.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">12. Contato</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Para dúvidas sobre estes Termos de Uso:
                </p>
                <div className="mt-3 text-muted-foreground">
                  <p>Email: contato@metaconstrutor.com</p>
                  <p>Telefone: (11) 99999-9999</p>
                </div>
              </section>

              <div className="text-sm text-muted-foreground pt-6 border-t">
                <p>Última atualização: Janeiro de 2024</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default TermsOfService;
