import React from 'react';
import { Github, Linkedin, Mail } from 'lucide-react';
import Logo from '@/components/Logo';

const FooterSection = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    produto: [
      { name: 'Funcionalidades', href: '#about' },
      { name: 'Preços', href: '#pricing' },
      { name: 'Atualizações', href: '#' },
      { name: 'Integrações', href: '#' }
    ],
    empresa: [
      { name: 'Sobre Nós', href: '#about' },
      { name: 'Contato', href: '#contact' },
      { name: 'Carreiras', href: '#' },
      { name: 'Blog', href: '#' }
    ],
    legal: [
      { name: 'Política de Privacidade', href: '/legal/privacidade' },
      { name: 'Termos de Uso', href: '/legal/termos' },
      { name: 'Cookies', href: '/legal/cookies' },
      { name: 'LGPD', href: '/legal/lgpd' }
    ],
    suporte: [
      { name: 'Central de Ajuda', href: '#' },
      { name: 'Documentação', href: '#' },
      { name: 'Status', href: '#' },
      { name: 'API', href: '#' }
    ]
  };

  const socialLinks = [
    { icon: Github, href: 'https://github.com/metaconstrutor', label: 'GitHub' },
    { icon: Linkedin, href: 'https://linkedin.com/company/metaconstrutor', label: 'LinkedIn' },
    { icon: Mail, href: 'mailto:contato@metaconstrutor.com', label: 'Email' }
  ];

  const scrollToSection = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.getElementById(href.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-6 sm:py-8 md:py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 sm:gap-6 md:gap-8">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Logo size="sm" />
            </div>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Revolucione a gestão das suas obras com a plataforma mais completa 
              do mercado de construção civil.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 bg-muted hover:bg-primary hover:text-primary-foreground rounded-lg flex items-center justify-center transition-colors"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Produto</h3>
            <ul className="space-y-3">
              {footerLinks.produto.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Empresa</h3>
            <ul className="space-y-3">
              {footerLinks.empresa.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Suporte</h3>
            <ul className="space-y-3">
              {footerLinks.suporte.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-3 sm:py-4 md:py-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 text-center sm:text-left">
          <div className="text-sm text-muted-foreground">
            © {currentYear} Meta Construtor. Todos os direitos reservados.
          </div>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span>Feito com ❤️ no Brasil</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Todos os sistemas operacionais</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;