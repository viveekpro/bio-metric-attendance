import { AttendanceRecord, Employee, SyncResponse, User, AuthResponse } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("k30_auth_token");
}

export function setAuthToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("k30_auth_token", token);
  }
}

export function removeAuthToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("k30_auth_token");
  }
}

function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

// ==========================================
// AUTH API
// ==========================================

export async function loginUser(
  username: string,
  password: string
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || "Login failed");
  }

  if (data.token) {
    setAuthToken(data.token);
  }

  return data;
}

export async function getCurrentUser(): Promise<{ success: boolean; user: User }> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  if (!res.ok) {
    removeAuthToken();
    throw new Error("Session expired or invalid");
  }

  return res.json();
}

// ==========================================
// ATTENDANCE & EMPLOYEES API (PROTECTED)
// ==========================================

export async function getTodayAttendance(): Promise<{
  success: boolean;
  date: string;
  total: number;
  data: AttendanceRecord[];
}> {
  const res = await fetch(`${API_BASE}/attendance/today`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch today's attendance");
  return res.json();
}

export async function getAttendanceByDate(date: string): Promise<{
  success: boolean;
  date: string;
  total: number;
  data: AttendanceRecord[];
}> {
  const res = await fetch(`${API_BASE}/attendance/date/${date}`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
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
    headers: getAuthHeaders(),
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
    headers: getAuthHeaders(),
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
  const res = await fetch(`${API_BASE}/employees`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch employees");
  return res.json();
}

export async function syncAttendance(): Promise<SyncResponse> {
  const res = await fetch(`${API_BASE}/attendance/sync`, {
    method: "POST",
    headers: getAuthHeaders(),
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
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Employee sync failed");
  }
  return res.json();
}

export async function syncDeviceTime(): Promise<{
  success: boolean;
  message: string;
  data?: {
    serverTime: string;
    deviceTime: string;
  };
}> {
  const res = await fetch(`${API_BASE}/device/sync-time`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Failed to sync device time");
  }
  return res.json();
}

export async function getDeviceStatus(): Promise<{
  success: boolean;
  data: {
    online: boolean;
    ip: string;
    port: number;
    deviceTime?: string;
    serverTime: string;
    realtimeActive?: boolean;
    info?: Record<string, unknown>;
  };
}> {
  const res = await fetch(`${API_BASE}/device/status`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Failed to fetch device status");
  }
  return res.json();
}

export async function changeUserPassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/auth/change-password`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || "Failed to change password");
  }
  return data;
}

