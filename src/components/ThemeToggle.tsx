import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLocale } from "@/contexts/LocaleContext";

type Theme = "light" | "dark" | "system";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const { locale } = useLocale();

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
    
    // Show toast notification with the appropriate language
    let title = "Tema atualizado";
    let description = `Tema definido para: ${newTheme === "dark" ? 'Escuro' : 'Claro'}`;
    
    if (locale === 'en-US') {
      title = "Theme updated";
      description = `Theme set to: ${newTheme === "dark" ? 'Dark' : 'Light'}`;
    } else if (locale === 'es-ES') {
      title = "Tema actualizado";
      description = `Tema establecido en: ${newTheme === "dark" ? 'Oscuro' : 'Claro'}`;
    } else if (locale === 'fr-FR') {
      title = "Thème mis à jour";
      description = `Thème défini sur: ${newTheme === "dark" ? 'Sombre' : 'Clair'}`;
    } else if (locale === 'de-DE') {
      title = "Theme aktualisiert";
      description = `Theme eingestellt auf: ${newTheme === "dark" ? 'Dunkel' : 'Hell'}`;
    } else if (locale === 'it-IT') {
      title = "Tema aggiornato";
      description = `Tema impostato su: ${newTheme === "dark" ? 'Scuro' : 'Chiaro'}`;
    }
    
    toast.success(description, {
      id: 'theme-toggle',
      duration: 2000,
    });
  };

  return (
    <Button 
      variant="outline" 
      size="icon" 
      className="rounded-full" 
      onClick={toggleTheme}
      aria-label={
        locale === 'en-US' ? 'Toggle theme' :
        locale === 'es-ES' ? 'Cambiar tema' :
        locale === 'fr-FR' ? 'Changer de thème' :
        locale === 'de-DE' ? 'Theme umschalten' :
        locale === 'it-IT' ? 'Cambia tema' :
        'Alternar tema'
      }
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">
        {locale === 'en-US' ? 'Toggle theme' :
         locale === 'es-ES' ? 'Cambiar tema' :
         locale === 'fr-FR' ? 'Changer de thème' :
         locale === 'de-DE' ? 'Theme umschalten' :
         locale === 'it-IT' ? 'Cambia tema' :
         'Alternar tema'}
      </span>
    </Button>
  );
}
