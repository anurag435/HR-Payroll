import { mockUsers } from "../mockData/users";
import { mockEmployees } from "../mockData/employees";
import { mockContracts } from "../mockData/contracts";
import { mockWorkingSchedules } from "../mockData/workingSchedules";
import { mockAttendance, MOCK_TODAY } from "../mockData/attendance";
import { mockTimeOffTypes } from "../mockData/timeOffTypes";
import { mockAllocations } from "../mockData/timeOffAllocations";
import { mockTimeOffRequests } from "../mockData/timeOffRequests";

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

// ---- Attendance -------------------------------------------------------------
export async function getAttendance({ employeeName } = {}) {
  if (USE_MOCK) {
    await delay();
    let rows = [...mockAttendance];
    if (employeeName) {
      rows = rows.filter((r) => r.employeeName === employeeName);
    }
    return rows;
  }
  const params = employeeName ? `?employee=${encodeURIComponent(employeeName)}` : "";
  const res = await fetch(`${BASE_URL}/attendance${params}`);
  if (!res.ok) throw new Error("Failed to load attendance.");
  return res.json();
}

export async function getAttendanceById(id) {
  if (USE_MOCK) {
    await delay();
    const record = mockAttendance.find((r) => r.id === id);
    if (!record) throw new Error("Attendance record not found.");
    return record;
  }
  const res = await fetch(`${BASE_URL}/attendance/${id}`);
  if (!res.ok) throw new Error("Failed to load attendance record.");
  return res.json();
}

const activeSessions = {};

export async function getActiveSession(employeeName) {
  if (USE_MOCK) {
    await delay(100);
    return activeSessions[employeeName] ?? null;
  }
  const res = await fetch(`${BASE_URL}/attendance/active-session?employee=${encodeURIComponent(employeeName)}`);
  if (!res.ok) throw new Error("Failed to load active session.");
  return res.json();
}

export async function checkIn(employeeName) {
  if (USE_MOCK) {
    await delay(150);
    activeSessions[employeeName] = { checkInTime: new Date() };
    return activeSessions[employeeName];
  }
  const res = await fetch(`${BASE_URL}/attendance/check-in`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ employeeName }),
  });
  if (!res.ok) throw new Error("Failed to check in.");
  return res.json();
}

export async function checkOut(employeeName) {
  if (USE_MOCK) {
    await delay(150);
    const session = activeSessions[employeeName];
    if (!session) throw new Error("No active session to check out from.");

    const checkInTime = session.checkInTime;
    const checkOutTime = new Date();
    const workedHours = Math.round(((checkOutTime - checkInTime) / 3600000) * 100) / 100;

    const newRecord = {
      id: `a${mockAttendance.length + 1}`,
      employeeId: null,
      employeeName,
      department: "",
      manager: "",
      date: MOCK_TODAY,
      checkIn: checkInTime.toLocaleString(),
      checkOut: checkOutTime.toLocaleString(),
      workedHours,
      overtime: workedHours > 8 ? Math.round((workedHours - 8) * 100) / 100 : 0,
      status: "present",
      notes: "System-generated from check in/out or manually corrected by an authorized user.",
    };
    mockAttendance.push(newRecord);
    delete activeSessions[employeeName];
    return newRecord;
  }
  const res = await fetch(`${BASE_URL}/attendance/check-out`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ employeeName }),
  });
  if (!res.ok) throw new Error("Failed to check out.");
  return res.json();
}

// ---- Time Off Types -------------------------------------------------------------
export async function getTimeOffTypes() {
  if (USE_MOCK) {
    await delay();
    return [...mockTimeOffTypes];
  }
  const res = await fetch(`${BASE_URL}/timeoff/types`);
  if (!res.ok) throw new Error("Failed to load time off types.");
  return res.json();
}

export async function getTimeOffTypeById(id) {
  if (USE_MOCK) {
    await delay();
    const type = mockTimeOffTypes.find((t) => t.id === id);
    if (!type) throw new Error("Time off type not found.");
    return type;
  }
  const res = await fetch(`${BASE_URL}/timeoff/types/${id}`);
  if (!res.ok) throw new Error("Failed to load time off type.");
  return res.json();
}

// ---- Time Off Allocations -------------------------------------------------------------
export async function getAllocations() {
  if (USE_MOCK) {
    await delay();
    return [...mockAllocations];
  }
  const res = await fetch(`${BASE_URL}/timeoff/allocations`);
  if (!res.ok) throw new Error("Failed to load allocations.");
  return res.json();
}

export async function getAllocationById(id) {
  if (USE_MOCK) {
    await delay();
    const alloc = mockAllocations.find((a) => a.id === id);
    if (!alloc) throw new Error("Allocation not found.");
    return alloc;
  }
  const res = await fetch(`${BASE_URL}/timeoff/allocations/${id}`);
  if (!res.ok) throw new Error("Failed to load allocation.");
  return res.json();
}

export async function setAllocationStatus(id, status) {
  if (USE_MOCK) {
    await delay(150);
    const idx = mockAllocations.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error("Allocation not found.");
    mockAllocations[idx] = { ...mockAllocations[idx], status };
    return mockAllocations[idx];
  }
  const res = await fetch(`${BASE_URL}/timeoff/allocations/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update allocation status.");
  return res.json();
}

// ---- Time Off Requests -------------------------------------------------------------
export async function getTimeOffRequests() {
  if (USE_MOCK) {
    await delay();
    return [...mockTimeOffRequests];
  }
  const res = await fetch(`${BASE_URL}/timeoff/requests`);
  if (!res.ok) throw new Error("Failed to load time off requests.");
  return res.json();
}

export async function getTimeOffRequestById(id) {
  if (USE_MOCK) {
    await delay();
    const req = mockTimeOffRequests.find((r) => r.id === id);
    if (!req) throw new Error("Time off request not found.");
    return req;
  }
  const res = await fetch(`${BASE_URL}/timeoff/requests/${id}`);
  if (!res.ok) throw new Error("Failed to load time off request.");
  return res.json();
}

// Approving a request that uses an allocation reduces that allocation's
// remaining balance — per the rule that approved leave should reduce the
// employee's available balance for types that require allocation.
export async function setRequestStatus(id, status) {
  if (USE_MOCK) {
    await delay(150);
    const idx = mockTimeOffRequests.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error("Time off request not found.");
    const request = mockTimeOffRequests[idx];
    const wasApproved = request.status === "approved";
    mockTimeOffRequests[idx] = { ...request, status };

    if (status === "approved" && !wasApproved && request.allocationUsed) {
      const allocIdx = mockAllocations.findIndex(
        (a) => a.employeeName === request.employeeName && a.typeName === request.typeName
      );
      if (allocIdx !== -1) {
        const durationDays = parseFloat(request.duration) || 0;
        const alloc = mockAllocations[allocIdx];
        const newTaken = alloc.taken + durationDays;
        const newRemaining = Math.max(alloc.allocated - newTaken, 0);
        mockAllocations[allocIdx] = { ...alloc, taken: newTaken, remaining: newRemaining };
      }
    }

    return mockTimeOffRequests[idx];
  }
  const res = await fetch(`${BASE_URL}/timeoff/requests/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update request status.");
  return res.json();
}