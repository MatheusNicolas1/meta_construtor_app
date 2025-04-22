import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { LocaleProvider } from "@/contexts/LocaleContext";
import LocationModal from "@/components/LocationModal";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { checkBrowserCompatibility, getBrowserInfo } from "@/utils/compatibility";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

import Auth from "./pages/Auth";
import SignupPage from "./pages/SignupPage";
import RegisterPage from "./pages/RegisterPage";
import ConfirmEmailPage from "./pages/ConfirmEmailPage";
import PaymentPage from "./pages/PaymentPage";
import AppLayout from "./layouts/AppLayout";
import Dashboard from "./pages/Dashboard";
import Obras from "./pages/Obras";
import CadastrarObra from "./pages/CadastrarObra";
import ObraDetalhe from "./pages/ObraDetalhe";
import RDOs from "./pages/RDOs";
import CreateRDO from "./pages/CreateRDO";
import RDODetalhe from "./pages/RDODetalhe";
import Analyses from "./pages/Analyses";
import Configuracoes from "./pages/Configuracoes";
import Support from "./pages/Support"; // Import the new Support page
import Tutorial from "./pages/Tutorial";
import NotFound from "./pages/NotFound";
import PlansPage from "./pages/PlansPage";

const queryClient = new QueryClient();

// Componente para as rotas protegidas
const ProtectedRoutes = () => {
  const { user, loading } = useAuth();
  const [isFirstVisit, setIsFirstVisit] = useState<boolean>(false);
  
  useEffect(() => {
    const hasVisitedBefore = localStorage.getItem("meta-constructor-visited");
    if (user && !hasVisitedBefore) {
      setIsFirstVisit(true);
      localStorage.setItem("meta-constructor-visited", "true");
    }
  }, [user]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-16 h-16 border-4 border-meta-orange border-t-meta-blue rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to={isFirstVisit ? "/tutorial" : "/dashboard"} replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="obras" element={<Obras />} />
        <Route path="obras/cadastrar" element={<CadastrarObra />} />
        <Route path="obras/:id" element={<ObraDetalhe />} />
        <Route path="rdos" element={<RDOs />} />
        <Route path="rdos/new" element={<CreateRDO />} />
        <Route path="rdos/:id" element={<RDODetalhe />} />
        <Route path="analyses" element={<Analyses />} />
        <Route path="configuracoes" element={<Configuracoes />} />
        <Route path="suporte" element={<Support />} />
        <Route path="tutorial" element={<Tutorial />} />
        <Route path="planos" element={<PlansPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// Componente para as rotas públicas
const PublicRoutes = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-16 h-16 border-4 border-meta-orange border-t-meta-blue rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/signup/register" element={<RegisterPage />} />
      <Route path="/signup/confirm-email" element={<ConfirmEmailPage />} />
      <Route path="/signup/payment" element={<PaymentPage />} />
      <Route path="/" element={<Navigate to="/auth" replace />} />
      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  );
};

const App = () => {
  const [compatibilityIssues, setCompatibilityIssues] = useState<string[]>([]);
  const [showCompatibilityWarning, setShowCompatibilityWarning] = useState<boolean>(false);

  useEffect(() => {
    const { compatible, issues } = checkBrowserCompatibility();
    if (!compatible) {
      setCompatibilityIssues(issues);
      setShowCompatibilityWarning(true);
      
      console.log("Browser information:", getBrowserInfo());
    }
    
    const savedTheme = localStorage.getItem("meta-constructor-theme");
    if (savedTheme) {
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else if (savedTheme === "system") {
        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (systemPrefersDark) {
          document.documentElement.classList.add("dark");
        }
      }
    } else {
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (systemPrefersDark) {
        document.documentElement.classList.add("dark");
      }
      localStorage.setItem("meta-constructor-theme", "system");
    }
    document.documentElement.classList.add("dark-transition");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <LocationModal />
            
            <Dialog open={showCompatibilityWarning} onOpenChange={setShowCompatibilityWarning}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    Aviso de Compatibilidade do Navegador
                  </DialogTitle>
                  <DialogDescription>
                    Detectamos alguns problemas de compatibilidade com seu navegador:
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <ul className="list-disc pl-5 space-y-2">
                    {compatibilityIssues.map((issue, index) => (
                      <li key={index} className="text-sm">{issue}</li>
                    ))}
                  </ul>
                </div>
                <DialogFooter>
                  <Button onClick={() => setShowCompatibilityWarning(false)}>
                    Continuar Mesmo Assim
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <BrowserRouter>
              <Routes>
                <Route path="/auth/*" element={<PublicRoutes />} />
                <Route path="/signup/*" element={<PublicRoutes />} />
                <Route path="/*" element={<ProtectedRoutes />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </LocaleProvider>
    </QueryClientProvider>
  );
};

export default App;
