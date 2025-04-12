
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Mail, RefreshCw } from "lucide-react";

const ConfirmEmailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [planId, setPlanId] = useState("");
  const [leadSource, setLeadSource] = useState<string | null>(null);
  const [leadId, setLeadId] = useState<string | null>(null);
  
  useEffect(() => {
    // Extract parameters from URL
    const queryParams = new URLSearchParams(location.search);
    const emailParam = queryParams.get('email');
    const planParam = queryParams.get('plan');
    const sourceParam = queryParams.get('leadSource');
    const idParam = queryParams.get('leadId');
    
    if (emailParam) setEmail(emailParam);
    if (planParam) setPlanId(planParam);
    if (sourceParam) setLeadSource(sourceParam);
    if (idParam) setLeadId(idParam);
    
    if (!emailParam || !planParam) {
      navigate('/signup');
    }
  }, [location, navigate]);
  
  const handleResendEmail = () => {
    setIsResending(true);
    
    // Mock API call delay
    setTimeout(() => {
      toast.success("E-mail reenviado com sucesso!");
      setIsResending(false);
    }, 1000);
  };
  
  const handleSimulateConfirmation = () => {
    // Build query parameters
    const params = new URLSearchParams();
    if (planId) params.append('plan', planId);
    if (leadSource) params.append('leadSource', leadSource);
    if (leadId) params.append('leadId', leadId);
    
    navigate(`/signup/payment?${params.toString()}`);
  };
  
  return (
    <div className="min-h-screen bg-[#022241] text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#1A2A44]/80 rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-meta-orange/20 p-4 rounded-full">
            <Mail className="h-12 w-12 text-meta-orange" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Confirme seu e-mail</h1>
        
        <p className="text-gray-300 mb-6">
          Enviamos um e-mail de confirmação para <span className="font-semibold text-meta-orange">{email}</span>.
          Por favor, clique no link no e-mail para confirmar sua conta.
        </p>
        
        <div className="space-y-4">
          <Button
            onClick={handleResendEmail}
            variant="outline"
            className="w-full border-meta-orange text-meta-orange hover:bg-meta-orange hover:text-white"
            disabled={isResending}
          >
            {isResending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Reenviando...
              </>
            ) : (
              'Reenviar E-mail'
            )}
          </Button>
          
          {/* Temporary button for development */}
          <div className="pt-8 border-t border-gray-700">
            <p className="text-sm text-gray-400 mb-4">Desenvolvimento apenas:</p>
            <Button
              onClick={handleSimulateConfirmation}
              variant="secondary"
              className="w-full"
            >
              Simular Confirmação
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmEmailPage;
