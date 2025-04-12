import { useLocale } from "@/contexts/LocaleContext";
import { useTranslation } from "@/locales/translations";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, MessageSquare, Send } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import SupabaseConnectionTest from "@/components/SupabaseConnectionTest";

const Support = () => {
  const { locale } = useLocale();
  const t = useTranslation(locale);

  const handleContactSupport = () => {
    // Mock a WhatsApp link - in real app, this would be the actual WhatsApp support number
    window.open('https://wa.me/5511999999999?text=Olá,%20preciso%20de%20ajuda%20com%20o%20Meta%20Construtor!', '_blank');
  };

  const faqTopics = [
    {
      id: "workManagement",
      title: t.supportPage.topics.workManagement,
      questions: [
        {
          id: "how-to-register-work",
          question: t.supportPage.faq.howToRegisterWork.question,
          answer: t.supportPage.faq.howToRegisterWork.answer
        },
        {
          id: "how-to-add-photos",
          question: t.supportPage.faq.howToAddPhotos.question,
          answer: t.supportPage.faq.howToAddPhotos.answer
        },
        {
          id: "can-register-accidents",
          question: t.supportPage.faq.canRegisterAccidents.question,
          answer: t.supportPage.faq.canRegisterAccidents.answer
        }
      ]
    },
    {
      id: "rdos",
      title: t.supportPage.topics.rdos,
      questions: [
        {
          id: "what-is-rdo",
          question: t.supportPage.faq.whatIsRDO.question,
          answer: t.supportPage.faq.whatIsRDO.answer
        },
        {
          id: "share-rdo",
          question: t.supportPage.faq.shareRDO.question,
          answer: t.supportPage.faq.shareRDO.answer
        },
        {
          id: "edit-rdo",
          question: t.supportPage.faq.editRDO.question,
          answer: t.supportPage.faq.editRDO.answer
        }
      ]
    },
    {
      id: "plansAndPayment",
      title: t.supportPage.topics.plansAndPayment,
      questions: [
        {
          id: "change-plan",
          question: t.supportPage.faq.changePlan.question,
          answer: t.supportPage.faq.changePlan.answer
        },
        {
          id: "payment-methods",
          question: t.supportPage.faq.paymentMethods.question,
          answer: t.supportPage.faq.paymentMethods.answer
        },
        {
          id: "cancel-plan",
          question: t.supportPage.faq.cancelPlan.question,
          answer: t.supportPage.faq.cancelPlan.answer
        }
      ]
    },
    {
      id: "technicalFeatures",
      title: t.supportPage.topics.technicalFeatures,
      questions: [
        {
          id: "offline-mode",
          question: t.supportPage.faq.offlineMode.question,
          answer: t.supportPage.faq.offlineMode.answer
        },
        {
          id: "ai-integration",
          question: t.supportPage.faq.aiIntegration.question,
          answer: t.supportPage.faq.aiIntegration.answer
        },
        {
          id: "multiple-devices",
          question: t.supportPage.faq.multipleDevices.question,
          answer: t.supportPage.faq.multipleDevices.answer
        },
        {
          id: "change-language",
          question: t.supportPage.faq.changeLanguage.question,
          answer: t.supportPage.faq.changeLanguage.answer
        }
      ]
    },
    {
      id: "supportAndGeneral",
      title: t.supportPage.topics.supportAndGeneral,
      questions: [
        {
          id: "contact-support",
          question: t.supportPage.faq.contactSupport.question,
          answer: t.supportPage.faq.contactSupport.answer
        },
        {
          id: "forgot-password",
          question: t.supportPage.faq.forgotPassword.question,
          answer: t.supportPage.faq.forgotPassword.answer
        }
      ]
    }
  ];

  return (
    <div className="space-y-12 py-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <HelpCircle className="h-8 w-8 text-meta-orange" />
          {t.supportPage.title}
        </h1>
        <p className="text-meta-gray-dark dark:text-meta-gray mt-2">
          {locale === 'pt-BR' ? 'Encontre respostas para suas dúvidas mais frequentes' : 
           locale === 'en-US' ? 'Find answers to your most frequent questions' : 
           locale === 'es-ES' ? 'Encuentra respuestas a tus preguntas más frecuentes' :
           locale === 'fr-FR' ? 'Trouvez des réponses à vos questions les plus fréquentes' :
           'Finden Sie Antworten auf Ihre häufigsten Fragen'}
        </p>
      </div>

      {/* Landing page style FAQ sections */}
      {faqTopics.map((topic) => (
        <section key={topic.id} id={topic.id} className="scroll-mt-16">
          <Card className="shadow-sm border-l-4 border-l-meta-blue">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-6 text-meta-blue dark:text-meta-orange">{topic.title}</h2>
              
              <div className="space-y-8">
                {topic.questions.map((faq) => (
                  <div key={faq.id} className="space-y-2">
                    <h3 className="font-medium text-lg">{faq.question}</h3>
                    <p className="text-meta-gray-dark dark:text-meta-gray">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Add some space between sections */}
          <div className="h-8" />
        </section>
      ))}

      {/* Jump links */}
      <div className="lg:sticky lg:top-4 bg-white/80 dark:bg-black/80 backdrop-blur-sm p-4 rounded-lg shadow-sm">
        <h3 className="font-medium mb-3">{t.supportPage.jumpToTopic}</h3>
        <div className="flex flex-wrap gap-2">
          {faqTopics.map((topic) => (
            <Button
              key={topic.id}
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => {
                document.getElementById(topic.id)?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {topic.title}
            </Button>
          ))}
        </div>
      </div>

      <Separator className="my-8" />

      {/* Contact support section */}
      <div className="flex flex-col items-center justify-center py-8">
        <h3 className="text-xl font-medium mb-4">
          {locale === 'pt-BR' ? 'Não encontrou o que procurava?' : 
           locale === 'en-US' ? 'Didn\'t find what you were looking for?' : 
           locale === 'es-ES' ? '¿No encontraste lo que buscabas?' :
           locale === 'fr-FR' ? 'Vous n\'avez pas trouvé ce que vous cherchiez?' :
           'Haben Sie nicht gefunden, wonach Sie gesucht haben?'}
        </h3>
        <Button 
          onClick={handleContactSupport}
          className="bg-meta-orange hover:bg-meta-orange/90 px-8"
          size="lg"
        >
          <MessageSquare className="mr-2 h-5 w-5" />
          {t.supportPage.contactSupport}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex gap-3 items-center mb-4">
              <HelpCircle className="h-6 w-6 text-meta-blue" />
              <h3 className="text-xl font-medium">{t('support.faq.title')}</h3>
            </div>
            
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index}>
                  <h4 className="font-medium mb-1">{t(`support.faq.questions.${faq}.question`)}</h4>
                  <p className="text-muted-foreground text-sm">{t(`support.faq.questions.${faq}.answer`)}</p>
                  {index < faqs.length - 1 && <Separator className="my-4" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex gap-3 items-center mb-4">
              <MessageSquare className="h-6 w-6 text-meta-orange" />
              <h3 className="text-xl font-medium">{t('support.contact.title')}</h3>
            </div>
            
            <p className="text-muted-foreground mb-4">{t('support.contact.description')}</p>
            
            <div className="space-y-4">
              <div>
                <p className="font-medium mb-1">{t('support.contact.email')}:</p>
                <p className="text-muted-foreground text-sm">suporte@metaconstrutor.com.br</p>
              </div>
              
              <div>
                <p className="font-medium mb-1">{t('support.contact.phone')}:</p>
                <p className="text-muted-foreground text-sm">+55 (11) 9999-9999</p>
              </div>
              
              <div>
                <p className="font-medium mb-1">{t('support.contact.whatsapp')}:</p>
                <p className="text-muted-foreground text-sm">+55 (11) 9999-9999</p>
              </div>
              
              <div>
                <p className="font-medium mb-1">{t('support.contact.hours')}:</p>
                <p className="text-muted-foreground text-sm">{t('support.contact.businessHours')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teste de conexão com o Supabase */}
      <div className="mt-8">
        <h3 className="text-xl font-medium mb-4">{t('support.connection.title', 'Teste de Conexão')}</h3>
        <SupabaseConnectionTest />
      </div>
    </div>
  );
};

export default Support;
