const ROLES = Object.freeze({
  EMPLOYEE: "Employee",
  HR_MANAGER: "HRManager",
  HR_PAYROLL_USER: "HRPayrollUser",
  HR_PAYROLL_MANAGER: "HRPayrollManager",
  ADMIN: "Admin",
});

const ALL_ROLES = Object.values(ROLES);

const ROLE_GROUPS = Object.freeze({
  // Anyone who manages HR master data (Employees, Contracts, Schedules, Time Off)
  HR_STAFF: [ROLES.HR_MANAGER, ROLES.HR_PAYROLL_USER, ROLES.HR_PAYROLL_MANAGER, ROLES.ADMIN],
  // Anyone who can touch payroll processing
  PAYROLL_STAFF: [ROLES.HR_PAYROLL_USER, ROLES.HR_PAYROLL_MANAGER, ROLES.ADMIN],
  // Only full payroll config control (Structures/Rules)
  PAYROLL_CONFIG: [ROLES.HR_PAYROLL_MANAGER, ROLES.ADMIN],
  ADMIN_ONLY: [ROLES.ADMIN],
});

module.exports = { ROLES, ALL_ROLES, ROLE_GROUPS };