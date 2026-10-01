"use client";

import React, { useState, useEffect } from "react";
import {
  Fingerprint,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { syncAttendance, syncEmployees } from "../lib/api";
import { useAuth } from "../lib/auth-context";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onRefreshData: () => void;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  onRefreshData,
}: NavbarProps) {
  const { user, logout } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSyncAll = async () => {
    try {
      setSyncing(true);
      setNotification(null);

      // Sync employees first to ensure proper lookup, then attendance
      await syncEmployees();
      const attResult = await syncAttendance();

      const created = attResult.data?.created ?? 0;
      const total = attResult.data?.validRecords ?? 0;

      setNotification({
        type: "success",
        message: `Sync complete! Synced ${total} records (${created} new)`,
      });

      onRefreshData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sync failed";
      setNotification({
        type: "error",
        message: msg,
      });
    } finally {
      setSyncing(false);
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 text-white p-2 rounded-xl shadow-inner flex items-center justify-center">
              <Fingerprint className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">
                  ZK-K30 Attendance
                </span>
                <span className="bg-blue-500/20 text-blue-400 text-xs font-semibold px-2 py-0.5 rounded-full border border-blue-500/30">
                  Live
                </span>
              </div>
              <p className="text-xs text-slate-400">
                192.168.1.201:4370 • Real-Time Gateway
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {[
              { id: "dashboard", label: "Dashboard" },
              { id: "history", label: "Attendance History" },
              { id: "employees", label: "Employees" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Right Section: Clock, Sync Button, User Profile & Logout */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="hidden lg:flex items-center text-xs font-mono text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <Clock className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
              {currentTime}
            </div>

            <button
              onClick={handleSyncAll}
              disabled={syncing}
              className={`flex items-center space-x-1.5 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-lg transition-all shadow ${
                syncing
                  ? "bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700"
                  : "bg-blue-600 hover:bg-blue-500 text-white active:scale-95"
              }`}
              title="Pull latest user and punch data from K30 machine"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin text-blue-400" : ""}`} />
              <span className="hidden sm:inline">{syncing ? "Syncing..." : "Sync Device"}</span>
              <span className="sm:hidden">Sync</span>
            </button>

            {/* User Profile & Logout Button */}
            {user && (
              <div className="flex items-center space-x-2 border-l border-slate-800 pl-2 sm:pl-3">
                <div className="hidden sm:flex items-center space-x-2 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-left text-xs leading-tight">
                    <p className="font-semibold text-white">{user.name}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{user.role}</p>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-900 transition flex items-center space-x-1 text-xs"
                  title="Sign out of attendance portal"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="md:hidden flex border-t border-slate-800 py-2 space-x-2">
          {[
            { id: "dashboard", label: "Dashboard" },
            { id: "history", label: "History" },
            { id: "employees", label: "Employees" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-1.5 text-center text-xs font-medium rounded ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sync Alert Banner */}
      {notification && (
        <div
          className={`text-xs px-4 py-2 border-b flex items-center justify-center space-x-2 animate-fadeIn ${
            notification.type === "success"
              ? "bg-emerald-950/80 border-emerald-800 text-emerald-300"
              : "bg-rose-950/80 border-rose-800 text-rose-300"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}
    </header>
  );
}
