export const ROLE_OPTIONS = [
  { value: "Employee", label: "Employee" },
  { value: "HRManager", label: "HR Manager" },
  { value: "HRPayrollUser", label: "HR Payroll User" },
  { value: "HRPayrollManager", label: "HR Payroll Manager" },
  { value: "Admin", label: "Admin" },
];

export const roleLabel = (value) =>
  ROLE_OPTIONS.find((r) => r.value === value)?.label ?? value;
