import React from "react"
import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false)
  const [theme, setTheme] = React.useState<"light" | "dark">("light")

  React.useEffect(() => {
    if (typeof window === "undefined") return

    const storedTheme = window.localStorage.getItem("vite-ui-theme") as
      | "light"
      | "dark"
      | null
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const initialTheme = storedTheme || (systemPrefersDark ? "dark" : "light")

    setTheme(initialTheme)
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(initialTheme)

    setMounted(true)
  }, [])

  const toggleTheme = () => {
    if (typeof window === "undefined") return
    const nextTheme = theme === "light" ? "dark" : "light"
    setTheme(nextTheme)
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(nextTheme)
    window.localStorage.setItem("vite-ui-theme", nextTheme)
  }

  if (!mounted) return null

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="h-9 w-9 px-0"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

