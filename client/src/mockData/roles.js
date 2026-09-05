// Section 3 of the spec — keep this as the single source of truth for role
// labels so the Admin "Create User" form and any future permission checks
// never drift out of sync with each other.
export const ROLES = [
  { value: "employee", label: "Employee" },
  { value: "hr_manager", label: "HR Manager" },
  { value: "hr_payroll_user", label: "HR Payroll User" },
  { value: "hr_payroll_manager", label: "HR Payroll Manager" },
  { value: "admin", label: "Admin" },
];

export const roleLabel = (value) =>
  ROLES.find((r) => r.value === value)?.label ?? value;