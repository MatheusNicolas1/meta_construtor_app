
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Calendar,
  Users,
  Settings,
  FileText,
  CheckSquare,
  Building,
  Wrench,
  BarChart3,
  FolderOpen,
  Truck,
  Zap
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Logo } from './Logo';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Calendar },
  { name: 'RDO', href: '/rdo', icon: FileText },
  { name: 'Obras', href: '/obras', icon: Building },
  { name: 'Atividades', href: '/atividades', icon: CheckSquare },
  { name: 'Equipes', href: '/equipes', icon: Users },
  { name: 'Equipamentos', href: '/equipamentos', icon: Wrench },
  { name: 'Documentos', href: '/documentos', icon: FolderOpen },
  { name: 'Fornecedores', href: '/fornecedores', icon: Truck },
  { name: 'Relatórios', href: '/relatorios', icon: BarChart3 },
  { name: 'Integrações', href: '/integracoes', icon: Zap },
  { name: 'Configurações', href: '/configuracoes', icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon" className="border-r bg-background transition-all duration-200">
      <SidebarContent className="bg-background">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-4 sm:py-6 bg-background">
            {!isCollapsed ? (
              <Logo size="sm" />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-r from-[#F7931E] to-[#FF6B35] rounded-lg flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105">
                <span className="text-white text-sm font-bold">M</span>
              </div>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.href}
                    tooltip={isCollapsed ? item.name : undefined}
                    className="mobile-menu-item w-full justify-start gap-3 px-3 py-2.5 sm:py-3 text-sm font-medium transition-all duration-200 hover:bg-accent/50 hover:text-accent-foreground data-[active=true]:bg-[#F7931E]/10 data-[active=true]:text-[#F7931E] data-[active=true]:border-l-2 data-[active=true]:border-[#F7931E] rounded-r-lg"
                  >
                    <NavLink to={item.href} className="flex items-center gap-3 w-full">
                      <item.icon className="mobile-menu-icon h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                      {!isCollapsed && (
                        <span className="mobile-text text-sm font-medium truncate">{item.name}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
