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

// ---- Attendance --------------------------------------------------------------
export async function getMyTodayAttendance() {
  return request("/attendance/me/today");
}
export async function listMyAttendance() {
  return request("/attendance/me");
}
export async function checkIn() {
  return request("/attendance/check-in", { method: "POST" });
}
export async function checkOut() {
  return request("/attendance/check-out", { method: "POST" });
}
export async function listAttendance(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/attendance${query ? `?${query}` : ""}`);
}
export async function getAttendanceById(id) {
  return request(`/attendance/${id}`);
}
export async function createManualAttendance(payload) {
  return request("/attendance/manual", { method: "POST", body: JSON.stringify(payload) });
}
export async function updateAttendance(id, payload) {
  return request(`/attendance/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}

// ---- Time Off: Types --------------------------------------------------------
export async function getTimeOffTypes() {
  return request("/timeoff/types");
}
export async function getTimeOffTypeById(id) {
  return request(`/timeoff/types/${id}`);
}
export async function createTimeOffType(payload) {
  return request("/timeoff/types", { method: "POST", body: JSON.stringify(payload) });
}
export async function updateTimeOffType(id, payload) {
  return request(`/timeoff/types/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}

// ---- Time Off: Allocations ---------------------------------------------------
export async function getTimeOffAllocations(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/timeoff/allocations${query ? `?${query}` : ""}`);
}
export async function getTimeOffAllocationById(id) {
  return request(`/timeoff/allocations/${id}`);
}
export async function createTimeOffAllocation(payload) {
  return request("/timeoff/allocations", { method: "POST", body: JSON.stringify(payload) });
}

// ---- Time Off: Requests ------------------------------------------------------
export async function getTimeOffRequests(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/timeoff/requests${query ? `?${query}` : ""}`);
}
export async function getTimeOffRequestById(id) {
  return request(`/timeoff/requests/${id}`);
}
export async function createTimeOffRequest(payload) {
  return request("/timeoff/requests", { method: "POST", body: JSON.stringify(payload) });
}
export async function approveTimeOffRequest(id) {
  return request(`/timeoff/requests/${id}/approve`, { method: "PATCH" });
}
export async function refuseTimeOffRequest(id) {
  return request(`/timeoff/requests/${id}/refuse`, { method: "PATCH" });
}

// ---- Payroll: Salary Structures (read-only here; config UI comes next) -----
export async function getSalaryStructures() {
  return request("/salary-structures");
}

// ---- Payroll: Payruns -------------------------------------------------------
export async function getPayruns(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/payruns${query ? `?${query}` : ""}`);
}
export async function getPayrunById(id) {
  return request(`/payruns/${id}`);
}
export async function createPayrun(payload) {
  return request("/payruns", { method: "POST", body: JSON.stringify(payload) });
}
export async function computePayrun(id) {
  return request(`/payruns/${id}/compute`, { method: "PATCH" });
}
export async function validatePayrun(id) {
  return request(`/payruns/${id}/validate`, { method: "PATCH" });
}
export async function markPayrunPaid(id) {
  return request(`/payruns/${id}/mark-paid`, { method: "PATCH" });
}

// ---- Payroll: Payslips -------------------------------------------------------
export async function getPayslips(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/payslips${query ? `?${query}` : ""}`);
}
export async function getPayslipById(id) {
  return request(`/payslips/${id}`);
}
// Not a JSON call — used directly as an <a href> so the browser handles
// the file download/inline PDF using the same auth cookie.
export function getPayslipPdfUrl(id) {
  return `${BASE_URL}/payslips/${id}/pdf`;
}

// ---- Payroll: Salary Rules (config) -----------------------------------------
export async function getSalaryRules() {
  return request("/salary-rules");
}
export async function getSalaryRuleById(id) {
  return request(`/salary-rules/${id}`);
}
export async function createSalaryRule(payload) {
  return request("/salary-rules", { method: "POST", body: JSON.stringify(payload) });
}
export async function updateSalaryRule(id, payload) {
  return request(`/salary-rules/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}
export async function deleteSalaryRule(id) {
  return request(`/salary-rules/${id}`, { method: "DELETE" });
}

// ---- Payroll: Salary Structures (config — create/update) --------------------
export async function getSalaryStructureById(id) {
  return request(`/salary-structures/${id}`);
}
export async function createSalaryStructure(payload) {
  return request("/salary-structures", { method: "POST", body: JSON.stringify(payload) });
}
export async function updateSalaryStructure(id, payload) {
  return request(`/salary-structures/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}