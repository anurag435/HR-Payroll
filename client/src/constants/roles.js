export const ROLE_OPTIONS = [
  { value: "Employee", label: "Employee" },
  { value: "HRManager", label: "HR Manager" },
  { value: "HRPayrollUser", label: "HR Payroll User" },
  { value: "HRPayrollManager", label: "HR Payroll Manager" },
  { value: "Admin", label: "Admin" },
];

export const roleLabel = (value) =>
  ROLE_OPTIONS.find((r) => r.value === value)?.label ?? value;

// Mirrors server/src/constants/roles.js ROLE_GROUPS — keep in sync.
// Used to decide what to render in nav and to gate frontend routes;
// the backend is still the real enforcement point for every one of these.
export const ROLE_GROUPS = {
  // Anyone who manages HR master data (Employees, Contracts, Schedules, Departments)
  HR_STAFF: ["HRManager", "HRPayrollUser", "HRPayrollManager", "Admin"],
  // Anyone who can touch payroll processing
  PAYROLL_STAFF: ["HRPayrollUser", "HRPayrollManager", "Admin"],
  // Only full payroll config control (Structures/Rules)
  PAYROLL_CONFIG: ["HRPayrollManager", "Admin"],
  ADMIN_ONLY: ["Admin"],
};

// The route every role should land on after login / when bounced off a
// page they can't access. Employees have no access to /employees at all,
// so they can't share the same fallback as everyone else.
export const HOME_ROUTE_FOR_ROLE = {
  Admin: "/admin/users",
  Employee: "/attendance",
};
export const DEFAULT_HOME_ROUTE = "/employees";

export function homeRouteForRole(role) {
  return HOME_ROUTE_FOR_ROLE[role] ?? DEFAULT_HOME_ROUTE;
}
