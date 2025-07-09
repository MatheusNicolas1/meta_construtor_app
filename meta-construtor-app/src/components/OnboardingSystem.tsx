import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  ArrowLeft, 
  X, 
  Building2,
  Users,
  FileText,
  Settings,
  BarChart3,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  position?: 'center' | 'left' | 'right';
}

const OnboardingSystem: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Bem-vindo ao MetaConstrutor! 🎉',
      description: 'Vamos te guiar através das principais funcionalidades do sistema.',
      icon: <Building2 className="w-8 h-8 text-orange-500" />,
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Sistema de Gestão de Obras</h3>
            <p className="text-gray-600">
              O MetaConstrutor é sua ferramenta completa para gerenciar obras, equipes, 
              RDOs e muito mais. Vamos começar!
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <p className="text-sm">Gestão de Equipes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <FileText className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <p className="text-sm">RDOs Digitais</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: 'dashboard',
      title: 'Dashboard Executivo',
      description: 'Acompanhe KPIs e métricas importantes das suas obras.',
      icon: <BarChart3 className="w-8 h-8 text-blue-500" />,
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Visão Geral do Negócio</h3>
            <p className="text-gray-600">
              No dashboard você encontra informações essenciais: RDOs criados hoje, 
              obras ativas, status de equipamentos e alertas importantes.
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Principais KPIs:</h4>
            <ul className="text-sm space-y-1">
              <li>• RDOs criados no dia</li>
              <li>• Obras ativas</li>
              <li>• Equipamentos em operação</li>
              <li>• Alertas críticos</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'obras',
      title: 'Gestão de Obras',
      description: 'Organize e controle todas as suas obras em um só lugar.',
      icon: <Building2 className="w-8 h-8 text-orange-500" />,
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Controle Total das Obras</h3>
            <p className="text-gray-600">
              Cadastre obras, defina orçamentos, aloque equipes e acompanhe o progresso 
              em tempo real.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Cadastro de obras completo</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm">Controle orçamentário</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm">Alocação de equipes</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'rdos',
      title: 'RDOs Digitais',
      description: 'Crie, gerencie e aprove Relatórios Diários de Obra.',
      icon: <FileText className="w-8 h-8 text-green-500" />,
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Relatórios Profissionais</h3>
            <p className="text-gray-600">
              Crie RDOs detalhados com informações de atividades, materiais, 
              equipamentos e imagens.
            </p>
          </div>
          <div className="space-y-2">
            <Badge variant="outline" className="w-full justify-center">
              📝 Atividades Executadas
            </Badge>
            <Badge variant="outline" className="w-full justify-center">
              📦 Materiais Utilizados
            </Badge>
            <Badge variant="outline" className="w-full justify-center">
              🚜 Equipamentos
            </Badge>
            <Badge variant="outline" className="w-full justify-center">
              📸 Fotos do Progresso
            </Badge>
          </div>
        </div>
      )
    },
    {
      id: 'teams',
      title: 'Equipes e Colaboradores',
      description: 'Gerencie suas equipes e aloque recursos eficientemente.',
      icon: <Users className="w-8 h-8 text-purple-500" />,
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Gestão de Pessoas</h3>
            <p className="text-gray-600">
              Organize suas equipes, defina líderes e acompanhe a produtividade.
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Funcionalidades:</h4>
            <ul className="text-sm space-y-1">
              <li>• Cadastro de equipes</li>
              <li>• Definição de líderes</li>
              <li>• Alocação em obras</li>
              <li>• Controle de status</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'settings',
      title: 'Configurações e Perfil',
      description: 'Personalize sua experiência e configure preferências.',
      icon: <Settings className="w-8 h-8 text-gray-500" />,
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Configurações Pessoais</h3>
            <p className="text-gray-600">
              Ajuste seu perfil, preferências de tema e configurações da conta.
            </p>
          </div>
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">Dicas Importantes:</h4>
              <ul className="text-sm space-y-1">
                <li>• Use o modo escuro para maior conforto</li>
                <li>• Configure notificações</li>
                <li>• Mantenha seus dados atualizados</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 'complete',
      title: 'Tudo Pronto! 🚀',
      description: 'Você está pronto para usar o MetaConstrutor.',
      icon: <CheckCircle className="w-8 h-8 text-green-500" />,
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Parabéns! 🎉</h3>
            <p className="text-gray-600">
              Você concluiu o tour pelo MetaConstrutor. Agora é hora de colocar 
              a mão na massa!
            </p>
          </div>
          <div className="bg-gradient-to-r from-orange-50 to-blue-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Primeiros Passos:</h4>
            <ol className="text-sm space-y-1">
              <li>1. Cadastre sua primeira obra</li>
              <li>2. Crie uma equipe</li>
              <li>3. Faça seu primeiro RDO</li>
              <li>4. Explore o dashboard</li>
            </ol>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Precisa de ajuda? Acesse a seção FAQ ou entre em contato conosco.
            </p>
          </div>
        </div>
      )
    }
  ];

  useEffect(() => {
    checkOnboardingStatus();
  }, [user]);

  const checkOnboardingStatus = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_concluido')
        .eq('id', user.id)
        .single();

      if (profile && !profile.onboarding_concluido) {
        setIsOpen(true);
      }
    } catch (error) {
      console.error('Erro ao verificar onboarding:', error);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipOnboarding = async () => {
    await completeOnboarding();
  };

  const completeOnboarding = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ onboarding_concluido: true })
        .eq('id', user.id);

      if (error) {
        toast.error('Erro ao concluir onboarding');
        return;
      }

      setIsOpen(false);
      toast.success('Onboarding concluído! Bem-vindo ao MetaConstrutor! 🎉');
    } catch (error) {
      console.error('Erro ao concluir onboarding:', error);
      toast.error('Erro ao concluir onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Não permite fechar sem concluir
    return;
  };

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              {currentStepData.icon}
              <span>{currentStepData.title}</span>
            </DialogTitle>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {currentStep + 1} de {steps.length}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={skipOnboarding}
                disabled={isLoading}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={progressPercentage} className="w-full" />
            <p className="text-sm text-gray-600 mt-2">{currentStepData.description}</p>
          </div>
        </DialogHeader>

        <div className="py-6">
          {currentStepData.content}
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>
            <Button
              variant="ghost"
              onClick={skipOnboarding}
              disabled={isLoading}
            >
              Pular Tutorial
            </Button>
          </div>
          <div>
            {currentStep === steps.length - 1 ? (
              <Button
                onClick={completeOnboarding}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? 'Finalizando...' : 'Começar a Usar!'}
                <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={nextStep}>
                Próximo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingSystem; 