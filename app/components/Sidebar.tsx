"use client";

import { Home, Inbox, BarChart2, Users, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ThemeToggle } from "./ThemeToggle";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        setIsMobile(window.innerWidth < 768);
        // Auto-collapse sidebar on mobile
        if (window.innerWidth < 768) {
          setIsCollapsed(true);
        }
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Inbox, label: "My Tasks", href: "/tasks", disabled: true },
    { icon: BarChart2, label: "Dashboard", href: "/dashboard", disabled: true },
    { icon: Users, label: "Team", href: "/team", disabled: true },
  ];

  return (
    <div
      className={cn(
        "bg-gray-900 text-white relative transition-all duration-300 dark:bg-gray-950 sidebar flex-shrink-0",
        isMobile ? "w-16" : (isCollapsed ? "w-16" : "w-52"),
        "flex flex-col",
        isMobile ? "h-full" : "h-screen"
      )}
      style={!isMobile ? { 
        width: isCollapsed ? '4rem' : '13rem', 
        minWidth: isCollapsed ? '4rem' : '13rem' 
      } : undefined}
    >
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

      <div className="p-4 flex flex-col items-center mobile-sidebar-container">
        <div className="flex items-center w-full justify-center theme-toggle-container mb-6">
          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
            <ThemeToggle />
          </div>
          {/* {!isCollapsed && !isMobile && <span className="text-xl font-bold">Planning</span>} */}
        </div>
        
        <nav className={cn("space-y-2 mobile-nav", isMobile ? "mobile-nav-horizontal" : "mobile-nav-vertical")}>
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors py-2 px-3 mobile-nav-link",
                isMobile ? "justify-center" : (isCollapsed ? "justify-center" : "justify-start"),
                item.disabled ? "opacity-50 cursor-not-allowed" : ""
              )}
              onClick={item.disabled ? (e) => e.preventDefault() : undefined}
            >
              <item.icon className={cn(
                isCollapsed || isMobile ? "w-6 h-6" : "w-5 h-5"
              )} />
              {!isCollapsed && !isMobile && (
                <span className="ml-3 hidden md:inline font-medium">{item.label}</span>
              )}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;