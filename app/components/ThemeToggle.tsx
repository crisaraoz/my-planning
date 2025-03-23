"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevenir cambios bruscos durante la hidratación
  useEffect(() => {
    setMounted(true);
  }, []);

  // Renderizar un placeholder visible durante la carga para mantener el espacio
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="bg-transparent text-white hover:bg-gray-800 flex items-center justify-center w-8 h-8"
        disabled
      >
        <Sun className="h-5 w-5" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="bg-transparent text-white hover:bg-gray-800 flex items-center justify-center w-8 h-8"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right">
        <p>Toggle theme</p>
      </TooltipContent>
    </Tooltip>
  );
} 