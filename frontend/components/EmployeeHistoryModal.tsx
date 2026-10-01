"use client";

import React, { useEffect, useState } from "react";
import { X, RefreshCw, Calendar, Clock, User, Download } from "lucide-react";
import { getEmployeeAttendance } from "../lib/api";
import { AttendanceRecord } from "../lib/types";

interface EmployeeHistoryModalProps {
  deviceUserId: string | null;
  onClose: () => void;
}

export default function EmployeeHistoryModal({
  deviceUserId,
  onClose,
}: EmployeeHistoryModalProps) {
  const [loading, setLoading] = useState(false);
  const [employeeInfo, setEmployeeInfo] = useState<{
    deviceUserId: string;
    name: string;
  } | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!deviceUserId) return;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getEmployeeAttendance(deviceUserId);
        setEmployeeInfo(res.employee);
        setRecords(res.data || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load employee records");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [deviceUserId]);

  if (!deviceUserId) return null;

  const exportCsv = () => {
    if (records.length === 0) return;
    const headers = ["User ID", "Name", "Date", "Time", "Device IP", "Record Key"];
    const rows = records.map((r) => {
      const dt = new Date(r.recordTime);
      return [
        r.deviceUserId,
        employeeInfo?.name || "Unknown",
        dt.toLocaleDateString(),
        dt.toLocaleTimeString(),
        r.deviceIp,
        r.recordKey,
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `employee-${deviceUserId}-attendance.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">
                {employeeInfo?.name || `Employee ${deviceUserId}`}
              </h3>
              <p className="text-xs font-mono text-slate-500">
                K30 Device User ID: <span className="font-bold">{deviceUserId}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={exportCsv}
              disabled={records.length === 0}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-medium transition disabled:opacity-40"
              title="Export Employee History to CSV"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {loading ? (
            <div className="py-16 text-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
              Loading history logs...
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-sm rounded-xl">
              {error}
            </div>
          ) : records.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="font-medium text-slate-500">No punch records on file</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100 dark:border-slate-800">
                <span>Total records: {records.length}</span>
                <span>Sorted by most recent</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {records.map((r) => {
                  const dt = new Date(r.recordTime);
                  return (
                    <div
                      key={r._id || r.recordKey}
                      className="py-2.5 flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center space-x-3">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {dt.toLocaleDateString("en-US", {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                          <p className="text-xs font-mono text-slate-500">
                            {dt.toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                              hour12: true,
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                          Verified
                        </span>
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                          IP: {r.deviceIp}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl text-sm font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
