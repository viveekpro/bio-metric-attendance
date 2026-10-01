"use client";

import React from "react";
import Image from "next/image";
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  Cpu,
  Shield,
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../lib/auth-context";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  totalEmployees: number;
  todayPunchesCount: number;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  mobileOpen,
  setMobileOpen,
  collapsed,
  setCollapsed,
  totalEmployees,
  todayPunchesCount,
}: SidebarProps) {
  const { user, logout } = useAuth();

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      badge: todayPunchesCount > 0 ? `${todayPunchesCount}` : undefined,
    },
    {
      id: "history",
      label: "Attendance Logs",
      icon: CalendarCheck,
    },
    {
      id: "employees",
      label: "Employees",
      icon: Users,
      badge: totalEmployees > 0 ? `${totalEmployees}` : undefined,
    },
    {
      id: "device",
      label: "K30 Machine",
      icon: Cpu,
      dot: true,
    },
    {
      id: "settings",
      label: "Admin Settings",
      icon: Shield,
    },
  ];

  const handleSelect = (id: string) => {
    setActiveTab(id);
    if (mobileOpen) {
      setMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop with fade */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md lg:hidden transition-opacity duration-300 animate-fadeIn"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Panel Container with smooth slide */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-slate-900/95 backdrop-blur-2xl border-r border-slate-800 flex flex-col justify-between transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-2xl ${
          mobileOpen
            ? "translate-x-0 w-72"
            : collapsed
            ? "w-20 -translate-x-full lg:translate-x-0"
            : "w-64 -translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Top Header & Branding */}
        <div>
          <div className="h-20 px-4 sm:px-5 border-b border-slate-800 flex items-center justify-between">
            {(!collapsed || mobileOpen) ? (
              <>
                <div className="flex items-center space-x-3 overflow-hidden animate-fadeIn">
                  <div className="relative w-11 h-11 rounded-2xl bg-white p-1 shadow-md flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-105">
                    <Image
                      src="/barrownz-logo.jpg"
                      alt="Barrownz Logo"
                      width={40}
                      height={40}
                      className="object-contain"
                      priority
                    />
                  </div>

                  <div className="leading-tight transition-opacity duration-200">
                    <h1 className="font-bold text-white text-base tracking-tight truncate">
                      Barrownz
                    </h1>
                    <p className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">
                      Admin Portal
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  {/* Desktop Collapse Button */}
                  <button
                    onClick={() => setCollapsed(true)}
                    className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition active:scale-95"
                    title="Slide panel to collapse"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Mobile Close Button */}
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              /* Logo is completely hidden when panel is slid/collapsed */
              <div className="w-full flex items-center justify-center">
                <button
                  onClick={() => setCollapsed(false)}
                  className="p-2.5 rounded-xl text-blue-400 hover:text-white hover:bg-slate-800 transition active:scale-95 shadow-sm"
                  title="Slide panel to expand (Show Barrownz Logo)"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Hardware Connection Banner */}
          {(!collapsed || mobileOpen) && (
            <div className="px-4 py-2.5 mx-3 mt-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="flex items-center text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                K30 Online
              </span>
              <span className="text-slate-400 text-[10px]">192.168.1.201</span>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  title={collapsed && !mobileOpen ? item.label : undefined}
                  className={`w-full flex items-center ${
                    collapsed && !mobileOpen ? "justify-center px-0 py-3" : "justify-between px-3.5 py-2.5"
                  } rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 active:scale-95 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold"
                      : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? "scale-110 text-white" : "text-slate-400"}`} />
                    {(!collapsed || mobileOpen) && <span>{item.label}</span>}
                  </div>

                  {(!collapsed || mobileOpen) && item.badge && (
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Profile */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/70">
          <div className={`flex items-center ${collapsed && !mobileOpen ? "justify-center" : "justify-between"}`}>
            {(!collapsed || mobileOpen) ? (
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-sm shrink-0 uppercase">
                  {user?.name?.charAt(0) || "A"}
                </div>
                <div className="truncate text-left">
                  <p className="text-xs font-semibold text-white truncate">
                    {user?.name || "Administrator"}
                  </p>
                  <p className="text-[10px] text-slate-400 capitalize truncate">
                    {user?.role || "admin"} • Barrownz
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs uppercase">
                {user?.name?.charAt(0) || "A"}
              </div>
            )}

            {(!collapsed || mobileOpen) && (
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
