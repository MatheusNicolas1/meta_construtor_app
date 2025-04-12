
import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem("meta-constructor-theme") as Theme | null;
    return storedTheme || "system";
  });
  
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() => {
    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return theme === "dark" ? "dark" : "light";
  });
  
  useEffect(() => {
    const root = window.document.documentElement;
    
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      
      if (systemTheme === "dark") {
        root.classList.add("dark");
        setResolvedTheme("dark");
      } else {
        root.classList.remove("dark");
        setResolvedTheme("light");
      }
      
      // Listen for changes in system theme
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => {
        if (localStorage.getItem("meta-constructor-theme") === "system") {
          if (mediaQuery.matches) {
            root.classList.add("dark");
            setResolvedTheme("dark");
          } else {
            root.classList.remove("dark");
            setResolvedTheme("light");
          }
        }
      };
      
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    } else {
      if (theme === "dark") {
        root.classList.add("dark");
        setResolvedTheme("dark");
      } else {
        root.classList.remove("dark");
        setResolvedTheme("light");
      }
    }
  }, [theme]);
  
  const setThemeWithStorage = (newTheme: Theme) => {
    localStorage.setItem("meta-constructor-theme", newTheme);
    setTheme(newTheme);
  };
  
  return { theme, resolvedTheme, setTheme: setThemeWithStorage };
}
