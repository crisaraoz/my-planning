"use client";

import { Home, Inbox, BarChart2, Users, ChevronLeft, ChevronRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ThemeToggle } from "./ThemeToggle";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [initialRender, setInitialRender] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Determinar inicialmente si es móvil basado en window.innerWidth
    let initialIsMobile = false;
    if (typeof window !== "undefined") {
      initialIsMobile = window.innerWidth < 768;
      setIsMobile(initialIsMobile);
      
      // Auto-collapse sidebar on mobile
      if (initialIsMobile) {
        setIsCollapsed(true);
      }
    }
    
    // Después de determinar el tamaño inicial, ya no estamos en "initialRender"
    setInitialRender(false);

    // Establecer estado inicial rápidamente para evitar flash
    const timer = setTimeout(() => {
      setMounted(true);
    }, 10);

    const handleResize = () => {
      if (typeof window !== "undefined") {
        const mobileView = window.innerWidth < 768;
        setIsMobile(mobileView);
        // Auto-collapse sidebar on mobile
        if (mobileView) {
          setIsCollapsed(true);
          setMobileMenuOpen(false); // Cerrar menú móvil al cambiar tamaño
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, []);

  const menuItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Inbox, label: "My Tasks", href: "/tasks", disabled: true },
    { icon: BarChart2, label: "Dashboard", href: "/dashboard", disabled: true },
    { icon: Users, label: "Team", href: "/team", disabled: true },
  ];

  // Asegurar que el sidebar se renderiza correctamente desde el inicio
  const sidebarClass = cn(
    "bg-gray-900 text-white transition-all duration-300 dark:bg-gray-950 sidebar flex-shrink-0",
    isMobile ? "w-full fixed top-0 left-0 z-50" : (isCollapsed ? "w-16" : "w-52"),
    "flex",
    isMobile ? "flex-row h-20" : "flex-col h-screen"
  );

  const sidebarStyle: CSSProperties = !isMobile ? { 
    width: isCollapsed ? '4rem' : '13rem', 
    minWidth: isCollapsed ? '4rem' : '13rem' 
  } : {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    zIndex: 999
  };

  // Toggle del menú móvil
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      {/* Overlay para cerrar menú al hacer click fuera (sólo visible en móvil cuando menú está abierto) */}
      {isMobile && mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div
        className={sidebarClass}
        style={sidebarStyle}
      >
        {/* Botón de colapso para desktop */}
        <Button
          variant="ghost"
          size="icon"
          className={`absolute -right-4 top-16 bg-gray-900 text-white rounded-full hover:bg-gray-800 z-50 dark:bg-gray-950 dark:hover:bg-gray-800 md:flex hidden items-center justify-center ${isCollapsed ? "hidden" : "block"}`}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <div className="flex items-center justify-center h-9 w-9">
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </div>
        </Button>

        <div className={cn(
          "flex items-center mobile-sidebar-container",
          isMobile ? "p-0 flex-row justify-between" : "p-4 flex-col"
        )}>
          {/* Contenedor para el icono de tema (a la izquierda en móvil) */}
          <div className={cn(
            "flex items-center justify-center theme-toggle-container",
            isMobile ? "mobile-theme-container mb-0 justify-start pl-4" : "w-full mb-6"
          )}>
            <div className={cn(
              "flex-shrink-0 flex items-center justify-center",
              isMobile ? "mobile-theme-icon" : "w-8 h-8"
            )}>
              <ThemeToggle />
            </div>
          </div>
          
          {/* Botón de hamburguesa para móvil (a la derecha) */}
          {isMobile && (
            <div className="mobile-hamburger-container pr-4">
              <Button
                variant="ghost"
                size="icon"
                className="bg-gray-800 text-white hover:bg-gray-700 flex items-center justify-center w-12 h-12 rounded-md"
                onClick={toggleMobileMenu}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-8 w-8" />
                ) : (
                  <Menu className="h-8 w-8" />
                )}
              </Button>
            </div>
          )}
          
          {/* Navegación para DESKTOP - Solo visible en desktop */}
          {!isMobile && (
            <nav className="mobile-nav mobile-nav-vertical space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors py-2 px-3 mobile-nav-link",
                    isCollapsed ? "justify-center" : "justify-start",
                    item.disabled ? "opacity-50 cursor-not-allowed" : ""
                  )}
                  onClick={item.disabled ? (e) => e.preventDefault() : undefined}
                >
                  <item.icon className={cn(
                    isCollapsed ? "w-6 h-6" : "w-5 h-5"
                  )} />
                  {!isCollapsed && (
                    <span className="ml-3 hidden md:inline font-medium">{item.label}</span>
                  )}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </div>

      {/* Menú móvil - Overlay completo con navegación centrada */}
      {isMobile && mobileMenuOpen && (
        <nav className="mobile-nav-menu">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-6 right-6 bg-gray-700 text-white hover:bg-gray-600 flex items-center justify-center w-14 h-14 rounded-md shadow-md"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-8 w-8" />
          </Button>
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "mobile-nav-link",
                item.disabled ? "opacity-50 cursor-not-allowed" : ""
              )}
              onClick={(e) => {
                if (item.disabled) {
                  e.preventDefault();
                } else {
                  setMobileMenuOpen(false);
                }
              }}
            >
              <item.icon className="w-6 h-6" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      )}
    </>
  );
};

export default Sidebar;