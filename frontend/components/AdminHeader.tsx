"use client";

import React, { useState, useEffect } from "react";
import { Menu, Clock, RefreshCw, CheckCircle, AlertCircle, Shield } from "lucide-react";
import { syncAttendance, syncEmployees } from "../lib/api";

interface AdminHeaderProps {
  activeTab: string;
  onToggleSidebar: () => void;
  onRefreshData: () => void;
}

export default function AdminHeader({
  activeTab,
  onToggleSidebar,
  onRefreshData,
}: AdminHeaderProps) {
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

      // Sync employees first, then attendance records
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
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return { title: "Dashboard Overview", desc: "Live biometric attendance analytics & real-time logs" };
      case "history":
        return { title: "Attendance Records", desc: "Search and export historical punches by date & month" };
      case "employees":
        return { title: "Employee Directory", desc: "Staff members enrolled on the K30 biometric machine" };
      case "device":
        return { title: "K30 Machine Management", desc: "Hardware connectivity, clock sync, and device diagnostics" };
      case "settings":
        return { title: "Security & Admin Settings", desc: "Manage administrator credentials and system configurations" };
      default:
        return { title: "Admin Panel", desc: "Barrownz Biometric Attendance Management System" };
    }
  };

  const pageInfo = getPageTitle();

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-tight">
              {pageInfo.title}
            </h2>
            <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {pageInfo.desc}
            </p>
          </div>
        </div>

        {/* Right: Clock & Sync Device Button */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center text-xs font-mono font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <Clock className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
            {currentTime}
          </div>

          <button
            onClick={handleSyncAll}
            disabled={syncing}
            className={`flex items-center space-x-2 text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-sm ${
              syncing
                ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-700"
                : "bg-blue-600 hover:bg-blue-500 text-white active:scale-95 shadow-blue-600/20"
            }`}
            title="Synchronize punches and user database from K30 machine"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin text-blue-400" : ""}`} />
            <span>{syncing ? "Syncing K30..." : "Sync Device"}</span>
          </button>
        </div>
      </div>

      {/* Sync Alert Banner */}
      {notification && (
        <div
          className={`text-xs px-4 py-2 border-t flex items-center justify-center space-x-2 animate-fadeIn ${
            notification.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
              : "bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}
    </header>
  );
}
