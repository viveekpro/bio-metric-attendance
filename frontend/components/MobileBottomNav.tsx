"use client";

import React from "react";
import { LayoutDashboard, CalendarCheck, Users, Cpu, Menu } from "lucide-react";

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSidebar: () => void;
  totalEmployees: number;
}

export default function MobileBottomNav({
  activeTab,
  setActiveTab,
  onOpenSidebar,
  totalEmployees,
}: MobileBottomNavProps) {
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "history", label: "Logs", icon: CalendarCheck },
    { id: "employees", label: "Staff", icon: Users, badge: totalEmployees > 0 ? `${totalEmployees}` : undefined },
    { id: "device", label: "Machine", icon: Cpu },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/90 backdrop-blur-xl border-t border-slate-800 px-3 py-2 shadow-2xl">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 active:scale-95 ${
                isActive ? "text-blue-400 font-semibold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? "scale-110 text-blue-400" : ""}`} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 bg-blue-600 text-white text-[9px] font-bold px-1 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{tab.label}</span>
              {isActive && (
                <span className="w-1 h-1 bg-blue-500 rounded-full mt-0.5 animate-pulse" />
              )}
            </button>
          );
        })}

        {/* Menu Toggle for Full Slide Panel */}
        <button
          onClick={onOpenSidebar}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-slate-400 hover:text-white transition-all active:scale-95"
          title="Open slide panel"
        >
          <Menu className="w-5 h-5 text-slate-300" />
          <span className="text-[10px] mt-1 tracking-tight">Menu</span>
        </button>
      </div>
    </div>
  );
}
