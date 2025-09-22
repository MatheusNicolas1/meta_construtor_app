import React, { memo, useMemo } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { NotificationPanel } from "./NotificationPanel";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { UserProfile } from "./UserProfile";
import { GlobalSearch } from "./GlobalSearch";
import { useIsMobile } from "@/hooks/use-mobile";
import { I18nProvider } from "react-aria-components";
import Logo from "./Logo";
import { useOptimizedCallback } from "@/hooks/useOptimizedCallback";

interface LayoutProps {
  children: React.ReactNode;
}

// Componente de header memoizado para evitar re-renders desnecessários
const Header = memo(() => {
  const isMobile = useIsMobile();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-full">
      <div className="flex h-16 items-center gap-2 px-3 sm:px-4 lg:px-6">
        {/* Left section - Sidebar trigger and logo */}
        <div className="flex items-center gap-2 min-w-0">
          <SidebarTrigger className="shrink-0" />
          
          {/* Logo - Visível apenas no mobile quando sidebar está fechada */}
          {isMobile && (
            <div className="flex items-center gap-2 min-w-0">
              <Logo size="sm" />
            </div>
          )}
        </div>
        
        {/* Center section - Search */}
        <div className="flex-1 flex justify-center min-w-0">
          <div className="w-full max-w-md lg:max-w-lg">
            <GlobalSearch />
          </div>
        </div>
        
        {/* Right section - Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <NotificationPanel />
          <ThemeToggle />
          <UserProfile />
        </div>
      </div>
    </header>
  );
});

Header.displayName = "Header";

// Main content memoizado
const MainContent = memo(({ children }: { children: React.ReactNode }) => (
  <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
    <div className="mx-auto max-w-7xl">
      {children}
    </div>
  </main>
));

MainContent.displayName = "MainContent";

const OptimizedLayout = memo(({ children }: LayoutProps) => {
  return (
    <I18nProvider locale="pt-BR">
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <MainContent>
            {children}
          </MainContent>
        </div>
      </div>
    </I18nProvider>
  );
});

OptimizedLayout.displayName = "OptimizedLayout";

export default OptimizedLayout;