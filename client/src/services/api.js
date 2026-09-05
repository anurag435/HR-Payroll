import { mockUsers } from "../mockData/users";
import { mockEmployees } from "../mockData/employees";

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