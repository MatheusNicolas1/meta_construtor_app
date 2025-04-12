
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plan } from "@/types/plans";
import { Lock } from "lucide-react";

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

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
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
  }, [location, navigate]);
  
  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    let formatted = '';
    
    for (let i = 0; i < digits.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += ' ';
      }
      formatted += digits[i];
    }
    
    return formatted.slice(0, 19); // Limit to 16 digits + 3 spaces
  };
  
  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, '');
    
    if (digits.length <= 2) {
      return digits;
    }
    
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
  };
  
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
  };
  
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value);
    setExpiry(formatted);
  };
  
  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '');
    setCvc(digits.slice(0, 3));
  };
  
  const validateForm = () => {
    let isValid = true;
    const newErrors: {[key: string]: string} = {};
    
    // Validate card number
    if (!cardNumber) {
      newErrors.cardNumber = "Número do cartão é obrigatório";
      isValid = false;
    } else if (cardNumber.replace(/\s/g, '').length < 16) {
      newErrors.cardNumber = "Número do cartão inválido";
      isValid = false;
    }
    
    // Validate expiry
    if (!expiry) {
      newErrors.expiry = "Data de validade é obrigatória";
      isValid = false;
    } else if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      newErrors.expiry = "Formato inválido (MM/AA)";
      isValid = false;
    } else {
      const [month, year] = expiry.split('/');
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100; // Get last 2 digits
      const currentMonth = currentDate.getMonth() + 1;
      
      if (parseInt(month) < 1 || parseInt(month) > 12) {
        newErrors.expiry = "Mês inválido";
        isValid = false;
      } else if (
        (parseInt(year) < currentYear) || 
        (parseInt(year) === currentYear && parseInt(month) < currentMonth)
      ) {
        newErrors.expiry = "Data expirada";
        isValid = false;
      }
    }
    
    // Validate CVC
    if (!cvc) {
      newErrors.cvc = "CVC é obrigatório";
      isValid = false;
    } else if (cvc.length < 3) {
      newErrors.cvc = "CVC inválido";
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Get user registration data
      const userData = localStorage.getItem('userRegistrationData');
      
      if (userData) {
        const parsedUserData = JSON.parse(userData);
        
        // Update user data with payment info (for mock purposes only)
        const updatedUserData = {
          ...parsedUserData,
          paymentDate: new Date().toISOString(),
          paymentStatus: "completed"
        };
        
        localStorage.setItem('userRegistrationData', JSON.stringify(updatedUserData));
        localStorage.setItem('whatsappNumber', parsedUserData.whatsappNumber || '');
      }
      
      // Mock payment processing delay
      setTimeout(() => {
        toast.success("Pagamento realizado com sucesso! Bem-vindo ao Meta Construtor!");
        
        toast("Você será adicionado ao nosso bot no WhatsApp em breve!", {
          duration: 5000,
        });
        
        navigate('/auth');
        
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Erro ao processar pagamento. Tente novamente.");
      setIsLoading(false);
    }
  };
  
  if (!selectedPlan) {
    return <div className="min-h-screen bg-[#022241] flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-meta-orange border-t-meta-blue rounded-full animate-spin"></div>
    </div>;
  }
  
  return (
    <div className="min-h-screen bg-[#022241] text-white py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Finalizar Pagamento</h1>
          <p className="text-gray-300">Complete os dados do cartão para ativar sua conta</p>
        </div>
        
        <Card className="bg-[#1A2A44]/80 border-none shadow-lg text-white">
          <CardHeader>
            <CardTitle>Plano Escolhido</CardTitle>
            <CardDescription className="text-gray-300">
              <span className="font-semibold text-meta-orange">{selectedPlan.name} - R$ {selectedPlan.price}/mês</span>
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="bg-[#0a1628]/50 p-4 rounded-lg flex items-center mb-4 border border-gray-700">
                  <Lock className="h-5 w-5 text-meta-orange mr-2" />
                  <p className="text-sm text-gray-300">
                    Seus dados estão protegidos com criptografia de ponta a ponta
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="cardNumber" className="text-white">Número do cartão</Label>
                  <Input
                    id="cardNumber"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="1234 5678 9012 3456"
                    className={`bg-[#0a1628] border-gray-700 text-white ${errors.cardNumber ? "border-red-500" : ""}`}
                    maxLength={19}
                  />
                  {errors.cardNumber && (
                    <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry" className="text-white">Data de validade</Label>
                    <Input
                      id="expiry"
                      value={expiry}
                      onChange={handleExpiryChange}
                      placeholder="MM/AA"
                      className={`bg-[#0a1628] border-gray-700 text-white ${errors.expiry ? "border-red-500" : ""}`}
                      maxLength={5}
                    />
                    {errors.expiry && (
                      <p className="text-red-500 text-xs mt-1">{errors.expiry}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="cvc" className="text-white">CVC</Label>
                    <Input
                      id="cvc"
                      value={cvc}
                      onChange={handleCvcChange}
                      placeholder="123"
                      className={`bg-[#0a1628] border-gray-700 text-white ${errors.cvc ? "border-red-500" : ""}`}
                      maxLength={3}
                    />
                    {errors.cvc && (
                      <p className="text-red-500 text-xs mt-1">{errors.cvc}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <Button type="submit" className="w-full bg-meta-orange hover:bg-meta-orange/90" disabled={isLoading}>
                {isLoading ? 'Processando...' : `Pagar R$ ${selectedPlan.price},00`}
              </Button>
              
              <p className="text-center text-xs text-gray-400 mt-4">
                Ao clicar em "Pagar", você concorda com os nossos Termos de Uso e Política de Privacidade.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentPage;
