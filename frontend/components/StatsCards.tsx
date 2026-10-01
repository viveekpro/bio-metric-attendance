"use client";

import React from "react";
import { Users, Fingerprint, Clock, UserCheck } from "lucide-react";
import { AttendanceRecord } from "../lib/types";

interface StatsCardsProps {
  records: AttendanceRecord[];
  totalEmployees: number;
  loading: boolean;
}

export default function StatsCards({
  records,
  totalEmployees,
  loading,
}: StatsCardsProps) {
  const uniqueEmployeeIds = new Set(records.map((r) => r.deviceUserId));
  const uniqueCount = uniqueEmployeeIds.size;

  let firstPunch = "—";
  let latestPunch = "—";

  if (records.length > 0) {
    const sorted = [...records].sort(
      (a, b) => new Date(a.recordTime).getTime() - new Date(b.recordTime).getTime()
    );

    firstPunch = new Date(sorted[0].recordTime).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    latestPunch = new Date(sorted[sorted.length - 1].recordTime).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  const attendanceRate =
    totalEmployees > 0
      ? Math.round((uniqueCount / totalEmployees) * 100)
      : 0;

  const cards = [
    {
      title: "Employees Present Today",
      value: loading ? "..." : `${uniqueCount}`,
      subtext: `${attendanceRate}% of ${totalEmployees} enrolled`,
      icon: UserCheck,
      color: "from-blue-600 to-indigo-600",
      bgColor: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
    },
    {
      title: "Total Punches Today",
      value: loading ? "..." : `${records.length}`,
      subtext: "Includes in/out & breaks",
      icon: Fingerprint,
      color: "from-emerald-600 to-teal-600",
      bgColor: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
    },
    {
      title: "First Punch In",
      value: loading ? "..." : firstPunch,
      subtext: "Earliest arrival today",
      icon: Clock,
      color: "from-amber-600 to-orange-600",
      bgColor: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
    },
    {
      title: "Latest Activity",
      value: loading ? "..." : latestPunch,
      subtext: "Most recent verification",
      icon: Users,
      color: "from-purple-600 to-pink-600",
      bgColor: "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow transition-shadow flex items-start justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {card.title}
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {card.value}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {card.subtext}
              </p>
            </div>
            <div className={`p-3 rounded-xl ${card.bgColor}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
