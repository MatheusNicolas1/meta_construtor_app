import React from 'react';
import { Cookie } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import SEO from '@/components/SEO';

const CookiePolicy = () => {
  return (
    <>
      <SEO 
        title="Política de Cookies - Meta Construtor"
        description="Política de uso de cookies da plataforma Meta Construtor"
      />
      
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-8">
            <Cookie className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Política de Cookies</h1>
          </div>

          <Card>
            <CardContent className="p-8 space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. O que são Cookies?</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Cookies são pequenos arquivos de texto armazenados no seu dispositivo (computador, tablet ou celular) quando você visita um site. Eles ajudam o site a lembrar informações sobre sua visita, tornando sua próxima visita mais fácil e o site mais útil para você.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Como Usamos Cookies</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Utilizamos cookies para diversos propósitos:
                </p>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">2.1. Cookies Essenciais (Necessários)</h3>
                    <p className="text-muted-foreground">
                      Fundamentais para o funcionamento básico da plataforma. Permitem navegação e uso de recursos essenciais, como áreas seguras e autenticação.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">2.2. Cookies de Desempenho</h3>
                    <p className="text-muted-foreground">
                      Coletam informações sobre como você usa o site, páginas visitadas e links clicados. Usados para melhorar o funcionamento da plataforma.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">2.3. Cookies Funcionais</h3>
                    <p className="text-muted-foreground">
                      Permitem que o site lembre suas escolhas (como idioma, tema escuro/claro) e forneça recursos aprimorados e personalizados.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">2.4. Cookies de Análise</h3>
                    <p className="text-muted-foreground">
                      Ajudam a entender como os visitantes interagem com a plataforma, fornecendo informações sobre áreas visitadas, tempo gasto e problemas encontrados.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. Tipos de Cookies que Utilizamos</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left py-3 px-4">Cookie</th>
                        <th className="text-left py-3 px-4">Tipo</th>
                        <th className="text-left py-3 px-4">Duração</th>
                        <th className="text-left py-3 px-4">Propósito</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b">
                        <td className="py-3 px-4 font-mono">session_id</td>
                        <td className="py-3 px-4">Essencial</td>
                        <td className="py-3 px-4">Sessão</td>
                        <td className="py-3 px-4">Mantém sua sessão ativa</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4 font-mono">auth_token</td>
                        <td className="py-3 px-4">Essencial</td>
                        <td className="py-3 px-4">30 dias</td>
                        <td className="py-3 px-4">Autenticação do usuário</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4 font-mono">theme_preference</td>
                        <td className="py-3 px-4">Funcional</td>
                        <td className="py-3 px-4">1 ano</td>
                        <td className="py-3 px-4">Lembra tema claro/escuro</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4 font-mono">_ga</td>
                        <td className="py-3 px-4">Análise</td>
                        <td className="py-3 px-4">2 anos</td>
                        <td className="py-3 px-4">Google Analytics - visitantes únicos</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Cookies de Terceiros</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  Utilizamos serviços de terceiros que também podem definir cookies:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li><strong>Google Analytics:</strong> Para análise de tráfego e comportamento dos usuários</li>
                  <li><strong>Supabase:</strong> Para autenticação e armazenamento de dados</li>
                  <li><strong>Serviços de CDN:</strong> Para melhor desempenho de carregamento</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Gerenciamento de Cookies</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  Você pode controlar e gerenciar cookies de várias formas:
                </p>
                <div className="space-y-3 text-muted-foreground">
                  <p><strong>Configurações do Navegador:</strong> A maioria dos navegadores permite que você recuse ou aceite cookies. Consulte as configurações do seu navegador.</p>
                  <p><strong>Exclusão de Cookies:</strong> Você pode excluir todos os cookies já armazenados no seu dispositivo através das configurações do navegador.</p>
                  <p className="text-amber-600 dark:text-amber-400">
                    ⚠️ Atenção: Desativar cookies pode afetar a funcionalidade da plataforma e sua experiência de uso.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Atualizações desta Política</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Podemos atualizar esta Política de Cookies periodicamente. Recomendamos que você revise esta página regularmente para se manter informado sobre como usamos cookies.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Mais Informações</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Para mais informações sobre como tratamos seus dados pessoais, consulte nossa Política de Privacidade. Para dúvidas sobre cookies:
                </p>
                <div className="mt-3 text-muted-foreground">
                  <p>Email: privacidade@metaconstrutor.com</p>
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

export default CookiePolicy;
