"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Prevenir cambios bruscos durante la hidratación
  useEffect(() => {
    // Detectar inmediatamente si estamos en móvil o desktop
    if (typeof window !== "undefined") {
      setIsMobile(window.innerWidth < 768);
    }

    // Prevenir el flash configurando mounted inmediatamente
    const timer = setTimeout(() => {
      setMounted(true);
    }, 10);
    
    // Actualizar al cambiar tamaño
    const handleResize = () => {
      if (typeof window !== "undefined") {
        setIsMobile(window.innerWidth < 768);
      }
    };
    
    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    }
  }, []);

  // Componente de placeholder con estilos idénticos al botón final para evitar saltos
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={`bg-transparent text-white hover:bg-gray-800 flex items-center justify-center w-8 h-8 ${isMobile ? 'mobile-theme-toggle' : ''}`}
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
          className={`bg-transparent text-white hover:bg-gray-800 flex items-center justify-center w-8 h-8 ${isMobile ? 'mobile-theme-toggle' : ''}`}
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side={isMobile ? "bottom" : "right"}>
        <p>Toggle theme</p>
      </TooltipContent>
    </Tooltip>
  );
} 