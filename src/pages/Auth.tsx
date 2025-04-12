import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [wantsTrial, setWantsTrial] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const navigate = useNavigate();
  const location = useLocation();
  
  const queryParams = new URLSearchParams(location.search);
  const leadSource = queryParams.get('leadSource');
  const leadId = queryParams.get('leadId');
  
  if (leadSource && leadId) {
    localStorage.setItem('leadSource', leadSource);
    localStorage.setItem('leadId', leadId);
  }

  const validateForm = () => {
    let isValid = true;
    const newErrors: {[key: string]: string} = {};
    
    if (!email) {
      newErrors.email = "E-mail é obrigatório";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "E-mail inválido";
      isValid = false;
    }
    
    if (!password) {
      newErrors.password = "Senha é obrigatória";
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = "A senha deve ter pelo menos 6 caracteres";
      isValid = false;
    }
    
    if (isSignUp) {
      if (!name) {
        newErrors.name = "Nome é obrigatório";
        isValid = false;
      }
      
      if (!company) {
        newErrors.company = "Empresa é obrigatória";
        isValid = false;
      }
      
      if (!phone) {
        newErrors.phone = "Telefone é obrigatório";
        isValid = false;
      } else if (!/^\(\d{2}\) \d{5}-\d{4}$/.test(phone)) {
        newErrors.phone = "Formato: (00) 00000-0000";
        isValid = false;
      }
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    
    if (digits.length <= 2) {
      return digits.length ? `(${digits}` : '';
    } else if (digits.length <= 7) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    } else {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPhone = formatPhone(e.target.value);
    setPhone(formattedPhone);
    if (errors.phone) {
      setErrors({...errors, phone: ""});
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);

    try {
      if (isSignUp) {
        navigate(`/signup`);
        return;
      } else {
        const { error: signinError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signinError) throw signinError;
      }

      toast.success("Conta criada com sucesso! Verifique seu e-mail para confirmar seu cadastro.");
    } catch (error: any) {
      console.error("Auth error:", error);
      toast.error(error.message || "Erro durante autenticação. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const clearErrors = (field: string) => {
    if (errors[field]) {
      setErrors({...errors, [field]: ""});
    }
  };

  const handleCreateAccountClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (leadSource) params.append('leadSource', leadSource);
    if (leadId) params.append('leadId', leadId);
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    navigate(`/signup${queryString}`);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="flex-1 bg-[#022241] flex items-center justify-center p-8 text-white">
        <div className="max-w-md space-y-6">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-bold">
              <span className="text-white">Meta</span>
              <span className="text-meta-orange">Construtor</span>
            </h1>
            <p className="text-xl mt-2">Sua obra sob controle total</p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="mt-1 bg-meta-orange rounded-full p-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Gestão completa de obras</h3>
                <p className="text-gray-300 text-sm">Controle todas as etapas do seu projeto de construção.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="mt-1 bg-meta-orange rounded-full p-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Relatórios detalhados</h3>
                <p className="text-gray-300 text-sm">Acompanhe o progresso e analise dados importantes da sua obra.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="mt-1 bg-meta-orange rounded-full p-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Equipes conectadas</h3>
                <p className="text-gray-300 text-sm">Integração entre escritório e campo para maior produtividade.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold">{isSignUp ? 'Criar uma conta' : 'Entrar na sua conta'}</h2>
            <p className="text-gray-500 mt-2">
              {isSignUp 
                ? 'Preencha as informações abaixo para começar'
                : 'Entre com suas credenciais para acessar o sistema'
              }
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              {isSignUp && (
                <>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">
                      Nome completo
                    </label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        clearErrors("name");
                      }}
                      placeholder="Seu nome"
                      required={isSignUp}
                      className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium mb-1">
                      Empresa
                    </label>
                    <Input
                      id="company"
                      type="text"
                      value={company}
                      onChange={(e) => {
                        setCompany(e.target.value);
                        clearErrors("company");
                      }}
                      placeholder="Nome da sua empresa"
                      required={isSignUp}
                      className={errors.company ? "border-red-500" : ""}
                    />
                    {errors.company && (
                      <p className="text-red-500 text-xs mt-1">{errors.company}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-1">
                      Telefone
                    </label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={handlePhoneChange}
                      placeholder="(00) 00000-0000"
                      required={isSignUp}
                      className={errors.phone ? "border-red-500" : ""}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                    )}
                  </div>
                </>
              )}
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  E-mail
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearErrors("email");
                  }}
                  placeholder="Seu e-mail"
                  required
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">
                  Senha
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearErrors("password");
                    }}
                    placeholder="Sua senha"
                    required
                    className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                  />
                  <button 
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>
              
              {isSignUp && (
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="trial" 
                    checked={wantsTrial} 
                    onCheckedChange={(checked) => setWantsTrial(checked as boolean)} 
                  />
                  <label
                    htmlFor="trial"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Teste grátis por 03 dias
                  </label>
                </div>
              )}
            </div>
            
            <Button type="submit" className="w-full bg-meta-blue hover:bg-meta-blue/90" disabled={isLoading}>
              {isLoading ? 'Processando...' : isSignUp ? 'Continuar' : 'Entrar'}
            </Button>
          </form>
          
          <div className="text-center text-sm">
            {isSignUp ? (
              <p>
                Já tem uma conta?{' '}
                <button 
                  type="button" 
                  onClick={() => {
                    setIsSignUp(false);
                    setErrors({});
                  }}
                  className="text-meta-blue hover:underline"
                >
                  Entrar
                </button>
              </p>
            ) : (
              <p>
                Não tem uma conta?{' '}
                <button 
                  type="button" 
                  onClick={handleCreateAccountClick}
                  className="text-meta-blue hover:underline"
                >
                  Criar conta
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
