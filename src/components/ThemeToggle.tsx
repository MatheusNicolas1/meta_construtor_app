
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type Theme = "light" | "dark" | "system";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const { toast } = useToast();

  useEffect(() => {
    // Get theme from localStorage on component mount
    const savedTheme = localStorage.getItem("meta-constructor-theme") as Theme | null;
    
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      // Default to system preference if no saved theme
      setTheme("system");
      applyTheme("system");
    }
    
    // Add class to enable CSS transitions for theme changes
    document.documentElement.classList.add("dark-transition");

    // Listen for system theme changes if using system theme
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        applyTheme("system");
      }
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const applyTheme = (newTheme: Theme) => {
    if (newTheme === "system") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", isDark);
    } else {
      document.documentElement.classList.toggle("dark", newTheme === "dark");
    }
  };

  const toggleTheme = () => {
    // Toggle between light and dark modes
    const newTheme = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches) 
      ? "light" 
      : "dark";
    
    setTheme(newTheme);
    localStorage.setItem("meta-constructor-theme", newTheme);
    applyTheme(newTheme);
    
    // Show toast notification
    const description = `Tema definido para: ${newTheme === "dark" ? 'Escuro' : 'Claro'}`;
    
    toast({
      title: "Tema atualizado",
      description: description,
    });
  };

  return (
    <Button 
      variant="outline" 
      size="icon" 
      className="rounded-full" 
      onClick={toggleTheme}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Alternar tema</span>
    </Button>
  );
}
