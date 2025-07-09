
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { SidebarTrigger } from './ui/sidebar';
import { NotificationCenter } from './NotificationCenter';
import { OfflineIndicator } from './OfflineIndicator';
import { useAuth } from '@/contexts/AuthContext';

export function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Carregar imagem do perfil do localStorage
  useEffect(() => {
    const savedImage = localStorage.getItem('profile_image');
    if (savedImage) {
      setProfileImage(savedImage);
    }

    // Listener para mudanças no localStorage (quando o avatar é atualizado em outra aba/componente)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'profile_image') {
        setProfileImage(e.newValue);
      }
    };

    // Listener personalizado para mudanças do avatar
    const handleAvatarUpdate = (event: CustomEvent) => {
      setProfileImage(event.detail.imageUrl);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('avatar-updated', handleAvatarUpdate as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('avatar-updated', handleAvatarUpdate as EventListener);
    };
  }, []);

  // Função para redirecionar para configurações do perfil
  const handleAvatarClick = () => {
    navigate('/configuracoes');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 sm:h-16 items-center px-3 sm:px-4 lg:px-6">
        {/* Logo e Menu Mobile */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <SidebarTrigger className="mobile-button !w-auto !min-w-10 !px-2 text-foreground hover:text-foreground" />
          <div className="sm:hidden">
            <Logo size="sm" className="logo" />
          </div>
        </div>
        
        {/* Espaço central - removida busca global */}
        <div className="flex-1"></div>
        
        {/* Ícones do topo - sempre fixos na direita */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 flex-shrink-0 min-w-fit">
          
          {/* OfflineIndicator com melhor contraste */}
          <div className="text-foreground flex-shrink-0">
            <OfflineIndicator />
          </div>
          
          {/* NotificationCenter com melhor contraste */}
          <div className="text-foreground hover:text-foreground flex-shrink-0">
            <NotificationCenter />
          </div>
          
          {/* ThemeToggle com melhor contraste */}
          <div className="text-foreground hover:text-foreground flex-shrink-0">
            <ThemeToggle />
          </div>
          
          {/* Avatar com sistema de atualização automática e clique para configurações */}
          <Avatar 
            className="h-8 w-8 sm:h-9 sm:w-9 hover:ring-2 hover:ring-[#FF5722] hover:ring-offset-2 transition-all duration-200 cursor-pointer flex-shrink-0 border border-border"
            onClick={handleAvatarClick}
          >
            {profileImage ? (
              <AvatarImage 
                src={profileImage} 
                alt="Foto de perfil"
                className="object-cover"
                onError={() => {
                  // Se a imagem falhar ao carregar, remove do localStorage e volta para o fallback
                  localStorage.removeItem('profile_image');
                  setProfileImage(null);
                }}
              />
            ) : null}
            <AvatarFallback className="bg-gradient-to-r from-[#FF5722] to-[#E64A19] text-white text-sm font-medium">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
