import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, CreditCard, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import SEO from '@/components/SEO';
import LandingNavigation from '@/components/landing/LandingNavigation';
import { secureEmailSchema, strongPasswordSchema } from '@/components/security/InputValidator';

// Schemas de validação
const cpfCnpjSchema = z.string()
  .min(11, 'CPF/CNPJ deve ter pelo menos 11 dígitos')
  .max(18, 'CPF/CNPJ deve ter no máximo 18 caracteres')
  .refine((value) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.length === 11 || cleaned.length === 14;
  }, 'CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos');

const phoneSchema = z.string()
  .min(10, 'Telefone deve ter pelo menos 10 dígitos')
  .max(15, 'Telefone deve ter no máximo 15 dígitos')
  .refine((value) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 15;
  }, 'Formato de telefone inválido');

const checkoutSchema = z.object({
  fullName: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  phone: phoneSchema,
  cpfCnpj: cpfCnpjSchema,
  email: secureEmailSchema,
  password: strongPasswordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword']
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

// Definição dos planos
const planDetails = {
  free: {
    name: 'FREE',
    price: '0',
    period: 'por 14 dias',
    description: 'Teste gratuito de 14 dias',
    features: [
      'Teste gratuito de 14 dias',
      '1 usuário',
      '1 obra',
      'RDO básico',
      'Suporte por email',
      'Sem cartão de crédito'
    ]
  },
  basic: {
    name: 'BÁSICO',
    price: '129,90',
    period: 'por mês',
    description: 'Perfeito para pequenas construtoras',
    features: [
      'Até 3 usuários',
      'Armazenamento ilimitado',
      'RDO digital completo',
      'Relatórios básicos',
      'Suporte por email',
      'Backup automático'
    ]
  },
  professional: {
    name: 'PROFISSIONAL',
    price: '199,90',
    period: 'por mês',
    description: 'Ideal para construtoras em crescimento',
    features: [
      'Até 5 usuários',
      'Obras ilimitadas',
      'Relatórios avançados',
      'Integrações WhatsApp',
      'Suporte via chat 24h',
      'Dashboard avançado',
      'Controle de estoque'
    ]
  },
  master: {
    name: 'MASTER',
    price: '499,90',
    period: 'por mês',
    description: 'Para construtoras estabelecidas',
    features: [
      'Até 15 usuários',
      'Obras ilimitadas',
      'Todas as funcionalidades do Profissional',
      'API personalizada',
      'Integração com ERP',
      'Suporte prioritário (SLA 8h)',
      'Treinamento dedicado'
    ]
  },
  business: {
    name: 'BUSINESS',
    price: 'Sob consulta',
    period: '',
    description: 'Para grandes incorporadoras e construtoras',
    features: [
      'Usuários ilimitados',
      'Integrações customizadas',
      'SLA 24/7',
      'Onboarding dedicado',
      'Gerente de conta exclusivo',
      'White label disponível',
      'Múltiplas empresas'
    ]
  }
};

// Utilitários de formatação
const formatCpfCnpj = (value: string) => {
  const cleaned = value.replace(/\D/g, '');
  
  if (cleaned.length <= 11) {
    // CPF: 000.000.000-00
    return cleaned
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2');
  } else {
    // CNPJ: 00.000.000/0000-00
    return cleaned
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})/, '$1-$2');
  }
};

const formatPhone = (value: string) => {
  const cleaned = value.replace(/\D/g, '');
  
  if (cleaned.length <= 10) {
    // Fixo: (00) 0000-0000
    return cleaned
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  } else {
    // Celular: (00) 90000-0000
    return cleaned
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  }
};

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [duplicateUser, setDuplicateUser] = useState<{ exists: boolean; by?: string } | null>(null);

  const planKey = searchParams.get('plan') || 'basic';
  const plan = planDetails[planKey as keyof typeof planDetails] || planDetails.basic;

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    trigger
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onChange'
  });

  const watchedFields = watch();

  // Formatação automática dos campos
  useEffect(() => {
    if (watchedFields.cpfCnpj) {
      const formatted = formatCpfCnpj(watchedFields.cpfCnpj);
      if (formatted !== watchedFields.cpfCnpj) {
        setValue('cpfCnpj', formatted);
      }
    }
  }, [watchedFields.cpfCnpj, setValue]);

  useEffect(() => {
    if (watchedFields.phone) {
      const formatted = formatPhone(watchedFields.phone);
      if (formatted !== watchedFields.phone) {
        setValue('phone', formatted);
      }
    }
  }, [watchedFields.phone, setValue]);

  // Redirecionar para Business se for plano Business
  useEffect(() => {
    if (planKey === 'business') {
      toast({
        title: 'Plano Business',
        description: 'Para o plano Business, entre em contato conosco para uma proposta personalizada.',
      });
      navigate('/contato');
    }
  }, [planKey, navigate, toast]);

  const checkDuplicateUser = async (data: CheckoutForm) => {
    // Simulação de checagem de duplicidade
    // Na implementação real, será uma chamada para o backend
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulação: usuário "admin@example.com" já existe
    if (data.email === 'admin@example.com') {
      return { exists: true, by: 'email' };
    }
    
    return { exists: false };
  };

  const handleFormSubmit = async (data: CheckoutForm) => {
    setIsLoading(true);
    setDuplicateUser(null);

    try {
      // Verificar duplicidade
      const duplicateCheck = await checkDuplicateUser(data);
      
      if (duplicateCheck.exists) {
        setDuplicateUser(duplicateCheck);
        setIsLoading(false);
        return;
      }

      // Simular criação de sessão de checkout
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Dados validados!',
        description: 'Redirecionando para pagamento...',
      });

      // Redirecionar para simulação de sucesso (na implementação real seria Stripe)
      setTimeout(() => {
        navigate(`/checkout/success?plan=${planKey}`);
      }, 1500);

    } catch (error) {
      toast({
        title: 'Erro no processamento',
        description: 'Ocorreu um erro. Tente novamente em alguns minutos.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const handleRecoverPassword = () => {
    navigate('/recuperar-senha');
  };

  const handleContactSupport = () => {
    navigate('/contato');
  };

  if (planKey === 'business') {
    return null; // Já redirecionou para contato
  }

  return (
    <>
      <SEO
        title={`Checkout - Plano ${plan.name} | Meta Construtor`}
        description={`Finalize sua assinatura do plano ${plan.name}. ${plan.description}`}
        canonical={window.location.href}
      />
      
      <div className="min-h-screen bg-background">
        <LandingNavigation />
        
        <main className="pt-16 pb-12">
          <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-8">
              <Button
                variant="ghost"
                onClick={() => navigate('/preco')}
                className="mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para planos
              </Button>
              
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Finalizar Assinatura
              </h1>
              <p className="text-muted-foreground">
                Preencha seus dados para continuar com o plano {plan.name}
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Formulário */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Dados Pessoais
                    </CardTitle>
                    <CardDescription>
                      Todas as informações são criptografadas e seguras
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                      {/* Nome Completo */}
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Nome Completo *</Label>
                        <Input
                          id="fullName"
                          placeholder="Seu nome completo"
                          {...register('fullName')}
                          aria-required="true"
                        />
                        {errors.fullName && (
                          <p className="text-sm text-destructive">{errors.fullName.message}</p>
                        )}
                      </div>

                      {/* Telefone */}
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone *</Label>
                        <Input
                          id="phone"
                          placeholder="(00) 00000-0000"
                          {...register('phone')}
                          aria-required="true"
                        />
                        {errors.phone && (
                          <p className="text-sm text-destructive">{errors.phone.message}</p>
                        )}
                      </div>

                      {/* CPF/CNPJ */}
                      <div className="space-y-2">
                        <Label htmlFor="cpfCnpj">CPF ou CNPJ *</Label>
                        <Input
                          id="cpfCnpj"
                          placeholder="000.000.000-00 ou 00.000.000/0000-00"
                          {...register('cpfCnpj')}
                          aria-required="true"
                        />
                        {errors.cpfCnpj && (
                          <p className="text-sm text-destructive">{errors.cpfCnpj.message}</p>
                        )}
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <Label htmlFor="email">E-mail *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="seu@email.com"
                          {...register('email')}
                          aria-required="true"
                        />
                        {errors.email && (
                          <p className="text-sm text-destructive">{errors.email.message}</p>
                        )}
                      </div>

                      {/* Senha */}
                      <div className="space-y-2">
                        <Label htmlFor="password">Senha *</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Mínimo 8 caracteres"
                          {...register('password')}
                          aria-required="true"
                        />
                        {errors.password && (
                          <p className="text-sm text-destructive">{errors.password.message}</p>
                        )}
                      </div>

                      {/* Confirmar Senha */}
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Digite a senha novamente"
                          {...register('confirmPassword')}
                          aria-required="true"
                        />
                        {errors.confirmPassword && (
                          <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                        )}
                      </div>

                      {/* Botão de submit */}
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={!isValid || isLoading}
                        size="lg"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                            Processando...
                          </>
                        ) : (
                          <>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Continuar para Pagamento
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Modal de usuário duplicado */}
                {duplicateUser?.exists && (
                  <Card className="border-amber-200 bg-amber-50">
                    <CardHeader>
                      <CardTitle className="text-amber-800">
                        Conta já existe
                      </CardTitle>
                      <CardDescription className="text-amber-700">
                        Já existe uma conta com o {duplicateUser.by === 'email' ? 'e-mail' : 
                        duplicateUser.by === 'cpf' ? 'CPF/CNPJ' : 'telefone'} informado.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button onClick={handleBackToLogin} variant="outline" className="flex-1">
                          Fazer Login
                        </Button>
                        <Button onClick={handleRecoverPassword} variant="outline" className="flex-1">
                          Recuperar Senha
                        </Button>
                        <Button onClick={handleContactSupport} variant="outline" className="flex-1">
                          Entrar em Contato
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Resumo do Plano */}
              <div className="space-y-6">
                <Card className="border-primary">
                  <CardHeader>
                    <CardTitle className="text-center">
                      Plano {plan.name}
                    </CardTitle>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">
                        {plan.price === 'Sob consulta' ? plan.price : `R$ ${plan.price}`}
                      </div>
                      {plan.period && (
                        <div className="text-muted-foreground">{plan.period}</div>
                      )}
                    </div>
                    <CardDescription className="text-center">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Garantias */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-green-600" />
                        <span className="text-sm">Dados 100% seguros e criptografados</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-blue-600" />
                        <span className="text-sm">Suporte técnico incluído</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-purple-600" />
                        <span className="text-sm">Cancele a qualquer momento</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Checkout;