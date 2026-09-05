import { mockUsers } from "../mockData/users";
import { mockEmployees } from "../mockData/employees";

// --- Swap point -------------------------------------------------------
// While the backend is in progress, USE_MOCK stays true and every function
// below resolves from local mock data (with a small artificial delay so
// loading states are visible and get tested). Once the API is ready:
//   1. set USE_MOCK to false
//   2. set BASE_URL to your backend origin
//   3. fill in the fetch() calls in the "real" branch of each function
// No component code needs to change either way — they only ever import
// from this file.
const USE_MOCK = true;
const BASE_URL = "http://localhost:8000/api";

const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

// ---- Auth --------------------------------------------------------------
export async function login({ email, password }) {
  if (USE_MOCK) {
    await delay();
    const user = mockUsers.find((u) => u.workEmail === email);
    if (!user) throw new Error("No account found for this email.");
    // Mock: any password is accepted for demo purposes.
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

// ---- Users (Admin > User Management) -----------------------------------
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

// ---- Employees (for dropdowns / linking) --------------------------------
export async function getEmployees() {
  if (USE_MOCK) {
    await delay();
    return [...mockEmployees];
  }
  const res = await fetch(`${BASE_URL}/employees`);
  if (!res.ok) throw new Error("Failed to load employees.");
  return res.json();
}