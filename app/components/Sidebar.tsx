"use client";

import { Home, Inbox, BarChart2, Users, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Inbox, label: "My Tasks", href: "/tasks" },
    { icon: BarChart2, label: "Dashboard", href: "/dashboard" },
    { icon: Users, label: "Team", href: "/team" },
  ];

  return (
    <div
      className={cn(
        "bg-gray-900 text-white h-screen relative transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-16 bg-gray-900 text-white rounded-full hover:bg-gray-800 z-50"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>

      <div className={cn(
        "p-4",
        isCollapsed && "flex flex-col items-center"
      )}>
        <div className={cn(
          "flex items-center gap-2 mb-8",
          isCollapsed && "justify-center"
        )}>
          <Settings className="w-8 h-8 flex-shrink-0" />
          {!isCollapsed && <span className="text-xl font-bold">Planning</span>}
        </div>
        
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const NavLink = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors",
                  isCollapsed ? "p-3 justify-center" : "px-4 py-3"
                )}
              >
                <item.icon className="w-5 h-5" />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );

            return isCollapsed ? (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>
                  {NavLink}
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-gray-800 text-white border-gray-700">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            ) : (
              NavLink
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;