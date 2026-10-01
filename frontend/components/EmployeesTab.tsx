"use client";

import React, { useState } from "react";
import { Users, Search, RefreshCw, CreditCard, Shield, Calendar } from "lucide-react";
import { Employee } from "../lib/types";
import { syncEmployees } from "../lib/api";

interface EmployeesTabProps {
  employees: Employee[];
  loading: boolean;
  onRefresh: () => void;
  onSelectEmployee: (deviceUserId: string) => void;
}

export default function EmployeesTab({
  employees,
  loading,
  onRefresh,
  onSelectEmployee,
}: EmployeesTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const filtered = employees.filter((e) => {
    const term = searchTerm.toLowerCase();
    return (
      e.name.toLowerCase().includes(term) ||
      e.deviceUserId.toLowerCase().includes(term) ||
      (e.cardNumber && e.cardNumber.toString().includes(term))
    );
  });

  const handleSyncEmployees = async () => {
    try {
      setSyncing(true);
      setFeedback(null);
      const res = await syncEmployees();
      const updated = res.data?.updated ?? 0;
      const created = res.data?.created ?? 0;
      setFeedback(`Employees synced: ${created} added, ${updated} updated`);
      onRefresh();
    } catch (err: unknown) {
      setFeedback(err instanceof Error ? err.message : "Failed to sync employees");
    } finally {
      setSyncing(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Employee Directory</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
              {employees.length} Enrolled
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Staff enrolled on the K30 Biometric device and synced to database
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Bar */}
          <div className="relative min-w-[200px] flex-1 sm:flex-none">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, ID or card..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleSyncEmployees}
            disabled={syncing || loading}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs sm:text-sm font-medium transition shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
            <span>Sync Users</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="text-xs bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-xl">
          {feedback}
        </div>
      )}

      {/* Directory Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && employees.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
            Loading employees list...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="font-medium text-slate-500">No employees match your search</p>
          </div>
        ) : (
          filtered.map((emp) => (
            <div
              key={emp._id || emp.deviceUserId}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                      {emp.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white leading-tight">
                        {emp.name}
                      </h3>
                      <p className="text-xs font-mono text-slate-500 mt-0.5">
                        User ID:{" "}
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {emp.deviceUserId}
                        </span>
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    <Shield className="w-3 h-3 mr-1" />
                    Role {emp.role ?? 0}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                      Card Number:
                    </span>
                    <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                      {emp.cardNumber || "None"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Internal UID:</span>
                    <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                      {emp.deviceUid || "—"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => onSelectEmployee(emp.deviceUserId)}
                  className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 bg-slate-50 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-xl transition"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>View Attendance History</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
