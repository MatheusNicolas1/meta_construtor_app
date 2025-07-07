
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle } from 'lucide-react';

export function FAQ() {
  const faqs = [
    {
      id: '1',
      question: 'Como cadastrar um novo RDO?',
      answer: 'Para cadastrar um novo RDO, acesse a seção "RDO" no menu lateral e clique em "Novo RDO". Preencha todos os campos obrigatórios como data, obra, equipe responsável, atividades realizadas e observações. Não se esqueça de anexar fotos quando necessário.'
    },
    {
      id: '2',
      question: 'Como atualizar a equipe de uma obra?',
      answer: 'Vá até a seção "Obras", encontre a obra desejada e clique em "Editar". Na tela de edição, você pode alterar o número de equipes e o responsável pela obra. Lembre-se de salvar as alterações.'
    },
    {
      id: '3',
      question: 'Como gerar um relatório PDF?',
      answer: 'Acesse a seção "Relatórios" no menu e escolha o tipo de relatório desejado (Obras, RDOs, Equipamentos, etc.). Selecione o período e os filtros necessários, depois clique em "Gerar Relatório PDF". O arquivo será baixado automaticamente.'
    },
    {
      id: '4',
      question: 'Como alterar o tema do sistema?',
      answer: 'Você pode alterar o tema de duas formas: 1) Clicando no ícone de sol/lua no cabeçalho da aplicação; 2) Indo em Configurações > Aparência e selecionando entre os temas Claro, Escuro ou Sistema (que segue a configuração do seu dispositivo).'
    },
    {
      id: '5',
      question: 'Como enviar uma foto de perfil?',
      answer: 'Vá em Configurações > Perfil, clique em "Alterar foto" próximo ao seu avatar. Selecione uma imagem JPG ou PNG de até 2MB. A foto será redimensionada automaticamente e salva no seu perfil.'
    },
    {
      id: '6',
      question: 'Como cadastrar novos equipamentos?',
      answer: 'Acesse "Equipamentos" no menu lateral e clique em "Novo Equipamento". Preencha as informações como nome, tipo, número de série, data de aquisição e status. Você também pode definir cronogramas de manutenção preventiva.'
    },
    {
      id: '7',
      question: 'O que fazer quando o sistema está offline?',
      answer: 'O MetaConstrutor funciona offline para operações básicas. Você pode visualizar dados já carregados e preencher RDOs que serão sincronizados quando a conexão for restabelecida. Um indicador aparece no cabeçalho quando você está offline.'
    },
    {
      id: '8',
      question: 'Como configurar notificações?',
      answer: 'Vá em Configurações > Notificações para personalizar quais alertas deseja receber (e-mail, push, SMS). Você pode ativar notificações para atrasos de obra, RDOs pendentes, manutenção de equipamentos e mais.'
    },
    {
      id: '9',
      question: 'Como exportar meus dados?',
      answer: 'Em Configurações > Privacidade, clique em "Exportar meus dados". Será gerado um arquivo com todas as suas informações armazenadas no sistema, incluindo obras, RDOs, equipamentos e configurações.'
    },
    {
      id: '10',
      question: 'Como adicionar uma nova obra?',
      answer: 'Na seção "Obras", clique em "Nova Obra". Preencha nome, endereço, orçamento, responsável, datas de início e previsão, número de equipes e atividades previstas. Todos os campos marcados são obrigatórios.'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5" />
          FAQ - Dúvidas Frequentes
        </CardTitle>
        <CardDescription>
          Encontre respostas para as principais dúvidas sobre o MetaConstrutor
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id}>
              <AccordionTrigger className="text-left hover:text-[#ff5722]">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
