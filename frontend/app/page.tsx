"use client";

import React, { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import StatsCards from "../components/StatsCards";
import TodayAttendanceTable from "../components/TodayAttendanceTable";
import HistoryTab from "../components/HistoryTab";
import EmployeesTab from "../components/EmployeesTab";
import EmployeeHistoryModal from "../components/EmployeeHistoryModal";
import { getTodayAttendance, getEmployees } from "../lib/api";
import { AttendanceRecord, Employee } from "../lib/types";

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [todayRecords, setTodayRecords] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingToday, setLoadingToday] = useState(true);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  const loadTodayData = useCallback(async () => {
    try {
      setLoadingToday(true);
      const res = await getTodayAttendance();
      setTodayRecords(res.data || []);
    } catch (err) {
      console.error("Error loading today's attendance:", err);
    } finally {
      setLoadingToday(false);
    }
  }, []);

  const loadEmployeesData = useCallback(async () => {
    try {
      setLoadingEmployees(true);
      const res = await getEmployees();
      setEmployees(res.data || []);
    } catch (err) {
      console.error("Error loading employees:", err);
    } finally {
      setLoadingEmployees(false);
    }
  }, []);

  const refreshAll = useCallback(() => {
    loadTodayData();
    loadEmployeesData();
  }, [loadTodayData, loadEmployeesData]);

  // Initial load
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Real-time polling for today's punches if autoRefresh is enabled
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      loadTodayData();
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, loadTodayData]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRefreshData={refreshAll}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Metric Summary Cards */}
            <StatsCards
              records={todayRecords}
              totalEmployees={employees.length}
              loading={loadingToday || loadingEmployees}
            />

            {/* Live Today Table */}
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
      </main>

      {/* Individual Employee Modal */}
      <EmployeeHistoryModal
        deviceUserId={selectedEmployeeId}
        onClose={() => setSelectedEmployeeId(null)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>ZK-K30 Biometric Attendance Dashboard & API Gateway</p>
          <p className="font-mono">Device Target: 192.168.1.201:4370</p>
        </div>
      </footer>
    </div>
  );
}
