"use client";

import React, { useState } from "react";
import {
  Search,
  Download,
  RefreshCw,
  Calendar,
  Clock,
  User,
  LayoutList,
  Table as TableIcon,
} from "lucide-react";
import { AttendanceRecord } from "../lib/types";

interface TodayAttendanceTableProps {
  records: AttendanceRecord[];
  loading: boolean;
  onRefresh: () => void;
  autoRefresh: boolean;
  setAutoRefresh: (val: boolean) => void;
  onSelectEmployee: (deviceUserId: string) => void;
}

export default function TodayAttendanceTable({
  records,
  loading,
  onRefresh,
  autoRefresh,
  setAutoRefresh,
  onSelectEmployee,
}: TodayAttendanceTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  const filteredRecords = records.filter((r) => {
    const employeeName =
      typeof r.employee === "object" && r.employee !== null
        ? r.employee.name.toLowerCase()
        : "";
    const userId = r.deviceUserId.toLowerCase();
    const term = searchTerm.toLowerCase();
    return employeeName.includes(term) || userId.includes(term);
  });

  const exportCsv = () => {
    if (records.length === 0) return;
    const headers = [
      "User ID",
      "Employee Name",
      "Time",
      "Type",
      "State",
      "Device IP",
      "Record Key",
    ];
    const rows = filteredRecords.map((r) => [
      r.deviceUserId,
      typeof r.employee === "object" && r.employee ? r.employee.name : "Unknown",
      new Date(r.recordTime).toLocaleString(),
      r.type,
      r.state,
      r.deviceIp,
      r.recordKey,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `attendance-today-${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden transition-all duration-300">
      {/* Table Toolbar Header */}
      <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Today&apos;s Attendance Punches</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                {filteredRecords.length}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live biometric verifications logged from K30 terminal
            </p>
          </div>

          {/* View Mode Toggle & Actions */}
          <div className="flex items-center space-x-2">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setViewMode("cards")}
                className={`p-1.5 rounded-lg text-xs font-medium transition ${
                  viewMode === "cards"
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                }`}
                title="Card View"
              >
                <LayoutList className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg text-xs font-medium transition ${
                  viewMode === "table"
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                }`}
                title="Table View"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Auto Refresh Toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                autoRefresh
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
                  : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  autoRefresh ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                }`}
              />
              <span className="hidden sm:inline">Auto Refresh:</span>
              <span>{autoRefresh ? "ON" : "OFF"}</span>
            </button>

            {/* Manual Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 transition active:scale-95"
              title="Refresh punches"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-500" : ""}`} />
            </button>

            {/* Export CSV */}
            <button
              onClick={exportCsv}
              disabled={filteredRecords.length === 0}
              className="flex items-center space-x-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 transition active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">CSV</span>
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search employee name or User ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
      </div>

      {/* Content Rendering (Cards or Table) */}
      {loading && records.length === 0 ? (
        <div className="py-16 text-center text-slate-400">
          <RefreshCw className="w-7 h-7 animate-spin mx-auto mb-2 text-blue-500" />
          <p className="text-sm">Loading attendance logs...</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="py-16 text-center text-slate-400">
          <Calendar className="w-9 h-9 mx-auto mb-2 opacity-30 text-blue-500" />
          <p className="font-semibold text-slate-500 text-sm">No punches recorded today</p>
          <p className="text-xs text-slate-400 mt-1">
            New biometric punches will show up here automatically in real time.
          </p>
        </div>
      ) : viewMode === "cards" ? (
        /* Mobile-Friendly Cards View */
        <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredRecords.map((record) => {
            const empName =
              typeof record.employee === "object" && record.employee
                ? record.employee.name
                : "Unknown";

            const dateObj = new Date(record.recordTime);
            const timeString = isNaN(dateObj.getTime())
              ? record.recordTime
              : dateObj.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: true,
                });

            return (
              <div
                key={record._id || record.recordKey}
                className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-blue-500/50 transition-all duration-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0 uppercase">
                      {empName.slice(0, 2)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                        {empName}
                      </h4>
                      <p className="text-xs font-mono text-slate-500 mt-0.5">
                        ID: <span className="font-bold text-slate-700 dark:text-slate-300">{record.deviceUserId}</span>
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                    Verified
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center text-xs font-mono font-medium text-slate-700 dark:text-slate-300">
                    <Clock className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                    <span>{timeString}</span>
                  </div>

                  <button
                    onClick={() => onSelectEmployee(record.deviceUserId)}
                    className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                  >
                    <User className="w-3 h-3" />
                    <span>History</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Traditional Desktop Table View */
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">User ID</th>
                <th className="py-3 px-4">Punch Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Terminal IP</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRecords.map((record) => {
                const empName =
                  typeof record.employee === "object" && record.employee
                    ? record.employee.name
                    : "Unknown";

                const dateObj = new Date(record.recordTime);
                const timeString = isNaN(dateObj.getTime())
                  ? record.recordTime
                  : dateObj.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: true,
                    });

                return (
                  <tr
                    key={record._id || record.recordKey}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-xs uppercase">
                        {empName.slice(0, 2)}
                      </div>
                      <span className="font-semibold">{empName}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs">
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-bold">
                        {record.deviceUserId}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs">
                      <span className="inline-flex items-center text-slate-700 dark:text-slate-300">
                        <Clock className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                        {timeString}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                        Verified
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-500">
                      {record.deviceIp || "192.168.1.201"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onSelectEmployee(record.deviceUserId)}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                      >
                        History
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
