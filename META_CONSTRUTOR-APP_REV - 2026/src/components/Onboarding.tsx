import { useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OnboardingProps {
  forceShow?: boolean;
  onComplete?: () => void;
}

const tourSteps: Step[] = [
  {
    target: '[data-tour="dashboard"]',
    content: 'Bem-vindo ao Meta Construtor! Este é o seu Dashboard onde você visualiza estatísticas e atividades recentes.',
    disableBeacon: true,
    placement: 'center',
  },
  {
    target: '[data-tour="obras"]',
    content: 'Aqui você gerencia todas as suas Obras. Crie, visualize e acompanhe o progresso de cada projeto.',
    placement: 'right',
  },
  {
    target: '[data-tour="rdo"]',
    content: 'O RDO (Relatório Diário de Obras) permite registrar todas as atividades, equipes e equipamentos utilizados.',
    placement: 'right',
  },
  {
    target: '[data-tour="checklist"]',
    content: 'Crie e gerencie Checklists para garantir que todas as etapas e verificações sejam concluídas.',
    placement: 'right',
  },
  {
    target: '[data-tour="equipamentos"]',
    content: 'Gerencie todos os Equipamentos disponíveis, seu status e manutenções.',
    placement: 'right',
  },
  {
    target: '[data-tour="documentos"]',
    content: 'Armazene e organize todos os Documentos importantes das suas obras em um só lugar.',
    placement: 'right',
  },
  {
    target: '[data-tour="relatorios"]',
    content: 'Gere Relatórios completos e profissionais das suas obras e RDOs.',
    placement: 'right',
  },
  {
    target: 'body',
    content: '💰 O sistema de créditos permite criar RDOs de forma controlada. No plano Free, você tem 7 créditos mensais que se renovam no dia 1º de cada mês!',
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '[data-tour="perfil"]',
    content: 'Acesse seu Perfil para configurar suas informações e preferências. Você pode reabrir este tour a qualquer momento!',
    placement: 'bottom',
    spotlightClicks: true,
  },
];

export const Onboarding = ({ forceShow = false, onComplete }: OnboardingProps) => {
  const [runTour, setRunTour] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (forceShow) {
        setRunTour(true);
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('has_seen_onboarding')
          .eq('id', user.id)
          .single();

        if (profile && !profile.has_seen_onboarding) {
          // Pequeno delay para garantir que a página está totalmente renderizada
          setTimeout(() => setRunTour(true), 1000);
        }
      } catch (error) {
        console.error('Erro ao verificar onboarding:', error);
      }
    };

    checkOnboarding();
  }, [forceShow]);

  const handleJoyrideCallback = async (data: CallBackProps) => {
    const { status, index, type, action } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRunTour(false);

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && !forceShow) {
          await supabase
            .from('profiles')
            .update({ has_seen_onboarding: true })
            .eq('id', user.id);
        }

        if (status === STATUS.FINISHED) {
          toast.success('🎉 Tour concluído! Você já pode começar a usar o Meta Construtor.');
        }

        onComplete?.();
      } catch (error) {
        console.error('Erro ao atualizar onboarding:', error);
      }
    }

    // Atualizar índice da etapa em qualquer transição
    if (type === 'step:after' && action === 'next') {
      setStepIndex(index + 1);
    } else if (type === 'step:after' && action === 'prev') {
      setStepIndex(index - 1);
    }
  };

  return (
    <Joyride
      steps={tourSteps}
      run={runTour}
      stepIndex={stepIndex}
      continuous
      showProgress
      showSkipButton
      disableOverlayClose
      disableCloseOnEsc
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#EA580C',
          textColor: 'hsl(var(--foreground))',
          backgroundColor: 'hsl(var(--background))',
          arrowColor: 'hsl(var(--background))',
          overlayColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 10000,
        },
        spotlight: {
          borderRadius: '8px',
        },
        tooltip: {
          borderRadius: '12px',
          padding: '20px',
        },
        buttonNext: {
          backgroundColor: '#EA580C',
          borderRadius: '8px',
          padding: '8px 16px',
        },
        buttonBack: {
          color: 'hsl(var(--muted-foreground))',
          marginRight: '10px',
        },
        buttonSkip: {
          color: 'hsl(var(--muted-foreground))',
        },
      }}
      locale={{
        back: 'Voltar',
        close: 'Fechar',
        last: 'Finalizar',
        next: 'Próximo',
        skip: 'Pular tour',
      }}
    />
  );
};
