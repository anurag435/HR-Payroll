import { mockUsers } from "../mockData/users";
import { mockEmployees } from "../mockData/employees";
import { mockContracts } from "../mockData/contracts";
import { mockWorkingSchedules } from "../mockData/workingSchedules";
import { mockAttendance, MOCK_TODAY } from "../mockData/attendance";
import { mockTimeOffTypes } from "../mockData/timeOffTypes";
import { mockAllocations } from "../mockData/timeOffAllocations";
import { mockTimeOffRequests } from "../mockData/timeOffRequests";

const USE_MOCK = false;
const BASE_URL = "http://localhost:3000";

const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      json.message || (json.errors && json.errors.join(", ")) || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return json.data;
}

// ---- Auth --------------------------------------------------------------
// All of these live under the authRouter, mounted at /auth in app.js:
// /auth/login, /auth/logout, /auth/me, /auth/users, /auth/users/:id/role

export async function login(firstArg, secondArg) {
  let email;
  let password;

  if (typeof firstArg === "object" && firstArg !== null) {
    email = firstArg.email;
    password = firstArg.password;
  } else {
    email = firstArg;
    password = secondArg;
  }

  if (USE_MOCK) {
    await delay();
    const user = mockUsers.find((u) => u.workEmail === email);
    if (!user) throw new Error("No account found for this email.");
    return { token: "mock-token", user };
  }

  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function getMe() {
  if (USE_MOCK) return mockUsers[0];
  return request("/auth/me");
}

export async function logoutUser() {
  if (USE_MOCK) return { message: "Logged out" };
  return request("/auth/logout", { method: "POST" });
}

export const loginUser = login;

// ---- Users (Admin only) --------------------------------------------------
export async function getUsers(params = {}) {
  if (USE_MOCK) {
    await delay();
    return [...mockUsers];
  }
  const query = new URLSearchParams(params).toString();
  return request(`/auth/users${query ? `?${query}` : ""}`);
}

export async function createUser(payload) {
  if (USE_MOCK) {
    await delay();
    const newUser = { id: `u${mockUsers.length + 1}`, ...payload };
    mockUsers.push(newUser);
    return newUser;
  }
  return request("/auth/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateUserRole(id, role) {
  if (USE_MOCK) {
    await delay();
    const idx = mockUsers.findIndex((u) => u.id === id);
    if (idx !== -1) mockUsers[idx] = { ...mockUsers[idx], role };
    return mockUsers[idx];
  }
  return request(`/auth/users/${id}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

export async function updateUser(id, payload) {
  return updateUserRole(id, payload.role);
}

// ---- Employees -------------------------------------------------------------
export async function getEmployees(params = {}) {
  if (USE_MOCK) {
    await delay();
    return { employees: [...mockEmployees], pagination: null };
  }
  const query = new URLSearchParams(params).toString();
  return request(`/employees${query ? `?${query}` : ""}`);
}

export async function getEmployeeById(id) {
  if (USE_MOCK) {
    await delay();
    const emp = mockEmployees.find((e) => e.id === id);
    if (!emp) throw new Error("Employee not found.");
    return { employee: emp, relatedCounts: { contracts: 0, attendance: 0, timeOff: 0 } };
  }
  return request(`/employees/${id}`);
}

export async function createEmployee(payload) {
  if (USE_MOCK) {
    await delay();
    const newEmp = { id: `e${mockEmployees.length + 1}`, ...payload };
    mockEmployees.push(newEmp);
    return newEmp;
  }
  return request("/employees", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateEmployee(id, payload) {
  if (USE_MOCK) {
    await delay();
    const idx = mockEmployees.findIndex((e) => e.id === id);
    if (idx !== -1) mockEmployees[idx] = { ...mockEmployees[idx], ...payload };
    return mockEmployees[idx];
  }
  return request(`/employees/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function archiveEmployee(id) {
  if (USE_MOCK) {
    await delay();
    return { id, status: "Inactive" };
  }
  return request(`/employees/${id}/archive`, { method: "PATCH" });
}

// ---- Departments -----------------------------------------------------------
export async function getDepartments() {
  if (USE_MOCK) {
    await delay();
    return [];
  }
  return request("/departments");
}

export async function createDepartment(payload) {
  if (USE_MOCK) {
    await delay();
    return { id: `d${Date.now()}`, ...payload };
  }
  return request("/departments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ---- Contracts -------------------------------------------------------------
export async function getContracts(params = {}) {
  if (USE_MOCK) {
    await delay();
    return [...mockContracts];
  }
  const query = new URLSearchParams(params).toString();
  return request(`/contracts${query ? `?${query}` : ""}`);
}

export async function getContractById(id) {
  if (USE_MOCK) {
    await delay();
    const contract = mockContracts.find((c) => c.id === id);
    if (!contract) throw new Error("Contract not found.");
    return contract;
  }
  return request(`/contracts/${id}`);
}

export async function createContract(payload) {
  if (USE_MOCK) {
    await delay();
    return { id: `c${Date.now()}`, ...payload };
  }
  return request("/contracts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ---- Working Schedules -------------------------------------------------------------
export async function getWorkingSchedules() {
  if (USE_MOCK) {
    await delay();
    return [...mockWorkingSchedules];
  }
  return request("/working-schedules");
}

export async function getWorkingScheduleById(id) {
  if (USE_MOCK) {
    await delay();
    const schedule = mockWorkingSchedules.find((s) => s.id === id);
    if (!schedule) throw new Error("Working schedule not found.");
    return schedule;
  }
  return request(`/working-schedules/${id}`);
}