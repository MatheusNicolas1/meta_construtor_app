
import React from 'react';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { Avatar, AvatarFallback } from './ui/avatar';
import { SidebarTrigger } from './ui/sidebar';
import { NotificationCenter } from './NotificationCenter';
import { OfflineIndicator } from './OfflineIndicator';
import { useAuth } from '@/contexts/AuthContext';

export function Header() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 sm:h-16 items-center px-3 sm:px-4 lg:px-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <SidebarTrigger className="mobile-button !w-auto !min-w-10 !px-2" />
          <div className="sm:hidden">
            <Logo size="sm" className="logo" />
          </div>
        </div>
        
        <div className="flex-1" />
        
        <div className="flex items-center gap-2 sm:gap-3">
          <OfflineIndicator />
          <NotificationCenter />
          <ThemeToggle />
          <Avatar className="h-8 w-8 sm:h-9 sm:w-9 hover:ring-2 hover:ring-[#F7931E] hover:ring-offset-2 transition-all duration-200 cursor-pointer">
            <AvatarFallback className="bg-gradient-to-r from-[#F7931E] to-[#FF6B35] text-white text-sm font-medium">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
