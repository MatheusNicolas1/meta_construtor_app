
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { OfflineProvider } from '@/contexts/OfflineContext';
import OnboardingSystem from '@/components/OnboardingSystem';

// Import pages
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import Obras from '@/pages/Obras';
import NovaObra from '@/pages/NovaObra';
import ObraDetailView from '@/pages/ObraDetailView';
import RDO from '@/pages/RDO';
import NovoRDO from '@/pages/NovoRDO';
import Teams from '@/pages/Teams';
import Equipment from '@/pages/Equipment';
import Activities from '@/pages/Activities';
import Relatorios from '@/pages/Relatorios';
import Configuracoes from '@/pages/Configuracoes';
import Documentos from '@/pages/Documentos';
import Fornecedores from '@/pages/Fornecedores';
import Integracoes from '@/pages/Integracoes';
import HistoricoAcoes from '@/pages/HistoricoAcoes';
import Checklist from '@/pages/Checklist';
import Admin from '@/pages/Admin';
import Auditoria from '@/pages/Auditoria';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="metaconstrutor-ui-theme">
        <AuthProvider>
          <OfflineProvider>
            <Router>
              <div className="App">
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/app" element={<Index />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/obras" element={<Obras />} />
                  <Route path="/obras/nova" element={<NovaObra />} />
                  <Route path="/obras/:id" element={<ObraDetailView />} />
                  <Route path="/rdo" element={<RDO />} />
                  <Route path="/rdo/novo" element={<NovoRDO />} />
                  <Route path="/equipes" element={<Teams />} />
                  <Route path="/equipamentos" element={<Equipment />} />
                  <Route path="/atividades" element={<Activities />} />
                  <Route path="/relatorios" element={<Relatorios />} />
                  <Route path="/configuracoes" element={<Configuracoes />} />
                  <Route path="/documentos" element={<Documentos />} />
                  <Route path="/fornecedores" element={<Fornecedores />} />
                  <Route path="/integracoes" element={<Integracoes />} />
                  <Route path="/historico" element={<HistoricoAcoes />} />
                  <Route path="/checklist" element={<Checklist />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/auditoria" element={<Auditoria />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Toaster />
                <OnboardingSystem />
              </div>
            </Router>
          </OfflineProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
