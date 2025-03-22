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
        "bg-gray-900 text-white h-screen relative transition-all duration-300 dark:bg-gray-950 sidebar",
        isCollapsed ? "w-16" : "w-64",
        "flex flex-col"
      )}
    >
      {!isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className={`absolute -right-4 top-16 bg-gray-900 text-white rounded-full hover:bg-gray-800 z-50 dark:bg-gray-950 dark:hover:bg-gray-800 md:block flex items-center justify-center ${isCollapsed ? "hidden" : "block"}`}
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
      )}

      <div className="p-4 flex flex-col items-center">
        <div className={cn(
          "flex items-center gap-2 mb-8",
          isMobile ? "justify-start w-12" : ""
        )}>
          <div className={cn(
            "flex-shrink-0 w-8 h-8 flex items-center",
            isMobile ? "justify-start mt-8" : "justify-center"
          )}>
            <ThemeToggle />
          </div>
          {/* {!isCollapsed && !isMobile && <span className="text-xl font-bold">Planning</span>} */}
        </div>
        
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors p-3",
                item.disabled ? "opacity-50 cursor-not-allowed" : ""
              )}
              onClick={item.disabled ? (e) => e.preventDefault() : undefined}
            >
              <item.icon className="w-5 h-5" />
              {!isCollapsed && (
                <span className="ml-2 hidden md:inline">{item.label}</span>
              )}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;