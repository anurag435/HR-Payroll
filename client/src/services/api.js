const BASE_URL = "http://localhost:3000";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include", // required to send/receive the httpOnly JWT cookie
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

  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function getMe() {
  return request("/auth/me");
}

export async function logoutUser() {
  return request("/auth/logout", { method: "POST" });
}

export const loginUser = login;

// ---- Users (Admin only) --------------------------------------------------
export async function getUsers(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/auth/users${query ? `?${query}` : ""}`);
}

export async function createUser(payload) {
  return request("/auth/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateUserRole(id, role) {
  return request(`/auth/users/${id}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

export async function updateUserStatus(id, isActive) {
  return request(`/auth/users/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
}

// ---- Employees -------------------------------------------------------------
export async function getEmployees(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/employees${query ? `?${query}` : ""}`);
}

export async function getEmployeeById(id) {
  return request(`/employees/${id}`);
}

export async function createEmployee(payload) {
  return request("/employees", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateEmployee(id, payload) {
  return request(`/employees/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function archiveEmployee(id) {
  return request(`/employees/${id}/archive`, { method: "PATCH" });
}

// ---- Departments -----------------------------------------------------------
export async function getDepartments() {
  return request("/departments");
}

export async function createDepartment(payload) {
  return request("/departments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ---- Contracts -------------------------------------------------------------
export async function getContracts(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/contracts${query ? `?${query}` : ""}`);
}

export async function getContractById(id) {
  return request(`/contracts/${id}`);
}

export async function createContract(payload) {
  return request("/contracts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateContract(id, payload) {
  return request(`/contracts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function endContract(id, payload = {}) {
  return request(`/contracts/${id}/end`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

// ---- Working Schedules -------------------------------------------------------------
export async function getWorkingSchedules() {
  return request("/working-schedules");
}

export async function getWorkingScheduleById(id) {
  return request(`/working-schedules/${id}`);
}

export async function createWorkingSchedule(payload) {
  return request("/working-schedules", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateWorkingSchedule(id, payload) {
  return request(`/working-schedules/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function archiveWorkingSchedule(id) {
  return request(`/working-schedules/${id}/archive`, { method: "PATCH" });
}