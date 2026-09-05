import { mockUsers } from "../mockData/users";
import { mockEmployees } from "../mockData/employees";
import { mockContracts } from "../mockData/contracts";
import { mockWorkingSchedules } from "../mockData/workingSchedules";

const USE_MOCK = true;
const BASE_URL = "http://localhost:8000/api";

const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

// ---- Auth --------------------------------------------------------------
export async function login({ email, password }) {
  if (USE_MOCK) {
    await delay();
    const user = mockUsers.find((u) => u.workEmail === email);
    if (!user) throw new Error("No account found for this email.");
    return { token: "mock-token", user };
  }
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Invalid email or password.");
  return res.json();
}

// ---- Users ---------------------------------------------------------------
export async function getUsers() {
  if (USE_MOCK) {
    await delay();
    return [...mockUsers];
  }
  const res = await fetch(`${BASE_URL}/users`);
  if (!res.ok) throw new Error("Failed to load users.");
  return res.json();
}

export async function createUser(payload) {
  if (USE_MOCK) {
    await delay();
    const newUser = { id: `u${mockUsers.length + 1}`, ...payload };
    mockUsers.push(newUser);
    return newUser;
  }
  const res = await fetch(`${BASE_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create user.");
  return res.json();
}

export async function updateUser(id, payload) {
  if (USE_MOCK) {
    await delay();
    const idx = mockUsers.findIndex((u) => u.id === id);
    if (idx !== -1) mockUsers[idx] = { ...mockUsers[idx], ...payload };
    return mockUsers[idx];
  }
  const res = await fetch(`${BASE_URL}/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update user.");
  return res.json();
}

// ---- Employees -------------------------------------------------------------
export async function getEmployees() {
  if (USE_MOCK) {
    await delay();
    return [...mockEmployees];
  }
  const res = await fetch(`${BASE_URL}/employees`);
  if (!res.ok) throw new Error("Failed to load employees.");
  return res.json();
}

export async function getEmployeeById(id) {
  if (USE_MOCK) {
    await delay();
    const emp = mockEmployees.find((e) => e.id === id);
    if (!emp) throw new Error("Employee not found.");
    return emp;
  }
  const res = await fetch(`${BASE_URL}/employees/${id}`);
  if (!res.ok) throw new Error("Failed to load employee.");
  return res.json();
}

// ---- Contracts -------------------------------------------------------------
export async function getContracts() {
  if (USE_MOCK) {
    await delay();
    return [...mockContracts];
  }
  const res = await fetch(`${BASE_URL}/contracts`);
  if (!res.ok) throw new Error("Failed to load contracts.");
  return res.json();
}

export async function getContractById(id) {
  if (USE_MOCK) {
    await delay();
    const contract = mockContracts.find((c) => c.id === id);
    if (!contract) throw new Error("Contract not found.");
    return contract;
  }
  const res = await fetch(`${BASE_URL}/contracts/${id}`);
  if (!res.ok) throw new Error("Failed to load contract.");
  return res.json();
}

// ---- Working Schedules -------------------------------------------------------------
export async function getWorkingSchedules() {
  if (USE_MOCK) {
    await delay();
    return [...mockWorkingSchedules];
  }
  const res = await fetch(`${BASE_URL}/working-schedules`);
  if (!res.ok) throw new Error("Failed to load working schedules.");
  return res.json();
}

export async function getWorkingScheduleById(id) {
  if (USE_MOCK) {
    await delay();
    const schedule = mockWorkingSchedules.find((s) => s.id === id);
    if (!schedule) throw new Error("Working schedule not found.");
    return schedule;
  }
  const res = await fetch(`${BASE_URL}/working-schedules/${id}`);
  if (!res.ok) throw new Error("Failed to load working schedule.");
  return res.json();
}