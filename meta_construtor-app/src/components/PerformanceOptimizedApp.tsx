import React, { Suspense, lazy, memo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';

import { SafeSuspense } from '@/components/SafeSuspense';
import OptimizedLayout from '@/components/OptimizedLayout';
import { AuthWrapper } from '@/components/auth/AuthWrapper';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import RootRedirect from '@/components/auth/RootRedirect';
import type { UserRole } from '@/types/user';
import { AuditProvider } from '@/components/security/AuditLogger';
import SecurityHeaders from '@/components/security/SecurityHeaders';
import { ServiceWorkerManager } from '@/components/ServiceWorkerManager';
import { PerformanceProvider } from '@/components/PerformanceProvider';

import { getPerformanceConfig } from '@/utils/performanceOptimizations';

// Componentes críticos carregados imediatamente
import Index from '@/pages/Index';
import Preco from '@/pages/Preco';
import Login from '@/pages/Login';
import Logout from '@/pages/Logout';
import RecuperarSenha from '@/pages/RecuperarSenha';
import RedefinirSenha from '@/pages/RedefinirSenha';
import CriarConta from '@/pages/CriarConta';
import MFA from '@/pages/MFA';
import RenovarSessao from '@/pages/RenovarSessao';
import Checkout from '@/pages/Checkout';
import CheckoutSuccess from '@/pages/CheckoutSuccess';
import CheckoutCancel from '@/pages/CheckoutCancel';

// Lazy loading otimizado com chunk específicos e prefetch
const Dashboard = lazy(() => 
  import(/* webpackChunkName: "dashboard" */ '@/pages/Dashboard')
);

const Obras = lazy(() => 
  import(/* webpackChunkName: "obras" */ '@/pages/Obras')
);

const ObraDetalhes = lazy(() => 
  import(/* webpackChunkName: "obra-detalhes" */ '@/pages/ObraDetalhes')
);

const RDO = lazy(() => 
  import(/* webpackChunkName: "rdo" */ '@/pages/RDO')
);

const RDOVisualizar = lazy(() => 
  import('@/pages/RDOVisualizar').then(module => ({
    default: module.default
  }))
);

const Atividades = lazy(() => 
  import('@/pages/Atividades').then(module => ({
    default: module.default
  }))
);

const Checklist = lazy(() => 
  import('@/pages/Checklist').then(module => ({
    default: module.default
  }))
);

const ChecklistDetalhes = lazy(() => 
  import('@/pages/ChecklistDetalhes').then(module => ({
    default: module.default
  }))
);

const Equipes = lazy(() => 
  import('@/pages/Equipes').then(module => ({
    default: module.default
  }))
);

const Equipamentos = lazy(() => 
  import('@/pages/Equipamentos').then(module => ({
    default: module.default
  }))
);

const Documentos = lazy(() => 
  import('@/pages/Documentos').then(module => ({
    default: module.default
  }))
);

const Fornecedores = lazy(() => 
  import('@/pages/Fornecedores').then(module => ({
    default: module.default
  }))
);

const Relatorios = lazy(() => 
  import('@/pages/Relatorios').then(module => ({
    default: module.default
  }))
);

const Integracoes = lazy(() => 
  import('@/pages/Integracoes').then(module => ({
    default: module.default
  }))
);

const Configuracoes = lazy(() => 
  import('@/pages/Configuracoes').then(module => ({
    default: module.default
  }))
);

const Perfil = lazy(() => 
  import('@/pages/Perfil').then(module => ({
    default: module.default
  }))
);

const Feedback = lazy(() => 
  import('@/pages/Feedback').then(module => ({
    default: module.default
  }))
);

const FAQ = lazy(() => 
  import('@/pages/FAQ').then(module => ({
    default: module.default
  }))
);

const Seguranca = lazy(() => 
  import('@/pages/Seguranca').then(module => ({
    default: module.default
  }))
);

const NotFound = lazy(() => 
  import('@/pages/NotFound').then(module => ({
    default: module.default
  }))
);

const Sobre = lazy(() => 
  import('@/pages/Sobre').then(module => ({
    default: module.default
  }))
);

const Contato = lazy(() => 
  import('@/pages/Contato').then(module => ({
    default: module.default
  }))
);

// Configuração otimizada do React Query
const perfConfig = getPerformanceConfig();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 3 * 60 * 1000, // 3 minutos
      gcTime: 8 * 60 * 1000, // 8 minutos
      retry: perfConfig.maxConcurrentRequests > 2 ? 2 : 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: false,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// Componente memoizado para página protegida
const ProtectedPage = memo(({ 
  children, 
  roles 
}: { 
  children: React.ReactNode; 
  roles?: UserRole[] 
}) => (
  <OptimizedLayout>
    <ProtectedRoute roles={roles}>
      <SafeSuspense>
        {children}
      </SafeSuspense>
    </ProtectedRoute>
  </OptimizedLayout>
));

ProtectedPage.displayName = 'ProtectedPage';

export const PerformanceOptimizedApp = memo(() => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <TooltipProvider>
          <PerformanceProvider>
            <ServiceWorkerManager />
            
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <SidebarProvider>
                <AuthWrapper>
                  <AuditProvider>
                    <SecurityHeaders />
                    <Routes>
                      {/* Rota raiz redireciona baseado na autenticação */}
                      <Route path="/" element={<RootRedirect />} />
                      
                      {/* Rotas públicas sem layout */}
                      <Route path="/login" element={<Login />} />
                      <Route path="/logout" element={<Logout />} />
                      <Route path="/recuperar-senha" element={<RecuperarSenha />} />
                      <Route path="/redefinir-senha" element={<RedefinirSenha />} />
                      <Route path="/criar-conta" element={<CriarConta />} />
                      <Route path="/mfa" element={<MFA />} />
                      <Route path="/renovar-sessao" element={<RenovarSessao />} />
                      <Route path="/home" element={<Index />} />
                      <Route path="/preco" element={<Preco />} />
                      <Route path="/sobre" element={<SafeSuspense><Sobre /></SafeSuspense>} />
                      <Route path="/contato" element={<SafeSuspense><Contato /></SafeSuspense>} />
                      
                      {/* Rotas de Checkout */}
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/checkout/success" element={<CheckoutSuccess />} />
                      <Route path="/checkout/cancel" element={<CheckoutCancel />} />

                      {/* Dashboard protegido */}
                      <Route 
                        path="/dashboard" 
                        element={
                          <ProtectedPage>
                            <Dashboard />
                          </ProtectedPage>
                        } 
                      />

                      {/* Obras */}
                      <Route 
                        path="/obras" 
                        element={
                          <ProtectedPage>
                            <Obras />
                          </ProtectedPage>
                        } 
                      />
                      <Route 
                        path="/obras/:id" 
                        element={
                          <ProtectedPage>
                            <ObraDetalhes />
                          </ProtectedPage>
                        } 
                      />
                      <Route 
                        path="/obras/:id/editar" 
                        element={
                          <ProtectedPage roles={["Administrador", "Gerente"]}>
                            <Obras />
                          </ProtectedPage>
                        } 
                      />

                      {/* RDO */}
                      <Route 
                        path="/rdo" 
                        element={
                          <ProtectedPage>
                            <RDO />
                          </ProtectedPage>
                        } 
                      />
                      <Route 
                        path="/rdo/:id/visualizar" 
                        element={
                          <ProtectedPage>
                            <RDOVisualizar />
                          </ProtectedPage>
                        } 
                      />
                      <Route 
                        path="/rdo/:id/editar" 
                        element={
                          <ProtectedPage>
                            <RDO />
                          </ProtectedPage>
                        } 
                      />

                      {/* Atividades */}
                      <Route 
                        path="/atividades" 
                        element={
                          <ProtectedPage>
                            <Atividades />
                          </ProtectedPage>
                        } 
                      />

                      {/* Checklist */}
                      <Route 
                        path="/checklist" 
                        element={
                          <ProtectedPage>
                            <Checklist />
                          </ProtectedPage>
                        } 
                      />
                      <Route 
                        path="/checklist/:id" 
                        element={
                          <ProtectedPage>
                            <ChecklistDetalhes />
                          </ProtectedPage>
                        } 
                      />

                      {/* Equipes */}
                      <Route 
                        path="/equipes" 
                        element={
                          <ProtectedPage roles={["Administrador", "Gerente"]}>
                            <Equipes />
                          </ProtectedPage>
                        } 
                      />
                      <Route 
                        path="/equipes/novo" 
                        element={
                          <ProtectedPage roles={["Administrador", "Gerente"]}>
                            <Equipes />
                          </ProtectedPage>
                        } 
                      />
                      <Route 
                        path="/equipes/:id/editar" 
                        element={
                          <ProtectedPage roles={["Administrador", "Gerente"]}>
                            <Equipes />
                          </ProtectedPage>
                        } 
                      />

                      {/* Colaboradores */}
                      <Route 
                        path="/colaboradores" 
                        element={
                          <ProtectedPage roles={["Administrador", "Gerente"]}>
                            <Equipes />
                          </ProtectedPage>
                        } 
                      />
                      <Route 
                        path="/colaboradores/novo" 
                        element={
                          <ProtectedPage roles={["Administrador", "Gerente"]}>
                            <Equipes />
                          </ProtectedPage>
                        } 
                      />
                      <Route 
                        path="/colaboradores/:id/editar" 
                        element={
                          <ProtectedPage roles={["Administrador", "Gerente"]}>
                            <Equipes />
                          </ProtectedPage>
                        } 
                      />

                      {/* Equipamentos */}
                      <Route 
                        path="/equipamentos" 
                        element={
                          <ProtectedPage>
                            <Equipamentos />
                          </ProtectedPage>
                        } 
                      />

                      {/* Documentos */}
                      <Route 
                        path="/documentos" 
                        element={
                          <ProtectedPage>
                            <Documentos />
                          </ProtectedPage>
                        } 
                      />

                      {/* Fornecedores */}
                      <Route 
                        path="/fornecedores" 
                        element={
                          <ProtectedPage roles={["Administrador", "Gerente"]}>
                            <Fornecedores />
                          </ProtectedPage>
                        } 
                      />

                      {/* Relatórios */}
                      <Route 
                        path="/relatorios" 
                        element={
                          <ProtectedPage roles={["Administrador", "Gerente"]}>
                            <Relatorios />
                          </ProtectedPage>
                        } 
                      />

                      {/* Integrações */}
                      <Route 
                        path="/integracoes" 
                        element={
                          <ProtectedPage roles={["Administrador", "Gerente"]}>
                            <Integracoes />
                          </ProtectedPage>
                        } 
                      />
                      <Route 
                        path="/integracoes/*" 
                        element={
                          <ProtectedPage roles={["Administrador", "Gerente"]}>
                            <Integracoes />
                          </ProtectedPage>
                        } 
                      />

                      {/* Configurações */}
                      <Route 
                        path="/configuracoes" 
                        element={
                          <ProtectedPage roles={["Administrador", "Gerente"]}>
                            <Configuracoes />
                          </ProtectedPage>
                        } 
                      />

                      {/* Perfil */}
                      <Route 
                        path="/perfil" 
                        element={
                          <ProtectedPage>
                            <Perfil />
                          </ProtectedPage>
                        } 
                      />

                      {/* Feedback e FAQ */}
                      <Route 
                        path="/feedback" 
                        element={
                          <ProtectedPage>
                            <Feedback />
                          </ProtectedPage>
                        } 
                      />
                      <Route 
                        path="/faq" 
                        element={
                          <ProtectedPage>
                            <FAQ />
                          </ProtectedPage>
                        } 
                      />

                      {/* Segurança */}
                      <Route 
                        path="/seguranca" 
                        element={
                          <ProtectedPage roles={["Administrador", "Gerente"]}>
                            <Seguranca />
                          </ProtectedPage>
                        } 
                      />

                      {/* 404 */}
                      <Route 
                        path="*" 
                        element={
                          <SafeSuspense>
                            <NotFound />
                          </SafeSuspense>
                        } 
                      />
                    </Routes>
                  </AuditProvider>
                </AuthWrapper>
              </SidebarProvider>
            </BrowserRouter>
          </PerformanceProvider>
        </TooltipProvider>
      </ThemeProvider>
    </HelmetProvider>
  </QueryClientProvider>
));

PerformanceOptimizedApp.displayName = 'PerformanceOptimizedApp';