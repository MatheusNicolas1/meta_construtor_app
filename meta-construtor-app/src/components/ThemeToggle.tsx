
import { Moon, Sun, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from './ThemeProvider';
import { useToast } from '@/hooks/use-toast';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    toast({
      title: "Tema alterado!",
      description: `Tema ${newTheme === 'light' ? 'claro' : newTheme === 'dark' ? 'escuro' : 'do sistema'} aplicado com sucesso.`,
      duration: 2000,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 sm:h-10 sm:w-10 border border-border/50 hover:bg-muted text-foreground hover:text-foreground focus:text-foreground"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-foreground stroke-2" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-foreground stroke-2" />
          <span className="sr-only">Alternar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-background border-border z-50">
        <DropdownMenuItem 
          onClick={() => handleThemeChange('light')}
          className="hover:bg-muted focus:bg-muted cursor-pointer text-foreground"
        >
          <Sun className="h-4 w-4 mr-2 text-foreground" />
          Claro
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleThemeChange('dark')}
          className="hover:bg-muted focus:bg-muted cursor-pointer text-foreground"
        >
          <Moon className="h-4 w-4 mr-2 text-foreground" />
          Escuro
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleThemeChange('system')}
          className="hover:bg-muted focus:bg-muted cursor-pointer text-foreground"
        >
          <Settings className="h-4 w-4 mr-2 text-foreground" />
          Sistema
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
