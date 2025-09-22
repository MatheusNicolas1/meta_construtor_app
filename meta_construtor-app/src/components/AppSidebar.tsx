import { 
  Home, 
  Briefcase,
  FileText, 
  CheckSquare, 
  Calendar, 
  Users, 
  Wrench, 
  Folder, 
  Truck, 
  BarChart3, 
  Zap
} from "lucide-react";
import { NavLink, useLocation, Link } from "react-router-dom";
import Logo from "./Logo";

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
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Obras", url: "/obras", icon: Briefcase },
  { title: "RDO", url: "/rdo", icon: FileText },
  { title: "Checklist", url: "/checklist", icon: CheckSquare },
  { title: "Atividades", url: "/atividades", icon: Calendar },
  { title: "Equipes", url: "/equipes", icon: Users },
  { title: "Equipamentos", url: "/equipamentos", icon: Wrench },
];

const secondaryItems = [
  { title: "Documentos", url: "/documentos", icon: Folder },
  { title: "Fornecedores", url: "/fornecedores", icon: Truck },
  { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
  { title: "Integrações", url: "/integracoes", icon: Zap },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === "collapsed";

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const getNavClass = (path: string) =>
    isActive(path) 
      ? "bg-primary text-primary-foreground hover:bg-primary/90" 
      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";

  return (
    <Sidebar 
      className={collapsed ? "w-16" : "w-64"} 
      collapsible="icon"
      side="left"
    >
      <SidebarContent className="bg-sidebar">
        {/* Header com Logo */}
        <div className={`border-b border-sidebar-border ${collapsed ? 'p-3' : 'p-4'}`}>
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-start'}`}>
            <Link 
              to="/dashboard" 
              className="flex items-center hover:opacity-80 transition-opacity touch-safe"
              title={collapsed ? "MetaConstrutor - Dashboard" : "Dashboard"}
            >
              {!collapsed && (
                <Logo size="md" />
              )}
              {collapsed && (
                <div className="w-8 h-8 flex items-center justify-center">
                  <Logo size="sm" />
                </div>
              )}
            </Link>
          </div>
        </div>

        {/* Navegação Principal */}
        <div className="flex-1 overflow-y-auto">
          <SidebarGroup className="px-3 py-2">
            <SidebarGroupLabel className="text-sidebar-foreground/70 px-2 py-1.5 text-xs font-semibold uppercase tracking-wider">
              {!collapsed && "Gestão"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        className={`${getNavClass(item.url)} flex items-center transition-colors rounded-lg h-10 px-3 ${
                          collapsed ? 'justify-center' : 'justify-start'
                        }`}
                        title={collapsed ? item.title : undefined}
                        end={false}
                      >
                        <item.icon className={`h-5 w-5 ${collapsed ? '' : 'mr-3'} flex-shrink-0`} />
                        {!collapsed && <span className="truncate">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="px-3 py-2">
            <SidebarGroupLabel className="text-sidebar-foreground/70 px-2 py-1.5 text-xs font-semibold uppercase tracking-wider">
              {!collapsed && "Sistema"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {secondaryItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        className={`${getNavClass(item.url)} flex items-center transition-colors rounded-lg h-10 px-3 ${
                          collapsed ? 'justify-center' : 'justify-start'
                        }`}
                        title={collapsed ? item.title : undefined}
                      >
                        <item.icon className={`h-5 w-5 ${collapsed ? '' : 'mr-3'} flex-shrink-0`} />
                        {!collapsed && <span className="truncate">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}