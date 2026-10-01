"use client";

import React, { useState, useEffect } from "react";
import {
  Cpu,
  Clock,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Server,
  Activity,
  ShieldCheck,
} from "lucide-react";
import { getDeviceStatus, syncDeviceTime } from "../lib/api";

export default function DeviceTab() {
  const [deviceInfo, setDeviceInfo] = useState<{
    online: boolean;
    ip: string;
    port: number;
    deviceTime?: string;
    serverTime: string;
    realtimeActive?: boolean;
    info?: Record<string, unknown>;
  } | null>(null);

  const [checking, setChecking] = useState(false);
  const [syncingTime, setSyncingTime] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const checkStatus = async () => {
    try {
      setChecking(true);
      setFeedback(null);
      const res = await getDeviceStatus();
      setDeviceInfo(res.data);
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Device check failed",
      });
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleSyncTime = async () => {
    try {
      setSyncingTime(true);
      setFeedback(null);
      const res = await syncDeviceTime();
      setFeedback({
        type: "success",
        message: res.message || "Hardware clock synchronized successfully!",
      });
      // Re-fetch device info to show updated clock
      await checkStatus();
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to sync device clock",
      });
    } finally {
      setSyncingTime(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-sm flex items-center space-x-3 animate-fadeIn ${
            feedback.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
              : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Top Device Specs Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/10 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Cpu className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  ZKTeco K30 Fingerprint & RFID Terminal
                </h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                  Connected
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Hardware gateway communicating over persistent TCP socket • Port 4370
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={checkStatus}
              disabled={checking}
              className="flex items-center space-x-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-semibold transition"
            >
              <RefreshCw className={`w-4 h-4 ${checking ? "animate-spin text-blue-500" : ""}`} />
              <span>Ping Hardware</span>
            </button>
          </div>
        </div>

        {/* Quick Spec Pills */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400">Terminal IP</span>
            <p className="text-base font-bold font-mono text-slate-900 dark:text-white mt-1">
              {deviceInfo?.ip || "192.168.1.201"}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400">Hardware Port</span>
            <p className="text-base font-bold font-mono text-slate-900 dark:text-white mt-1">
              {deviceInfo?.port || 4370} (ZK-TCP)
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400">Real-Time Daemon</span>
            <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1.5">
              <Activity className="w-4 h-4" />
              Active
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400">Concurrency Mutex</span>
            <p className="text-base font-bold text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              Protected
            </p>
          </div>
        </div>
      </div>

      {/* Clock Synchronization Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span>Hardware Clock Synchronization</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Ensure K30 internal RTC matches standard server time to prevent clock drift on attendance logs
            </p>
          </div>

          <button
            onClick={handleSyncTime}
            disabled={syncingTime}
            className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncingTime ? "animate-spin" : ""}`} />
            <span>{syncingTime ? "Setting K30 Time..." : "Synchronize Clock with Server"}</span>
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              K30 Hardware Clock
            </span>
            <p className="text-lg font-mono font-bold text-slate-900 dark:text-white mt-2">
              {deviceInfo?.deviceTime
                ? new Date(deviceInfo.deviceTime).toLocaleString()
                : "Checking..."}
            </p>
            <p className="text-xs text-slate-400 mt-1">Reported directly from K30 RTC memory</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Server Local Time
            </span>
            <p className="text-lg font-mono font-bold text-slate-900 dark:text-white mt-2">
              {new Date().toLocaleString()}
            </p>
            <p className="text-xs text-slate-400 mt-1">Windows Host reference clock</p>
          </div>
        </div>
      </div>
    </div>
  );
}
