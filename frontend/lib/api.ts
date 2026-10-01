import { AttendanceRecord, Employee, SyncResponse } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

export async function getTodayAttendance(): Promise<{
  success: boolean;
  date: string;
  total: number;
  data: AttendanceRecord[];
}> {
  const res = await fetch(`${API_BASE}/attendance/today`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch today's attendance");
  return res.json();
}

export async function getAttendanceByDate(date: string): Promise<{
  success: boolean;
  date: string;
  total: number;
  data: AttendanceRecord[];
}> {
  const res = await fetch(`${API_BASE}/attendance/date/${date}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch attendance for ${date}`);
  return res.json();
}

export async function getMonthlyAttendance(
  year: string,
  month: string
): Promise<{
  success: boolean;
  year: number;
  month: number;
  total: number;
  data: AttendanceRecord[];
}> {
  const paddedMonth = month.padStart(2, "0");
  const res = await fetch(`${API_BASE}/attendance/month/${year}/${paddedMonth}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to fetch attendance for ${year}/${month}`);
  return res.json();
}

export async function getEmployeeAttendance(deviceUserId: string): Promise<{
  success: boolean;
  employee: { deviceUserId: string; name: string };
  total: number;
  data: AttendanceRecord[];
}> {
  const res = await fetch(`${API_BASE}/attendance/employee/${deviceUserId}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to fetch attendance for employee ${deviceUserId}`);
  return res.json();
}

export async function getEmployees(): Promise<{
  success: boolean;
  total: number;
  data: Employee[];
}> {
  const res = await fetch(`${API_BASE}/employees`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch employees");
  return res.json();
}

export async function syncAttendance(): Promise<SyncResponse> {
  const res = await fetch(`${API_BASE}/attendance/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Attendance sync failed");
  }
  return res.json();
}

export async function syncEmployees(): Promise<SyncResponse> {
  const res = await fetch(`${API_BASE}/employees/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Employee sync failed");
  }
  return res.json();
}
