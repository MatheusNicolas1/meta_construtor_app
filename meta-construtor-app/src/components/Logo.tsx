
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from './ThemeProvider';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className = "", size = 'md' }: LogoProps) {
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  const sizeClasses = {
    sm: 'text-lg sm:text-xl',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-4xl'
  };

  // Determinar se está no modo escuro
  const isDark = theme === 'dark' || 
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const metaColor = isDark ? 'text-white' : 'text-[#0A192F]';

  const handleLogoClick = () => {
    navigate('/dashboard');
  };

  return (
    <div 
      className={`font-bold cursor-pointer hover:opacity-80 transition-all duration-200 hover:scale-105 ${sizeClasses[size]} ${className}`}
      onClick={handleLogoClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleLogoClick();
        }
      }}
    >
      <span className={`${metaColor} transition-colors duration-200`}>Meta</span>
      <span className="text-[#F7931E] transition-colors duration-200">Construtor</span>
    </div>
  );
}
