"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Calendar, Search, Download, RefreshCw, Filter, Clock } from "lucide-react";
import { getAttendanceByDate, getMonthlyAttendance } from "../lib/api";
import { AttendanceRecord } from "../lib/types";

interface HistoryTabProps {
  onSelectEmployee: (deviceUserId: string) => void;
}

export default function HistoryTab({ onSelectEmployee }: HistoryTabProps) {
  const [filterMode, setFilterMode] = useState<"date" | "month">("date");
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const currentYear = new Date().getFullYear().toString();
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, "0");
  const [selectedYear, setSelectedYear] = useState<string>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (filterMode === "date") {
        const res = await getAttendanceByDate(selectedDate);
        setRecords(res.data || []);
      } else {
        const res = await getMonthlyAttendance(selectedYear, selectedMonth);
        setRecords(res.data || []);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load history");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [filterMode, selectedDate, selectedYear, selectedMonth]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
    const headers = ["User ID", "Employee Name", "Date & Time", "Type", "State", "Device IP", "Record Key"];
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
    const label = filterMode === "date" ? selectedDate : `${selectedYear}-${selectedMonth}`;
    link.setAttribute("download", `attendance-report-${label}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const uniqueUsers = new Set(filteredRecords.map((r) => r.deviceUserId)).size;

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-600" />
              <span>Attendance History & Reports</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Search historical punch records across days and months
            </p>
          </div>

          {/* Filter Mode Toggle */}
          <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setFilterMode("date")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterMode === "date"
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              Single Date
            </button>
            <button
              onClick={() => setFilterMode("month")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterMode === "month"
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              Monthly Summary
            </button>
          </div>
        </div>

        {/* Inputs row */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          {filterMode === "date" ? (
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Year
                </label>
                <input
                  type="number"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Month
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[
                    "01", "02", "03", "04", "05", "06",
                    "07", "08", "09", "10", "11", "12",
                  ].map((m) => (
                    <option key={m} value={m}>
                      Month {m}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Search inside results */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Search In Query
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-end space-x-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="flex-1 flex items-center justify-center space-x-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span>Query Logs</span>
            </button>
            <button
              onClick={exportCsv}
              disabled={filteredRecords.length === 0}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition disabled:opacity-50"
              title="Download CSV"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Summary metric banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-500">Total Punches Found</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {records.length}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-500">Unique Attendees</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {uniqueUsers}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 col-span-2 sm:col-span-1">
          <p className="text-xs text-slate-500">Active Scope</p>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
            {filterMode === "date" ? selectedDate : `${selectedYear} / Month ${selectedMonth}`}
          </p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Results Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">User ID</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Device IP</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                    Fetching records...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-medium text-slate-500">No attendance records found</p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => {
                  const empName =
                    typeof r.employee === "object" && r.employee
                      ? r.employee.name
                      : "Unknown";
                  const dt = new Date(r.recordTime);

                  return (
                    <tr
                      key={r._id || r.recordKey}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        {empName}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs">
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-bold">
                          {r.deviceUserId}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-700 dark:text-slate-300">
                        <span className="inline-flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          {dt.toLocaleDateString()} {dt.toLocaleTimeString()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-slate-500">
                        {r.deviceIp}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onSelectEmployee(r.deviceUserId)}
                          className="text-xs text-blue-600 hover:underline font-medium"
                        >
                          View Employee
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
    </div>
  );
}
