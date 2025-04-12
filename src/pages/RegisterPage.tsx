
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plan } from "@/types/plans";
import { Eye, EyeOff } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocale } from "@/contexts/LocaleContext";

const plans: Plan[] = [
  {
    id: "basico",
    name: "Plano Básico",
    price: 97,
    description: "Ideal para pequenas obras",
    features: []
  },
  {
    id: "avancado",
    name: "Plano Avançado",
    price: 197,
    description: "Perfeito para equipes médias",
    features: []
  },
  {
    id: "premium",
    name: "Plano Premium",
    price: 597,
    description: "Para grandes projetos",
    features: []
  }
];

const RegisterPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { locale } = useLocale();
  
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("+55");
  const [companyName, setCompanyName] = useState("");
  const [documentType, setDocumentType] = useState("cnpj");
  const [documentNumber, setDocumentNumber] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [leadSource, setLeadSource] = useState<string | null>(null);
  const [leadId, setLeadId] = useState<string | null>(null);
  
  useEffect(() => {
    // Extract parameters from URL
    const queryParams = new URLSearchParams(location.search);
    const planId = queryParams.get('plan');
    const source = queryParams.get('leadSource');
    const id = queryParams.get('leadId');
    
    // Set lead tracking data
    if (source) setLeadSource(source);
    if (id) setLeadId(id);
    
    // Find selected plan
    if (planId) {
      const plan = plans.find(p => p.id === planId);
      if (plan) {
        setSelectedPlan(plan);
      } else {
        navigate('/signup');
      }
    } else {
      navigate('/signup');
    }

    // Set default document type based on locale
    if (locale === 'pt-BR') {
      setDocumentType('cnpj');
    } else {
      setDocumentType('other');
    }
  }, [location, navigate, locale]);

  const validateForm = () => {
    let isValid = true;
    const newErrors: {[key: string]: string} = {};
    
    // Validate full name
    if (!fullName.trim()) {
      newErrors.fullName = "Nome completo é obrigatório";
      isValid = false;
    }
    
    // Validate email
    if (!email) {
      newErrors.email = "E-mail é obrigatório";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "E-mail inválido";
      isValid = false;
    }
    
    // Validate password
    if (!password) {
      newErrors.password = "Senha é obrigatória";
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = "A senha deve ter pelo menos 6 caracteres";
      isValid = false;
    }
    
    // Validate confirm password
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem";
      isValid = false;
    }
    
    // Validate WhatsApp number
    if (!whatsappNumber || whatsappNumber.length <= 3) {
      newErrors.whatsappNumber = "Número de WhatsApp é obrigatório";
      isValid = false;
    } else if (!/^\+\d{1,3}\d{9,}$/.test(whatsappNumber)) {
      newErrors.whatsappNumber = "Formato inválido (ex: +5511999999999)";
      isValid = false;
    }
    
    // Validate company name
    if (!companyName.trim()) {
      newErrors.companyName = "Nome da empresa é obrigatório";
      isValid = false;
    }
    
    // Validate document number
    if (!documentNumber) {
      newErrors.documentNumber = "Número do documento é obrigatório";
      isValid = false;
    } else {
      // Validate CPF
      if (documentType === 'cpf' && documentNumber.replace(/\D/g, '').length !== 11) {
        newErrors.documentNumber = "CPF inválido";
        isValid = false;
      } 
      // Validate CNPJ
      else if (documentType === 'cnpj' && documentNumber.replace(/\D/g, '').length !== 14) {
        newErrors.documentNumber = "CNPJ inválido";
        isValid = false;
      }
      // Validate other document 
      else if (documentType === 'other' && documentNumber.length < 5) {
        newErrors.documentNumber = "Documento deve ter pelo menos 5 caracteres";
        isValid = false;
      }
    }
    
    // Validate billing address
    if (!billingAddress.trim()) {
      newErrors.billingAddress = "Endereço de cobrança é obrigatório";
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const formatCNPJ = (value: string) => {
    // Remove non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Format to XX.XXX.XXX/XXXX-XX
    if (digits.length <= 2) {
      return digits;
    } else if (digits.length <= 5) {
      return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    } else if (digits.length <= 8) {
      return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
    } else if (digits.length <= 12) {
      return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
    } else {
      return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
    }
  };
  
  const formatCPF = (value: string) => {
    // Remove non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Format to XXX.XXX.XXX-XX
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    } else if (digits.length <= 9) {
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    } else {
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    if (documentType === 'cpf') {
      setDocumentNumber(formatCPF(value));
    } else if (documentType === 'cnpj') {
      setDocumentNumber(formatCNPJ(value));
    } else {
      // For other document types, just use the value as is
      setDocumentNumber(value);
    }
  };
  
  const handleDocumentTypeChange = (value: string) => {
    setDocumentType(value);
    setDocumentNumber(''); // Clear the document number when changing type
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Ensure it always starts with "+"
    let value = e.target.value;
    if (!value.startsWith('+')) {
      value = '+' + value;
    }
    
    // Keep only digits and +
    value = value.replace(/[^\d+]/g, '');
    
    setWhatsappNumber(value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Save user data in localStorage for mock registration
      const userData = {
        fullName,
        email,
        whatsappNumber,
        companyName,
        documentType,
        documentNumber,
        billingAddress,
        selectedPlan: selectedPlan?.id,
        leadSource,
        leadId,
        registrationDate: new Date().toISOString(),
      };
      
      localStorage.setItem('userRegistrationData', JSON.stringify(userData));
      
      // Mock API call delay
      setTimeout(() => {
        toast.success("Cadastro iniciado com sucesso!");
        
        // Redirect to email confirmation page with parameters
        const params = new URLSearchParams();
        params.append('email', email);
        if (selectedPlan) params.append('plan', selectedPlan.id);
        if (leadSource) params.append('leadSource', leadSource);
        if (leadId) params.append('leadId', leadId);
        
        navigate(`/signup/confirm-email?${params.toString()}`);
        
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Erro ao processar cadastro. Tente novamente.");
      setIsLoading(false);
    }
  };

  // Helper function to get language-specific labels
  const getDocumentLabels = () => {
    if (locale === 'pt-BR') {
      return {
        typeLabel: "Tipo de Documento",
        numberLabel: "Número do Documento",
        cpf: "CPF",
        cnpj: "CNPJ",
        other: "Outro Documento"
      };
    } else if (locale === 'es-ES') {
      return {
        typeLabel: "Tipo de Documento",
        numberLabel: "Número de Documento",
        cpf: "CPF (Brasil)",
        cnpj: "CNPJ (Brasil)",
        other: "Otro Documento"
      };
    } else {
      return {
        typeLabel: "Document Type",
        numberLabel: "Document Number",
        cpf: "CPF (Brazil)",
        cnpj: "CNPJ (Brazil)",
        other: "Other Document"
      };
    }
  };

  const documentLabels = getDocumentLabels();

  if (!selectedPlan) {
    return <div className="min-h-screen bg-[#022241] flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-meta-orange border-t-meta-blue rounded-full animate-spin"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-[#022241] text-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Crie sua conta</h1>
          <p className="text-gray-300">Preencha as informações abaixo para começar</p>
        </div>
        
        <Card className="bg-[#1A2A44]/80 border-none shadow-lg text-white">
          <CardHeader>
            <CardTitle>Plano Escolhido</CardTitle>
            <CardDescription className="text-gray-300">
              <span className="font-semibold text-meta-orange">{selectedPlan.name} - R$ {selectedPlan.price}/mês</span>
              <p className="mt-1">{selectedPlan.description}</p>
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName" className="text-white">Nome completo</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={`bg-[#0a1628] border-gray-700 text-white ${errors.fullName ? "border-red-500" : ""}`}
                    placeholder="Ex: João Silva"
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="email" className="text-white">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`bg-[#0a1628] border-gray-700 text-white ${errors.email ? "border-red-500" : ""}`}
                    placeholder="Ex: joao.silva@email.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="password" className="text-white">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`bg-[#0a1628] border-gray-700 text-white pr-10 ${errors.password ? "border-red-500" : ""}`}
                      placeholder="Sua senha"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="confirmPassword" className="text-white">Confirme a senha</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`bg-[#0a1628] border-gray-700 text-white pr-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                      placeholder="Confirme sua senha"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="whatsappNumber" className="text-white">Número de WhatsApp</Label>
                  <Input
                    id="whatsappNumber"
                    value={whatsappNumber}
                    onChange={handlePhoneChange}
                    className={`bg-[#0a1628] border-gray-700 text-white ${errors.whatsappNumber ? "border-red-500" : ""}`}
                    placeholder="Ex: +5511999999999"
                  />
                  {errors.whatsappNumber && (
                    <p className="text-red-500 text-xs mt-1">{errors.whatsappNumber}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="companyName" className="text-white">Nome da empresa</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className={`bg-[#0a1628] border-gray-700 text-white ${errors.companyName ? "border-red-500" : ""}`}
                    placeholder="Ex: Construtora Silva"
                  />
                  {errors.companyName && (
                    <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="documentType" className="text-white">{documentLabels.typeLabel}</Label>
                    <Select
                      value={documentType}
                      onValueChange={handleDocumentTypeChange}
                    >
                      <SelectTrigger className="bg-[#0a1628] border-gray-700 text-white">
                        <SelectValue placeholder={documentLabels.typeLabel} />
                      </SelectTrigger>
                      <SelectContent>
                        {locale === 'pt-BR' && (
                          <>
                            <SelectItem value="cpf">{documentLabels.cpf}</SelectItem>
                            <SelectItem value="cnpj">{documentLabels.cnpj}</SelectItem>
                          </>
                        )}
                        <SelectItem value="other">{documentLabels.other}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label htmlFor="documentNumber" className="text-white">{documentLabels.numberLabel}</Label>
                    <Input
                      id="documentNumber"
                      value={documentNumber}
                      onChange={handleDocumentChange}
                      className={`bg-[#0a1628] border-gray-700 text-white ${errors.documentNumber ? "border-red-500" : ""}`}
                      placeholder={
                        documentType === 'cpf' 
                          ? "123.456.789-00" 
                          : documentType === 'cnpj' 
                            ? "12.345.678/0001-99" 
                            : "12345678"
                      }
                    />
                    {errors.documentNumber && (
                      <p className="text-red-500 text-xs mt-1">{errors.documentNumber}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="billingAddress" className="text-white">Endereço de cobrança</Label>
                  <Input
                    id="billingAddress"
                    value={billingAddress}
                    onChange={(e) => setBillingAddress(e.target.value)}
                    className={`bg-[#0a1628] border-gray-700 text-white ${errors.billingAddress ? "border-red-500" : ""}`}
                    placeholder="Ex: Rua das Flores, 123, Santos, SP, Brasil"
                  />
                  {errors.billingAddress && (
                    <p className="text-red-500 text-xs mt-1">{errors.billingAddress}</p>
                  )}
                </div>
              </div>
              
              <Button type="submit" className="w-full bg-meta-orange hover:bg-meta-orange/90" disabled={isLoading}>
                {isLoading ? 'Processando...' : 'Confirmar Cadastro e Pagar'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
