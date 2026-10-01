export interface User {
  id: string;
  username: string;
  name: string;
  role: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
  error?: string;
}

export interface Employee {
  _id: string;
  deviceUserId: string;
  name: string;
  deviceUid?: number;
  role?: number;
  cardNumber?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AttendanceRecord {
  _id: string;
  employee?: {
    _id: string;
    deviceUserId: string;
    name: string;
  } | Employee;
  deviceUserId: string;
  recordTime: string;
  type: number;
  state: number;
  deviceIp: string;
  recordKey: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SyncResponse {
  success: boolean;
  message: string;
  data?: {
    totalRecordsFromDevice?: number;
    validRecords?: number;
    created?: number;
    alreadyExists?: number;
    total?: number;
    updated?: number;
  };
  error?: string;
}
