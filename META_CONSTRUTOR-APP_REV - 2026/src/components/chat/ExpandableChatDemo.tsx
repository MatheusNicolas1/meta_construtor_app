"use client"

import { useState, FormEvent } from "react"
import { Send, Bot, Paperclip, Mic, CornerDownLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@/components/ui/chat-bubble"
import { ChatInput } from "@/components/ui/chat-input"
import {
  ExpandableChat,
  ExpandableChatHeader,
  ExpandableChatBody,
  ExpandableChatFooter,
} from "@/components/ui/expandable-chat"
import { ChatMessageList } from "@/components/ui/chat-message-list"

export function ExpandableChatDemo() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      content: "Olá! 👋 Sou o assistente virtual do Meta Construtor. \n\nPosso ajudá-lo com:\n• 📱 Apresentação\n• ℹ️ Sobre nós\n• 💰 Preços e planos\n• 📞 Contato\n\nOu responder sobre funcionalidades, RDOs, checklists e muito mais!",
      sender: "ai",
    },
  ])

  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const getAIResponse = (userMessage: string): string => {
    const msg = userMessage.toLowerCase();
    
    // === ANÁLISE DE SEÇÕES PRINCIPAIS ===
    
    // Apresentação / Home / Visão Geral
    if (msg.includes('apresenta') || msg.includes('introdução') || msg.includes('introducao') || 
        msg.includes('visão geral') || msg.includes('visao geral') || msg.includes('o que é') || 
        msg.includes('o que e') || msg.includes('descrição geral') || msg.includes('descricao geral') ||
        msg.includes('inicio') || msg.includes('início') || msg.includes('home')) {
      return '📱 A página de **Apresentação** contém uma visão geral completa do Meta Construtor, funcionalidades e benefícios.\n\n👉 [Clique aqui para acessar a Apresentação](/)';
    }
    
    // Sobre
    if (msg.includes('sobre') || msg.includes('empresa') || msg.includes('equipe') || msg.includes('time') ||
        msg.includes('quem somos') || msg.includes('história') || msg.includes('historia') || 
        msg.includes('propósito') || msg.includes('proposito') || msg.includes('missão') || 
        msg.includes('missao') || msg.includes('valores') || msg.includes('institucional') ||
        msg.includes('quem é') || msg.includes('quem e')) {
      return 'ℹ️ A página **Sobre** contém informações institucionais, nossa missão, valores, equipe e diferenciais.\n\n👉 [Clique aqui para acessar Sobre](/sobre)';
    }
    
    // Preço
    if (msg.includes('plano') || msg.includes('preço') || msg.includes('preco') || 
        msg.includes('quanto custa') || msg.includes('valor') || msg.includes('custo') || 
        msg.includes('orçamento') || msg.includes('orcamento') || msg.includes('tabela de preços') || 
        msg.includes('assinatura') || msg.includes('mensalidade') || msg.includes('pagar') ||
        msg.includes('quanto é') || msg.includes('quanto e') || msg.includes('custa')) {
      return '💰 A página de **Preços** mostra todos os planos disponíveis:\n• FREE - 5 créditos/mês\n• BÁSICO - R$ 129,90/mês\n• PROFISSIONAL - R$ 199,90/mês\n• MASTER - R$ 499,90/mês\n• BUSINESS - Sob consulta\n\n👉 [Clique aqui para ver os Preços](/preco)';
    }
    
    // Contato / Suporte
    if (msg.includes('contato') || msg.includes('falar') || msg.includes('comunicação') || 
        msg.includes('comunicacao') || msg.includes('telefone') || msg.includes('whatsapp') || 
        msg.includes('email') || msg.includes('e-mail') || msg.includes('endereço') || 
        msg.includes('endereco') || msg.includes('localização') || msg.includes('localizacao') || 
        msg.includes('redes sociais') || msg.includes('atendimento') || msg.includes('suporte') ||
        msg.includes('ajuda')) {
      return '📞 A página de **Contato** tem todos os nossos canais de comunicação:\n• Email: contato@metaconstrutor.com\n• WhatsApp: (75) 9 9220-5734\n• Endereço e horários de atendimento\n• Redes sociais\n\n👉 [Clique aqui para acessar Contato](/contato)';
    }
    
    // === FUNCIONALIDADES ===
    
    // Funcionalidades gerais
    if (msg.includes('funcionalidade') || msg.includes('recurso') || msg.includes('faz') || msg.includes('fazer')) {
      return "O Meta Construtor oferece:\n\n📋 **RDOs digitais** - Registro completo de atividades\n✅ **Checklists inteligentes** - Templates e assinaturas digitais\n📊 **Gestão de obras** - Controle total do progresso\n👷 **Equipes e equipamentos** - Gerenciamento eficiente\n📁 **Documentos centralizados** - Tudo organizado\n📈 **Relatórios em tempo real** - Insights valiosos\n🔗 **Integrações** - WhatsApp, Gmail, Google Drive\n\nPosso explicar mais sobre algum recurso específico?";
    }
    
    // RDO
    if (msg.includes('rdo') || msg.includes('diário') || msg.includes('diario')) {
      return "Os **RDOs digitais** são completos e práticos:\n\n✅ Registro de atividades do dia\n☀️ Condições climáticas\n👷 Equipe presente e horas trabalhadas\n🚜 Equipamentos utilizados\n📸 Fotos e evidências\n📝 Observações e ocorrências\n✍️ Aprovação digital\n\nTudo sincronizado em nuvem e acessível em qualquer dispositivo!";
    }
    
    // Checklist
    if (msg.includes('checklist') || msg.includes('lista') || msg.includes('verificação') || msg.includes('verificacao')) {
      return "Nossos **checklists digitais** são completos:\n\n📋 Templates prontos (segurança, qualidade, recebimento)\n✏️ Customizáveis para suas necessidades\n✍️ Assinatura digital certificada\n📎 Anexos obrigatórios de evidências\n📊 Progresso em tempo real\n✅ Rastreamento completo\n\nAumente a qualidade e conformidade da sua obra!";
    }
    
    // Integrações
    if (msg.includes('integra') || msg.includes('whatsapp') || msg.includes('gmail') || msg.includes('drive')) {
      return "Nossas **integrações** facilitam seu trabalho:\n\n💬 **WhatsApp** - Notificações automáticas\n📧 **Gmail** - Envio de relatórios\n📁 **Google Drive** - Backup de documentos\n📅 **Google Calendar** - Eventos da obra\n🔗 **Webhooks** - Integrações personalizadas\n\nConecte suas ferramentas favoritas!";
    }
    
    // Segurança
    if (msg.includes('segur') || msg.includes('lgpd') || msg.includes('dados') || msg.includes('privacidade')) {
      return "Sua **segurança** é nossa prioridade:\n\n🔒 Criptografia de ponta a ponta\n✅ Conformidade com LGPD\n💾 Backups automáticos diários\n🔐 Autenticação de 2 fatores\n👥 Controle de permissões por usuário\n🛡️ Proteção contra ataques\n\nSeus dados estão seguros conosco!";
    }
    
    // Mobile
    if (msg.includes('mobile') || msg.includes('celular') || msg.includes('app') || msg.includes('smartphone')) {
      return "Sim! 📱 O Meta Construtor é **100% responsivo**:\n\n✅ Funciona em celular, tablet e computador\n✅ Mesma experiência em todos dispositivos\n✅ Modo offline - trabalhe sem internet\n✅ Sincronização automática\n✅ Interface otimizada para mobile\n\nAcesse de qualquer lugar, a qualquer hora!";
    }
    
    // Teste/Demo
    if (msg.includes('test') || msg.includes('demo') || msg.includes('experimentar') || msg.includes('grátis') || msg.includes('gratis') || msg.includes('trial')) {
      return "Experimente **gratuitamente**! 🎉\n\n🆓 Plano FREE disponível:\n• 5 créditos por mês\n• 1 crédito = 1 RDO\n• Sem cartão de crédito\n• Sem compromisso\n\n👉 [Comece agora mesmo](/checkout?plan=free)\n\nOu entre em [Contato](/contato) para agendar uma demonstração personalizada!";
    }
    
    // Default
    return "Olá! 👋 Posso te ajudar com:\n\n📱 **[Apresentação](/)** - Visão geral do sistema\nℹ️ **[Sobre](/sobre)** - Nossa empresa e valores\n💰 **[Preços](/preco)** - Planos a partir de R$ 129,90\n📞 **[Contato](/contato)** - Fale conosco\n\nOu perguntar sobre: funcionalidades, RDOs, checklists, integrações, segurança e mais!\n\nComo posso ajudar?";
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = input;
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        content: userMessage,
        sender: "user",
      },
    ])
    setInput("")
    setIsLoading(true)

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          content: getAIResponse(userMessage),
          sender: "ai",
        },
      ])
      setIsLoading(false)
    }, 800)
  }

  const handleAttachFile = () => {
    // Funcionalidade de anexar arquivo
  }

  const handleMicrophoneClick = () => {
    // Funcionalidade de gravação de áudio
  }

  return (
    <ExpandableChat
      size="lg"
      position="bottom-right"
      icon={<Bot className="h-6 w-6" />}
    >
      <ExpandableChatHeader className="flex-col text-center justify-center">
        <h1 className="text-xl font-semibold">Suporte Meta Construtor ✨</h1>
        <p className="text-sm text-muted-foreground">
          Estamos aqui para ajudar com suas dúvidas
        </p>
      </ExpandableChatHeader>

      <ExpandableChatBody>
        <ChatMessageList>
          {messages.map((message) => (
            <ChatBubble
              key={message.id}
              variant={message.sender === "user" ? "sent" : "received"}
            >
              <ChatBubbleAvatar
                className="h-8 w-8 shrink-0"
                src={
                  message.sender === "user"
                    ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&q=80&crop=faces&fit=crop"
                    : "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=64&h=64&q=80&crop=faces&fit=crop"
                }
                fallback={message.sender === "user" ? "US" : "MC"}
              />
              <ChatBubbleMessage
                variant={message.sender === "user" ? "sent" : "received"}
              >
                {message.content}
              </ChatBubbleMessage>
            </ChatBubble>
          ))}

          {isLoading && (
            <ChatBubble variant="received">
              <ChatBubbleAvatar
                className="h-8 w-8 shrink-0"
                src="https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=64&h=64&q=80&crop=faces&fit=crop"
                fallback="MC"
              />
              <ChatBubbleMessage isLoading />
            </ChatBubble>
          )}
        </ChatMessageList>
      </ExpandableChatBody>

      <ExpandableChatFooter>
        <form
          onSubmit={handleSubmit}
          className="relative rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring p-1"
        >
          <ChatInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="min-h-12 resize-none rounded-lg bg-background border-0 p-3 shadow-none focus-visible:ring-0"
          />
          <div className="flex items-center p-3 pt-0 justify-between">
            <div className="flex">
              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={handleAttachFile}
              >
                <Paperclip className="size-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={handleMicrophoneClick}
              >
                <Mic className="size-4" />
              </Button>
            </div>
            <Button type="submit" size="sm" className="ml-auto gap-1.5">
              Enviar
              <CornerDownLeft className="size-3.5" />
            </Button>
          </div>
        </form>
      </ExpandableChatFooter>
    </ExpandableChat>
  )
}