import React from 'react';
import { Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import SEO from '@/components/SEO';

const PrivacyPolicy = () => {
  return (
    <>
      <SEO 
        title="Política de Privacidade - Meta Construtor"
        description="Política de privacidade e tratamento de dados do Meta Construtor"
      />
      
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Política de Privacidade</h1>
          </div>

          <Card>
            <CardContent className="p-8 space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Introdução</h2>
                <p className="text-muted-foreground leading-relaxed">
                  A Meta Construtor está comprometida com a proteção da privacidade e dos dados pessoais de seus usuários. Esta Política de Privacidade explica como coletamos, usamos, armazenamos e protegemos suas informações pessoais em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018).
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Informações que Coletamos</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p className="font-medium">2.1. Dados Fornecidos por Você:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Nome completo, email, telefone e CPF/CNPJ</li>
                    <li>Informações de obras e projetos</li>
                    <li>Dados de equipes e colaboradores</li>
                    <li>Documentos e anexos relacionados às obras</li>
                  </ul>
                  
                  <p className="font-medium mt-4">2.2. Dados Coletados Automaticamente:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Endereço IP e informações do dispositivo</li>
                    <li>Dados de navegação e uso da plataforma</li>
                    <li>Cookies e tecnologias similares</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. Como Usamos suas Informações</h2>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Fornecer e melhorar nossos serviços</li>
                  <li>Processar suas solicitações e transações</li>
                  <li>Enviar notificações importantes sobre a plataforma</li>
                  <li>Personalizar sua experiência de uso</li>
                  <li>Prevenir fraudes e garantir segurança</li>
                  <li>Cumprir obrigações legais</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Compartilhamento de Dados</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Não vendemos suas informações pessoais. Compartilhamos dados apenas quando necessário para:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-3">
                  <li>Prestadores de serviços que nos auxiliam na operação da plataforma</li>
                  <li>Cumprimento de obrigações legais</li>
                  <li>Proteção de direitos e segurança</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Segurança dos Dados</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Implementamos medidas técnicas e organizacionais apropriadas para proteger suas informações contra acesso não autorizado, alteração, divulgação ou destruição, incluindo criptografia, controles de acesso e monitoramento contínuo.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Seus Direitos</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  De acordo com a LGPD, você tem o direito de:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Confirmar a existência de tratamento de dados</li>
                  <li>Acessar seus dados pessoais</li>
                  <li>Corrigir dados incompletos ou desatualizados</li>
                  <li>Solicitar a anonimização ou eliminação de dados</li>
                  <li>Revogar o consentimento</li>
                  <li>Portabilidade dos dados</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Retenção de Dados</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Mantemos suas informações pessoais pelo tempo necessário para cumprir as finalidades descritas nesta política, exceto quando um período de retenção mais longo for exigido por lei.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">8. Alterações nesta Política</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos sobre mudanças significativas através da plataforma ou por email.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">9. Contato</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Para exercer seus direitos ou esclarecer dúvidas sobre esta política, entre em contato com nosso Encarregado de Proteção de Dados:
                </p>
                <div className="mt-3 text-muted-foreground">
                  <p>Email: privacidade@metaconstrutor.com</p>
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

export default PrivacyPolicy;
