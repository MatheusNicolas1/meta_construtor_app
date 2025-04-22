import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  ClipboardList, 
  BarChart, 
  LogOut, 
  Menu, 
  X,
  Building,
  Users,
  HelpCircle,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "next-themes";
import { useLocale } from "@/contexts/LocaleContext";
import { useTranslation } from "@/locales/translations";

const AppLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { locale } = useLocale();
  const t = useTranslation(locale);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  // Check if dark mode is active
  const isDarkMode = theme === "dark";

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Obras", href: "/obras", icon: Building },
    { name: "RDOs", href: "/rdos", icon: ClipboardList },
    { name: "Análises", href: "/analyses", icon: BarChart },
    { name: "Configurações", href: "/configuracoes", icon: Settings },
    { name: "Suporte", href: "/suporte", icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-meta-gray">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-meta-gray sticky top-0 z-10">
        <div className="container max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          {/* Logo with conditional styling for dark mode */}
          <div className="flex items-center">
            <NavLink to="/dashboard" className="flex items-center">
              <h1 className="text-2xl font-bold">
                <span className={cn(
                  isDarkMode ? "text-white" : "text-meta-blue"
                )}>Meta</span>
                <span className="text-meta-orange">Construtor</span>
              </h1>
            </NavLink>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => cn(
                "flex items-center gap-2 text-meta-dark hover:text-meta-orange transition-colors font-medium",
                isActive && "text-meta-orange"
              )}
            >
              <LayoutDashboard className="w-5 h-5" />
              {t.navigation.dashboard}
            </NavLink>
            <NavLink 
              to="/obras" 
              className={({ isActive }) => cn(
                "flex items-center gap-2 text-meta-dark hover:text-meta-orange transition-colors font-medium",
                isActive && "text-meta-orange"
              )}
            >
              <Building className="w-5 h-5" />
              {t.navigation.works}
            </NavLink>
            <NavLink 
              to="/rdos" 
              className={({ isActive }) => cn(
                "flex items-center gap-2 text-meta-dark hover:text-meta-orange transition-colors font-medium",
                isActive && "text-meta-orange"
              )}
            >
              <ClipboardList className="w-5 h-5" />
              {t.navigation.rdos}
            </NavLink>
            <NavLink 
              to="/analyses" 
              className={({ isActive }) => cn(
                "flex items-center gap-2 text-meta-dark hover:text-meta-orange transition-colors font-medium",
                isActive && "text-meta-orange"
              )}
            >
              <BarChart className="w-5 h-5" />
              {t.navigation.analyses}
            </NavLink>
            <NavLink 
              to="/configuracoes" 
              className={({ isActive }) => cn(
                "flex items-center gap-2 text-meta-dark hover:text-meta-orange transition-colors font-medium",
                isActive && "text-meta-orange"
              )}
            >
              <Settings className="w-5 h-5" />
              {locale === 'pt-BR' ? 'Configurações' : 
               locale === 'en-US' ? 'Settings' : 
               locale === 'es-ES' ? 'Configuración' :
               locale === 'fr-FR' ? 'Paramètres' :
               'Einstellungen'}
            </NavLink>
            <div className="ml-2">
              <ThemeToggle />
            </div>
            {/* Support link now only has the icon */}
            <NavLink 
              to="/suporte" 
              className={({ isActive }) => cn(
                "flex items-center justify-center w-8 h-8 rounded-full text-meta-dark hover:text-meta-orange hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
                isActive && "text-meta-orange"
              )}
              title={t.navigation.support}
            >
              <HelpCircle className="w-5 h-5" />
            </NavLink>
            <Button 
              onClick={handleLogout}
              variant="ghost" 
              className="text-meta-dark hover:text-meta-orange hover:bg-transparent"
            >
              <LogOut className="w-5 h-5 mr-2" />
              {t.navigation.logout}
            </Button>
          </nav>

          {/* Mobile Menu Button and Theme Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <NavLink 
              to="/suporte" 
              className={({ isActive }) => cn(
                "flex items-center justify-center w-8 h-8 rounded-full text-meta-dark hover:text-meta-orange hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
                isActive && "text-meta-orange"
              )}
              title={t.navigation.support}
            >
              <HelpCircle className="w-5 h-5" />
            </NavLink>
            <button 
              className="text-meta-dark" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 px-4 py-3 shadow-md">
            <nav className="flex flex-col space-y-4">
              <NavLink 
                to="/dashboard" 
                className={({ isActive }) => cn(
                  "flex items-center gap-2 text-meta-dark hover:text-meta-orange transition-colors py-2 px-4 rounded-md font-medium",
                  isActive && "bg-meta-gray text-meta-orange"
                )}
              >
                <LayoutDashboard className="w-5 h-5" />
                {t.navigation.dashboard}
              </NavLink>
              <NavLink 
                to="/obras" 
                className={({ isActive }) => cn(
                  "flex items-center gap-2 text-meta-dark hover:text-meta-orange transition-colors py-2 px-4 rounded-md font-medium",
                  isActive && "bg-meta-gray text-meta-orange"
                )}
              >
                <Building className="w-5 h-5" />
                {t.navigation.works}
              </NavLink>
              <NavLink 
                to="/rdos" 
                className={({ isActive }) => cn(
                  "flex items-center gap-2 text-meta-dark hover:text-meta-orange transition-colors py-2 px-4 rounded-md font-medium",
                  isActive && "bg-meta-gray text-meta-orange"
                )}
              >
                <ClipboardList className="w-5 h-5" />
                {t.navigation.rdos}
              </NavLink>
              <NavLink 
                to="/analyses" 
                className={({ isActive }) => cn(
                  "flex items-center gap-2 text-meta-dark hover:text-meta-orange transition-colors py-2 px-4 rounded-md font-medium",
                  isActive && "bg-meta-gray text-meta-orange"
                )}
              >
                <BarChart className="w-5 h-5" />
                {t.navigation.analyses}
              </NavLink>
              <NavLink 
                to="/configuracoes" 
                className={({ isActive }) => cn(
                  "flex items-center gap-2 text-meta-dark hover:text-meta-orange transition-colors py-2 px-4 rounded-md font-medium",
                  isActive && "bg-meta-gray text-meta-orange"
                )}
              >
                <Settings className="w-5 h-5" />
                {locale === 'pt-BR' ? 'Configurações' : 
                 locale === 'en-US' ? 'Settings' : 
                 locale === 'es-ES' ? 'Configuración' :
                 locale === 'fr-FR' ? 'Paramètres' :
                 'Einstellungen'}
              </NavLink>
              <NavLink 
                to="/suporte" 
                className={({ isActive }) => cn(
                  "flex items-center gap-2 text-meta-dark hover:text-meta-orange transition-colors py-2 px-4 rounded-md font-medium",
                  isActive && "bg-meta-gray text-meta-orange"
                )}
              >
                <HelpCircle className="w-5 h-5" />
                {t.navigation.support}
              </NavLink>
              <Button 
                onClick={handleLogout}
                variant="ghost" 
                className="flex items-center justify-start gap-2 text-meta-dark hover:text-meta-orange hover:bg-transparent py-2 px-4 w-full"
              >
                <LogOut className="w-5 h-5" />
                {t.navigation.logout}
              </Button>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 container max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-meta-gray py-6">
        <div className="container max-w-7xl mx-auto px-4 text-center text-sm text-meta-gray-dark">
          © {new Date().getFullYear()} Meta Construtor. {locale === 'pt-BR' ? 'Todos os direitos reservados.' : 
             locale === 'en-US' ? 'All rights reserved.' : 
             locale === 'es-ES' ? 'Todos los derechos reservados.' :
             locale === 'fr-FR' ? 'Tous droits réservés.' :
             'Alle Rechte vorbehalten.'}
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;
