"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Sidebar from "../components/Sidebar";
import AdminHeader from "../components/AdminHeader";
import StatsCards from "../components/StatsCards";
import TodayAttendanceTable from "../components/TodayAttendanceTable";
import HistoryTab from "../components/HistoryTab";
import EmployeesTab from "../components/EmployeesTab";
import DeviceTab from "../components/DeviceTab";
import SettingsTab from "../components/SettingsTab";
import EmployeeHistoryModal from "../components/EmployeeHistoryModal";
import MobileBottomNav from "../components/MobileBottomNav";
import LoginForm from "../components/LoginForm";
import { useAuth } from "../lib/auth-context";
import { useSwipeGesture } from "../lib/useSwipeGesture";
import { getTodayAttendance, getEmployees } from "../lib/api";
import { AttendanceRecord, Employee } from "../lib/types";

export default function AdminPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [todayRecords, setTodayRecords] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingToday, setLoadingToday] = useState(true);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  // Enable touch swipe gestures on mobile
  useSwipeGesture({
    onSwipeRight: () => {
      // Swiping right opens the slide panel
      setMobileSidebarOpen(true);
    },
    onSwipeLeft: () => {
      // Swiping left closes the slide panel
      setMobileSidebarOpen(false);
    },
    minSwipeDistance: 50,
  });

  const loadTodayData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoadingToday(true);
      const res = await getTodayAttendance();
      setTodayRecords(res.data || []);
    } catch (err) {
      console.error("Error loading today's attendance:", err);
    } finally {
      setLoadingToday(false);
    }
  }, [isAuthenticated]);

  const loadEmployeesData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoadingEmployees(true);
      const res = await getEmployees();
      setEmployees(res.data || []);
    } catch (err) {
      console.error("Error loading employees:", err);
    } finally {
      setLoadingEmployees(false);
    }
  }, [isAuthenticated]);

  const refreshAll = useCallback(() => {
    if (isAuthenticated) {
      loadTodayData();
      loadEmployeesData();
    }
  }, [isAuthenticated, loadTodayData, loadEmployeesData]);

  // Initial load when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshAll();
    }
  }, [isAuthenticated, refreshAll]);

  // Real-time polling for punches
  useEffect(() => {
    if (!isAuthenticated || !autoRefresh) return;
    const interval = setInterval(() => {
      loadTodayData();
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, autoRefresh, loadTodayData]);

  // Auth checking preloader
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
        <div className="relative w-16 h-16 rounded-2xl bg-white p-2 shadow-2xl mb-4 animate-pulse flex items-center justify-center">
          <Image
            src="/barrownz-logo.jpg"
            alt="Barrownz"
            width={48}
            height={48}
            className="object-contain"
            priority
          />
        </div>
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400 mt-3 font-mono">Authenticating Barrownz session...</p>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans transition-colors duration-300">
      {/* Sliding Sidebar for Desktop & Mobile */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        totalEmployees={employees.length}
        todayPunchesCount={todayRecords.length}
      />

      {/* Main Content Area (Smoothly adjusts width when sidebar collapses) */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          sidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        {/* Top Header */}
        <AdminHeader
          activeTab={activeTab}
          onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          onRefreshData={refreshAll}
        />

        {/* Tab Page Views with Smooth Fade Animations */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl w-full mx-auto pb-24 lg:pb-8">
          {activeTab === "dashboard" && (
            <div className="space-y-6 sm:space-y-8 animate-fadeIn">
              {/* Metric Summary Cards */}
              <StatsCards
                records={todayRecords}
                totalEmployees={employees.length}
                loading={loadingToday || loadingEmployees}
              />

              {/* Today's Punch Stream */}
              <TodayAttendanceTable
                records={todayRecords}
                loading={loadingToday}
                onRefresh={loadTodayData}
                autoRefresh={autoRefresh}
                setAutoRefresh={setAutoRefresh}
                onSelectEmployee={(id) => setSelectedEmployeeId(id)}
              />
            </div>
          )}

          {activeTab === "history" && (
            <div className="animate-fadeIn">
              <HistoryTab
                onSelectEmployee={(id) => setSelectedEmployeeId(id)}
              />
            </div>
          )}

          {activeTab === "employees" && (
            <div className="animate-fadeIn">
              <EmployeesTab
                employees={employees}
                loading={loadingEmployees}
                onRefresh={loadEmployeesData}
                onSelectEmployee={(id) => setSelectedEmployeeId(id)}
              />
            </div>
          )}

          {activeTab === "device" && (
            <div className="animate-fadeIn">
              <DeviceTab />
            </div>
          )}

          {activeTab === "settings" && (
            <div className="animate-fadeIn">
              <SettingsTab />
            </div>
          )}
        </main>

        {/* Desktop Footer */}
        <footer className="hidden lg:block border-t border-slate-800 py-6 px-8 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <p className="flex items-center gap-1.5">
              <span>© {new Date().getFullYear()} Barrownz Group</span>
              <span>•</span>
              <span>Enterprise Attendance Management</span>
            </p>
            <p className="font-mono text-slate-400">ZK-K30 Gateway: 192.168.1.201:4370</p>
          </div>
        </footer>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSidebar={() => setMobileSidebarOpen(true)}
        totalEmployees={employees.length}
      />

      {/* Individual Employee Modal */}
      <EmployeeHistoryModal
        deviceUserId={selectedEmployeeId}
        onClose={() => setSelectedEmployeeId(null)}
      />
    </div>
  );
}
