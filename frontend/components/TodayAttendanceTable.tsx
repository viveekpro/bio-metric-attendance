"use client";

import React, { useState } from "react";
import { Search, Download, RefreshCw, Calendar, Clock, User } from "lucide-react";
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
    const headers = ["User ID", "Employee Name", "Time", "Type", "State", "Device IP", "Record Key"];
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
    link.setAttribute("download", `attendance-today-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
      {/* Table Top Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Today&apos;s Attendance Logs</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {filteredRecords.length} records
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time biometric verifications received from K30
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search bar */}
          <div className="relative min-w-[200px] flex-1 sm:flex-none">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search employee or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              autoRefresh
                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
                : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
            }`}
            title="Automatically poll for new attendance punches every 10s"
          >
            <span className={`w-2 h-2 rounded-full ${autoRefresh ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
            <span>Auto Refresh: {autoRefresh ? "ON" : "OFF"}</span>
          </button>

          {/* Manual Refresh */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 transition"
            title="Refresh Table"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-500" : ""}`} />
          </button>

          {/* Export CSV */}
          <button
            onClick={exportCsv}
            disabled={filteredRecords.length === 0}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4">Employee</th>
              <th className="py-3 px-4">User ID</th>
              <th className="py-3 px-4">Punch Time</th>
              <th className="py-3 px-4">Verification</th>
              <th className="py-3 px-4">Device IP</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading && records.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                  Loading attendance records...
                </td>
              </tr>
            ) : filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="font-medium text-slate-500">No attendance punches found</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Either no punches recorded yet today, or check search filter.
                  </p>
                </td>
              </tr>
            ) : (
              filteredRecords.map((record) => {
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
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {/* Employee Name */}
                    <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-xs uppercase">
                        {empName.slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {empName}
                        </div>
                        <div className="text-xs text-slate-400 sm:hidden">
                          ID: {record.deviceUserId}
                        </div>
                      </div>
                    </td>

                    {/* User ID */}
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600 dark:text-slate-300">
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-bold">
                        {record.deviceUserId}
                      </span>
                    </td>

                    {/* Time */}
                    <td className="py-3.5 px-4 font-mono text-xs font-medium text-slate-800 dark:text-slate-200">
                      <span className="inline-flex items-center text-slate-700 dark:text-slate-300">
                        <Clock className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                        {timeString}
                      </span>
                    </td>

                    {/* Verification Method / Type */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                        Fingerprint / Valid
                      </span>
                    </td>

                    {/* Device IP */}
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-500 dark:text-slate-400">
                      {record.deviceIp || "192.168.1.201"}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onSelectEmployee(record.deviceUserId)}
                        className="inline-flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 px-2.5 py-1 rounded-md transition"
                      >
                        <User className="w-3 h-3" />
                        <span>History</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
