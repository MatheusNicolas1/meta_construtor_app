
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LocaleProvider } from "@/contexts/LocaleContext";
import LocationModal from "@/components/LocationModal";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { checkBrowserCompatibility, getBrowserInfo } from "@/utils/compatibility";

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
import Equipe from "./pages/Equipe";
import Support from "./pages/Support"; // Import the new Support page
import Tutorial from "./pages/Tutorial";
import NotFound from "./pages/NotFound";
import PlansPage from "./pages/PlansPage";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isFirstVisit, setIsFirstVisit] = useState<boolean>(false);
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

  useEffect(() => {
    const checkTrialStatus = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) return;
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*, plan:plan_id(*)')
        .eq('id', data.session.user.id)
        .single();
        
      if (error || !profile) return;
      
      if (profile.trial_end) {
        const trialEndDate = new Date(profile.trial_end);
        const currentDate = new Date();
        
        if (currentDate > trialEndDate && profile.plan?.name === 'Premium') {
          const { data: basicPlan } = await supabase
            .from('plans')
            .select('id')
            .eq('name', 'Básico')
            .single();
            
          if (basicPlan) {
            await supabase
              .from('profiles')
              .update({
                plan_id: basicPlan.id,
                trial_start: null,
                trial_end: null
              })
              .eq('id', data.session.user.id);
              
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
            
            toast.warning('Seu período de teste do plano Premium terminou. Seu plano foi alterado para o plano Básico.');
          }
        } else if (currentDate > trialEndDate && profile.trial_end) {
          await supabase
            .from('profiles')
            .update({
              trial_start: null,
              trial_end: null
            })
            .eq('id', data.session.user.id);
        }
      }
    };
    
    checkTrialStatus();
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
      
      const hasVisitedBefore = localStorage.getItem("meta-constructor-visited");
      if (data.session && !hasVisitedBefore) {
        setIsFirstVisit(true);
        localStorage.setItem("meta-constructor-visited", "true");
      }
    };

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-16 h-16 border-4 border-meta-orange border-t-meta-blue rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <LocationModal />
          
          <Dialog open={showCompatibilityWarning} onOpenChange={setShowCompatibilityWarning}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  Browser Compatibility Warning
                </DialogTitle>
                <DialogDescription>
                  We detected some compatibility issues with your browser:
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
                  Continue Anyway
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <BrowserRouter>
            <Routes>
              <Route 
                path="/auth" 
                element={isAuthenticated ? <Navigate to="/app/dashboard" replace /> : <Auth />} 
              />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/signup/register" element={<RegisterPage />} />
              <Route path="/signup/confirm-email" element={<ConfirmEmailPage />} />
              <Route path="/signup/payment" element={<PaymentPage />} />
              <Route 
                path="/" 
                element={<Navigate to="/auth" replace />} 
              />
              {!isAuthenticated && (
                <Route
                  path="*"
                  element={<Navigate to="/auth" replace />}
                />
              )}
              {isAuthenticated && (
                <Route path="/app" element={<AppLayout />}>
                  <Route index element={<Navigate to={isFirstVisit ? "/tutorial" : "/app/dashboard"} replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="obras" element={<Obras />} />
                  <Route path="obras/cadastrar" element={<CadastrarObra />} />
                  <Route path="obras/:id" element={<ObraDetalhe />} />
                  <Route path="rdos" element={<RDOs />} />
                  <Route path="rdos/new" element={<CreateRDO />} />
                  <Route path="rdos/:id" element={<RDODetalhe />} />
                  <Route path="analyses" element={<Analyses />} />
                  <Route path="equipe" element={<Equipe />} />
                  <Route path="suporte" element={<Support />} /> {/* Add the new Support route */}
                  <Route path="tutorial" element={<Tutorial />} />
                  <Route path="planos" element={<PlansPage />} />
                </Route>
              )}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LocaleProvider>
    </QueryClientProvider>
  );
};

export default App;
